#!/usr/bin/env bash
# ===========================================================================
# Vera — Casper Agentic Buildathon 2026 Demo Recording Script
# ===========================================================================
# This script runs the complete Vera demo walkthrough with timed pauses.
# Use with asciinema (Linux/macOS) or OBS / Windows Game Bar (Win+G).
#
# USAGE:
#   # Option A: asciinema (Linux/macOS)
#   asciinema rec demo.cast -c "bash scripts/demo-record.sh"
#
#   # Option B: OBS / Windows Game Bar
#   # 1. Start OBS or press Win+G and click Start Recording
#   # 2. Run: bash scripts/demo-record.sh
#   # 3. Stop recording when script finishes
#
# REQUIREMENTS:
#   - Node.js 18+, pnpm installed
#   - Terminal window at least 100x30 characters
# ===========================================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
VERA_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
PORT=3006
BASE_URL="http://localhost:$PORT"
RECORDING_MARKER="🎥 RECORDING"

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║     🛡️ VERA — Casper Agentic Buildathon 2026 Demo 🛡️       ║"
echo "║                                                              ║"
echo "║  Agent Identity & Trust on Casper Network                    ║"
echo "║  ${RECORDING_MARKER}"                                        ║
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""
echo "=== Starting Vera in mock mode ==="
sleep 2

# Kill any existing process on the port
kill $(lsof -t -i:$PORT 2>/dev/null) 2>/dev/null || true
sleep 1

# Start Vera in the background
cd "$VERA_DIR"
VERA_MOCK_MODE=true pnpm dev -p $PORT &
VERA_PID=$!

# Wait for Vera to be ready
echo "Waiting for Vera to start..."
for i in $(seq 1 30); do
  if curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/health" 2>/dev/null | grep -q 200; then
    echo "✅ Vera is running at $BASE_URL"
    break
  fi
  if [ "$i" -eq 30 ]; then
    echo "❌ Vera failed to start within 30 seconds"
    kill $VERA_PID 2>/dev/null || true
    exit 1
  fi
  sleep 1
done

sleep 1
clear

# ===========================================================================
# DEMO — 7 Steps
# Each step: header, command, output, pause
# ===========================================================================

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║     🛡️ VERA — Agent Identity & Trust Authority 🛡️          ║"
echo "║                                                              ║"
echo "║  Submitting to: Casper Agentic Buildathon 2026               ║"
echo "║  Track: Agent Identity & Trust                               ║"
echo "║  Deadline: July 7, 2026 @ 23:59 UTC                         ║"
echo "╚══════════════════════════════════════════════════════════════╝"
sleep 3

# --- Step 1: Health Check ---
echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "  STEP 1/7: Health Check"
echo "═══════════════════════════════════════════════════════════════"
echo ""
sleep 1
echo "$ curl $BASE_URL/api/health"
sleep 1
curl -s "$BASE_URL/api/health" | python3 -m json.tool
echo ""
sleep 2

# --- Step 2: Discover Agents ---
echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "  STEP 2/7: Discover Agents"
echo ""
echo "  Vera finds agents from Casper MCP and direct registration."
echo "  She knows 3 agents out of the box — let's see who they are."
echo "═══════════════════════════════════════════════════════════════"
echo ""
sleep 2
echo "$ curl $BASE_URL/api/discover"
sleep 1
curl -s "$BASE_URL/api/discover" | python3 -m json.tool
echo ""
sleep 3

# --- Step 3: Check the Leaderboard ---
echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "  STEP 3/7: Leaderboard"
echo ""
echo "  Vera evaluates every agent on identity, endpoint quality,"
echo "  key hygiene, and past reputation — then ranks them."
echo "═══════════════════════════════════════════════════════════════"
echo ""
sleep 2
echo "$ curl $BASE_URL/api/leaderboard"
sleep 1
curl -s "$BASE_URL/api/leaderboard" | python3 -m json.tool
echo ""
sleep 3

# --- Step 4: Run Full Evaluation ---
echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "  STEP 4/7: Run Full Evaluation"
echo ""
echo "  Runs Ed25519 challenge-response verification against each"
echo "  agent, probes their endpoints, scores them, and writes an"
echo "  on-chain attestation to the AgentAttest contract on Casper."
echo "═══════════════════════════════════════════════════════════════"
echo ""
sleep 2
echo "$ curl -X POST $BASE_URL/api/evaluate -H \"Content-Type: application/json\" -d '{}'"
sleep 1
curl -s -X POST "$BASE_URL/api/evaluate" -H "Content-Type: application/json" -d '{}' | python3 -m json.tool
echo ""
sleep 4

