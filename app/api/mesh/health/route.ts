import { NextResponse } from 'next/server';
import { discoverAgents } from '../../../../lib/discovery';
import type { AgentRecord } from '../../../../lib/types';

/**
 * GET /api/mesh/health — Ping all known agents and report mesh health
 *
 * This validates the agent mesh is actually functional.
 * Each known agent gets pinged at their endpoint.
 * A mesh with all agents reachable = healthy trust network.
 */
export async function GET() {
  const agents: AgentRecord[] = await discoverAgents();

  interface MeshResult {
    agentId: string;
    name: string;
    endpoint: string;
    status: string;
    latencyMs: number;
  }

  const results: MeshResult[] = await Promise.all(
    agents.map(async (agent: AgentRecord) => {
      const start = Date.now();
      try {
        const resp = await fetch(agent.endpoint, {
          method: 'GET',
          signal: AbortSignal.timeout(5000),
        });
        const latencyMs = Date.now() - start;
        return {
          agentId: agent.agentId,
          name: agent.name,
          endpoint: agent.endpoint,
          status: resp.ok ? 'reachable' : `HTTP ${resp.status}`,
          latencyMs,
        };
      } catch {
        return {
          agentId: agent.agentId,
          name: agent.name,
          endpoint: agent.endpoint,
          status: 'unreachable',
          latencyMs: Date.now() - start,
        };
      }
    }),
  );

  const reachable = results.filter((r: MeshResult) => r.status === 'reachable').length;
  const total = results.length;

  return NextResponse.json({
    vera: 'Agent Mesh Health',
    meshStatus: reachable === total ? 'healthy' : reachable > 0 ? 'degraded' : 'down',
    meshDensity: `${reachable}/${total} agents reachable`,
    agents: results,
    recommendations: reachable < total
      ? [
          'Some agents in the mesh are unreachable — consider deploying missing services.',
          'Agents with unreachable endpoints will score lower in evaluations.',
        ]
      : ['All known agents are reachable. The trust mesh is healthy.'],
  });
}
