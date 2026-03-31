from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
import os
from typing import List

from dotenv import load_dotenv


def _resolve(path_value: str) -> Path:
    return Path(path_value).expanduser().resolve()


@dataclass(frozen=True)
class Settings:
    data_dir: Path
    output_dir: Path
    admin_overrides_path: Path
    source_rss_urls: List[str]
    ru_sources: List[str]
    global_sources: List[str]
    calendar_ics_urls: List[str]
    source_rss_limit: int
    ollama_base_url: str
    ollama_model: str
    ollama_timeout: float
    translate_to_ru: bool
    include_global_sources: bool


def load_settings() -> Settings:
    load_dotenv()
    data_dir = _resolve(os.getenv("TREND_RADAR_DATA_DIR", "backend/data"))
    output_dir = _resolve(os.getenv("TREND_RADAR_OUTPUT_DIR", "backend/outputs"))
    admin_overrides_path = _resolve(
        os.getenv("TREND_RADAR_ADMIN_OVERRIDES", "backend/data/admin_overrides.json")
    )
    ru_sources_default = [
        "https://lenta.ru/rss/news",
        "https://ria.ru/export/rss2/archive/index.xml",
        "https://rssexport.rbc.ru/rbcnews/news/30/full.rss",
    ]
    global_sources_default = [
        "https://news.ycombinator.com/rss",
        "https://rss.nytimes.com/services/xml/rss/nyt/World.xml",
    ]
    source_rss_urls_env = os.getenv("SOURCE_RSS_URLS", "").strip()
    source_rss_url_single = os.getenv("SOURCE_RSS_URL", "").strip()
    include_global_sources = os.getenv("SOURCE_INCLUDE_GLOBAL", "false").lower() in {
        "true",
        "1",
        "yes",
    }
    translate_to_ru = os.getenv("TRANSLATE_TO_RU", "true").lower() in {"true", "1", "yes"}

    if source_rss_urls_env:
        source_rss_urls = [url.strip() for url in source_rss_urls_env.split(",") if url.strip()]
        ru_sources = source_rss_urls[:]
        global_sources = []
    elif source_rss_url_single:
        source_rss_urls = [source_rss_url_single]
        ru_sources = [source_rss_url_single]
        global_sources = []
    else:
        ru_sources = ru_sources_default
        global_sources = global_sources_default if include_global_sources else []
        source_rss_urls = ru_sources + global_sources
    calendar_ics_urls_env = os.getenv("CALENDAR_ICS_URLS", "").strip()
    if calendar_ics_urls_env:
        calendar_ics_urls = [
            url.strip() for url in calendar_ics_urls_env.split(",") if url.strip()
        ]
    else:
        calendar_ics_urls = [
            "https://calendar.google.com/calendar/ical/ru.russian%23holiday%40group.v.calendar.google.com/public/basic.ics"
        ]
    source_rss_limit = int(os.getenv("SOURCE_RSS_LIMIT", "12"))
    ollama_base_url = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
    ollama_model = os.getenv("OLLAMA_MODEL", "llama3.2:3b")
    ollama_timeout = float(os.getenv("OLLAMA_TIMEOUT", "30"))
    return Settings(
        data_dir=data_dir,
        output_dir=output_dir,
        admin_overrides_path=admin_overrides_path,
        source_rss_urls=source_rss_urls,
        ru_sources=ru_sources,
        global_sources=global_sources,
        calendar_ics_urls=calendar_ics_urls,
        source_rss_limit=source_rss_limit,
        ollama_base_url=ollama_base_url,
        ollama_model=ollama_model,
        ollama_timeout=ollama_timeout,
        translate_to_ru=translate_to_ru,
        include_global_sources=include_global_sources,
    )