# --- Step 5: Compare Agents ---
echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "  STEP 5/7: Compare Agents Side-by-Side"
echo ""
echo "  Vera compares Luna (events) vs Sigil (legal/notary) —"
echo "  their scores, capabilities, chains, and status."
echo "═══════════════════════════════════════════════════════════════"
echo ""
sleep 2
echo "$ curl \"$BASE_URL/api/agents/compare?ids=luna,sigil\""
sleep 1
curl -s "$BASE_URL/api/agents/compare?ids=luna,sigil" | python3 -m json.tool
echo ""
sleep 3

# --- Step 6: Register a New Agent ---
echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "  STEP 6/7: Register a New Agent"
echo ""
echo "  Any agent can self-register with Vera. She accepts their"
echo "  Ed25519 public key, endpoint, capabilities, and chains —"
echo "  then runs verification to build trust from Day 1."
echo "═══════════════════════════════════════════════════════════════"
echo ""
sleep 2
echo "$ curl -X POST $BASE_URL/api/register \\"
echo "  -H \"Content-Type: application/json\" \\"
echo "  -d '{"
echo "    \"agentId\": \"my-agent\","
echo "    \"name\": \"My Agent\","
echo "    \"ed25519PublicKey\": \"abcd1234...64hexchars...\","
echo "    \"endpoint\": \"https://my-agent.example.com\","
echo "    \"capabilities\": [\"data\", \"analytics\"],"
echo "    \"chains\": [\"casper\"]"
echo "  }'"
sleep 2
curl -s -X POST "$BASE_URL/api/register" \
  -H "Content-Type: application/json" \
  -d '{
    "agentId": "my-agent",
    "name": "My Agent",
    "ed25519PublicKey": "abcd1234...64hexchars...",
    "endpoint": "https://my-agent.example.com",
    "capabilities": ["data", "analytics"],
    "chains": ["casper"]
  }' | python3 -m json.tool
echo ""
sleep 3

# --- Step 7: On-Chain Attestations ---
echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "  STEP 7/7: On-Chain Attestations"
echo ""
echo "  Every evaluation produces a verifiable attestation on the"
echo "  Casper AgentAttest contract (Odra 2.0). In mock mode it"
echo "  returns a simulated deploy hash — live mode writes real"
echo "  transactions to Casper Testnet."
echo "═══════════════════════════════════════════════════════════════"
echo ""
sleep 2
echo "$ curl -X POST $BASE_URL/api/attestations \\"
echo "  -H \"Content-Type: application/json\" \\"
echo "  -d '{\"agentId\": \"sigil\", \"score\": 98, \"evaluator\": \"vera\"}'"
sleep 1
curl -s -X POST "$BASE_URL/api/attestations" \
  -H "Content-Type: application/json" \
  -d '{"agentId": "sigil", "score": 98, "evaluator": "vera"}' | python3 -m json.tool
echo ""

# Then query the attestation history
echo ""
echo "$ curl $BASE_URL/api/attestations"
sleep 1
curl -s "$BASE_URL/api/attestations" | python3 -m json.tool
echo ""
sleep 3

# ===========================================================================
# Summary
# ===========================================================================
echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║  ✅ Demo Complete — 7/7 Steps Successful                    ║"
echo "║                                                              ║"
echo "║  Submission: Vera 🛡️ — Agent Identity & Trust Authority     ║"
echo "║  On-Chain:   AgentAttest Odra Contract (Casper Testnet)     ║"
echo "║  Verify:     github.com/Warchildwages/Vera                  ║"
echo "║  Branch:     submission/casper-buildathon                   ║"
echo "║  Tag:        v0.1.0-casper-buildathon                       ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""
echo "🎥 Recording complete — stop your recording now, then upload"
echo "   to the DoraHacks portal at:"
echo "   https://dorahacks.io/hackathon/casper-agentic-buildathon"
echo ""

# Cleanup
kill $VERA_PID 2>/dev/null || true
