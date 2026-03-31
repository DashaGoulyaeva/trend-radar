from __future__ import annotations

import hashlib
from datetime import datetime, date, timedelta, timezone
from typing import Any, Iterable
from urllib.error import URLError
from urllib.parse import urlparse
from urllib.request import Request, urlopen
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

try:
    from icalendar import Calendar
except Exception:  # pragma: no cover - optional dependency
    Calendar = None

from ..config import Settings
from ..models import Evidence, TrendItem

try:
    MOSCOW_TZ = ZoneInfo("Europe/Moscow")
except ZoneInfoNotFoundError:
    MOSCOW_TZ = datetime.now().astimezone().tzinfo or timezone.utc


def _hash_id(value: str) -> str:
    return hashlib.sha1(value.encode("utf-8")).hexdigest()[:12]


def _safe_text(value: Any) -> str:
    if not value:
        return ""
    return str(value).strip()


def _source_key(url: str) -> str:
    if not url:
        return "calendar"
    parsed = urlparse(url)
    return parsed.netloc.replace("www.", "") or "calendar"


def _event_datetime(event: Any) -> datetime | None:
    dt_start = event.get("dtstart")
    if not dt_start:
        return None
    value = dt_start.dt
    if isinstance(value, datetime):
        if value.tzinfo is None:
            return value.replace(tzinfo=MOSCOW_TZ)
        return value
    if isinstance(value, date):
        return datetime.combine(value, datetime.min.time(), tzinfo=MOSCOW_TZ)
    return None


def _event_window(event_date: date, today: date) -> str | None:
    if event_date == today:
        return "today"
    if today < event_date <= today + timedelta(days=6):
        return "week"
    return None


def _fetch_ics(url: str, timeout: int = 10) -> bytes | None:
    try:
        request = Request(url, headers={"User-Agent": "TrendRadar/1.0"})
        with urlopen(request, timeout=timeout) as response:
            return response.read()
    except URLError:
        return None


def collect_calendar(settings: Settings) -> list[TrendItem]:
    items: list[TrendItem] = []
    if Calendar is None:
        return items
    sources = settings.calendar_ics_urls or []
    today = datetime.now(MOSCOW_TZ).date()

    for source_index, source_url in enumerate(sources):
        ics_payload = _fetch_ics(source_url)
        if not ics_payload:
            continue
        calendar = Calendar.from_ical(ics_payload)
        source_key = _source_key(source_url)

        for event_index, event in enumerate(calendar.walk("VEVENT")):
            event_dt = _event_datetime(event)
            if not event_dt:
                continue
            event_date = event_dt.astimezone(MOSCOW_TZ).date()
            window = _event_window(event_date, today)
            if not window:
                continue

            title = _safe_text(event.get("summary"))
            description = _safe_text(event.get("description"))
            event_url = _safe_text(event.get("url"))
            uid = _safe_text(event.get("uid"))

            stable_key = uid or title or f"calendar-{source_index}-{event_index}"
            item_id = f"calendar-{_hash_id(stable_key)}"
            score = 80 if window == "today" else 65

            items.append(
                TrendItem(
                    id=item_id,
                    title=title or "Календарный повод",
                    window=window,
                    score=score,
                    predictive_score=0,
                    verdict="unknown",
                    source=source_key,
                    source_url=source_url,
                    captured_at=event_dt.isoformat(),
                    updated_at=datetime.utcnow().isoformat(timespec="seconds"),
                    locale="ru-RU",
                    region_bias_score=1.0,
                    evidence=[
                        Evidence(
                            source_key=source_key,
                            url=event_url or None,
                            note=description or None,
                        )
                    ],
                )
            )

    return items
