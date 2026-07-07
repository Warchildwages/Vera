# 🎥 Vera Demo Recording Guide — Casper Agentic Buildathon 2026

## Before You Start

1. **Ensure prerequisites:**
   - Node.js 18+ and pnpm installed
   - Vera cloned at `C:\Users\Jones\Documents\WarchildDev\Vera`
   - On the `submission/casper-buildathon` branch: `git checkout submission/casper-buildathon`

2. **Choose your recording tool:**
   - **Windows Game Bar (Win+G)** — Fastest, no install needed. Records just the terminal window.
   - **OBS Studio** — For polished recordings with overlays. Free at `obsproject.com`.
   - **ShareX** — Lightweight alternative. Free at `getsharex.com`.

3. **Prepare your terminal:**
   - Make the terminal window at least **120 × 40 characters**
   - Use a **light background** (records better for hackathon judges)
   - Set font size to **14pt+** for readability
   - **Close all other terminal tabs** to avoid confusion

## Recording Steps

### Option A: Windows Game Bar (Recommended — Zero Setup)

```powershell
# 1. Open a fresh terminal in the Vera directory
cd C:\Users\Jones\Documents\WarchildDev\Vera

# 2. Switch to submission branch
git checkout submission/casper-buildathon

# 3. Press Win+G — the Game Bar overlay appears
#    Click the "Record" button (the circle)
#    A small recording indicator appears in the corner

# 4. Run the demo script:
powershell -ExecutionPolicy Bypass -File scripts\demo-record.ps1

# 5. When "Demo Complete" appears, press Win+G again
#    Click "Stop Recording" (the square button)
```

Your video is saved to `C:\Users\Jones\Videos\Captures\`.

### Option B: OBS Studio

1. **Setup:** Create a new scene with a "Window Capture" source
2. **Select:** Choose your terminal window (Git Bash or PowerShell)
3. **Crop:** Hold Alt and drag edges to crop to just the terminal area
4. **Record:** Start Recording, then run the demo script
5. **Stop:** Stop Recording when complete

## Demo Script Reference

Both `scripts\demo-record.sh` (Git Bash) and `scripts\demo-record.ps1` (PowerShell) run the same 7 steps:

| Step | Route | What It Shows |
|------|-------|---------------|
| 1 | `GET /api/health` | Vera is alive — returns blockchain info, agent count |
| 2 | `GET /api/discover` | 3 seed agents: Luna, Sigil, TicketBot |
| 3 | `GET /api/leaderboard` | Ranked scores: Sigil 98, Luna 94, TicketBot 12 |
| 4 | `POST /api/evaluate` | Full eval with on-chain attestation |
| 5 | `GET /api/agents/compare` | Side-by-side: Luna vs Sigil |
| 6 | `POST /api/register` | New agent self-registers |
| 7 | `POST /api/attestations` + GET | Write and query on-chain attestations |

## Submission on DoraHacks

After recording the video, submit at:

```
https://dorahacks.io/hackathon/casper-agentic-buildathon
```

### Submission Checklist

- [ ] **GitHub repo:** https://github.com/Warchildwages/Vera
- [ ] **Branch:** `submission/casper-buildathon`
- [ ] **Tag:** `v0.1.0-casper-buildathon`
- [ ] **Demo video file:** Upload to YouTube unlisted or DoraHacks directly
- [ ] **Description:** "Agent Identity & Trust Authority for Casper Network"
- [ ] **Track:** Agent Identity & Trust
- [ ] **Team:** Jones

### Recommended Demo Video Description (paste into DoraHacks)

> **Vera 🛡️ — Agent Identity & Trust Authority for Casper Network**
>
> Vera is the trust authority for the Casper agent economy. She discovers agents via the Casper MCP registry, cryptographically verifies their Ed25519 identity through challenge-response (tweetnacl), tests their capabilities via live endpoint probes, aggregates reputation from transactions and disputes — and records every evaluation as an on-chain attestation on Casper Testnet via the AgentAttest Odra 2.0 contract.
>
> **Key features:**
> - Ed25519 challenge-response verification (tweetnacl)
> - AgentAttest Odra 2.0 contract on Casper Testnet (4 entry points)
> - Agent discovery, comparison, leaderboard, and self-registration
> - did:nostr W3C spec v0.1.0 DID documents
> - Multi-chain x402 payment support (Casper + Circle)
> - 15 API routes, 15 unit tests, strict TypeScript
> - 3 seed agents: Sigil (98/100), Luna (94/100), TicketBot (12/100)
>
> **On-chain:** AgentAttest contract (record, query, count) — Casper Testnet
> **GitHub:** github.com/Warchildwages/Vera

## Timing

- **Deadline:** July 7, 2026 @ **23:59 UTC** (7:59 PM ET)
- **Demo recording takes:** ~2 minutes (video) + 5 minutes (setup + post-processing)
- **Don't wait — record now.**
