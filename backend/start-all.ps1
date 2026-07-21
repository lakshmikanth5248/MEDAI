# Starts every backend microservice as its own background process.
# Reads backend/.env ONCE and passes those variables into every child
# process's environment, so the Supabase connection string only ever lives
# in one file. Run backend/migrate-all.ps1 and seed/seed_data.py first.
#
# Usage:  cd backend ; ./start-all.ps1
# Stop:   ./stop-all.ps1

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$envFile = Join-Path $root ".env"

if (-not (Test-Path $envFile)) {
    Write-Error "backend/.env not found. Copy .env.example to .env and fill in DATABASE_URL / JWT_SECRET / INTERNAL_SERVICE_SECRET first."
    exit 1
}

Get-Content $envFile | ForEach-Object {
    $line = $_.Trim()
    if ($line -and -not $line.StartsWith("#") -and $line.Contains("=")) {
        $key, $value = $line -split "=", 2
        [System.Environment]::SetEnvironmentVariable($key.Trim(), $value.Trim())
    }
}

function Start-Service-Process([string]$name, [string]$portVar) {
    $dir = Join-Path $root $name
    $venvPython = Join-Path $dir ".venv\Scripts\python.exe"
    $python = if (Test-Path $venvPython) { $venvPython } else { "python" }
    $port = [System.Environment]::GetEnvironmentVariable($portVar)
    Write-Host "Starting $name on port $port ..."
    $proc = Start-Process -FilePath $python -ArgumentList "app.py" -WorkingDirectory $dir -PassThru -WindowStyle Hidden
    return [PSCustomObject]@{ Name = $name; Pid = $proc.Id }
}

$pids = @()
$pids += Start-Service-Process "auth-service" "AUTH_SERVICE_PORT"
$pids += Start-Service-Process "clinical-service" "CLINICAL_SERVICE_PORT"
$pids += Start-Service-Process "pharmacy-service" "PHARMACY_SERVICE_PORT"
$pids += Start-Service-Process "prescription-service" "PRESCRIPTION_SERVICE_PORT"
$pids += Start-Service-Process "billing-service" "BILLING_SERVICE_PORT"
$pids += Start-Service-Process "notification-service" "NOTIFICATION_SERVICE_PORT"
$pids += Start-Service-Process "core-service" "CORE_SERVICE_PORT"
Start-Sleep -Seconds 2   # let upstream services bind before the gateway starts routing to them
$pids += Start-Service-Process "gateway" "GATEWAY_PORT"

$pidsFile = Join-Path $root ".running-pids.json"
$pids | ConvertTo-Json | Set-Content $pidsFile

Write-Host ""
Write-Host "All services started. PIDs saved to $pidsFile"
Write-Host "Gateway: http://127.0.0.1:$([System.Environment]::GetEnvironmentVariable('GATEWAY_PORT'))"
Write-Host "Run ./stop-all.ps1 to stop everything."
