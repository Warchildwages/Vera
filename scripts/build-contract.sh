#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────────────────────────
# Vera — AgentAttest Odra Contract Build Script
# ──────────────────────────────────────────────────────────────────────────────
# Builds the AgentAttest Odra 2.0 Rust contract for the Casper Network.
# The compiled .wasm is deployable to Casper Testnet.
#
# Prerequisites:
#   - Rust toolchain: rustup target add wasm32-unknown-unknown
#   - Odra CLI: cargo install odra-cli
#
# Usage:
#   bash scripts/build-contract.sh
#
# After build:
#   odra deploy --node-address http://rpc.testnet.casper.network:7777 \
#     --secret-key ./key.pem \
#     --session casper/agent-attest/target/wasm32-unknown-unknown/release/agent-attest.wasm
#
# Set the returned contract hash as VERA_AGENT_ATTEST_CONTRACT in .env
# ──────────────────────────────────────────────────────────────────────────────

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
CONTRACT_DIR="$PROJECT_DIR/casper/agent-attest"

echo "🛡️  Building AgentAttest contract..."
echo "   Dir: $CONTRACT_DIR"

cd "$CONTRACT_DIR"

# Ensure wasm target is installed
if ! rustup target list --installed | grep -q wasm32-unknown-unknown; then
  echo "📦 Installing wasm32-unknown-unknown target..."
  rustup target add wasm32-unknown-unknown
fi

# Build the contract
echo "🔨 Building..."
cargo build --release --target wasm32-unknown-unknown

WASM_FILE="$CONTRACT_DIR/target/wasm32-unknown-unknown/release/agent_attest.wasm"

if [ -f "$WASM_FILE" ]; then
  WASM_SIZE=$(wc -c < "$WASM_FILE")
  echo "✅ Build complete!"
  echo "   Output: $WASM_FILE"
  echo "   Size: $WASM_SIZE bytes"
  echo ""
  echo "🚀 To deploy to Casper Testnet:"
  echo "   odra deploy \\"
  echo "     --node-address http://rpc.testnet.casper.network:7777 \\"
  echo "     --secret-key ./key.pem \\"
  echo "     --session $WASM_FILE"
  echo ""
  echo "   Then set VERA_AGENT_ATTEST_CONTRACT=<contract-hash> in .env"
else
  echo "❌ Build failed — WASM file not found at $WASM_FILE"
  exit 1
fi
