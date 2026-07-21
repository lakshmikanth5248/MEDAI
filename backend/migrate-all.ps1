# Runs `alembic upgrade head` for every service, in the order required by
# their cross-schema foreign keys: auth -> clinical -> pharmacy ->
# prescription -> billing -> notification -> core.
#
# NOTE: this project ships backend/sql/schema.sql as the authoritative,
# hand-written DDL (run that against Supabase first - see README). Each
# service's Alembic setup is "stamped" against that existing schema rather
# than generating it from scratch, so this script also stamps `head` instead
# of generating new tables. Use Alembic normally for FUTURE schema changes.
#
# Usage: cd backend ; ./migrate-all.ps1 [-Stamp]

param(
    [switch]$Stamp
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$envFile = Join-Path $root ".env"

if (-not (Test-Path $envFile)) {
    Write-Error "backend/.env not found. Copy .env.example to .env and fill in DATABASE_URL first."
    exit 1
}

Get-Content $envFile | ForEach-Object {
    $line = $_.Trim()
    if ($line -and -not $line.StartsWith("#") -and $line.Contains("=")) {
        $key, $value = $line -split "=", 2
        [System.Environment]::SetEnvironmentVariable($key.Trim(), $value.Trim())
    }
}

$order = @("auth-service", "clinical-service", "pharmacy-service", "prescription-service", "billing-service", "notification-service", "core-service")

foreach ($svc in $order) {
    $dir = Join-Path $root $svc
    $venvPython = Join-Path $dir ".venv\Scripts\python.exe"
    $python = if (Test-Path $venvPython) { $venvPython } else { "python" }
    $alembicCmd = if ($Stamp) { "stamp" } else { "upgrade" }
    Write-Host "==> $svc : alembic $alembicCmd head"
    Push-Location $dir
    try {
        & $python -m alembic $alembicCmd head
        if ($LASTEXITCODE -ne 0) { throw "$svc migration failed" }
    } finally {
        Pop-Location
    }
}

Write-Host "All migrations applied."
