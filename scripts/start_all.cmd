@echo off
chcp 65001 >nul
setlocal

echo ===============================
echo Радар трендов - быстрый запуск
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

if not exist "%OLLAMA_EXE%" (
  echo Предупреждение: Ollama не найдена по пути "%OLLAMA_EXE%".
  echo Продолжаю без автозапуска Ollama.
)

pushd "%REPO_ROOT%" >nul

call :ensure_deps
if errorlevel 1 (
  echo Не удалось установить зависимости. Проверь доступ в интернет и права.
)

call :check_ollama
if errorlevel 1 (
  if exist "%OLLAMA_EXE%" (
    echo Ollama не запущена. Пытаюсь стартовать...
    start "" /min "%OLLAMA_EXE%" serve
    powershell -NoProfile -Command "Start-Sleep -Seconds 2"
    call :check_ollama
    if errorlevel 1 (
      echo Не удалось запустить Ollama. Продолжаю без нее.
    ) else (
      echo Ollama запущена.
    )
  ) else (
    echo Ollama не найдена. Пропускаю запуск.
  )
) else (
  echo Ollama уже запущена.
)

echo.
echo Запуск пайплайна...
"%PYTHON_EXE%" backend\scripts\run_pipeline.py

echo.
echo Запуск API...
powershell -NoProfile -Command "Start-Process -FilePath '%PYTHON_EXE%' -ArgumentList 'backend\\scripts\\serve_api.py --host 127.0.0.1 --port 8000' -WindowStyle Minimized"

powershell -NoProfile -Command "Start-Sleep -Seconds 2"

call :check_api
if errorlevel 1 (
  echo API недоступен по http://127.0.0.1:8000/api/trends
) else (
  echo API доступен: http://127.0.0.1:8000/api/trends
)

call :check_ollama
if errorlevel 1 (
  echo Ollama недоступна по http://127.0.0.1:11434/api/tags
) else (
  echo Ollama доступна: http://127.0.0.1:11434/api/tags
)

echo.
echo Готово. Открой: "%REPO_ROOT%\web\index.html"
echo.

if /I "%1"=="front" (
  echo Открываю фронт...
  start "" "%REPO_ROOT%\web\index.html"
)

echo Окно можно закрыть, когда API больше не нужен.
popd >nul
exit /b 0

:ensure_deps
if not exist "%REPO_ROOT%\backend\.deps" (
  mkdir "%REPO_ROOT%\backend\.deps" >nul 2>nul
)
"%PYTHON_EXE%" -c "import sys; from pathlib import Path; repo=Path(r'%REPO_ROOT%'); deps=repo/'backend'/'.deps'; src=repo/'backend'/'src'; sys.path[:0]=[str(deps), str(src)]; import icalendar" >nul 2>nul
if errorlevel 1 (
  echo Устанавливаю зависимости в backend\.deps...
  "%PYTHON_EXE%" -m pip install -r backend\requirements.txt --target backend\.deps
  if errorlevel 1 exit /b 1
)
exit /b 0

:check_ollama
powershell -NoProfile -Command "try { (Invoke-WebRequest -UseBasicParsing 'http://127.0.0.1:11434/api/tags' -TimeoutSec 2) | Out-Null; exit 0 } catch { exit 1 }"
exit /b %errorlevel%

:check_api
powershell -NoProfile -Command "try { (Invoke-WebRequest -UseBasicParsing 'http://127.0.0.1:8000/api/trends' -TimeoutSec 2) | Out-Null; exit 0 } catch { exit 1 }"
exit /b %errorlevel%
