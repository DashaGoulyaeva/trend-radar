param(
    [switch]$OpenFront,
    [switch]$Elevate,
    [switch]$InstallAutostart
)

[Console]::OutputEncoding = [System.Text.UTF8Encoding]::new($false)
$OutputEncoding = [Console]::OutputEncoding

function Test-Admin {
    $identity = [Security.Principal.WindowsIdentity]::GetCurrent()
    $principal = New-Object Security.Principal.WindowsPrincipal($identity)
    return $principal.IsInRole([Security.Principal.WindowsBuiltinRole]::Administrator)
}

if ($Elevate -and -not (Test-Admin)) {
    $argsList = @("-ExecutionPolicy", "Bypass", "-File", "`"$PSCommandPath`"")
    if ($OpenFront) { $argsList += "-OpenFront" }
    if ($InstallAutostart) { $argsList += "-InstallAutostart" }
    Start-Process -FilePath "powershell" -ArgumentList $argsList -Verb RunAs
    exit
}

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
$ollamaUrl = "http://127.0.0.1:11434/api/tags"
$apiUrl = "http://127.0.0.1:8000/api/trends"
$ollamaExe = "C:\Users\1\AppData\Local\Programs\Ollama\ollama.exe"
$pythonExe = "C:\Python314\python.exe"
$depsPath = Join-Path $repoRoot "backend\.deps"

if (-not (Test-Path $pythonExe)) {
    Write-Host "Ошибка: Python не найден по пути $pythonExe."
    exit 1
}

if (-not (Test-Path $ollamaExe)) {
    Write-Host "Предупреждение: Ollama не найдена по пути $ollamaExe. Продолжаю без автозапуска Ollama."
}

function Test-Url([string]$url) {
    try {
        Invoke-WebRequest -UseBasicParsing $url -TimeoutSec 2 | Out-Null
        return $true
    } catch {
        return $false
    }
}

function Ensure-Deps {
    if (-not (Test-Path $depsPath)) {
        New-Item -ItemType Directory -Path $depsPath | Out-Null
    }
    $check = "import sys; from pathlib import Path; repo=Path(r'$repoRoot'); deps=repo/'backend'/'.deps'; src=repo/'backend'/'src'; sys.path[:0]=[str(deps), str(src)]; import icalendar"
    & $pythonExe -c $check | Out-Null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Устанавливаю зависимости в backend\.deps..."
        & $pythonExe -m pip install -r "$repoRoot\backend\requirements.txt" --target "$repoRoot\backend\.deps"
        if ($LASTEXITCODE -ne 0) { return $false }
    }
    return $true
}

if (-not (Ensure-Deps)) {
    Write-Host "Не удалось установить зависимости. Проверь доступ в интернет и права."
}

if (-not (Test-Url $ollamaUrl)) {
    if (Test-Path $ollamaExe) {
        Write-Host "Ollama не запущена. Пытаюсь стартовать..."
        try {
            Start-Process -WindowStyle Minimized -FilePath $ollamaExe -ArgumentList "serve"
        } catch {
            Write-Host "Не удалось запустить Ollama по пути $ollamaExe."
        }
        Start-Sleep -Seconds 2
    } else {
        Write-Host "Ollama не найдена. Пропускаю запуск."
    }
}

if (Test-Url $ollamaUrl) {
    Write-Host "Ollama доступна: $ollamaUrl"
} else {
    Write-Host "Ollama недоступна. Продолжаю без нее."
}

Write-Host "Запуск пайплайна..."
& $pythonExe "$repoRoot\backend\scripts\run_pipeline.py"

Write-Host "Запуск API..."
Start-Process -FilePath $pythonExe -ArgumentList "$repoRoot\backend\scripts\serve_api.py --host 127.0.0.1 --port 8000"

Start-Sleep -Seconds 2
if (Test-Url $apiUrl) {
    Write-Host "API доступен: $apiUrl"
} else {
    Write-Host "API недоступен по $apiUrl"
}

if (Test-Url $ollamaUrl) {
    Write-Host "Ollama доступна: $ollamaUrl"
} else {
    Write-Host "Ollama недоступна: $ollamaUrl"
}

if ($OpenFront) {
    Start-Process "$repoRoot\web\index.html"
}

Write-Host "Готово. Открой: $repoRoot\web\index.html"

if ($InstallAutostart) {
    $taskName = "Trend Radar Autostart"
    $taskCmd = "`"$repoRoot\scripts\start_all.cmd`""
    $createArgs = @(
        "/Create",
        "/TN", $taskName,
        "/SC", "ONLOGON",
        "/RL", "HIGHEST",
        "/TR", $taskCmd,
        "/F"
    )
    try {
        Start-Process -FilePath "$env:SystemRoot\System32\schtasks.exe" -ArgumentList $createArgs -Wait -NoNewWindow
        Write-Host "Автозапуск установлен через Task Scheduler: $taskName"
    } catch {
        Write-Host "Не удалось создать задачу Task Scheduler. Запусти скрипт с -Elevate."
    }
}