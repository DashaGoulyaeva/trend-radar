@echo off
setlocal
set "REPO_ROOT=%~dp0.."

pushd "%REPO_ROOT%" >nul

call :check_ollama
if errorlevel 1 (
  echo Ollama не запущена. Пытаюсь стартовать...
  start "" /min ollama serve
  timeout /t 2 >nul
  call :check_ollama
  if errorlevel 1 (
    echo Не удалось запустить Ollama. Продолжаю без нее.
  ) else (
    echo Ollama запущена.
  )
) else (
  echo Ollama уже запущена.
)

echo Запуск пайплайна...
python backend\scripts\run_pipeline.py

echo Запуск API...
start "" python backend\scripts\serve_api.py --host 127.0.0.1 --port 8000

if /I "%1"=="front" (
  echo Открываю фронт...
  start "" "%REPO_ROOT%\Фронт\index.html"
)

echo Готово. Открой: "%REPO_ROOT%\Фронт\index.html"

popd >nul
exit /b 0

:check_ollama
powershell -NoProfile -Command "try { (Invoke-WebRequest -UseBasicParsing 'http://127.0.0.1:11434/api/tags' -TimeoutSec 2) | Out-Null; exit 0 } catch { exit 1 }"
exit /b %errorlevel%
