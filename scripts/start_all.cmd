@chcp 1251 >nul
@echo off
setlocal

echo ===============================
echo Радар трендов — быстрый запуск
echo ===============================
echo Этот скрипт поднимает Ollama, запускает пайплайн и API.
echo.
set "REPO_ROOT=%~dp0.."
set "OLLAMA_EXE=C:\Users\1\AppData\Local\Programs\Ollama\ollama.exe"
if not exist "%OLLAMA_EXE%" set "OLLAMA_EXE=ollama"

pushd "%REPO_ROOT%" >nul

call :check_ollama
if errorlevel 1 (
  echo Ollama не запущена. Пытаюсь стартовать...
  start "" /min "%OLLAMA_EXE%" serve
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

echo.
echo Запуск пайплайна...
"C:\Python314\python.exe" backend\scripts\run_pipeline.py

echo.
echo Запуск API...
start "" "C:\Python314\python.exe" backend\scripts\serve_api.py --host 127.0.0.1 --port 8000

if /I "%1"=="front" (
  echo Открываю фронт...
  start "" "%REPO_ROOT%\Фронт\index.html"
)

echo.
echo Готово. Открой: "%REPO_ROOT%\Фронт\index.html"
echo.

popd >nul
exit /b 0

:check_ollama
powershell -NoProfile -Command "try { (Invoke-WebRequest -UseBasicParsing 'http://127.0.0.1:11434/api/tags' -TimeoutSec 2) | Out-Null; exit 0 } catch { exit 1 }"
exit /b %errorlevel%