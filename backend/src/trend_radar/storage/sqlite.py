from __future__ import annotations

import json
import sqlite3
from datetime import datetime
from pathlib import Path
from typing import Iterable

from ..models import RawItem, TrendItem


class SQLiteStore:
    def __init__(self, db_path: Path) -> None:
        self.db_path = Path(db_path)
        self.db_path.parent.mkdir(parents=True, exist_ok=True)

    def connect(self) -> sqlite3.Connection:
        conn = sqlite3.connect(self.db_path, check_same_thread=False)
        conn.row_factory = sqlite3.Row
        conn.execute("PRAGMA journal_mode=WAL;")
        conn.execute("PRAGMA foreign_keys=ON;")
        return conn

    def init_db(self) -> None:
        with self.connect() as conn:
            conn.executescript(
                """
                CREATE TABLE IF NOT EXISTS raw_items (
                    uid TEXT PRIMARY KEY,
                    title TEXT NOT NULL,
                    url TEXT NOT NULL,
                    source TEXT NOT NULL,
                    published_at TEXT NOT NULL,
                    summary TEXT,
                    raw_json TEXT,
                    created_at TEXT NOT NULL
                );

                CREATE TABLE IF NOT EXISTS trend_items (
                    uid TEXT PRIMARY KEY,
                    title TEXT NOT NULL,
                    url TEXT NOT NULL,
                    source TEXT NOT NULL,
                    published_at TEXT NOT NULL,
                    score REAL NOT NULL,
                    explanation TEXT,
                    updated_at TEXT NOT NULL
                );
                CREATE INDEX IF NOT EXISTS idx_trend_score ON trend_items(score);
                CREATE INDEX IF NOT EXISTS idx_trend_published ON trend_items(published_at);
                """
            )

    def write_batch(self, raw_items: Iterable[RawItem], trend_items: Iterable[TrendItem]) -> None:
        now = datetime.utcnow().isoformat()
        with self.connect() as conn:
            conn.execute("BEGIN;")
            for item in raw_items:
                conn.execute(
                    """
                    INSERT OR REPLACE INTO raw_items
                    (uid, title, url, source, published_at, summary, raw_json, created_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                    """,
                    (
                        item.uid,
                        item.title,
                        item.url,
                        item.source,
                        item.published_at.isoformat(),
                        item.summary,
                        json.dumps(item.raw, ensure_ascii=False),
                        now,
                    ),
                )
            for item in trend_items:
                conn.execute(
                    """
                    INSERT OR REPLACE INTO trend_items
                    (uid, title, url, source, published_at, score, explanation, updated_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                    """,
                    (
                        item.uid,
                        item.title,
                        item.url,
                        item.source,
                        item.published_at.isoformat(),
                        item.score,
                        item.explanation,
                        now,
                    ),
                )
            conn.execute("COMMIT;")

    def fetch_trends(self, limit: int = 50) -> list[TrendItem]:
        limit = max(1, min(limit, 500))
        with self.connect() as conn:
            rows = conn.execute(
                """
                SELECT uid, title, url, source, published_at, score, explanation
                FROM trend_items
                ORDER BY score DESC, published_at DESC
                LIMIT ?
                """,
                (limit,),
            ).fetchall()
        items: list[TrendItem] = []
        for row in rows:
            items.append(
                TrendItem(
                    uid=row["uid"],
                    title=row["title"],
                    url=row["url"],
                    source=row["source"],
                    published_at=datetime.fromisoformat(row["published_at"]),
                    score=float(row["score"]),
                    explanation=row["explanation"],
                )
            )
        return items

