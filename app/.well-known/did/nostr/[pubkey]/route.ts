import { NextResponse } from 'next/server';
import { discoverAgents } from '../../../../../lib/discovery';
import { buildDidNostrDoc } from '../../../../../lib/did-nostr';

/**
 * GET /.well-known/did/nostr/:pubkey — Vera's did:nostr document
 *
 * Per W3C Nostr CG v0.1.0. Returns Vera's DID document with:
 * - Verification method (Ed25519 public key)
 * - Service endpoints (discovery, evaluation, query)
 * - Known agents in Vera's registry (Luna, Sigil, etc.)
 * - Cross-chain identity references
 */
export async function GET(
  _req: Request,
  { params }: { params: { pubkey: string } },
) {
  const agents = await discoverAgents();
  const doc = buildDidNostrDoc(agents);

  return NextResponse.json(doc, {
    headers: {
      'Content-Type': 'application/did+json',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
