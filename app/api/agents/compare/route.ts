import { NextResponse } from 'next/server';
import { discoverAgents, getAgent } from '../../../../lib/discovery';
import { verifyAgent } from '../../../../lib/verification';
import { evaluateAgent } from '../../../../lib/evaluator';
import { aggregateReputation, getWarnings } from '../../../../lib/reputation';

/**
 * GET /api/agents/compare?ids=luna,sigil — Compare multiple agents side-by-side
 *
 * Returns a comparison matrix showing scores, capabilities, reputation,
 * and warnings for each agent. Ideal for demo and judge review.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const idsParam = url.searchParams.get('ids');

  if (!idsParam) {
    return NextResponse.json(
      { error: 'VALIDATION_ERROR', detail: 'Query parameter "ids" is required (comma-separated, e.g. ?ids=luna,sigil)' },
      { status: 400 },
    );
  }

  const agentIds = idsParam.split(',').map((s) => s.trim()).filter(Boolean);

  if (agentIds.length < 2) {
    return NextResponse.json(
      { error: 'VALIDATION_ERROR', detail: 'At least 2 agent IDs required for comparison' },
      { status: 400 },
    );
  }

  if (agentIds.length > 6) {
    return NextResponse.json(
      { error: 'VALIDATION_ERROR', detail: 'Maximum 6 agents for comparison' },
      { status: 400 },
    );
  }

  const agents = await Promise.all(
    agentIds.map((id) => getAgent(id)),
  );

  const validAgents = agents.filter(Boolean);
  if (validAgents.length === 0) {
    return NextResponse.json(
      { error: 'NOT_FOUND', detail: 'None of the requested agents were found' },
      { status: 404 },
    );
  }

  // Build full profiles for each
  const profiles = await Promise.all(
    validAgents.map(async (agent) => {
      if (!agent) return null;
      const verification = await verifyAgent(agent);
      const evaluation = verification.keyValid
        ? await evaluateAgent(agent, verification)
        : null;
      const reputation = aggregateReputation(agent.agentId);
      const warnings = getWarnings(agent.agentId);

      return {
        agentId: agent.agentId,
        name: agent.name,
        description: agent.description,
        endpoint: agent.endpoint,
        capabilities: agent.capabilities,
        chains: agent.chains,
        verified: verification.keyValid && verification.endpointReachable,
        keyValid: verification.keyValid,
        didNostrValid: verification.didNostrValid,
        score: evaluation?.overall ?? 0,
        identity: evaluation?.identity ?? 0,
        capability: evaluation?.capability ?? 0,
        reliability: evaluation?.reliability ?? 0,
        transactions: reputation.totalTransactions,
        disputes: reputation.disputes,
        unresolvedDisputes: reputation.unresolvedDisputes,
        reports: reputation.reports,
        warnings,
        lastUpdated: new Date().toISOString(),
      };
    }),
  );

  // Find best agent
  const bestScore = Math.max(...profiles.map((p) => p?.score ?? 0));

  return NextResponse.json({
    vera: 'Agent Comparison',
    comparedAt: new Date().toISOString(),
    count: profiles.length,
    comparison: profiles,
    verdict: profiles.map((p) => ({
      agentId: p?.agentId,
      name: p?.name,
      rank: p?.score === bestScore ? '🥇 Best' : '',
      recommendation: p?.warnings && p.warnings.length > 0
        ? '⚠️ Caution — warnings present'
        : p?.verified
          ? '✅ Trusted — verified identity'
          : '⚠️ Verify before transacting',
    })),
  });
}
