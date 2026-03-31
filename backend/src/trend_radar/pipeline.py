from __future__ import annotations

from pathlib import Path

from .collectors.rss_collector import collect_rss
from .config import load_settings
from .processors.enrich import enrich_items
from .processors.score import score_items
from .storage.json_store import write_json


def run_pipeline(output_path: Path | None = None) -> dict[str, object]:
    settings = load_settings()
    items = collect_rss(settings)
    items = enrich_items(items, settings)
    scored_items = score_items(items)
    output_path = output_path or settings.output_dir / "trends.json"
    payload = {"items": [item.to_dict() for item in scored_items]}
    write_json(output_path, payload)
    return payload
