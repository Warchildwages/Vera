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
# 0. Start Vera (mock mode — all features work, no Testnet needed)
VERA_MOCK_MODE=true pnpm dev

# 1. Discover agents
curl http://localhost:3006/api/discover

# 2. Check the leaderboard (NEW)
curl http://localhost:3006/api/leaderboard

# 3. Evaluate all agents — produces on-chain attestation!
curl -X POST http://localhost:3006/api/evaluate \
  -H "Content-Type: application/json" \
  -d '{}'

# 4. Get agent details
curl http://localhost:3006/api/agents/luna

# 5. Compare agents side-by-side (NEW)
curl "http://localhost:3006/api/agents/compare?ids=luna,sigil"

# 6. Register a new agent (NEW)
curl -X POST http://localhost:3006/api/register \
  -H "Content-Type: application/json" \
  -d '{"agentId":"my-agent","name":"My Agent","ed25519PublicKey":"abcd1234...64hex...","endpoint":"https://my-agent.example.com","capabilities":["data"],"chains":["casper"]}'

# 7. Query on-chain attestations (NEW)
curl http://localhost:3006/api/attestations
```

## API

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Service health |
| `/api/discover` | GET | List all discovered agents (`?capability=events`) |
| `/api/leaderboard` | GET | **NEW** — Ranked agent scores |
| `/api/agents/:id` | GET | Full profile for a specific agent |
| `/api/agents/compare` | GET | **NEW** — Compare agents `?ids=luna,sigil` |
| `/api/evaluate` | POST | Full evaluation — **produces Casper attestation** |
| `/api/attestations` | GET | **NEW** — On-chain attestation history |
| `/api/attestations` | POST | **NEW** — Attest a specific agent |
| `/api/register` | POST | **NEW** — Self-register a new agent |
| `/api/report` | POST | Submit a reputation event |
| `/api/verify/challenge` | GET | Get Ed25519 challenge for key proof |
| `/api/verify/challenge` | POST | Submit signed challenge response |
| `/api/x402/service-info` | GET | x402 discovery with DID document |
| `/.well-known/did/nostr/:pubkey` | GET | Vera's W3C did:nostr document |

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
