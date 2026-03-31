from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
import os

from dotenv import load_dotenv


def _resolve(path_value: str) -> Path:
    return Path(path_value).expanduser().resolve()


@dataclass(frozen=True)
class Settings:
    data_dir: Path
    output_dir: Path
    admin_overrides_path: Path
    source_rss_url: str
    source_rss_limit: int
    ollama_base_url: str
    ollama_model: str
    ollama_timeout: float


def load_settings() -> Settings:
    load_dotenv()
    data_dir = _resolve(os.getenv("TREND_RADAR_DATA_DIR", "backend/data"))
    output_dir = _resolve(os.getenv("TREND_RADAR_OUTPUT_DIR", "backend/outputs"))
    admin_overrides_path = _resolve(
        os.getenv("TREND_RADAR_ADMIN_OVERRIDES", "backend/data/admin_overrides.json")
    )
    source_rss_url = os.getenv("SOURCE_RSS_URL", "https://news.ycombinator.com/rss")
    source_rss_limit = int(os.getenv("SOURCE_RSS_LIMIT", "12"))
    ollama_base_url = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
    ollama_model = os.getenv("OLLAMA_MODEL", "llama3.2:3b")
    ollama_timeout = float(os.getenv("OLLAMA_TIMEOUT", "30"))
    return Settings(
        data_dir=data_dir,
        output_dir=output_dir,
        admin_overrides_path=admin_overrides_path,
        source_rss_url=source_rss_url,
        source_rss_limit=source_rss_limit,
        ollama_base_url=ollama_base_url,
        ollama_model=ollama_model,
        ollama_timeout=ollama_timeout,
    )
