#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────────────────────────
# Vera — Demo Recording Script
# ──────────────────────────────────────────────────────────────────────────────
# Run this in mock mode to demonstrate all of Vera's capabilities.
#
# Usage:
#   cd /path/to/Vera
#   VERA_MOCK_MODE=true pnpm dev &
#   sleep 10
#   bash scripts/demo.sh
#   # Press Ctrl+C to stop the server after demo
#
# For recording:
#   macOS/Linux: asciinema rec demo.cast -- bash scripts/demo.sh
#   Windows:     Use OBS or Windows Game Bar (Win+G) to record terminal window
# ──────────────────────────────────────────────────────────────────────────────

BASE_URL="${BASE_URL:-http://localhost:3006}"
PASS=0
FAIL=0

pass() { PASS=$((PASS+1)); }
fail() { FAIL=$((FAIL+1)); echo "  ❌ $1"; }

echo ""
echo "══════════════════════════════════════════════"
echo "  🛡️  VERA — Agent Trust Authority Demo"
echo "══════════════════════════════════════════════"
echo ""

# ── 1. Health Check ──────────────────────────────────────────────────────
echo "─── 1. Health Check ───"
RESP=$(curl -s "$BASE_URL/api/health")
echo "$RESP" | python3 -m json.tool 2>/dev/null || echo "$RESP"
echo ""

# ── 2. Discover Agents ───────────────────────────────────────────────────
echo "─── 2. Discover Agents ───"
RESP=$(curl -s "$BASE_URL/api/discover")
COUNT=$(echo "$RESP" | grep -o '"count":' | wc -l)
echo "Agents discovered: $(echo "$RESP" | grep -oP '"count":\K\d+')"
echo ""

# ── 3. Leaderboard ───────────────────────────────────────────────────────
echo "─── 3. Agent Leaderboard ───"
curl -s "$BASE_URL/api/leaderboard" | python3 -c "
import sys,json
d=json.load(sys.stdin)
for r in d['rankings']:
    badge = '🥇' if r['rank']==1 else '🥈' if r['rank']==2 else '🥉' if r['rank']==3 else f'#{r[\"rank\"]}'
    print(f\"  {badge} {r['name']} — {r['score']}/100 {'✅' if r['verified'] else '❌'} ({r['transactions']} txns)\")
print(f'\n  Summary: {d[\"summary\"][\"verifiedAgents\"]} verified, {d[\"summary\"][\"flaggedAgents\"]} flagged')
print(f'  Top agent: {d[\"summary\"][\"topAgent\"]} ({d[\"summary\"][\"topScore\"]}/100)')
"
echo ""

# ── 4. Get Agent Profile ─────────────────────────────────────────────────
echo "─── 4. Agent Profile (Luna) ───"
curl -s "$BASE_URL/api/agents/luna" | python3 -c "
import sys,json
d=json.load(sys.stdin)
print(f'  Name: {d[\"name\"]}')
print(f'  Score: {d[\"evaluation\"][\"overall\"]}/100')
print(f'  Identity: {d[\"evaluation\"][\"identity\"]}/100')
print(f'  Capability: {d[\"evaluation\"][\"capability\"]}/100')
print(f'  Verified: {\"✅\" if d[\"verification\"][\"keyValid\"] else \"❌\"}')
print(f'  DID valid: {\"✅\" if d[\"verification\"][\"didNostrValid\"] else \"❌\"}')
print(f'  Txns: {d[\"reputation\"][\"totalTransactions\"]}')
"
echo ""

# ── 5. Compare Agents ────────────────────────────────────────────────────
echo "─── 5. Agent Comparison (Luna vs Sigil vs TicketBot) ───"
curl -s "$BASE_URL/api/agents/compare?ids=luna,sigil,ticketbot" | python3 -c "
import sys,json
d=json.load(sys.stdin)
print(f'  {\"Name\":<16} {\"Score\":>6} {\"ID\":>6} {\"CAP\":>6} {\"REL\":>6}  {\"Txns\":>5}  Verdict')
print(f'  {\"-\"*16} {\"-\":>6} {\"-\":>6} {\"-\":>6} {\"-\":>6}  {\"-\":>5}  {\"-\":*<30}')
for c in d['comparison']:
    print(f'  {c[\"name\"]:<16} {c[\"score\"]:>6} {c[\"identity\"]:>6} {c[\"capability\"]:>6} {c[\"reliability\"]:>6}  {c[\"transactions\"]:>5}  {c[\"warnings\"][0] if c[\"warnings\"] else \"✅ Trusted\"}')
"
echo ""

# ── 6. Full Evaluation + Attestation ─────────────────────────────────────
echo "─── 6. Full Evaluation (produces Casper attestation) ───"
curl -s -X POST "$BASE_URL/api/evaluate" \
  -H "Content-Type: application/json" \
  -d '{}' | python3 -c "
import sys,json
d=json.load(sys.stdin)
print(f'  Agents evaluated: {d[\"count\"]}')
for r in d['rankings']:
    print(f'  {r[\"name\"]} — {r[\"score\"]}/100')
if d.get('casperAttestation'):
    a = d['casperAttestation']
    print(f'\\n  🛡️  Casper Attestation: {\"✅\" if a[\"verified\"] else \"❌\"}')
    print(f'     Tx Hash: {a[\"transactionHash\"]}')
    if a.get('explorer'):
        print(f'     Explorer: {a[\"explorer\"]}')
"
echo ""

# ── 7. Attestation History ───────────────────────────────────────────────
echo "─── 7. Attestation History ───"
curl -s "$BASE_URL/api/attestations?limit=3" | python3 -c "
import sys,json
d=json.load(sys.stdin)
print(f'  Total attestations: {d[\"total\"]}')
for a in d['attestations'][:3]:
    print(f'  🛡️  {a[\"name\"]} — Tx: {a[\"transactionHash\"][:20]}...')
"
echo ""

# ── 8. Mesh Health ───────────────────────────────────────────────────────
echo "─── 8. Agent Mesh Health ───"
RESP=$(curl -s "$BASE_URL/api/mesh/health" 2>&1 | python3 -c "
import sys,json
d=json.load(sys.stdin)
print(f'  Mesh status: {d[\"meshStatus\"]}')
print(f'  Density: {d[\"meshDensity\"]}')
for a in d['agents']:
    print(f'  {a[\"name\"]:<16} {a[\"status\"]:<20} {a[\"latencyMs\"]}ms')
" 2>/dev/null || echo "  (mesh health may timeout if agents unreachable)")
echo ""

echo "══════════════════════════════════════════════"
echo "  ✅ Demo Complete!"
echo "══════════════════════════════════════════════"
echo ""
echo "Results: $PASS checks passed, $FAIL failed"
echo ""
echo "For screen recording:"
echo "  macOS/Linux: asciinema rec demo.cast -- bash scripts/demo.sh"
echo "  Windows:     OBS Studio → Window Capture → CMD/Terminal"
echo "               Then submit to DoraHacks as demo video"
