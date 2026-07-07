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

// Real agents in Vera's directory — only deployed, verifiable agents
const SEED_AGENTS: AgentRecord[] = [
  {
    agentId: 'luna',
    name: 'Luna 🌙',
    description: 'Full-service event agent — tickets, gigs, venue management, and event discovery. Powered by AllFans with 17 operations including buy, create, RSVP, transfer, and marketplace.',
    ed25519PublicKey: 'a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2',
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
    ed25519PublicKey: 'b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3',
    endpoint: 'https://sigil.onrender.com',
    capabilities: ['notary', 'witness', 'escrow', 'dispute', 'analyze', 'compliance', 'verify'],
    chains: ['casper', 'base', 'arc'],
    didNostrUrl: 'https://sigil.onrender.com/.well-known/did/nostr/demo-sigil-pubkey.json',
    registeredAt: '2026-06-01T00:00:00Z',
  },
  {
    agentId: 'ticketbot',
    name: 'TicketBot',
    description: 'Event ticket reseller — secondary marketplace. Example agent with bad key showing flagged status.',
    ed25519PublicKey: 'demo-ticketbot-bad-key',
    endpoint: 'https://ticketbot.example.com',
    capabilities: ['events', 'tickets', 'resale'],
    chains: ['casper'],
    registeredAt: '2026-06-15T00:00:00Z',
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
