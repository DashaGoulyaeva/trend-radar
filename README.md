# Trend Radar

Локальный редакторский радар сигналов. Фронтенд работает как статическая страница
`index.html` и подтягивает данные из API.

## Быстрый запуск (локально)

1. Установить зависимости:

```bash
npm i
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

4. Открыть фронт:

- Открой `index.html` двойным кликом (file://).
- Или запусти локальный сервер:

```bash
python -m http.server 8001
```

После этого открой `http://127.0.0.1:8001`.

UI ожидает API по `http://127.0.0.1:8000/api/trends`.

## Конфиг (.env)

Скопируй `backend/.env.example` в `backend/.env` и при необходимости измени:

- `SOURCE_RSS_URL` (по умолчанию `https://news.ycombinator.com/rss`)
- `SOURCE_RSS_LIMIT`
- `OLLAMA_BASE_URL` (по умолчанию `http://localhost:11434`)
- `OLLAMA_MODEL` (по умолчанию `llama3.2:3b`)
- `OLLAMA_TIMEOUT`

## Структура

- `backend/` — Python pipeline + API
- `src/` — исходники прежнего React UI (сейчас фронт — статический `index.html`)

## API contract (stub)

The backend now emits placeholder fields required by the product scope:

- `window`: `today` | `week`
- `admin_score` and `admin_notes`
- `locale` (default `ru-RU`)
- `region_bias_score`
