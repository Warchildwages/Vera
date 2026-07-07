/**
 * Vera — Agent Category Taxonomy
 *
 * Maps agent capabilities to browseable directory categories.
 * This is the "Yellow Pages" for the agent economy.
 */

export interface AgentCategory {
  id: string;
  name: string;
  icon: string;
  tags: string[];
  description: string;
}

export const AGENT_CATEGORIES: AgentCategory[] = [
  {
    id: 'events',
    name: 'Events & Ticketing',
    icon: '\u{1F39F}\uFE0F',
    tags: ['events', 'tickets', 'gigs', 'venue', 'marketplace', 'transfer', 'check-in', 'resale'],
    description: 'Event discovery, ticket sales, venue management',
  },
  {
    id: 'legal',
    name: 'Legal & Notary',
    icon: '\u2696\uFE0F',
    tags: ['notary', 'witness', 'escrow', 'dispute', 'timestamp', 'analyze', 'compliance'],
    description: 'On-chain notarization, dispute resolution, escrow',
  },
  {
    id: 'defi',
    name: 'DeFi & Finance',
    icon: '\u{1F3E6}',
    tags: ['yield', 'swap', 'liquidity', 'staking', 'lending', 'trading', 'defi'],
    description: 'Yield optimization, trading, lending, and DeFi automation',
  },
  {
    id: 'security',
    name: 'Security & Audit',
    icon: '\u{1F512}',
    tags: ['audit', 'verify', 'security', 'monitor', 'shield', 'sentinel'],
    description: 'Smart contract audits, threat monitoring, security verification',
  },
  {
    id: 'payments',
    name: 'Payments & x402',
    icon: '\u{1F4B8}',
    tags: ['payment', 'x402', 'transfer', 'invoice', 'micropayment', 'billing'],
    description: 'Micropayments, x402 gateways, and payment processing',
  },
  {
    id: 'data',
    name: 'Data & Oracle',
    icon: '\u{1F4CA}',
    tags: ['data', 'analytics', 'oracle', 'feed', 'index', 'query'],
    description: 'Data feeds, analytics, oracle services, information retrieval',
  },
  {
    id: 'identity',
    name: 'Identity & Attestation',
    icon: '\u{1FAAA}',
    tags: ['identity', 'did', 'attest', 'verify', 'credential', 'reputation', 'trust'],
    description: 'Decentralized identity, credential verification, trust scoring',
  },
  {
    id: 'infra',
    name: 'Infrastructure',
    icon: '\u2699\uFE0F',
    tags: ['infra', 'api', 'gateway', 'relay', 'bridge', 'node', 'rpc'],
    description: 'Blockchain infrastructure, API gateways, cross-chain relays',
  },
];

export function deriveCategories(capabilities: string[]): string[] {
  const matched = new Set<string>();
  const lowerCaps = capabilities.map((c) => c.toLowerCase());
  for (const category of AGENT_CATEGORIES) {
    for (const tag of category.tags) {
      if (lowerCaps.some((c) => c.includes(tag) || tag.includes(c))) {
        matched.add(category.id);
        break;
      }
    }
  }
  return Array.from(matched);
}

export function getCategoryCounts(
  agentCapabilities: { agentId: string; capabilities: string[] }[],
): { id: string; name: string; icon: string; description: string; count: number }[] {
  return AGENT_CATEGORIES.map((cat) => ({
    id: cat.id,
    name: cat.name,
    icon: cat.icon,
    description: cat.description,
    count: agentCapabilities.filter((a) =>
      a.capabilities.some((c) =>
        cat.tags.some((t) => c.toLowerCase().includes(t) || t.includes(c.toLowerCase())),
      ),
    ).length,
  })).filter((c) => c.count > 0);
}
