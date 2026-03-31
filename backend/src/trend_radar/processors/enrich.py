from __future__ import annotations

import json
import os
import shutil
import subprocess
import time
from typing import Any
from urllib import request

from ..config import Settings
from ..models import TrendItem


def _build_prompt(item: TrendItem) -> str:
    evidence_lines = []
    for evidence in item.evidence:
        line = f"- {evidence.source_key}"
        if evidence.url:
            line += f" | {evidence.url}"
        if evidence.note:
            line += f" | {evidence.note}"
        evidence_lines.append(line)

    evidence_text = "\n".join(evidence_lines) if evidence_lines else "- (no evidence)"

    return (
        "Ты редакторский ассистент. Проанализируй сигнал и дай краткую интерпретацию.\n"
        "Верни строго JSON без markdown, ключи:\n"
        "why_live (строка), scene (строка), risk (строка), angles (массив строк), "
        "verdict (строка), score (0-100 число).\n\n"
        f"Сигнал: {item.title}\n"
        f"Evidence:\n{evidence_text}\n"
    )


def _build_translate_prompt(title: str, summary: str) -> str:
    return (
        "Переведи на русский. Верни строго JSON без markdown, ключи: title, summary.\n\n"
        f"title: {title}\n"
        f"summary: {summary}\n"
    )


def _ollama_healthcheck(settings: Settings) -> bool:
    endpoint = settings.ollama_base_url.rstrip("/") + "/api/tags"
    try:
        with request.urlopen(endpoint, timeout=2) as response:
            return response.status == 200
    except Exception:
        return False


def _autostart_ollama() -> bool:
    try:
        exe = shutil.which("ollama")
        if not exe:
            fallback = r"C:\Users\1\AppData\Local\Programs\Ollama\ollama.exe"
            if os.path.exists(fallback):
                exe = fallback
        if not exe:
            return False
        if os.name == "nt":
            creationflags = subprocess.CREATE_NEW_PROCESS_GROUP | subprocess.DETACHED_PROCESS
            subprocess.Popen(
                [exe, "serve"],
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
                creationflags=creationflags,
            )
        else:
            subprocess.Popen(
                [exe, "serve"],
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
                start_new_session=True,
            )
        return True
    except FileNotFoundError:
        return False


def _ensure_ollama_running(settings: Settings) -> bool:
    if _ollama_healthcheck(settings):
        return True
    if not _autostart_ollama():
        return False
    time.sleep(2)
    return _ollama_healthcheck(settings)


def _call_ollama(prompt: str, settings: Settings, allow_autostart: bool = True) -> str:
    endpoint = settings.ollama_base_url.rstrip("/") + "/api/generate"
    payload = {
        "model": settings.ollama_model,
        "prompt": prompt,
        "stream": False,
    }
    data = json.dumps(payload).encode("utf-8")

    def _execute() -> str:
        req = request.Request(endpoint, data=data, headers={"Content-Type": "application/json"})
        with request.urlopen(req, timeout=settings.ollama_timeout) as response:
            body = response.read().decode("utf-8")
        parsed = json.loads(body)
        return str(parsed.get("response", "")).strip()

    try:
        return _execute()
    except Exception:
        if not allow_autostart:
            raise
        if not _ensure_ollama_running(settings):
            raise
        return _execute()


def _extract_json(text: str) -> dict[str, Any] | None:
    if not text:
        return None
    cleaned = text.strip()
    if cleaned.startswith("```"):
        cleaned = cleaned.strip("`")
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        return None


def _translate_item_to_ru(item: TrendItem, settings: Settings) -> bool:
    if item.locale == "ru-RU" or not settings.translate_to_ru:
        return True

    summary = ""
    for evidence in item.evidence:
        if evidence.note:
            summary = evidence.note
            break

    prompt = _build_translate_prompt(item.title, summary)
    try:
        response_text = _call_ollama(prompt, settings)
    except Exception:
        return False

    payload = _extract_json(response_text)
    if not payload:
        return False

    translated_title = str(payload.get("title", "")).strip()
    translated_summary = str(payload.get("summary", "")).strip()
    if translated_title:
        item.title = translated_title
    if translated_summary:
        for evidence in item.evidence:
            if evidence.note:
                evidence.note = translated_summary
    item.locale = "ru-RU"
    return True


def enrich_items(items: list[TrendItem], settings: Settings) -> list[TrendItem]:
    enriched: list[TrendItem] = []
    ollama_ready = _ensure_ollama_running(settings)

    for item in items:
        if item.locale != "ru-RU":
            translated = _translate_item_to_ru(item, settings)
            if not translated and settings.translate_to_ru:
                continue
            if not ollama_ready:
                ollama_ready = _ensure_ollama_running(settings)

        if not ollama_ready:
            item.why_live = (
                "Ollama недоступна. Попытка автозапуска не удалась — "
                "используем только заголовок и краткое описание."
            )
            item.verdict = "unknown"
            enriched.append(item)
            continue

        prompt = _build_prompt(item)
        try:
            response_text = _call_ollama(prompt, settings, allow_autostart=True)
        except Exception:
            item.why_live = (
                "Ollama недоступна. Попытка автозапуска не удалась — "
                "используем только заголовок и краткое описание."
            )
            item.verdict = "unknown"
            enriched.append(item)
            continue

        payload = _extract_json(response_text)
        if not payload:
            item.why_live = response_text[:500]
            item.verdict = "unknown"
            enriched.append(item)
            continue

        item.why_live = str(payload.get("why_live", item.why_live))
        item.scene = str(payload.get("scene", item.scene))
        item.risk = str(payload.get("risk", item.risk))
        item.verdict = str(payload.get("verdict", item.verdict))
        score_value = payload.get("score")
        if isinstance(score_value, (int, float)):
            item.score = max(0, min(100, int(score_value)))
        angles_value = payload.get("angles")
        if isinstance(angles_value, list):
            item.angles = [str(value) for value in angles_value if str(value).strip()]

        enriched.append(item)

    return enriched
