# Trend Radar backend (Python)

Пайплайн сбора/обогащения и минимальный API для фронтенда.

## Требования

- Python 3.10+
- Ollama (опционально, для обогащения)

## Конфиг (.env)

Скопируйте `backend/.env.example` в `backend/.env` и при необходимости измените:

- `TREND_RADAR_DATA_DIR`
- `TREND_RADAR_OUTPUT_DIR`
- `TREND_RADAR_ADMIN_OVERRIDES`
- `SOURCE_RSS_URL`
- `SOURCE_RSS_URLS` (comma-separated)
- `SOURCE_INCLUDE_GLOBAL` (false по умолчанию)
- `TRANSLATE_TO_RU` (true по умолчанию)
- `SOURCE_RSS_LIMIT`
- `CALENDAR_ICS_URLS` (список iCal/ICS через запятую)
- `OLLAMA_BASE_URL`
- `OLLAMA_MODEL`
- `OLLAMA_TIMEOUT`

По умолчанию используются только RU-источники. Глобальные источники добавляются при `SOURCE_INCLUDE_GLOBAL=true`.

## Pipeline

```bash
python backend/scripts/run_pipeline.py --output backend/outputs/trends.json
```

Результат пишется в `backend/outputs/trends.json`.

## API

Запуск:

```bash
python backend/scripts/serve_api.py --host 127.0.0.1 --port 8000
```

Эндпоинты:

- `GET /api/trends` — список трендов (с применёнными админ-оверрайдами)
- `GET /api/trends?window=today|week` — фильтр по окну анализа
- `PATCH /api/trends/{trend_id}/admin` — записать админ-правки

Админ-правки сохраняются в `backend/data/admin_overrides.json`.

## Контракт данных (stub)

Каждый тренд содержит поля:

- `window`: `today` | `week`
- `admin_score`: int (заглушка)
- `admin_notes`: list[string]
- `locale`: по умолчанию `ru-RU`
- `region_bias_score`: float (заглушка)
- `emotion`, `confidence`
- `source`, `source_url`
- `captured_at`, `updated_at`

## CORS (file://)

Для работы `file://` у фронтенда разрешён `Origin: null` в CORS. API принимает `*` и `null`.
