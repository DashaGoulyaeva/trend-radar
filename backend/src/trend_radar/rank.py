from __future__ import annotations

from datetime import datetime, timezone

from .models import RawItem, TrendItem


def rank_items(items: list[RawItem]) -> list[TrendItem]:
    now = datetime.now(tz=timezone.utc)
    ranked: list[TrendItem] = []
    for item in items:
        published = item.published_at
        if published.tzinfo is None:
            published = published.replace(tzinfo=timezone.utc)
        age_hours = max((now - published).total_seconds() / 3600.0, 0.0)
        score = max(10.0, 100.0 - age_hours * 2.0)
        ranked.append(
            TrendItem(
                uid=item.uid,
                title=item.title,
                url=item.url,
                source=item.source,
                published_at=published,
                score=round(score, 2),
                explanation=None,
            )
        )
    return ranked
