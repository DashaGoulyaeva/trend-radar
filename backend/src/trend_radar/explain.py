from __future__ import annotations

from .config import Settings
from .models import TrendItem


def explain_items(items: list[TrendItem], settings: Settings) -> list[TrendItem]:
    explanation = "Ranked by recency and source freshness."
    explained: list[TrendItem] = []
    try:
        for item in items:
            explained.append(
                TrendItem(
                    uid=item.uid,
                    title=item.title,
                    url=item.url,
                    source=item.source,
                    published_at=item.published_at,
                    score=item.score,
                    explanation=explanation,
                )
            )
    except Exception:
        return items
    return explained
