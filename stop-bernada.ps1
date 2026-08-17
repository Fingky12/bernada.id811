$ErrorActionPreference = "Stop"

$PG_BIN  = "C:\Users\User\scoop\apps\postgresql\18.4-2\bin"
$PG_DATA = "C:\Users\User\scoop\apps\postgresql\18.4-2\data"

Write-Host ""
Write-Host "========================================"
Write-Host "        BERNADA.ID SERVER STOP"
Write-Host "========================================"
Write-Host ""

# ---------- API ----------
Write-Host "[1/2] Stopping API..."

$connections = Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue

if ($connections) {
    $processIds = $connections |
        Select-Object -ExpandProperty OwningProcess -Unique

    foreach ($processId in $processIds) {
        try {
            Stop-Process -Id $processId -Force -ErrorAction Stop
            Write-Host "API: STOPPED (PID $processId)"
        }
        catch {
            Write-Host "API: Failed to stop PID $processId"
        }
    }
}
else {
    Write-Host "API: Already stopped"
}

# ---------- PostgreSQL ----------
Write-Host "[2/2] Stopping PostgreSQL..."

& "$PG_BIN\pg_ctl.exe" status -D "$PG_DATA" 2>&1 | Out-Null

if ($LASTEXITCODE -eq 0) {
    & "$PG_BIN\pg_ctl.exe" stop `
        -D "$PG_DATA" `
        -m fast

    if ($LASTEXITCODE -eq 0) {
        Write-Host "PostgreSQL: STOPPED"
    }
    else {
        Write-Host "PostgreSQL: Failed to stop"
    }
}
else {
    Write-Host "PostgreSQL: Already stopped"
}

Write-Host ""
Write-Host "========================================"
Write-Host "       BERNADA.ID STOPPED"
Write-Host "========================================"
Write-Host ""