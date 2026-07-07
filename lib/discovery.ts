/**
 * Vera — Agent Discovery via Casper Registry
 *
 * Discovers agents from Casper's agent registry. Returns agent records that Vera
 * can then verify and evaluate. The directory shows agents across all categories.
 */

import type { AgentRecord } from './types';

function isMockMode(): boolean {
  if (process.env.NODE_ENV === 'production' && !process.env.VERA_MOCK_MODE) return false;
  return process.env.VERA_MOCK_MODE === 'true';
}

// Expanded agent directory — the "Yellow Pages" of the agent economy
const SEED_AGENTS: AgentRecord[] = [
  {
    agentId: 'luna',
    name: 'Luna 🌙',
    description: 'Full-service event agent — tickets, gigs, venue management, and event discovery. Powered by AllFans with 17 operations including buy, create, RSVP, transfer, and marketplace.',
    ed25519PublicKey: 'demo-luna-ed25519-pubkey',
    endpoint: 'https://luna-agent.onrender.com',
    capabilities: ['events', 'tickets', 'gigs', 'venue', 'marketplace', 'transfer', 'check-in', 'rsvp'],
    chains: ['casper', 'base', 'arc'],
    didNostrUrl: 'https://luna-agent.onrender.com/.well-known/did/nostr/demo-luna-pubkey.json',
    registeredAt: '2026-06-01T00:00:00Z',
  },
  {
    agentId: 'sigil',
    name: 'Sigil 🦅',
    description: 'On-chain notary and legal document agent. Powered by Signet — escrow, dispute resolution, compliance evaluation, and witness attestation across chains.',
    ed25519PublicKey: 'demo-sigil-ed25519-pubkey',
    endpoint: 'https://sigil.onrender.com',
    capabilities: ['notary', 'witness', 'escrow', 'dispute', 'analyze', 'compliance', 'verify'],
    chains: ['casper', 'base', 'arc'],
    didNostrUrl: 'https://sigil.onrender.com/.well-known/did/nostr/demo-sigil-pubkey.json',
    registeredAt: '2026-06-01T00:00:00Z',
  },
  {
    agentId: 'ticketbot',
    name: 'TicketBot',
    description: 'Event ticket reseller — secondary marketplace for event tickets. Higher prices, no verification.',
    ed25519PublicKey: 'demo-ticketbot-bad-key',
    endpoint: 'https://ticketbot.example.com',
    capabilities: ['events', 'tickets', 'resale'],
    chains: ['casper'],
    registeredAt: '2026-06-15T00:00:00Z',
  },
  {
    agentId: 'yieldmax',
    name: 'YieldMax 🤖',
    description: 'Autonomous DeFi yield optimizer — monitors liquidity pools across Casper and Base, rebalances positions, and executes swaps. Supports x402 for gasless transactions.',
    ed25519PublicKey: 'demo-yieldmax-ed25519-pubkey',
    endpoint: 'https://yieldmax-agent.example.com',
    capabilities: ['yield', 'liquidity', 'swap', 'defi', 'staking', 'trading'],
    chains: ['casper', 'base'],
    registeredAt: '2026-06-20T00:00:00Z',
  },
  {
    agentId: 'sentinelos',
    name: 'SentinelOS 🛡️',
    description: 'Security monitoring agent — detects smart contract vulnerabilities, monitors for suspicious transactions, and blocks dangerous interactions before wallet signing.',
    ed25519PublicKey: 'demo-sentinel-ed25519-pubkey',
    endpoint: 'https://sentinel-agent.example.com',
    capabilities: ['security', 'monitor', 'shield', 'audit', 'protection'],
    chains: ['casper', 'base', 'ethereum'],
    registeredAt: '2026-06-18T00:00:00Z',
  },
  {
    agentId: 'payflow',
    name: 'PayFlow 💸',
    description: 'x402 payment gateway agent — handles micropayment routing, invoice generation, cross-chain settlement, and payment verification. Pay-per-use for agents and humans.',
    ed25519PublicKey: 'demo-payflow-ed25519-pubkey',
    endpoint: 'https://payflow-agent.example.com',
    capabilities: ['payment', 'x402', 'transfer', 'invoice', 'micropayment', 'billing'],
    chains: ['casper', 'base', 'arc'],
    registeredAt: '2026-06-22T00:00:00Z',
  },
  {
    agentId: 'dataweaver',
    name: 'DataWeaver 📊',
    description: 'Cross-chain data oracle — indexes on-chain data, provides queryable feeds, and delivers verified data to agents via x402. Supports Casper, Base, and Ethereum.',
    ed25519PublicKey: 'demo-dataweaver-ed25519-pubkey',
    endpoint: 'https://dataweaver-agent.example.com',
    capabilities: ['data', 'analytics', 'oracle', 'query', 'feed', 'index'],
    chains: ['casper', 'base', 'ethereum'],
    registeredAt: '2026-06-25T00:00:00Z',
  },
  {
    agentId: 'attesta',
    name: 'Attesta 🪪',
    description: 'Decentralized identity and credential agent — issues verifiable credentials, verifies DIDs (did:nostr, did:ethr), manages attestation chains, and provides reputation scores.',
    ed25519PublicKey: 'demo-attesta-ed25519-pubkey',
    endpoint: 'https://attesta-agent.example.com',
    capabilities: ['identity', 'did', 'attest', 'credential', 'reputation', 'verify'],
    chains: ['casper', 'base', 'ethereum'],
    registeredAt: '2026-06-28T00:00:00Z',
  },
];

/**
 * Discover agents from the registry.
 * In mock mode: returns expanded seed agents.
 * In production: queries Casper MCP + ERC-8004 registries.
 */
export async function discoverAgents(): Promise<AgentRecord[]> {
  if (isMockMode()) {
    return SEED_AGENTS;
  }
  // TODO: Query Casper MCP Registry + ERC-8004 Identity Registry
  return SEED_AGENTS;
}

/**
 * Discover agents filtered by capability.
 */
export async function discoverByCapability(capability: string): Promise<AgentRecord[]> {
  const all = await discoverAgents();
  return all.filter((a) =>
    a.capabilities.some((c) => c.toLowerCase().includes(capability.toLowerCase())),
  );
}

/**
 * Get a single agent by ID.
 */
export async function getAgent(agentId: string): Promise<AgentRecord | null> {
  const all = await discoverAgents();
  return all.find((a) => a.agentId === agentId) ?? null;
}
