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

function Resolve-Python {
    $cmd = Get-Command python -ErrorAction SilentlyContinue
    if ($cmd) { return @($cmd.Path) }
    $py = Get-Command py -ErrorAction SilentlyContinue
    if ($py) { return @($py.Path, "-3") }
    return $null
}

function Resolve-Ollama {
    $cmd = Get-Command ollama -ErrorAction SilentlyContinue
    if ($cmd) { return $cmd.Path }
    $fallback = Join-Path $env:LOCALAPPDATA "Programs\Ollama\ollama.exe"
    if (Test-Path $fallback) { return $fallback }
    return $null
}

$pythonCmd = Resolve-Python
if (-not $pythonCmd) {
    Write-Host "Ошибка: Python не найден в PATH. Установи Python или добавь в PATH."
    exit 1
}

$pythonExe = $pythonCmd[0]
$pythonArgs = @()
if ($pythonCmd.Length -gt 1) { $pythonArgs += $pythonCmd[1] }

$ollamaExe = Resolve-Ollama
if (-not $ollamaExe) {
    Write-Host "Предупреждение: Ollama не найдена в PATH. Продолжаю без автозапуска Ollama."
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
    & $pythonCmd -c "import trend_radar" | Out-Null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Устанавливаю зависимости (editable) в backend..."
        & $pythonCmd -m pip install -e "$repoRoot\backend"
        if ($LASTEXITCODE -ne 0) { return $false }
    }
    return $true
}

if (-not (Ensure-Deps)) {
    Write-Host "Не удалось установить зависимости. Проверь доступ в интернет и права."
}

if (-not (Test-Url $ollamaUrl)) {
    if ($ollamaExe) {
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
& $pythonCmd -m trend_radar.pipeline

Write-Host "Запуск API..."
Start-Process -FilePath $pythonExe -ArgumentList ($pythonArgs + "-m trend_radar.api") -WindowStyle Minimized

Start-Sleep -Seconds 2
if (Test-Url $apiUrl) {
    Write-Host "API доступен: $apiUrl"
} else {
    Write-Host "API недоступен по $apiUrl"
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
