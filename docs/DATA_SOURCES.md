# Data Sources

## Current

- RSS: `SOURCE_RSS_URL` (по умолчанию Hacker News RSS)
- Календарные поводы (iCal/ICS): `CALENDAR_ICS_URLS` (по умолчанию публичный календарь праздников РФ)
- Админ-правки из UI (локальный JSON)

## Planned (stub)

- Российские медиа/агрегаторы
- Telegram/соцсети
- Маркетплейсы и отзывы

## External References / Reference Implementations

- [RSSHub](https://github.com/DIYgod/RSSHub) — карта возможных RSS-источников и схем. Layer: ingestion/normalization. License: MIT.
- [Miniflux](https://github.com/miniflux/v2) — референсный агрегатор, полезен для понимания выдачи и хранения. Layer: aggregation/API. License: Apache-2.0.
- [FreshRSS](https://github.com/FreshRSS/FreshRSS) — зрелая реализация ленты, помогает с логикой обновлений. Layer: aggregation/UI patterns. License: AGPL-3.0.
- [Tiny Tiny RSS](https://github.com/tt-rss/tt-rss) — фильтры и правила обработки лент. Layer: aggregation/decisioning. License: GPL-3.0.
- [osmosfeed](https://github.com/osmoscraft/osmosfeed) — статический вывод ленты и кеширование. Layer: output/frontend delivery. License: MIT.
- [Scrapy](https://github.com/scrapy/scrapy) — стандарт для сбора данных из веб-источников. Layer: ingestion/crawling. License: BSD-3-Clause.
- [Scrapyd](https://github.com/scrapy/scrapyd) — запуск и контроль краулеров. Layer: scheduling/ops. License: BSD-3-Clause.
- [fastfeedparser](https://github.com/kagisearch/fastfeedparser) — быстрый RSS/Atom парсер. Layer: parsing. License: MIT.
- [icalendar](https://github.com/collective/icalendar) — Python парсер iCal/ICS. Layer: parsing. License: BSD-2-Clause.
- [ics-py](https://github.com/ics-py/ics-py) — ещё один Python парсер iCal/ICS. Layer: parsing. License: Apache-2.0.
