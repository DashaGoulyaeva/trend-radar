from __future__ import annotations

import hashlib
from datetime import datetime
from urllib.parse import urlparse
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


def _source_key(url: str) -> str:
    if not url:
        return "rss"
    parsed = urlparse(url)
    return parsed.netloc.replace("www.", "") or "rss"


def _parse_timestamp(entry: Any) -> str | None:
    for key in ("published", "updated"):
        value = _safe_text(getattr(entry, key, None))
        if value:
            return value
    return None


def collect_rss(settings: Settings) -> list[TrendItem]:
    items: list[TrendItem] = []
    sources = settings.source_rss_urls or []

    for source_index, source_url in enumerate(sources):
        feed = feedparser.parse(source_url)
        entries = feed.entries or []
        is_ru = source_url in settings.ru_sources
        locale = "ru-RU" if is_ru else "global"
        region_bias_score = 1.0 if is_ru else 0.35
        source_key = _source_key(source_url)

        for index, entry in enumerate(entries[: settings.source_rss_limit]):
            title = _safe_text(getattr(entry, "title", None))
            link = _safe_text(getattr(entry, "link", None))
            summary = _safe_text(getattr(entry, "summary", None))
            captured_at = _parse_timestamp(entry)

            stable_key = title or link or f"rss-{source_index}-{index}"
            item_id = f"rss-{_hash_id(stable_key)}"
            score = max(40, 100 - index * 4)
            window = "today" if index < max(1, settings.source_rss_limit // 2) else "week"

            items.append(
                TrendItem(
                    id=item_id,
                    title=title or "Untitled signal",
                    window=window,
                    score=score,
                    predictive_score=0,
                    verdict="unknown",
                    source=source_key,
                    source_url=source_url,
                    captured_at=captured_at,
                    updated_at=datetime.utcnow().isoformat(timespec="seconds"),
                    locale=locale,
                    region_bias_score=region_bias_score,
                    evidence=[
                        Evidence(
                            source_key=source_key,
                            url=link or None,
                            note=summary or None,
                        )
                    ],
                )
            )

    return items
