# Vera 🛡️ — Agent Trust Authority

**Main submission for the Casper Agentic Buildathon 2026**

Vera is the trust layer for the autonomous agent economy. She discovers agents, verifies their Ed25519 identity via challenge-response, tests their capabilities, aggregates reputation — and records every evaluation as an **on-chain attestation on Casper Testnet**.

---

## The Three-Agent Ecosystem

```
🌙 Luna  ───  Event ticketing agent (17 ops)
   ↓
🛡️ Vera  ───  Trust authority — THIS REPO (main submission)
   ↓
🦅 Sigil  ───  Legal/notary agent (11 ops)
```

Vera is the **central trust authority** — Luna and Sigil use Vera to verify each other's identity and reputation before transacting.

---

## Buildathon Feature: On-Chain Attestations

When Vera evaluates an agent, she writes an attestation to the **AgentAttest** Odra smart contract on **Casper Testnet**:

```
POST /api/evaluate
  → Vera discovers + verifies + evaluates agents
  → Builds attestation: { agent_id, operation, score, proof_hash }
  → Signs with Vera's Ed25519 key
  → Submits deploy to AgentAttest.record() on Casper Testnet
  → Returns deploy hash + Explorer link in response
```

The deploy hash is verifiable at **https://testnet.cspr.live/deploy/{hash}**

### Smart Contract

The AgentAttest contract is at `casper/agent-attest/` — an **Odra 2.0** Rust contract:

| Entry Point | Description |
|-------------|-------------|
| `record(agent_id, operation, amount, platform_tx, timestamp, proof_hash, requested_by)` | Record a new attestation |
| `get_attestation(platform_tx)` | Query an attestation by hash |
| `agent_attestation_count(agent_id)` | Get attestation count for an agent |
| `total_attestations()` | Get total attestation count |

---

## Quick Start

```bash
# Install
pnpm install

# Copy and configure env
cp .env.example .env

# Run in mock mode (all features work, no Testnet connection needed)
VERA_MOCK_MODE=true pnpm dev

# Run tests
VERA_MOCK_MODE=true pnpm test
```

## Demo

```bash
# Discover agents
curl http://localhost:3006/api/discover

# Evaluate all agents — produces an on-chain attestation!
curl -X POST http://localhost:3006/api/evaluate \
  -H "Content-Type: application/json" \
  -d '{}'

# Get agent details
curl http://localhost:3006/api/agents/luna
```

## API

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/discover` | GET | List all discovered agents |
| `/api/agents/:id` | GET | Full profile for a specific agent |
| `/api/evaluate` | POST | Full evaluation — **produces Casper attestation** |
| `/api/report` | POST | Submit a reputation event |
| `/api/health` | GET | Service health |
| `/api/x402/service-info` | GET | x402 discovery with DID document |

## Environment Variables

| Variable | Purpose |
|----------|---------|
| `VERA_MOCK_MODE` | `true` = mock data + simulated attestations (default) |
| `VERA_ATTEST_PUBLIC_KEY` | Vera's Ed25519 public key (for signing attestations) |
| `VERA_ATTEST_SECRET_KEY` | Vera's Ed25519 secret key |
| `VERA_AGENT_ATTEST_CONTRACT` | AgentAttest contract hash on Casper Testnet |
| `CASPER_RPC_URL` | Casper RPC endpoint |
| `MCP_REGISTRY_URL` | MCP registry for agent discovery |
| `LUNA_DID_NOSTR` | Cross-reference to Luna's DID document |
| `SIGIL_DID_NOSTR` | Cross-reference to Sigil's DID document |

## Deploy the AgentAttest Contract

Requires Rust + Odra CLI:

```bash
cd casper/agent-attest
odra build
odra deploy --node-address http://rpc.testnet.casper.network:7777 \
  --secret-key ./vera-attest-key.pem \
  --session target/wasm32-unknown-unknown/release/agent-attest.wasm
# Set the returned contract hash as VERA_AGENT_ATTEST_CONTRACT
```

## Identity

Vera publishes its identity at `/.well-known/did/nostr/{pubkey}.json` per the W3C Nostr CG v0.1.0 standard. Cross-references Luna and Sigil for a bi-directional identity mesh.

## Links

- GitHub: https://github.com/Warchildwages/Vera
- Luna (event agent): https://github.com/Warchildwages/Luna
- Sigil (legal agent): https://github.com/Warchildwages/Sigil
- AllFans (event platform): https://allfans-k2sw.onrender.com
