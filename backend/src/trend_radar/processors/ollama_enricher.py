from __future__ import annotations

import json
import re
from typing import Any

import requests

from ..config import Settings
from ..models import Axis, TrendItem


_JSON_RE = re.compile(r"\{.*\}", re.DOTALL)


def _extract_json(text: str) -> dict[str, Any] | None:
    match = _JSON_RE.search(text)
    if not match:
        return None
    try:
        return json.loads(match.group(0))
    except json.JSONDecodeError:
        return None


def _apply_payload(item: TrendItem, payload: dict[str, Any]) -> None:
    item.verdict = str(payload.get("verdict", item.verdict))
    item.why_live = str(payload.get("why_live", item.why_live))
    item.scene = str(payload.get("scene", item.scene))
    item.risk = str(payload.get("risk", item.risk))
    item.works = payload.get("works") or item.works or []
    item.avoid = payload.get("avoid") or item.avoid or []
    item.angles = payload.get("angles") or item.angles or []
    item.score = int(payload.get("score", item.score))
    item.predictive_score = int(payload.get("predictive_score", item.predictive_score))
    axes_payload = payload.get("axes") or []
    if isinstance(axes_payload, list):
        item.axes = [Axis(label=str(axis.get("label", "")), value=str(axis.get("value", ""))) for axis in axes_payload]


def _build_prompt(item: TrendItem) -> str:
    summary = item.admin_note or ""
    return (
        "Ты редакторский аналитик трендов. На основе сигнала сформируй краткую карточку.\n"
        "Ответь СТРОГО JSON без пояснений.\n"
        "Нужные ключи: verdict, why_live, scene, risk, works, avoid, angles, axes, score, predictive_score.\n"
        "axes = массив объектов {label, value} (например: Нативность, Риск натяжки, Срок жизни).\n"
        f"Сигнал:\nЗаголовок: {item.title}\nКратко: {summary}\n"
    )


def enrich_with_ollama(items: list[TrendItem], settings: Settings) -> list[TrendItem]:
    if not items:
        return items

    url = f"{settings.ollama_base_url.rstrip('/')}/api/generate"
    for item in items:
        prompt = _build_prompt(item)
        try:
            response = requests.post(
                url,
                json={
                    "model": settings.ollama_model,
                    "prompt": prompt,
                    "stream": False,
                },
                timeout=settings.ollama_timeout,
            )
            response.raise_for_status()
            payload = response.json()
        except requests.RequestException:
            continue

        raw_text = payload.get("response", "")
        parsed = _extract_json(raw_text)
        if parsed:
            _apply_payload(item, parsed)
    return items
