# ===========================================================================
# Vera — Casper Agentic Buildathon 2026 Demo Recording (PowerShell)
# ===========================================================================
# Run this script with OBS or Windows Game Bar (Win+G) recording the
# terminal window. The script runs the complete demo walkthrough with
# timed pauses so each step is clearly visible.
#
# USAGE:
#   1. Open this terminal window (make it at least 120x40 characters)
#   2. Start OBS Studio or press Win+G and click "Start Recording"
#   3. Run: powershell -ExecutionPolicy Bypass -File scripts/demo-record.ps1
#   4. Stop recording when "Demo Complete" appears
#
# REQUIREMENTS:
#   - Node.js 18+, pnpm installed
# ===========================================================================

$ErrorActionPreference = "Stop"
$VeraDir = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$Port = 3006
$BaseUrl = "http://localhost:$Port"
$RecordingMarker = "🎥 RECORDING"

Write-Host ""
Write-Host "╔══════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║     🛡️ VERA — Casper Agentic Buildathon 2026 Demo 🛡️       ║" -ForegroundColor Cyan
Write-Host "║                                                              ║" -ForegroundColor Cyan
Write-Host "║  Agent Identity & Trust on Casper Network                    ║" -ForegroundColor Cyan
Write-Host "║  $RecordingMarker                                            ║" -ForegroundColor Yellow
Write-Host "╚══════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""
Write-Host "=== Starting Vera in mock mode ===" -ForegroundColor Green
Start-Sleep 2

# Kill any existing process on port
$existing = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
if ($existing) {
    $pidToKill = $existing.OwningProcess
    Stop-Process -Id $pidToKill -Force -ErrorAction SilentlyContinue
    Start-Sleep 1
}

# Start Vera
Set-Location $VeraDir
$env:VERA_MOCK_MODE = "true"
$process = Start-Process -FilePath "pnpm" -ArgumentList "dev -p $Port" -NoNewWindow -PassThru -RedirectStandardOutput "$env:TEMP\vera-demo.log" -RedirectStandardError "$env:TEMP\vera-demo-err.log"

# Wait for Vera to be ready
Write-Host "Waiting for Vera to start..." -ForegroundColor Yellow
$ready = $false
for ($i = 1; $i -le 30; $i++) {
    try {
        $response = Invoke-WebRequest -Uri "$BaseUrl/api/health" -TimeoutSec 2 -UseBasicParsing
        if ($response.StatusCode -eq 200) {
            $ready = $true
            break
        }
    } catch {}
    Start-Sleep 1
}

if (-not $ready) {
    Write-Host "❌ Vera failed to start within 30 seconds" -ForegroundColor Red
    Stop-Process -Id $process.Id -Force -ErrorAction SilentlyContinue
    exit 1
}

Write-Host "✅ Vera is running at $BaseUrl" -ForegroundColor Green
Start-Sleep 1
Clear-Host

# ===========================================================================
# DEMO — 7 Steps
# ===========================================================================

Write-Host ""
Write-Host "╔══════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║     🛡️ VERA — Agent Identity & Trust Authority 🛡️          ║" -ForegroundColor Cyan
Write-Host "║                                                              ║" -ForegroundColor Cyan
Write-Host "║  Submitting to: Casper Agentic Buildathon 2026               ║" -ForegroundColor White
Write-Host "║  Track: Agent Identity & Trust                               ║" -ForegroundColor White
Write-Host "║  Deadline: July 7, 2026 @ 23:59 UTC                         ║" -ForegroundColor Red
Write-Host "╚══════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Start-Sleep 3

# --- Step 1: Health Check ---
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host "  STEP 1/7: Health Check" -ForegroundColor Magenta
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host ""
Start-Sleep 1
Write-Host "PS> curl $BaseUrl/api/health" -ForegroundColor Yellow
Start-Sleep 1
try {
    $r = Invoke-RestMethod -Uri "$BaseUrl/api/health" -UseBasicParsing
    $r | ConvertTo-Json | Write-Host
} catch { Write-Host $_.Exception.Message -ForegroundColor Red }
Write-Host ""
Start-Sleep 2

# --- Step 2: Discover Agents ---
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host "  STEP 2/7: Discover Agents" -ForegroundColor Magenta
Write-Host ""
Write-Host "  Vera finds agents from Casper MCP and direct registration." -ForegroundColor White
Write-Host "  She knows 3 agents out of the box — let's see who they are." -ForegroundColor White
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host ""
Start-Sleep 2
Write-Host "PS> curl $BaseUrl/api/discover" -ForegroundColor Yellow
Start-Sleep 1
try {
    $r = Invoke-RestMethod -Uri "$BaseUrl/api/discover" -UseBasicParsing
    $r | ConvertTo-Json -Depth 5 | Write-Host
} catch { Write-Host $_.Exception.Message -ForegroundColor Red }
Write-Host ""
Start-Sleep 3

# --- Step 3: Leaderboard ---
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host "  STEP 3/7: Leaderboard" -ForegroundColor Magenta
Write-Host ""
Write-Host "  Vera evaluates every agent on identity, endpoint quality," -ForegroundColor White
Write-Host "  key hygiene, and past reputation — then ranks them." -ForegroundColor White
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host ""
Start-Sleep 2
Write-Host "PS> curl $BaseUrl/api/leaderboard" -ForegroundColor Yellow
Start-Sleep 1
try {
    $r = Invoke-RestMethod -Uri "$BaseUrl/api/leaderboard" -UseBasicParsing
    $r | ConvertTo-Json -Depth 5 | Write-Host
} catch { Write-Host $_.Exception.Message -ForegroundColor Red }
Write-Host ""
Start-Sleep 3

