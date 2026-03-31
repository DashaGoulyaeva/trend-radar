from __future__ import annotations

import argparse
from pathlib import Path
from typing import Any

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from trend_radar.config import load_settings
from trend_radar.storage.json_store import read_json, write_json

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*", "null"],
    allow_methods=["*"],
    allow_headers=["*"],
)

settings = load_settings()
trends_path = settings.output_dir / "trends.json"
overrides_path = settings.admin_overrides_path


def _load_overrides() -> dict[str, Any]:
    return read_json(overrides_path) if overrides_path.exists() else {}


def _apply_overrides(payload: dict[str, Any], overrides: dict[str, Any]) -> dict[str, Any]:
    items = payload.get("items", [])
    for item in items:
        patch = overrides.get(item.get("id"))
        if patch:
            item.update(patch)
    return {"items": items}


def _normalize_item(item: dict[str, Any]) -> dict[str, Any]:
    defaults = {
        "id": "",
        "title": "",
        "why_live": "",
        "score": 0,
        "verdict": "",
        "scene": "",
        "angles": [],
        "risk": "",
        "window": "today",
        "admin_score": None,
        "admin_notes": [],
        "emotion": "",
        "confidence": None,
        "source": "",
        "source_url": "",
        "captured_at": None,
        "updated_at": None,
        "locale": "ru-RU",
        "region_bias_score": 0.0,
    }
    for key, value in defaults.items():
        item.setdefault(key, value)
    return item


@app.get("/api/trends")
async def get_trends(window: str | None = None) -> dict[str, Any]:
    payload = read_json(trends_path) if trends_path.exists() else {"items": []}
    overrides = _load_overrides()
    applied = _apply_overrides(payload, overrides)
    items = [_normalize_item(item) for item in applied.get("items", [])]
    if window in {"today", "week"}:
        items = [item for item in items if item.get("window") == window]
    return {"items": items}


@app.patch("/api/trends/{trend_id}/admin")
async def patch_trend(trend_id: str, payload: dict[str, Any]) -> dict[str, Any]:
    overrides = _load_overrides()
    overrides[trend_id] = {**overrides.get(trend_id, {}), **payload}
    write_json(overrides_path, overrides)
    return {"status": "ok", "trend_id": trend_id}


def main() -> None:
    parser = argparse.ArgumentParser(description="Run Trend Radar API server")
    parser.add_argument("--host", default="127.0.0.1")
    parser.add_argument("--port", type=int, default=8000)
    args = parser.parse_args()

    import uvicorn

    uvicorn.run("serve_api:app", host=args.host, port=args.port, reload=False)


if __name__ == "__main__":
    main()
