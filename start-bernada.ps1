$ErrorActionPreference = "Stop"

$PG_BIN  = "C:\Users\User\scoop\apps\postgresql\18.4-2\bin"
$PG_DATA = "C:\Users\User\scoop\apps\postgresql\18.4-2\data"
$NODE    = "C:\Users\User\AppData\Local\hermes\node\node.exe"
$PROJECT = "C:\Users\User\bernada.id811"
$PG_LOG  = "$env:TEMP\opencode\bernada-pg.log"

Write-Host ""
Write-Host "========================================"
Write-Host "       BERNADA.ID SERVER START"
Write-Host "========================================"
Write-Host ""

# ------------ Postgresql ------------

Write-Host "[1/3] Checking PostgreSQL..."

& "$PG_BIN\pg_ctl.exe" status -D "$PG_DATA" 2>&1 | Out-Null

if ($LASTEXITCODE -eq 0) {
  Write-Host "PostgreSQL: Already Running"
}
else {
  Write-Host "PostgreSQL: Starting..."

  & "$PG_BIN\pg_ctl.exe" start `
    -D "$PG_DATA" `
    -w `
    -l "$PG_LOG"

  if ($LASTEXITCODE -ne 0) {
    throw "PostgreSQL failed to start. Check log file: $PG_LOG"
  }

Write-Host "Database: STARTED"
}

# ---------- Database Readiness ------------
Write-Host "[2/3] Checking Database..."

$dbReady = $false
for ($i =1; $i -le 10; $i++) {
  try {
    & "$PG_BIN\psql.exe" `
      -h 127.0.0.1 `
      -p 5432 `
      -U bernada `
      -d bernada `
      -c "SELECT 1;" `
      2>$null

    if ($LASTEXITCODE -eq 0) {
      $dbReady = $true
      break
    }
  }
  catch {}
  Start-Sleep -Seconds 1
}

if (-not $dbReady) {
  throw "PostgreSQL hidup teteapi database belum READY."
}

Write-Host "Database: READY"

# ---------- API ------------
Write-Host "[3/3] Starting API..."

$apiReady = $false

try {
    $health = Invoke-RestMethod `
        -Uri "http://127.0.0.1:3000/api/health" `
        -TimeoutSec 3

    if ($health.status -eq "ok" -and $health.database -eq "connected") {
        Write-Host "API: Already Running"
        $apiReady = $true
    }
}
catch {}

if (-not $apiReady) {
    Write-Host "API: STARTING..."

    # Jalur resmi: start-api.ps1 menangani reuse + spawn detached (helper).
    # Tidak memakai Start-Process langsung (berisiko mewarisi pipe stdout tool).
    & (Join-Path $PSScriptRoot "scripts\start-api.ps1") -Port 3000 -TimeoutSec 30

    $health = $null
    try {
        $health = Invoke-RestMethod -Uri "http://127.0.0.1:3000/api/health" -TimeoutSec 3
    }
    catch {}

    if (-not ($health.status -eq "ok" -and $health.database -eq "connected")) {
        throw "BERNADA API gagal READY."
    }

    Write-Host "API: READY"
    $apiReady = $true
}

Write-Host ""
Write-Host "========================================"
Write-Host "       BERNADA.ID READY"
Write-Host "========================================"
Write-Host "PostgreSQL : 5432"
Write-Host "API        : http://127.0.0.1:3000"
Write-Host "Health     : http://127.0.0.1:3000/api/health"
Write-Host "========================================"
Write-Host ""