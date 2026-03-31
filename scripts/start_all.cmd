@chcp 1251 >nul
@echo off
setlocal

echo ===============================
echo Радар трендов — быстрый запуск
echo ===============================
echo Этот скрипт поднимает Ollama, запускает пайплайн и API.
echo.
set "REPO_ROOT=%~dp0.."
set "PYTHON_EXE=C:\Python314\python.exe"
set "OLLAMA_EXE=C:\Users\1\AppData\Local\Programs\Ollama\ollama.exe"

if not exist "%PYTHON_EXE%" (
  echo Ошибка: Python не найден по пути "%PYTHON_EXE%".
  echo Установи Python или поправь путь в scripts\start_all.cmd.
  exit /b 1
)

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
"%PYTHON_EXE%" backend\scripts\run_pipeline.py

echo.
echo Запуск API...
echo Готово. Открой: "%REPO_ROOT%\Фронт\index.html"
echo.

if /I "%1"=="front" (
  echo Открываю фронт...
  start "" "%REPO_ROOT%\Фронт\index.html"
)

"%PYTHON_EXE%" backend\scripts\serve_api.py --host 127.0.0.1 --port 8000

popd >nul
exit /b 0

:check_ollama
powershell -NoProfile -Command "try { (Invoke-WebRequest -UseBasicParsing 'http://127.0.0.1:11434/api/tags' -TimeoutSec 2) | Out-Null; exit 0 } catch { exit 1 }"
exit /b %errorlevel%