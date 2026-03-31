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
$ollamaExe = "C:\Users\1\AppData\Local\Programs\Ollama\ollama.exe"
$pythonExe = "C:\Python314\python.exe"

if (-not (Test-Path $pythonExe)) {
    Write-Host "Ошибка: Python не найден по пути $pythonExe."
    exit 1
}

if (-not (Test-Path $ollamaExe)) {
    Write-Host "Предупреждение: Ollama не найдена по пути $ollamaExe. Попробую запустить как есть."
}

function Test-Ollama {
    try {
        Invoke-WebRequest -UseBasicParsing $ollamaUrl -TimeoutSec 2 | Out-Null
        return $true
    } catch {
        return $false
    }
}

if (-not (Test-Ollama)) {
    Write-Host "Ollama не запущена. Пытаюсь стартовать..."
    try {
        Start-Process -WindowStyle Minimized -FilePath $ollamaExe -ArgumentList "serve"
    } catch {
        Write-Host "Не удалось запустить Ollama по пути $ollamaExe."
    }
    Start-Sleep -Seconds 2
}

if (Test-Ollama) {
    Write-Host "Ollama запущена."
} else {
    Write-Host "Ollama недоступна, продолжаю без нее."
}

Write-Host "Запуск пайплайна..."
& $pythonExe "$repoRoot\backend\scripts\run_pipeline.py"

Write-Host "Запуск API..."
Start-Process -FilePath $pythonExe -ArgumentList "$repoRoot\backend\scripts\serve_api.py --host 127.0.0.1 --port 8000"

if ($OpenFront) {
    Start-Process "$repoRoot\Фронт\index.html"
}

Write-Host "Готово. Открой: $repoRoot\Фронт\index.html"

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