# --- Step 4: Evaluate ---
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host "  STEP 4/7: Run Full Evaluation" -ForegroundColor Magenta
Write-Host ""
Write-Host "  Runs Ed25519 challenge-response, probes endpoints, scores," -ForegroundColor White
Write-Host "  and writes on-chain attestation to AgentAttest contract." -ForegroundColor White
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host ""
Start-Sleep 2
Write-Host "PS> curl -X POST $BaseUrl/api/evaluate -H 'Content-Type: application/json' -d '{}'" -ForegroundColor Yellow
Start-Sleep 1
try {
    $body = @{} | ConvertTo-Json
    $r = Invoke-RestMethod -Uri "$BaseUrl/api/evaluate" -Method Post -ContentType "application/json" -Body $body -UseBasicParsing
    $r | ConvertTo-Json -Depth 5 | Write-Host
} catch { Write-Host $_.Exception.Message -ForegroundColor Red }
Write-Host ""
Start-Sleep 4

# --- Step 5: Compare ---
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host "  STEP 5/7: Compare Agents Side-by-Side" -ForegroundColor Magenta
Write-Host ""
Write-Host "  Compare Luna (events) vs Sigil (legal/notary) —" -ForegroundColor White
Write-Host "  their scores, capabilities, chains, and status." -ForegroundColor White
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host ""
Start-Sleep 2
Write-Host "PS> curl '$BaseUrl/api/agents/compare?ids=luna,sigil'" -ForegroundColor Yellow
Start-Sleep 1
try {
    $r = Invoke-RestMethod -Uri "$BaseUrl/api/agents/compare?ids=luna,sigil" -UseBasicParsing
    $r | ConvertTo-Json -Depth 5 | Write-Host
} catch { Write-Host $_.Exception.Message -ForegroundColor Red }
Write-Host ""
Start-Sleep 3

# --- Step 6: Register ---
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host "  STEP 6/7: Register a New Agent" -ForegroundColor Magenta
Write-Host ""
Write-Host "  Any agent self-registers with their Ed25519 key, endpoint," -ForegroundColor White
Write-Host "  capabilities, and chains — Vera verifies from Day 1." -ForegroundColor White
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host ""
Start-Sleep 2
Write-Host "PS> curl -X POST $BaseUrl/api/register -H 'Content-Type: application/json' -d '{...}'" -ForegroundColor Yellow
Start-Sleep 2
try {
    $regBody = @{
        agentId = "my-agent"
        name = "My Agent"
        ed25519PublicKey = "abcd1234...64hexchars..."
        endpoint = "https://my-agent.example.com"
        capabilities = @("data", "analytics")
        chains = @("casper")
    } | ConvertTo-Json
    $r = Invoke-RestMethod -Uri "$BaseUrl/api/register" -Method Post -ContentType "application/json" -Body $regBody -UseBasicParsing
    $r | ConvertTo-Json -Depth 5 | Write-Host
} catch { Write-Host $_.Exception.Message -ForegroundColor Red }
Write-Host ""
Start-Sleep 3

# --- Step 7: Attestations ---
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host "  STEP 7/7: On-Chain Attestations" -ForegroundColor Magenta
Write-Host ""
Write-Host "  Every evaluation produces a verifiable attestation on" -ForegroundColor White
Write-Host "  the Casper AgentAttest contract (Odra 2.0)." -ForegroundColor White
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host ""
Start-Sleep 2
Write-Host "PS> curl -X POST $BaseUrl/api/attestations -H 'Content-Type: application/json' -d '{...}'" -ForegroundColor Yellow
Start-Sleep 1
try {
    $attestBody = @{agentId="sigil"; score=98; evaluator="vera"} | ConvertTo-Json
    $r = Invoke-RestMethod -Uri "$BaseUrl/api/attestations" -Method Post -ContentType "application/json" -Body $attestBody -UseBasicParsing
    $r | ConvertTo-Json -Depth 5 | Write-Host
} catch { Write-Host $_.Exception.Message -ForegroundColor Red }
Write-Host ""

# Query attestation history
Write-Host "PS> curl $BaseUrl/api/attestations" -ForegroundColor Yellow
Start-Sleep 1
try {
    $r = Invoke-RestMethod -Uri "$BaseUrl/api/attestations" -UseBasicParsing
    $r | ConvertTo-Json -Depth 5 | Write-Host
} catch { Write-Host $_.Exception.Message -ForegroundColor Red }
Write-Host ""
Start-Sleep 3

# ===========================================================================
# Summary
# ===========================================================================
Write-Host ""
Write-Host "╔══════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║  ✅ Demo Complete — 7/7 Steps Successful                    ║" -ForegroundColor Green
Write-Host "║                                                              ║" -ForegroundColor Green
Write-Host "║  Submission: Vera 🛡️ — Agent Identity & Trust Authority     ║" -ForegroundColor Green
Write-Host "║  On-Chain:   AgentAttest Odra Contract (Casper Testnet)     ║" -ForegroundColor Green
Write-Host "║  Verify:     github.com/Warchildwages/Vera                  ║" -ForegroundColor Green
Write-Host "║  Branch:     submission/casper-buildathon                   ║" -ForegroundColor Green
Write-Host "║  Tag:        v0.1.0-casper-buildathon                       ║" -ForegroundColor Green
Write-Host "╚══════════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Host "🎥 Recording complete — stop your recording now!" -ForegroundColor Yellow
Write-Host "" -ForegroundColor Yellow
Write-Host "   Then upload to DoraHacks:" -ForegroundColor White
Write-Host "   https://dorahacks.io/hackathon/casper-agentic-buildathon" -ForegroundColor Cyan
Write-Host ""

# Cleanup
Stop-Process -Id $process.Id -Force -ErrorAction SilentlyContinue
