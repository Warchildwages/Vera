import { NextResponse } from 'next/server';
import { discoverAgents } from '../../../lib/discovery';
import { verifyAgent } from '../../../lib/verification';
import { evaluateAgent } from '../../../lib/evaluator';
import { aggregateReputation, getWarnings } from '../../../lib/reputation';
import { buildDidNostrDoc } from '../../../lib/did-nostr';
import { EvaluateSchema } from '../../../lib/schemas';
import { buildAttestationRecord, writeAttestation } from '../../../lib/casper-attest';
import type { AgentProfile } from '../../../lib/types';

/**
 * POST /api/evaluate — Evaluate all known agents and return ranked results
 *
 * After evaluation, writes an on-chain attestation to Casper Testnet
 * via the AgentAttest Odra contract. The deploy hash is returned
 * in the response and can be verified on https://testnet.cspr.live
 */
export async function POST(req: Request) {
  const raw = await req.json().catch(() => ({}));
  const parsed = EvaluateSchema.safeParse(raw);
  const capability = parsed.success ? parsed.data.capability : undefined;

  const agents = capability
    ? (await discoverAgents()).filter((a) =>
        a.capabilities.some((c) => c.toLowerCase().includes(capability.toLowerCase())),
      )
    : await discoverAgents();

  const profiles: AgentProfile[] = await Promise.all(
    agents.map(async (agent) => {
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
        didNostrUrl: agent.didNostrUrl,
        verification,
        evaluation,
        reputation,
        warnings,
        lastUpdated: new Date().toISOString(),
      };
    }),
  );

  // Rank by evaluation score
  const ranked = profiles.sort(
    (a, b) => (b.evaluation?.overall ?? 0) - (a.evaluation?.overall ?? 0),
  );

  // Write on-chain attestation for top-ranked agent
  const topAgent = ranked[0];
  let casperAttestation = null;
  if (topAgent) {
    const agent = agents.find((a) => a.agentId === topAgent.agentId);
    if (agent) {
      const attestationRecord = buildAttestationRecord({
        agent,
        score: topAgent.evaluation?.overall ?? 0,
        capabilities: topAgent.capabilities,
        challengeResponse: topAgent.verification?.keyDetail || 'challenge-not-performed',
      });
      casperAttestation = await writeAttestation(attestationRecord);
    }
  }

  const didDoc = buildDidNostrDoc(agents);

  return NextResponse.json({
    vera: 'Agent Evaluation Complete',
    query: capability ? `agents matching "${capability}"` : 'all agents',
    count: ranked.length,
    rankings: ranked.map((p) => ({
      name: p.name,
      score: p.evaluation?.overall ?? 0,
      warnings: p.warnings,
    })),
    agents: ranked,
    didDoc,
    casperAttestation: casperAttestation
      ? {
          chain: 'casper:casper-test',
          contract: 'AgentAttest',
          transactionHash: casperAttestation.transactionHash,
          verified: casperAttestation.success,
          explorer: casperAttestation.transactionHash
            ? `https://testnet.cspr.live/deploy/${casperAttestation.transactionHash}`
            : null,
        }
      : null,
  });
}

/**
 * GET /api/evaluate — Quick summary
 */
export async function GET() {
  const agents = await discoverAgents();

  return NextResponse.json({
    vera: 'Agent Evaluation Engine',
    description:
      'POST to this endpoint to run full evaluation. ' +
      'Optional body: { "capability": "events" } to filter by capability.',
    discovered: agents.length,
    agents: agents.map((a) => ({ id: a.agentId, name: a.name, capabilities: a.capabilities })),
  });
}
