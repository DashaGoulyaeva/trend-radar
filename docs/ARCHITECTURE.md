# Architecture

## Components

- Frontend (Vite + React) — отображение трендов и админ-редактирование.
- Backend (Python) — сбор, обогащение, скоринг, API.
- Storage — JSON-файлы для выдачи и админ-оверрайдов.

## Data flow

1. Collector получает сырые данные.
2. Enricher добавляет контекст (опционально через Ollama).
3. Scorer вычисляет базовые оценки.
4. Pipeline пишет `backend/outputs/trends.json`.
5. API отдаёт данные и применяет админ-оверрайды.

## Storage

- `backend/outputs/trends.json` — выдача API.
- `backend/data/admin_overrides.json` — админ-правки.

## External References / Reference Implementations

- [RSSHub](https://github.com/DIYgod/RSSHub) — эталонный проект генерации RSS из множества источников. Layer: ingestion/normalization. License: MIT.
- [Miniflux](https://github.com/miniflux/v2) — минималистичный агрегатор и читалка, полезен для моделей хранения и API. Layer: aggregation/API. License: Apache-2.0.
- [FreshRSS](https://github.com/FreshRSS/FreshRSS) — self-hosted агрегатор с богатой логикой ленты. Layer: aggregation/UI patterns. License: AGPL-3.0.
- [Tiny Tiny RSS](https://github.com/tt-rss/tt-rss) — зрелый агрегатор с фильтрами и оценками. Layer: aggregation/decisioning. License: GPL-3.0.
- [osmosfeed](https://github.com/osmoscraft/osmosfeed) — статичная публикация ленты через GitHub. Layer: output/frontend delivery. License: MIT.
- [Scrapy](https://github.com/scrapy/scrapy) — фреймворк для кастомных парсеров источников. Layer: ingestion/crawling. License: BSD-3-Clause.
- [Scrapyd](https://github.com/scrapy/scrapyd) — сервис для запуска и оркестрации пауков Scrapy. Layer: scheduling/ops. License: BSD-3-Clause.
- [fastfeedparser](https://github.com/kagisearch/fastfeedparser) — быстрый парсер RSS/Atom. Layer: parsing. License: MIT.
