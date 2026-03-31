from __future__ import annotations

import hashlib
from typing import Any

import feedparser

from ..config import Settings
from ..models import Evidence, TrendItem


def _hash_id(value: str) -> str:
    return hashlib.sha1(value.encode("utf-8")).hexdigest()[:12]


def _safe_text(value: Any) -> str:
    if not value:
        return ""
    return str(value).strip()


def collect_rss(settings: Settings) -> list[TrendItem]:
    feed = feedparser.parse(settings.source_rss_url)
    items: list[TrendItem] = []
    entries = feed.entries or []

    for index, entry in enumerate(entries[: settings.source_rss_limit]):
        title = _safe_text(getattr(entry, "title", None))
        link = _safe_text(getattr(entry, "link", None))
        summary = _safe_text(getattr(entry, "summary", None))

        stable_key = title or link or f"rss-{index}"
        item_id = f"rss-{_hash_id(stable_key)}"
        score = max(40, 100 - index * 4)

        items.append(
            TrendItem(
                id=item_id,
                title=title or "Untitled signal",
                score=score,
                predictive_score=0,
                verdict="unknown",
                evidence=[
                    Evidence(
                        source_key="rss",
                        url=link or None,
                        note=summary or None,
                    )
                ],
            )
        )

    return items
