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
