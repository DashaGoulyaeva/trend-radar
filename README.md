# Trend Radar

Локальный редакторский радар трендов для российской аудитории. Фронтенд получает данные из локального API и показывает два окна анализа: сегодня и неделя вперёд.

## Обзор

- Целевая аудитория: ru-RU
- Окна анализа: `today`, `week`
- Админ-оценки: `admin_score`, `admin_notes`

## Быстрый старт

1. Установить зависимости

```bash
npm i
python -m pip install -r backend/requirements.txt
```

2. (Опционально) Запустить Ollama

```bash
ollama serve
ollama run llama3.1
```

3. Запустить пайплайн и API

```bash
python backend/scripts/run_pipeline.py --output backend/outputs/trends.json
python backend/scripts/serve_api.py --host 127.0.0.1 --port 8000
```

4. Запустить фронтенд

```bash
npm run dev
```

Фронтенд ожидает API по `http://127.0.0.1:8000/api/trends`.

## Архитектура

- `backend/` — Python pipeline + API
- `src/` — React UI (Vite)
- `docs/` — архитектура, источники, roadmap

## Документация

- `docs/ARCHITECTURE.md`
- `docs/DATA_SOURCES.md`
- `docs/ROADMAP.md`
