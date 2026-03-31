from __future__ import annotations

from dataclasses import dataclass

from fastapi import FastAPI
from pydantic import BaseModel
import uvicorn

from .config import load_settings
from .models import TrendItemDTO
from .storage import SQLiteStore


class TrendResponse(BaseModel):
    items: list[TrendItemDTO]
    count: int


def create_app() -> FastAPI:
    settings = load_settings()
    store = SQLiteStore(settings.db_path)
    store.init_db()

    app = FastAPI(title="Trend Radar API")

    @app.get("/api/trends", response_model=TrendResponse)
    def get_trends(limit: int = 50) -> TrendResponse:
        items = store.fetch_trends(limit=limit)
        return TrendResponse(items=[TrendItemDTO.model_validate(item) for item in items], count=len(items))

    return app


app = create_app()


def main() -> int:
    uvicorn.run("trend_radar.api:app", host="127.0.0.1", port=8000, reload=False)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
