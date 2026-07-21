# Stops every process started by start-all.ps1.
$ErrorActionPreference = "SilentlyContinue"
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$pidsFile = Join-Path $root ".running-pids.json"

if (-not (Test-Path $pidsFile)) {
    Write-Host "No .running-pids.json found - nothing to stop."
    exit 0
}

$entries = Get-Content $pidsFile | ConvertFrom-Json
foreach ($entry in $entries) {
    Write-Host "Stopping $($entry.Name) (PID $($entry.Pid)) ..."
    Stop-Process -Id $entry.Pid -Force
}

Remove-Item $pidsFile -Force
Write-Host "All services stopped."
