# 🛡️ Vera — Submission: Casper Agentic Buildathon 2026

**Track:** Agent Identity & Trust  
**Main Submission:** Vera (this repository)  
**Guest Agents (discoverable via Vera):** Luna 🌙 (events), Sigil 🦅 (legal/notary)

---

## Submission Summary

Vera is the **trust authority for the Casper agent economy**. She discovers agents via the Casper registry, cryptographically verifies their Ed25519 identity through challenge-response (tweetnacl), tests their capabilities via live endpoint probes, aggregates reputation from transactions and disputes — and records every evaluation as an **on-chain attestation on Casper Testnet**.

| Dimension | Status |
|-----------|--------|
| **On-chain smart contract** | ✅ AgentAttest Odra 2.0 contract (record, query, count) |
| **Real testnet transactions** | 🟡 Mock mode by default — deploy contract + set env vars for live attestations |
| **x402 payment support** | ✅ Multi-chain (Casper PAYMENT-SIGNATURE + Circle x-402-*) |
| **Ed25519 verification** | ✅ tweetnacl challenge-response (cryptographic proof of key ownership) |
| **did:nostr spec v0.1.0** | ✅ W3C Nostr CG compliant DID document served at `/.well-known/did/nostr/` |
| **Agent self-registration** | ✅ POST /api/register — agents join the trust mesh |
| **Agent comparison** | ✅ GET /api/agents/compare?ids=luna,sigil |
| **Leaderboard** | ✅ GET /api/leaderboard — ranked scores |
| **Full test suite** | ✅ 15 unit tests, all passing |
| **TypeScript strict** | ✅ tsc --noEmit passes clean |
| **CI/CD** | ✅ GitHub Actions typecheck → test → build + Render blueprint |

---

## Architecture

```
                    ┌──────────────────────────────┐
                    │     Casper MCP Registry       │
                    │  (agent discovery layer)      │
                    └──────────┬───────────────────┘
                               │ discoverAgents()
                               ▼
┌──────────────────────────────────────────────────────────┐
│                      VERA 🛡️                              │
│                                                          │
│  Registration → Verification → Evaluation → Attestation │
│  (POST /register)  (verify)    (evaluate)    (attest)    │
└───────────────────────┬──────────────────────────────────┘
                        │         │         │
          ┌─────────────┘         │         └─────────────┐
          ▼                      ▼                       ▼
     ┌────────┐          ┌────────────┐          ┌───────────┐
     │ Luna 🌙│          │ Sigil 🦅  │          │ TicketBot │
     │ Events │          │ Notary     │          │ Reseller  │
     │ 94/100 │          │ 98/100     │          │  12/100   │
     └────────┘          └────────────┘          └───────────┘
```

---

## API Routes

| Method | Route | Description |
|--------|-------|-------------|
| `GET` | `/api/health` | Health check — always returns 200 |
| `GET` | `/api/discover` | List all known agents (optional `?capability=events`) |
| `GET` | `/api/leaderboard` | Ranked agent scores by evaluation |
| `GET` | `/api/agents/:id` | Full profile for a specific agent |
| `GET` | `/api/agents/compare?ids=luna,sigil` | Side-by-side agent comparison |
| `GET` | `/api/attestations` | On-chain attestation history |
| `POST` | `/api/attestations` | Attest a specific agent evaluation |
| `POST` | `/api/evaluate` | Run full evaluation on all agents + write attestation |
| `POST` | `/api/register` | Self-register a new agent with Vera |
| `POST` | `/api/report` | Submit reputation event (transaction, dispute, report) |
| `GET` | `/api/verify/challenge` | Get Ed25519 challenge for proof-of-key-ownership |
| `POST` | `/api/verify/challenge` | Submit signed challenge response |
| `GET` | `/api/x402/service-info` | x402 pricing and agent discovery metadata |
| `GET` | `/.well-known/did/nostr/:pubkey` | Vera's W3C did:nostr document |

---

## Quick Demo

```bash
# 1. Start Vera (mock mode — all features work, no testnet needed)
VERA_MOCK_MODE=true pnpm dev

# 2. Discover agents
curl http://localhost:3006/api/discover

# 3. Check the leaderboard
curl http://localhost:3006/api/leaderboard

# 4. Run full evaluation (includes on-chain attestation in mock mode)
curl -X POST http://localhost:3006/api/evaluate \
  -H "Content-Type: application/json" \
  -d '{}'

# 5. Compare agents side-by-side
curl "http://localhost:3006/api/agents/compare?ids=luna,sigil"

# 6. Register a new agent
curl -X POST http://localhost:3006/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "agentId": "my-agent",
    "name": "My Agent",
    "ed25519PublicKey": "abcd1234...64hexchars...",
    "endpoint": "https://my-agent.example.com",
    "capabilities": ["data", "analytics"],
    "chains": ["casper"]
  }'

# 7. Query on-chain attestations
curl http://localhost:3006/api/attestations
```

