import { NextResponse } from 'next/server';
import { discoverAgents } from '../../../../lib/discovery';
import { getCategoryCounts } from '../../../../lib/categories';

/**
 * GET /api/discover/categories — Browse agent categories with counts
 */
export async function GET() {
  const agents = await discoverAgents();
  const categories = getCategoryCounts(
    agents.map((a) => ({ agentId: a.agentId, capabilities: a.capabilities })),
  );
  return NextResponse.json({
    vera: 'Agent Categories',
    total: categories.length,
    categories,
  });
}
