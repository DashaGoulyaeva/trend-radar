from __future__ import annotations

from .models import RawItem


def normalize_items(items: list[RawItem]) -> list[RawItem]:
    seen: set[str] = set()
    normalized: list[RawItem] = []
    for item in items:
        url = item.url.strip()
        if not url or url in seen:
            continue
        seen.add(url)
        title = " ".join(item.title.split())
        summary = " ".join(item.summary.split()) if item.summary else None
        normalized.append(
            RawItem(
                uid=item.uid,
                title=title,
                url=url,
                source=item.source,
                published_at=item.published_at,
                summary=summary,
                raw=item.raw,
            )
        )
    return normalized