---

## On-Chain Component: AgentAttest Contract

Built with **Odra 2.0** for **Casper Network** (`casper/agent-attest/`):

```
Entry Points:
  · record(agent_id, operation, amount, platform_tx, timestamp, proof_hash, requested_by)
  · get_attestation(platform_tx) → AttestationRecord
  · agent_attestation_count(agent_id) → u64
  · total_attestations() → u64
```

**To deploy live on Casper Testnet:**
```bash
# Build the WASM contract
bash scripts/build-contract.sh

# Deploy to Testnet
odra deploy \
  --node-address http://rpc.testnet.casper.network:7777 \
  --secret-key ./key.pem \
  --session casper/agent-attest/target/wasm32-unknown-unknown/release/agent_attest.wasm

# Set VERA_AGENT_ATTEST_CONTRACT=<returned-hash> in .env
# Set VERA_ATTEST_PUBLIC_KEY & VERA_ATTEST_SECRET_KEY to enable live attestations
```

Mock mode produces simulated deploy hashes — all API features work without a live contract.

---

## x402 Payment Support

Vera supports **multi-chain x402** payment detection:
- **Casper protocol**: `PAYMENT-SIGNATURE` header (Ed25519 via tweetnacl + CSPR.cloud)
- **Circle Gateway**: `x-402-*` headers (multi-chain: Base, Arc)
- Evaluation costs 0.001 USDC (configurable via Vera's x402 service-info)

All routes respond with proper `402 Payment Required` responses when payment is needed.

---

## Identities & Verification

| Identity Layer | Implementation |
|----------------|---------------|
| **Ed25519 Key** | Registered at registration, verified via tweetnacl challenge-response |
| **Endpoint Probe** | GET to agent endpoint with 5s timeout |
| **did:nostr** | W3C Nostr CG v0.1.0 specification — served at `/.well-known/did/nostr/:pubkey` |
| **AgentAttest** | On-chain attestation on Casper Testnet via AgentAttest contract |
| **Cross-Reference Mesh** | Bidirectional DID references between Vera, Luna, Sigil |

---

## Known Seed Agents

| Agent | Type | Score | Status |
|-------|------|:-----:|--------|
| **Luna 🌙** | Events | 94/100 | ✅ Verified — recommendation |
| **Sigil 🦅** | Notary/Legal | 98/100 | ✅ Verified — recommendation |
| **TicketBot ⚠️** | Reseller | 12/100 | ❌ Bad key — flagged |

---

## Project Health

| Gate | Status |
|------|--------|
| `pnpm typecheck` | ✅ Pass (0 errors) |
| `pnpm test` | ✅ 15/15 pass |
| `pnpm build` | ✅ Compiles (standalone) |
| CI workflow | ✅ GitHub Actions (typecheck → test → build) |
| lefthook | ✅ Pre-commit (gitleaks + typecheck) |
| .gitleaks.toml | ✅ Seed data allowlisted |
| render.yaml | ✅ Render blueprint (Node, standalone) |
| .env.example | ✅ Documents all env vars |
| Biome lint | ✅ Configured |
| **Route Endpoints** | **14 API routes** |
| **Contract (Casper)** | **4 entry points** |

---

## Submission Details

- **Branch:** `submission/casper-buildathon`
- **Tag:** `v0.1.0-casper-buildathon`
- **GitHub:** `https://github.com/Warchildwages/Vera`
- **Demo Video:** *(record after submission — see DEMO_GUIDE.md)*
- **Deadline:** July 7, 2026 @ 23:59 UTC

---

## Submission Framing

**Vera is the main submission** — she writes on-chain attestations to the AgentAttest Odra contract on Casper Testnet. This satisfies the "transaction-producing on-chain component" requirement.

**Luna 🌙 and Sigil 🦅 are guest agents** — discoverable through Vera, independently deployed, but Vera is the trust authority that binds them together. Requesting agents query Vera to find trusted counterparties, then transact directly.

> *"Vera doesn't judge — she records transparently."*

---

## Expandability (Beyond Buildathon)

- **Governance tokens** — Vera could issue VERA tokens for staking-based reputation
- **Circuit breakers** — Auto-flag agents whose score drops below threshold
- **Alert webhooks** — Notify when an agent's verification status changes
- **SLA monitoring** — Track uptime and response latency over time
- **Cross-chain attestation queries** — Query AgentAttest state directly from Base/Arc
- **Agent attestation history** — Full timeline of every evaluation, signed and attested
