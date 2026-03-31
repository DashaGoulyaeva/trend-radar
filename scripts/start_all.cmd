@echo off
chcp 65001 >nul
setlocal

echo ===============================
echo Радар трендов - быстрый запуск
echo ===============================
echo Этот скрипт поднимает Ollama, запускает пайплайн и API.
echo.
set "REPO_ROOT=%~dp0.."

call :find_python
if not defined PYTHON_FILE (
  echo Ошибка: Python не найден в PATH. Установи Python или добавь в PATH.
  exit /b 1
)

call :find_ollama

pushd "%REPO_ROOT%" >nul

call :ensure_deps
if errorlevel 1 (
  echo Не удалось установить зависимости. Проверь доступ в интернет и права.
)

call :check_ollama
if errorlevel 1 (
  if defined OLLAMA_FILE (
    echo Ollama не запущена. Пытаюсь стартовать...
    powershell -NoProfile -Command "Start-Process -FilePath '%OLLAMA_FILE%' -ArgumentList 'serve' -WindowStyle Minimized"
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
call "%PYTHON_FILE%" %PYTHON_ARGS% -m trend_radar.pipeline

echo.
echo Запуск API...
powershell -NoProfile -Command "Start-Process -FilePath '%PYTHON_FILE%' -ArgumentList '%PYTHON_ARGS% -m trend_radar.api' -WindowStyle Minimized"

powershell -NoProfile -Command "Start-Sleep -Seconds 2"

call :check_api
if errorlevel 1 (
  echo API недоступен по http://127.0.0.1:8000/api/trends
) else (
  echo API доступен: http://127.0.0.1:8000/api/trends
)

popd >nul
exit /b 0

:find_python
set "PYTHON_FILE="
set "PYTHON_ARGS="
where python >nul 2>nul
if %errorlevel%==0 (
  set "PYTHON_FILE=python"
  exit /b 0
)
where py >nul 2>nul
if %errorlevel%==0 (
  set "PYTHON_FILE=py"
  set "PYTHON_ARGS=-3"
)
exit /b 0

:find_ollama
set "OLLAMA_FILE="
where ollama >nul 2>nul
if %errorlevel%==0 (
  set "OLLAMA_FILE=ollama"
  exit /b 0
)
if exist "%LOCALAPPDATA%\Programs\Ollama\ollama.exe" (
  set "OLLAMA_FILE=%LOCALAPPDATA%\Programs\Ollama\ollama.exe"
)
exit /b 0

:ensure_deps
call "%PYTHON_FILE%" %PYTHON_ARGS% -c "import trend_radar" >nul 2>nul
if errorlevel 1 (
  echo Устанавливаю зависимости (editable) в backend...
  call "%PYTHON_FILE%" %PYTHON_ARGS% -m pip install -e backend
  if errorlevel 1 exit /b 1
)
exit /b 0

:check_ollama
powershell -NoProfile -Command "try { (Invoke-WebRequest -UseBasicParsing 'http://127.0.0.1:11434/api/tags' -TimeoutSec 2) | Out-Null; exit 0 } catch { exit 1 }"
exit /b %errorlevel%

:check_api
powershell -NoProfile -Command "try { (Invoke-WebRequest -UseBasicParsing 'http://127.0.0.1:8000/api/trends' -TimeoutSec 2) | Out-Null; exit 0 } catch { exit 1 }"
exit /b %errorlevel%
