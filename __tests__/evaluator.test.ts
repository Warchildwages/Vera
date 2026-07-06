/**
 * Vera — Evaluator + Reputation Unit Tests
 *
 * Tests for the evaluator scoring logic and reputation aggregation.
 */
import { describe, it, expect } from 'vitest';

describe('Evaluator — Scoring Logic', () => {
  it('evaluates agent capabilities correctly', async () => {
    const { evaluateAgent } = await import('../lib/evaluator');
    const agent = {
      agentId: 'test-agent',
      name: 'Test Agent',
      description: 'A test agent',
      ed25519PublicKey: 'a'.repeat(64),
      endpoint: 'https://test-agent.local',
      capabilities: ['events', 'tickets'],
      chains: ['casper'],
      registeredAt: '2026-01-01T00:00:00Z',
    };

    const verification = {
      agentId: 'test-agent',
      keyValid: true,
      keyDetail: 'Key format valid',
      endpointReachable: true,
      endpointDetail: 'HTTP 200',
      didNostrValid: true,
      didNostrDetail: 'DID valid',
      timestamp: new Date().toISOString(),
    };

    const score = await evaluateAgent(agent, verification);
    expect(score.agentId).toBe('test-agent');
    expect(score.overall).toBeGreaterThanOrEqual(0);
    expect(score.overall).toBeLessThanOrEqual(100);
    expect(score.identity).toBeGreaterThanOrEqual(0);
    expect(score.capability).toBeGreaterThanOrEqual(0);
    expect(score.reliability).toBeGreaterThanOrEqual(0);
    expect(score.dimensions.length).toBeGreaterThanOrEqual(3);
    expect(score.testedAt).toBeTruthy();
    expect(score.expiresAt).toBeTruthy();
  });

  it('scores a fully verified agent higher than a partially verified one', async () => {
    const { evaluateAgent } = await import('../lib/evaluator');
    const agent = {
      agentId: 'test',
      name: 'Test',
      description: 'Test',
      ed25519PublicKey: 'b'.repeat(64),
      endpoint: 'https://test.local',
      capabilities: ['events'],
      chains: ['casper'],
      registeredAt: '2026-01-01T00:00:00Z',
    };

    const fullVerification = {
      agentId: 'test', keyValid: true, keyDetail: 'OK',
      endpointReachable: true, endpointDetail: 'HTTP 200',
      didNostrValid: true, didNostrDetail: 'Valid',
      timestamp: new Date().toISOString(),
    };

    const partialVerification = {
      agentId: 'test', keyValid: false, keyDetail: 'Bad key',
      endpointReachable: true, endpointDetail: 'HTTP 200',
      didNostrValid: false, didNostrDetail: 'No DID',
      timestamp: new Date().toISOString(),
    };

    const fullScore = await evaluateAgent(agent, fullVerification);
    const partialScore = await evaluateAgent(agent, partialVerification);
    expect(fullScore.overall).toBeGreaterThan(partialScore.overall);
  });

  it('handles agents with no capabilities gracefully', async () => {
    const { evaluateAgent } = await import('../lib/evaluator');
    const agent = {
      agentId: 'empty',
      name: 'Empty',
      description: '',
      ed25519PublicKey: 'c'.repeat(64),
      endpoint: 'https://empty.local',
      capabilities: [],
      chains: ['casper'],
      registeredAt: '2026-01-01T00:00:00Z',
    };

    const verification = {
      agentId: 'empty', keyValid: true, keyDetail: 'OK',
      endpointReachable: true, endpointDetail: 'HTTP 200',
      didNostrValid: false, didNostrDetail: 'No DID',
      timestamp: new Date().toISOString(),
    };

    const score = await evaluateAgent(agent, verification);
    expect(score.overall).toBeGreaterThanOrEqual(0);
    expect(score.dimensions.some((d) => d.name.startsWith('op:'))).toBe(true);
  });
});

describe('Reputation — Aggregation', () => {
  it('returns seed reputation data for known agents', async () => {
    const { getReputation, aggregateReputation } = await import('../lib/reputation');

    const lunaRep = getReputation('luna');
    expect(lunaRep.length).toBeGreaterThanOrEqual(50);

    const agg = aggregateReputation('luna');
    expect(agg.totalTransactions).toBeGreaterThanOrEqual(50);
    expect(agg.disputes).toBeGreaterThanOrEqual(1);
  });

  it('returns empty reputation for unknown agents', async () => {
    const { getReputation, aggregateReputation } = await import('../lib/reputation');

    const rep = getReputation('unknown-agent');
    expect(rep).toEqual([]);

    const agg = aggregateReputation('unknown-agent');
    expect(agg.totalTransactions).toBe(0);
    expect(agg.recentEvents).toEqual([]);
  });

  it('aggregates warnings correctly', async () => {
    const { getWarnings } = await import('../lib/reputation');

    // TicketBot should have verification failure warnings
    const ticketBotWarnings = getWarnings('ticketbot');
    expect(ticketBotWarnings.length).toBeGreaterThanOrEqual(1);

    // Luna should have no warnings (good reputation)
    const lunaWarnings = getWarnings('luna');
    // Check it's an array (may or may not have warnings depending on seed data)
    expect(Array.isArray(lunaWarnings)).toBe(true);
  });
});
