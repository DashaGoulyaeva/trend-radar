# Trend Radar backend (Python)

Пайплайн сбора/нормализации/ранжирования + минимальный API для фронтенда.

## Требования

- Python 3.10+
- SQLite (встроен в Python)
- Ollama (опционально, для обогащения)

## Установка (editable)

```bash
python -m pip install -e backend
```

## Конфиг (.env)

Скопируйте `backend/.env.example` в `backend/.env` и при необходимости измените:

- `TREND_RADAR_DATA_DIR`
- `TREND_RADAR_OUTPUT_DIR`
- `TREND_RADAR_DB_PATH`
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
trend-radar-pipeline
```

Результат пишется в SQLite: `backend/data/trend_radar.sqlite3`.

## API

Запуск:

```bash
trend-radar-api
```

Эндпоинты:

- `GET /api/trends?limit=50` — список трендов

## CORS (file://)

Для работы `file://` у фронтенда разрешён `Origin: null` в CORS. API принимает `*` и `null`.
