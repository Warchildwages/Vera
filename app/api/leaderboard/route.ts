import { NextResponse } from 'next/server';
import { discoverAgents } from '../../../lib/discovery';
import { evaluateAgent } from '../../../lib/evaluator';
import { verifyAgent } from '../../../lib/verification';
import { aggregateReputation, getWarnings } from '../../../lib/reputation';

/**
 * GET /api/leaderboard — Ranked agent leaderboard
 *
 * Returns agents sorted by evaluation score descending.
 * Includes identity score, capability score, reliability,
 * warnings count, and reputation transaction count.
 *
 * This is a lightweight endpoint — runs verification + evaluation
 * for every known agent and ranks them.
 */
export async function GET() {
  const agents = await discoverAgents();

  const ranked = await Promise.all(
    agents.map(async (agent) => {
      const verification = await verifyAgent(agent);
      const evaluation = verification.keyValid
        ? await evaluateAgent(agent, verification)
        : null;
      const reputation = aggregateReputation(agent.agentId);
      const warnings = getWarnings(agent.agentId);

      return {
        rank: 0, // filled below
        agentId: agent.agentId,
        name: agent.name,
        score: evaluation?.overall ?? 0,
        identity: evaluation?.identity ?? 0,
        capability: evaluation?.capability ?? 0,
        reliability: evaluation?.reliability ?? 0,
        verified: verification.keyValid && verification.endpointReachable,
        didValid: verification.didNostrValid,
        transactions: reputation.totalTransactions,
        warnings: warnings.length,
        warningText: warnings.slice(0, 2),
      };
    }),
  );

  // Sort by score descending
  ranked.sort((a, b) => b.score - a.score);
  ranked.forEach((r, i) => { r.rank = i + 1; });

  return NextResponse.json({
    vera: 'Agent Leaderboard',
    generatedAt: new Date().toISOString(),
    count: ranked.length,
    rankings: ranked,
    summary: {
      verifiedAgents: ranked.filter((r) => r.verified).length,
      flaggedAgents: ranked.filter((r) => r.warnings > 0).length,
      topAgent: ranked[0]?.name ?? null,
      topScore: ranked[0]?.score ?? 0,
    },
  });
}
