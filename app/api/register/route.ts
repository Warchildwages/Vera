import { NextResponse } from 'next/server';
import { registerAgent, getRegisteredAgents } from '../../../lib/registration';
import { getAgent } from '../../../lib/discovery';
import type { AgentRecord } from '../../../lib/types';

/**
 * POST /api/register — Register a new agent with Vera
 *
 * Agents self-register with their Ed25519 public key, endpoint,
 * and capabilities. Vera uses this for discovery.
 *
 * Body: { agentId, name, description, ed25519PublicKey, endpoint, capabilities, chains, didNostrUrl }
 */
export async function POST(req: Request) {
  try {
    const raw = await req.json();
    const { agentId, name, description, ed25519PublicKey, endpoint, capabilities, chains, didNostrUrl } = raw;

    if (!agentId || !name || !ed25519PublicKey || !endpoint) {
      return NextResponse.json(
        { error: 'VALIDATION_ERROR', detail: 'agentId, name, ed25519PublicKey, and endpoint are required' },
        { status: 400 },
      );
    }

    // Validate Ed25519 key format (32 bytes = 64 hex chars)
    if (!/^[0-9a-f]{64}$/i.test(ed25519PublicKey)) {
      return NextResponse.json(
        { error: 'VALIDATION_ERROR', detail: 'ed25519PublicKey must be 64 hex characters (32 bytes)' },
        { status: 400 },
      );
    }

    // Check for duplicate
    const existing = await getAgent(agentId);
    if (existing) {
      return NextResponse.json(
        { error: 'CONFLICT', detail: `Agent '${agentId}' is already registered with Vera. POST again to update.` },
        { status: 409 },
      );
    }

    const record: AgentRecord = {
      agentId,
      name,
      description: description || '',
      ed25519PublicKey,
      endpoint,
      capabilities: capabilities || [],
      chains: chains || ['casper'],
      didNostrUrl,
      registeredAt: new Date().toISOString(),
    };

    registerAgent(record);

    return NextResponse.json({
      accepted: true,
      agentId,
      detail: `Agent '${name}' registered with Vera. Run challenge-response to prove key ownership: GET /api/verify/challenge`,
      nextSteps: [
        { step: 1, action: 'GET /api/verify/challenge', description: 'Get a challenge to sign' },
        { step: 2, action: 'POST /api/verify/challenge', description: 'Submit signed challenge to prove Ed25519 key ownership' },
        { step: 3, action: 'POST /api/evaluate', description: 'Trigger full evaluation across all registered agents' },
      ],
      registeredAt: record.registeredAt,
    });
  } catch (e) {
    return NextResponse.json(
      { error: 'REGISTRATION_FAILED', detail: (e as Error).message },
      { status: 400 },
    );
  }
}

/**
 * GET /api/register — List registered (non-seed) agents
 */
export async function GET() {
  const registered = getRegisteredAgents();
  return NextResponse.json({
    vera: 'Agent Registration',
    count: registered.length,
    agents: registered.map((a) => ({
      id: a.agentId,
      name: a.name,
      capabilities: a.capabilities,
      chains: a.chains,
      registeredAt: a.registeredAt,
    })),
  });
}
