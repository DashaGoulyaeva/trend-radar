from __future__ import annotations

import json
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


def _call_ollama(prompt: str, settings: Settings) -> str:
    endpoint = settings.ollama_base_url.rstrip("/") + "/api/generate"
    payload = {
        "model": settings.ollama_model,
        "prompt": prompt,
        "stream": False,
    }
    data = json.dumps(payload).encode("utf-8")
    req = request.Request(endpoint, data=data, headers={"Content-Type": "application/json"})
    with request.urlopen(req, timeout=settings.ollama_timeout) as response:
        body = response.read().decode("utf-8")
    parsed = json.loads(body)
    return str(parsed.get("response", "")).strip()


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


def enrich_items(items: list[TrendItem], settings: Settings) -> list[TrendItem]:
    for item in items:
        prompt = _build_prompt(item)
        try:
            response_text = _call_ollama(prompt, settings)
        except Exception:
            item.why_live = "Ollama недоступна. Проверь запуск локального сервера."
            item.verdict = "unknown"
            continue

        payload = _extract_json(response_text)
        if not payload:
            item.why_live = response_text[:500]
            item.verdict = "unknown"
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

    return items
