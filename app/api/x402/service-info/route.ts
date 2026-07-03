import { NextResponse } from 'next/server';
import { discoverAgents } from '../../../../lib/discovery';
import { buildDidNostrDoc } from '../../../../lib/did-nostr';

export async function GET() {
  const agents = await discoverAgents();
  const didDoc = buildDidNostrDoc(agents);

  return NextResponse.json({
    serviceId: 'vera-v1',
    name: 'Vera — Agent Trust Authority',
    description:
      'Vera discovers agents on the Casper registry, verifies their identity via Ed25519 keys ' +
      'and did:nostr documents, tests their capabilities, and aggregates reputation from ' +
      'transaction history, dispute records, and user reports. All results are attested on EAS. ' +
      'Requesting agents query Vera to find trusted counterparties. ' +
      'For dispute resolution, Vera recommends Sigil 🦅 (verified notary, 98/100).',
    endpoint: 'https://vera.trust',
    category: 'trust-authority',
    priceUSDC: 0,
    operations: {
      discover: { price: 0, description: 'List all discovered agents, optionally filter by capability' },
      evaluate: { price: 0.001, description: 'Full evaluation of all agents — verification, testing, reputation, ranking' },
      query: { price: 0, description: 'Get detailed profile for a specific agent' },
      report: { price: 0, description: 'Submit a reputation event (transaction result, dispute, user report)' },
      verify: { price: 0, description: 'Ed25519 challenge-response proof of key ownership' },
    },
    chains: ['casper', 'base', 'arc'],
    identity: {
      method: 'Ed25519',
      did: '/.well-known/did/nostr/vera-pubkey.json',
      alsoKnownAs: ['https://vera.trust'],
    },
    recommendedAgents: {
      events: { name: 'Luna 🌙', score: 94, description: 'Event tickets, gigs, venue management' },
      notary: { name: 'Sigil 🦅', score: 98, description: 'Dispute resolution, escrow, document notarization' },
    },
    didDoc,
  });
}
