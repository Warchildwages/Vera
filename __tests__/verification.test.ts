/**
 * Vera — Core unit tests
 *
 * Tests for verification, reputation, evaluator, and discovery logic.
 * These run without a server — pure function tests only.
 */

import { describe, it, expect } from 'vitest';

// ---------------------------------------------------------------------------
// Verification
// ---------------------------------------------------------------------------

describe('Verification', () => {
  it('validates Ed25519 key format (32 bytes = 64 hex chars)', async () => {
    const { isValidEd25519Key, generateChallenge } = await import('../lib/verification');

    // Valid 32-byte hex key
    const validKey = 'a'.repeat(64);
    expect(isValidEd25519Key(validKey)).toBe(true);

    // Too short
    expect(isValidEd25519Key('a'.repeat(62))).toBe(false);

    // Too long
    expect(isValidEd25519Key('a'.repeat(66))).toBe(false);

    // Non-hex characters
    expect(isValidEd25519Key('z'.repeat(64))).toBe(false);

    // Empty
    expect(isValidEd25519Key('')).toBe(false);

    // generateChallenge returns 32 bytes
    const { challenge } = generateChallenge();
    expect(challenge).toHaveLength(64); // 32 bytes = 64 hex chars
    expect(challenge).toMatch(/^[0-9a-f]{64}$/);
  });

  it('verifies challenge-response signature', async () => {
    const nacl = await import('tweetnacl');
    const { generateChallenge, verifyChallenge } = await import('../lib/verification');

    // Generate a real keypair
    const keyPair = nacl.default.sign.keyPair();
    const publicKeyHex = Array.from(keyPair.publicKey)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');

    const { challenge } = generateChallenge();
    const msgBytes = new TextEncoder().encode(challenge);
    const signature = nacl.default.sign.detached(msgBytes, keyPair.secretKey);
    const signatureHex = Array.from(signature)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');

    // Valid signature should pass
    const valid = verifyChallenge(challenge, signatureHex, publicKeyHex);
    expect(valid).toBe(true);

    // Wrong key should fail
    const wrongKey = 'b'.repeat(64);
    const invalid = verifyChallenge(challenge, signatureHex, wrongKey);
    expect(invalid).toBe(false);

    // Wrong signature should fail
    const wrongSig = 'c'.repeat(128);
    const badSig = verifyChallenge(challenge, wrongSig, publicKeyHex);
    expect(badSig).toBe(false);
  });

  it('validates did:nostr document structure', async () => {
    const { validateDidNostrDoc } = await import('../lib/verification');
    const agent = {
      agentId: 'test',
      name: 'Test',
      description: 'Test agent',
      ed25519PublicKey: 'a'.repeat(64),
      endpoint: 'https://test.example.com',
      capabilities: ['events', 'tickets'],
      chains: ['casper'],
      registeredAt: '2026-01-01T00:00:00Z',
    };

    // Valid doc
    const validDoc = {
      id: 'did:nostr:test',
      verificationMethod: [{ id: 'did:nostr:test#key', type: 'Ed25519VerificationKey' }],
      service: [
        { id: 'events', type: 'LunaOperation', serviceEndpoint: 'https://test/api/x402' },
        { id: 'tickets', type: 'LunaOperation', serviceEndpoint: 'https://test/api/x402' },
      ],
    };
    expect(validateDidNostrDoc(validDoc, agent)).toBe(true);

    // Missing verificationMethod
    const noVm = { id: 'did:nostr:test', service: [] };
    expect(validateDidNostrDoc(noVm, agent)).toBe(false);

    // Missing service array
    const noService = { id: 'did:nostr:test', verificationMethod: [] };
    expect(validateDidNostrDoc(noService, agent)).toBe(false);

    // Missing capabilities in service
    const wrongService = {
      id: 'did:nostr:test',
      verificationMethod: [{ id: 'did:nostr:test#key' }],
      service: [{ id: 'unrelated', type: 'Other', serviceEndpoint: 'https://x' }],
    };
    expect(validateDidNostrDoc(wrongService, agent)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Discovery
// ---------------------------------------------------------------------------

describe('Discovery', () => {
  it('returns seed agents with expected count', async () => {
    // Set mock mode
    process.env.VERA_MOCK_MODE = 'true';
    const { discoverAgents, discoverByCapability, getAgent } = await import('../lib/discovery');

    const agents = await discoverAgents();
    expect(agents.length).toBeGreaterThanOrEqual(3);

    // Verify Luna exists
    const luna = await getAgent('luna');
    expect(luna).not.toBeNull();
    expect(luna?.capabilities).toContain('events');

    // Filter by capability
    const events = await discoverByCapability('events');
    expect(events.length).toBeGreaterThanOrEqual(1);
    expect(events.some((a) => a.agentId === 'luna')).toBe(true);
  });

  it('returns null for unknown agent', async () => {
    const { getAgent } = await import('../lib/discovery');
    const agent = await getAgent('nonexistent-agent');
    expect(agent).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Reputation
// ---------------------------------------------------------------------------

describe('Reputation', () => {
  it('returns seed reputation data', async () => {
    const { getReputation, aggregateReputation, getWarnings } = await import('../lib/reputation');

    // Luna should have 50+ transactions
    const lunaRep = getReputation('luna');
    expect(lunaRep.length).toBeGreaterThanOrEqual(50);

    const agg = aggregateReputation('luna');
    expect(agg.totalTransactions).toBeGreaterThanOrEqual(50);

    // Sigil should have 1 transaction
    const sigilRep = getReputation('sigil');
    expect(sigilRep.length).toBeGreaterThanOrEqual(1);

    // TicketBot should have warnings (bad key)
    const warnings = getWarnings('ticketbot');
    expect(warnings.length).toBeGreaterThanOrEqual(1);
    expect(warnings[0]).toContain('verification');
  });

  it('submits new reputation events', async () => {
    const { submitReputation, getReputation } = await import('../lib/reputation');

    const event = {
      eventId: 'test-event-1',
      agentId: 'luna',
      type: 'report' as const,
      outcome: 'positive' as const,
      source: 'test',
      detail: 'Unit test submission',
      timestamp: new Date().toISOString(),
    };

    submitReputation(event);
    const events = getReputation('luna');
    expect(events.some((e) => e.eventId === 'test-event-1')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

describe('Schemas', () => {
  it('validates report schema', async () => {
    const { ReportSchema } = await import('../lib/schemas');

    // Valid report
    const valid = ReportSchema.safeParse({
      agentId: 'test-agent',
      type: 'transaction',
      outcome: 'positive',
      source: 'test',
      detail: 'Test transaction',
    });
    expect(valid.success).toBe(true);

    // Missing required field
    const invalid = ReportSchema.safeParse({
      agentId: 'test-agent',
    });
    expect(invalid.success).toBe(false);
  });

  it('validates challenge response schema', async () => {
    const { ChallengeResponseSchema } = await import('../lib/schemas');

    const valid = ChallengeResponseSchema.safeParse({
      agentId: 'test',
      challenge: 'a'.repeat(64),
      signature: 'b'.repeat(128),
      publicKey: 'c'.repeat(64),
    });
    expect(valid.success).toBe(true);

    const invalid = ChallengeResponseSchema.safeParse({});
    expect(invalid.success).toBe(false);
  });
});
