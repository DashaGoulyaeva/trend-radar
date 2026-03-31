# Trend Radar

Локальный редакторский радар сигналов для российской аудитории. На фронте используется название «Радар трендов».

## Структура

- `Фронт/` — статический фронт (открывается напрямую через `file://`).
- `backend/` — Python pipeline + API.
- `docs/` — архитектура и источники.

## Быстрый запуск (локально)

1. Установить зависимости:

```bash
npm i
python -m pip install -r backend/requirements.txt
```

2. Запустить всё сразу (Ollama + пайплайн + API):

```bash
scripts\start_all.cmd
```

Скрипт использует явные пути:
- Python: `C:\Python314\python.exe`
- Ollama: `C:\Users\1\AppData\Local\Programs\Ollama\ollama.exe` (если нет в PATH)

3. (Опционально) запуск через PowerShell + открыть фронт:

```bash
scripts\start_all.ps1 -OpenFront
```

4. Открыть фронт вручную:

```
Фронт\index.html
```

UI ожидает API по `http://127.0.0.1:8000/api/trends`.

## Автозапуск

- Task Scheduler (ONLOGON): `scripts\start_all.ps1 -InstallAutostart`
- Если нужны админ-права: `scripts\start_all.ps1 -InstallAutostart -Elevate`
- Startup folder: создаётся `TrendRadar_StartAll.cmd` в `"%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup"`

Поднять фронт сразу: `scripts\start_all.cmd front`

## Конфиг (.env)

Скопируй `backend/.env.example` в `backend/.env` и при необходимости измени:

- `SOURCE_RSS_URL` (один источник)
- `SOURCE_RSS_URLS` (список через запятую)
- `SOURCE_INCLUDE_GLOBAL` (по умолчанию `false`)
- `TRANSLATE_TO_RU` (по умолчанию `true`)
- `SOURCE_RSS_LIMIT`
- `OLLAMA_BASE_URL` (по умолчанию `http://localhost:11434`)
- `OLLAMA_MODEL` (по умолчанию `llama3.2:3b`)
- `OLLAMA_TIMEOUT`
