from __future__ import annotations

import argparse

from .config import load_settings
from .explain import explain_items
from .ingest import ingest_rss
from .normalize import normalize_items
from .rank import rank_items
from .storage import SQLiteStore


def run_pipeline() -> int:
    settings = load_settings()
    store = SQLiteStore(settings.db_path)
    store.init_db()

    raw_items = ingest_rss(settings)
    normalized = normalize_items(raw_items)
    ranked = rank_items(normalized)
    explained = explain_items(ranked, settings)

    store.write_batch(raw_items, explained)
    return len(explained)


def main() -> int:
    parser = argparse.ArgumentParser(description="Run Trend Radar pipeline")
    parser.add_argument("--limit", type=int, default=None, help="Limit RSS items per source")
    args = parser.parse_args()

    if args.limit is not None:
        # override via env-like behavior for this run
        settings = load_settings()
        settings = settings.__class__(
            data_dir=settings.data_dir,
            output_dir=settings.output_dir,
            db_path=settings.db_path,
            admin_overrides_path=settings.admin_overrides_path,
            source_rss_urls=settings.source_rss_urls,
            ru_sources=settings.ru_sources,
            global_sources=settings.global_sources,
            calendar_ics_urls=settings.calendar_ics_urls,
            source_rss_limit=args.limit,
            ollama_base_url=settings.ollama_base_url,
            ollama_model=settings.ollama_model,
            ollama_timeout=settings.ollama_timeout,
            translate_to_ru=settings.translate_to_ru,
            include_global_sources=settings.include_global_sources,
        )
        store = SQLiteStore(settings.db_path)
        store.init_db()
        raw_items = ingest_rss(settings)
        normalized = normalize_items(raw_items)
        ranked = rank_items(normalized)
        explained = explain_items(ranked, settings)
        store.write_batch(raw_items, explained)
        return len(explained)

    run_pipeline()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
