# start-api.ps1 - BERNADA.ID API orchestrator (detached, readiness-based, exit 0)
# Menjalankan server detached/background, menunggu readiness saja, LALU KEMBALI (exit 0).
# Tidak pernah menunggu node.exe exit. Aman dipanggil dari tool bash yang harus return control ke agent.
#
# SPAWN memakai helper detached scripts/spawn-api.ps1 yang diluncurkan via
# [System.Diagnostics.Process]::Start(UseShellExecute=$true) sehingga TIDAK mewarisi
# pipe stdout tool bash (menghindari hang opencode karena conhost.exe memegang pipe).
# Kontrak helper: state file %TEMP%\opencode\bernada-api-<port>.state berisi PID=/STATUS=READY|FAIL.
#
# Penggunaan:
#   & .\scripts\start-api.ps1 -Port 3000
#   & .\scripts\start-api.ps1 -Port 3001
#
# Output sukses (stdout):
#   STARTED PID=<pid> / PORT=<port> / HEALTH=OK / DB=CONNECTED / REPRO-DONE / EXITCODE=0

param(
    [int]$Port = 3000,
    [int]$TimeoutSec = 30
)

$ErrorActionPreference = "Stop"

$PROJECT = "C:\Users\User\bernada.id811"

$NODE = $null
$nodeCmd = Get-Command node -ErrorAction SilentlyContinue
if ($nodeCmd -and (Test-Path $nodeCmd.Source)) {
    $NODE = $nodeCmd.Source
}
if (-not $NODE) {
    $NODE = "C:\Users\User\AppData\Local\hermes\node\node.exe"
}

$apiOut = "$env:TEMP\opencode\bernada-api-$Port.out.log"
$apiErr = "$env:TEMP\opencode\bernada-api-$Port.err.log"
$state  = "$env:TEMP\opencode\bernada-api-$Port.state"

function Get-Health {
    param([int]$p)
    try {
        $h = Invoke-RestMethod -Uri "http://127.0.0.1:$p/api/health" -TimeoutSec 3
        if ($h.status -eq "ok" -and $h.database -eq "connected") {
            return $h
        }
    }
    catch {}
    return $null
}

# --- 1) REUSE: server sehat sudah berjalan ---
$conn = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
$existingPid = $null
if ($conn) {
    $existingPid = $conn.OwningProcess | Select-Object -First 1
    $h = Get-Health -p $Port
    if ($h) {
        "STARTED PID=$existingPid"
        "PORT=$Port"
        "HEALTH=OK"
        "DB=CONNECTED"
        "REPRO-DONE"
        "EXITCODE=0"
        exit 0
    }
}

# --- 2) SPAWN: luncurkan helper detached (berumur pendek, EXIT sendiri setelah READY) ---
Remove-Item $apiOut, $apiErr, $state -ErrorAction SilentlyContinue

try {
    $spawnScript = Join-Path $PSScriptRoot "spawn-api.ps1"
    $psi = [System.Diagnostics.ProcessStartInfo]::new()
    $psi.FileName = "powershell.exe"
    $psi.Arguments = '-NoProfile -NonInteractive -ExecutionPolicy Bypass -File "' + $spawnScript + '" -Port ' + $Port + ' -Node "' + $NODE + '" -Project "' + $PROJECT + '" -State "' + $state + '" -TimeoutSec ' + $TimeoutSec
    $psi.WorkingDirectory = $PROJECT
    $psi.UseShellExecute = $true
    $psi.WindowStyle = [System.Diagnostics.ProcessWindowStyle]::Hidden
    $null = [System.Diagnostics.Process]::Start($psi)
}
catch {
    Write-Error "Gagal meluncurkan spawn-api.ps1: $_"
    "EXITCODE=1"
    exit 1
}

# --- 3) POLL state file (bounded, deterministik) ---
$ready = $false
$failReason = ""
$deadline = (Get-Date).AddSeconds($TimeoutSec)
while ((Get-Date) -lt $deadline) {
    Start-Sleep -Milliseconds 500
    if (Test-Path $state) {
        $content = Get-Content $state -Raw
        if ($content -match "STATUS=READY") {
            $ready = $true
            break
        }
        if ($content -match "STATUS=FAIL") {
            if ($content -match "REASON=(.*)") { $failReason = $Matches[1].Trim() }
            break
        }
    }
}

if (-not $ready) {
    Write-Error "API gagal READY dalam $TimeoutSec detik. $failReason"
    if (Test-Path $state) { Write-Output "=== STATE ==="; Get-Content $state }
    if (Test-Path $apiOut) { Write-Output "=== STDOUT ==="; Get-Content $apiOut -Tail 50 }
    if (Test-Path $apiErr) { Write-Output "=== STDERR ==="; Get-Content $apiErr -Tail 50 }
    "EXITCODE=1"
    exit 1
}

# verifikasi ulang health (jaga konsistensi laporan)
$hFinal = Get-Health -p $Port
if (-not $hFinal) {
    Write-Error "State READY tetapi health tidak terverifikasi."
    "EXITCODE=1"
    exit 1
}

# --- 4) REPORT ---
$spawnedPid = $null
if (Test-Path $state) {
    if ((Get-Content $state -Raw) -match "PID=(\d+)") { $spawnedPid = $Matches[1] }
}
if (-not $spawnedPid) {
    $conn2 = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
    if ($conn2) { $spawnedPid = $conn2.OwningProcess | Select-Object -First 1 }
}
"STARTED PID=$spawnedPid"
"PORT=$Port"
"HEALTH=OK"
"DB=CONNECTED"
"REPRO-DONE"
"EXITCODE=0"
exit 0
