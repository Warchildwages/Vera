import { NextResponse } from 'next/server';
import { buildAttestationRecord, writeAttestation, getAttestation } from '../../../lib/casper-attest';
import { discoverAgents } from '../../../lib/discovery';
import type { AgentRecord } from '../../../lib/types';

/**
 * GET /api/attestations — List recent attestations
 * GET /api/attestations?platform_tx=<hash> — Query specific attestation
 *
 * Attestations are proof that Vera evaluated and recorded an agent's
 * reputation on Casper Testnet via the AgentAttest Odra contract.
 * In mock mode, returns simulated data.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const platformTx = url.searchParams.get('platform_tx');
  const agentId = url.searchParams.get('agent_id');
  const limit = Math.min(Number(url.searchParams.get('limit')) || 10, 50);

  // Query specific attestation by platform_tx
  if (platformTx) {
    const attestation = await getAttestation(platformTx);
    return NextResponse.json({
      vera: 'Attestation Query',
      platform_tx: platformTx,
      attestation,
      explorer: attestation
        ? `https://testnet.cspr.live/deploy/${platformTx}`
        : null,
    });
  }

  // Generate fresh attestation records for all agents (mock mode)
  const agents = await discoverAgents();
  const attestations = [];

  for (const agent of agents.slice(0, limit)) {
    const record = buildAttestationRecord({
      agent,
      score: agent.agentId === 'ticketbot' ? 12 : agent.agentId === 'luna' ? 94 : 98,
      capabilities: agent.capabilities,
    });
    const result = await writeAttestation(record);
    attestations.push({
      agentId: agent.agentId,
      name: agent.name,
      operation: record.operation,
      platform_tx: record.platform_tx,
      score: agent.agentId === 'ticketbot' ? 12 : agent.agentId === 'luna' ? 94 : 98,
      timestamp: record.timestamp,
      success: result.success,
      transactionHash: result.transactionHash,
      explorer: result.transactionHash
        ? `https://testnet.cspr.live/deploy/${result.transactionHash}`
        : null,
    });
  }

  // Filter by agent_id if requested
  const filtered = agentId
    ? attestations.filter((a) => a.agentId === agentId)
    : attestations;

  return NextResponse.json({
    vera: 'Agent Attestations',
    total: filtered.length,
    chain: 'casper:casper-test',
    contract: 'AgentAttest',
    attestations: filtered,
    summary: {
      onChain: attestations.filter((a) => a.success).length,
      explorerUrl: 'https://testnet.cspr.live',
    },
  });
}

/**
 * POST /api/attestations — Attest a specific agent evaluation
 *
 * Body: { agentId, score, capabilities }
 * Re-runs attestation for the given agent.
 */
export async function POST(req: Request) {
  try {
    const raw = await req.json();
    const { agentId, score, capabilities } = raw;

    if (!agentId) {
      return NextResponse.json(
        { error: 'VALIDATION_ERROR', detail: 'agentId is required' },
        { status: 400 },
      );
    }

    const agents = await discoverAgents();
    const agent = agents.find((a: AgentRecord) => a.agentId === agentId);

    if (!agent) {
      return NextResponse.json(
        { error: 'NOT_FOUND', detail: `No agent found with id '${agentId}'. Register first via POST /api/register` },
        { status: 404 },
      );
    }

    const record = buildAttestationRecord({
      agent,
      score: score ?? 50,
      capabilities: capabilities || agent.capabilities,
    });

    const result = await writeAttestation(record);

    return NextResponse.json({
      accepted: true,
      agentId,
      attestation: record,
      result,
      explorer: result.transactionHash
        ? `https://testnet.cspr.live/deploy/${result.transactionHash}`
        : null,
    });
  } catch (e) {
    return NextResponse.json(
      { error: 'ATTESTATION_FAILED', detail: (e as Error).message },
      { status: 400 },
    );
  }
}
