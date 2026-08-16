# spawn-api.ps1 - Helper DETACHED berumur pendek untuk start-api.ps1
# Diluncurkan via [System.Diagnostics.Process]::Start() dengan UseShellExecute=$true
# sehingga TIDAK mewarisi pipe stdout tool bash (mencegah hang opencode karena
# conhost.exe memegang salinan pipe selama proses anak hidup).
#
# Tugas: spawn node (log ke file, capture PID), tunggu readiness (bounded),
# tulis state file, lalu EXIT. Tidak pernah menunggu node.exe exit.

param(
    [int]$Port,
    [string]$Node,
    [string]$Project,
    [string]$State,
    [int]$TimeoutSec = 30
)

$ErrorActionPreference = "Stop"

$apiOut = "$env:TEMP\opencode\bernada-api-$Port.out.log"
$apiErr = "$env:TEMP\opencode\bernada-api-$Port.err.log"

function Write-State {
    param([string]$status, [string]$pidValue = "", [string]$reason = "")
    $lines = @("PID=$pidValue", "STATUS=$status")
    if ($reason) { $lines += "REASON=$reason" }
    Set-Content -Path $State -Value $lines -Encoding UTF8
}

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

Remove-Item $apiOut, $apiErr, $State -ErrorAction SilentlyContinue

# pastikan node bind ke port yang diminta (--env-file tidak menimpa env yang sudah ada)
$env:PORT = "$Port"

$apiPid = $null
try {
    $p = Start-Process -FilePath $Node `
        -ArgumentList @("--env-file-if-exists=.env", "server/index.js") `
        -WorkingDirectory $Project `
        -RedirectStandardOutput $apiOut `
        -RedirectStandardError $apiErr `
        -WindowStyle Hidden `
        -PassThru
    $apiPid = $p.Id
}
catch {
    Write-State -status "FAIL" -reason "START-PROCESS-ERROR: $($_.Exception.Message)"
    exit 1
}

$ready = $false
$deadline = (Get-Date).AddSeconds($TimeoutSec)
while ((Get-Date) -lt $deadline) {
    Start-Sleep -Milliseconds 500

    $proc = Get-Process -Id $apiPid -ErrorAction SilentlyContinue
    if (-not $proc) {
        Write-State -status "FAIL" -pidValue "$apiPid" -reason "NODE-EXITED-EARLY"
        exit 1
    }

    if (Get-Health -p $Port) {
        $ready = $true
        break
    }
}

if ($ready) {
    Write-State -status "READY" -pidValue "$apiPid"
    exit 0
}

Write-State -status "FAIL" -pidValue "$apiPid" -reason "TIMEOUT-$TimeoutSec"
exit 1
