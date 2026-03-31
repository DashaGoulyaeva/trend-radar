# Trend Radar backend (Python)

Python-пайплайн + минимальный API с RSS-ингестом и Ollama-обогащением.

## Минимальный запуск

1. Установить зависимости:

```bash
python -m pip install -r backend/requirements.txt
```

2. Запустить Ollama и модель:

```bash
ollama serve
ollama run llama3.2:3b
```

3. Запустить пайплайн и API:

```bash
python backend/scripts/run_pipeline.py --output backend/outputs/trends.json
python backend/scripts/serve_api.py --host 127.0.0.1 --port 8000
```

## Конфиг (.env)

Скопируй `backend/.env.example` в `backend/.env` и при необходимости измени:

- `SOURCE_RSS_URL` (по умолчанию `https://news.ycombinator.com/rss`)
- `SOURCE_RSS_LIMIT`
- `OLLAMA_BASE_URL` (по умолчанию `http://localhost:11434`)
- `OLLAMA_MODEL` (по умолчанию `llama3.2:3b`)
- `OLLAMA_TIMEOUT`

## Structure

- `src/trend_radar/` — pipeline modules
- `scripts/` — runnable entrypoints
- `data/` — raw and processed source data
- `outputs/` — API-ready trend payloads
- `logs/` - runtime logs

## Data contract (stub)

Each trend item currently exposes placeholder fields for the product contract:

- `window`: `today` | `week`
- `admin_score` and `admin_notes`
- `locale` (defaults to `ru-RU`)
- `region_bias_score` (float, stubbed)
