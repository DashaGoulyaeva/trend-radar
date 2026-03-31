from __future__ import annotations

from ..models import TrendItem


def score_items(items: list[TrendItem]) -> list[TrendItem]:
    for item in items:
        if item.predictive_score <= 0:
            item.predictive_score = max(0, min(100, int(item.score * 0.8)))
    return items
