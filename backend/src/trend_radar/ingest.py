from __future__ import annotations

from datetime import datetime, timezone
import hashlib
from typing import Iterable

import feedparser

from .config import Settings
from .models import RawItem


def _make_uid(value: str) -> str:
    return hashlib.sha256(value.encode("utf-8")).hexdigest()[:16]


def _coerce_published(entry: dict) -> datetime:
    published = entry.get("published_parsed") or entry.get("updated_parsed")
    if published:
        return datetime(*published[:6], tzinfo=timezone.utc)
    return datetime.now(tz=timezone.utc)


def _iter_entries(feed: feedparser.FeedParserDict, limit: int) -> Iterable[dict]:
    for entry in feed.entries[: max(limit, 0)]:
        yield entry


def ingest_rss(settings: Settings) -> list[RawItem]:
    items: list[RawItem] = []
    limit = settings.source_rss_limit
    for source_url in settings.source_rss_urls:
        parsed = feedparser.parse(source_url)
        source_title = parsed.feed.get("title", source_url)
        for entry in _iter_entries(parsed, limit):
            link = entry.get("link") or entry.get("id")
            title = (entry.get("title") or "").strip()
            if not link or not title:
                continue
            uid = _make_uid(link)
            items.append(
                RawItem(
                    uid=uid,
                    title=title,
                    url=link,
                    source=str(source_title),
                    published_at=_coerce_published(entry),
                    summary=(entry.get("summary") or "").strip() or None,
                    raw=dict(entry),
                )
            )
    return items
