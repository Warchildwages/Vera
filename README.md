# Vera

Agent trust authority for the Casper agent economy.

## What It Does

Vera discovers agents on the Casper registry, verifies their identity via Ed25519 keys and did:nostr documents, tests their capabilities, and aggregates reputation from transaction history, dispute records, and user reports.

The three-agent architecture:
- **Vera** — Trust authority (this repo)
- **Luna 🌙** — Event agent (AllFans, separate repo)
- **Sigil 🦅** — Notary agent (Signet, separate repo)

## Quick Start

```bash
pnpm install
cp .env.example .env
pnpm dev
```

## API

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/discover` | GET | List all discovered agents, filter by `?capability=events` |
| `/api/agents/:id` | GET | Full profile for a specific agent |
| `/api/evaluate` | POST | Full evaluation of all agents, ranked by score |
| `/api/report` | POST | Submit a reputation event |
| `/api/health` | GET | Service health |
| `/api/x402/service-info` | GET | x402 discovery with DID document |

## Identity

Vera publishes its identity at `/.well-known/did/nostr/{pubkey}.json` per W3C Nostr CG v0.1.0.
