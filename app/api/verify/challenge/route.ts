/**
 * GET /api/verify/challenge — Generate a cryptographic challenge for Ed25519 proof-of-control.
 *
 * An agent requests a challenge, signs it with their Ed25519 private key,
 * and returns the signature. Vera verifies using tweetnacl.
 * This cryptographically proves the agent controls their claimed public key.
 *
 * Usage:
 *   1. Agent: GET /api/verify/challenge → { challenge: "abc...", agentId: "luna" }
 *   2. Agent: signs challenge with Ed25519 private key
 *   3. Agent: POST /api/verify/challenge { challenge, signature, publicKey }
 *   4. Vera:  verifies with tweetnacl → { verified: true, keyDetail: "..." }
 */

import { NextResponse } from 'next/server';
import { generateChallenge, verifyChallenge } from '../../../../lib/verification';
import { ChallengeResponseSchema } from '../../../../lib/schemas';
import { getAgent } from '../../../../lib/discovery';

/**
 * GET — Generate a challenge for an agent to sign.
 */
export async function GET() {
  const { challenge } = generateChallenge();

  return NextResponse.json({
    challenge,
    description:
      'Sign this challenge with your Ed25519 private key and POST it back with your public key to cryptographically prove ownership.',
    algorithm: 'Ed25519',
    library: 'tweetnacl',
  });
}

/**
 * POST — Verify a signed challenge.
 */
export async function POST(req: Request) {
  try {
    const raw = await req.json();
    const parsed = ChallengeResponseSchema.safeParse(raw);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'VALIDATION_ERROR', detail: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const { agentId, challenge, signature, publicKey } = parsed.data;

    // Look up the agent's registered public key — NEVER fall back to user-supplied key
    const agent = await getAgent(agentId);
    if (!agent) {
      return NextResponse.json(
        {
          verified: false,
          agentId,
          keyDetail: 'Agent not found in Vera registry. Register first via POST /api/register.',
        },
        { status: 404 },
      );
    }

    // Verify the signature cryptographically against the REGISTERED key
    const valid = verifyChallenge(challenge, signature, agent.ed25519PublicKey);

    // If the agent exists, update their verification status
    if (valid && agent) {
      // In production: persist the verified state
      // For now: return the result
      return NextResponse.json({
        verified: true,
        agentId,
        keyDetail: `Ed25519 key cryptographically verified via tweetnacl. Agent ${agent.name} controls their claimed public key.`,
        algorithm: 'Ed25519',
        library: 'tweetnacl.sign.detached.verify',
      });
    }

    if (!valid) {
      return NextResponse.json(
        {
          verified: false,
          agentId,
          keyDetail: 'Signature verification failed. The agent does not control the claimed public key.',
        },
        { status: 401 },
      );
    }

    return NextResponse.json({
      verified: true,
      agentId,
      keyDetail: 'Ed25519 key verified (key-only — no matching agent record).',
    });
  } catch (e) {
    console.error('[verify-challenge] Verification error:', e);
    return NextResponse.json(
      { error: 'VERIFICATION_FAILED', detail: 'An internal error occurred during verification.' },
      { status: 400 },
    );
  }
}
