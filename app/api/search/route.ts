import { NextResponse } from 'next/server';
import { discoverAgents } from '../../../lib/discovery';
import { verifyAgent } from '../../../lib/verification';
import { evaluateAgent } from '../../../lib/evaluator';
import { aggregateReputation, getWarnings } from '../../../lib/reputation';
import { deriveCategories } from '../../../lib/categories';

/**
 * GET /api/search — Search the Agent Directory
 *
 * Full-text search across agent names, descriptions, and capabilities.
 * Filter by chain, category, minScore, and limit.
 *
 * Examples:
 *   GET /api/search?q=tickets
 *   GET /api/search?q=events&chain=base
 *   GET /api/search?q=yield&minScore=70&limit=5
 *   GET /api/search?category=legal
 *   GET /api/search?chain=ethereum
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = url.searchParams.get('q')?.trim().toLowerCase() || '';
  const chain = url.searchParams.get('chain')?.trim().toLowerCase();
  const category = url.searchParams.get('category')?.trim().toLowerCase();
  const minScore = parseInt(url.searchParams.get('minScore') || '0', 10);
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '20', 10), 50);

  const allAgents = await discoverAgents();

  // Build full profiles with evaluation
  const profiles = await Promise.all(
    allAgents.map(async (agent) => {
      const verification = await verifyAgent(agent);
      const evaluation = verification.keyValid
        ? await evaluateAgent(agent, verification)
        : null;
      const reputation = aggregateReputation(agent.agentId);
      const warnings = getWarnings(agent.agentId);
      const agentCategories = deriveCategories(agent.capabilities);

      return {
        agentId: agent.agentId,
        name: agent.name,
        description: agent.description,
        endpoint: agent.endpoint,
        capabilities: agent.capabilities,
        categories: agentCategories,
        chains: agent.chains,
        score: evaluation?.overall ?? 0,
        verified: verification.keyValid && verification.endpointReachable,
        transactions: reputation.totalTransactions,
        warnings: warnings.length,
      };
    }),
  );

  // Apply filters
  let filtered = profiles;

  // Full-text search across name, description, capabilities
  if (q) {
    filtered = filtered.filter((p) => {
      const searchText = `${p.name} ${p.description} ${p.capabilities.join(' ')}`.toLowerCase();
      return searchText.includes(q);
    });
  }

  // Chain filter
  if (chain) {
    filtered = filtered.filter((p) =>
      p.chains.some((c) => c.toLowerCase() === chain),
    );
  }

  // Category filter
  if (category) {
    filtered = filtered.filter((p) =>
      p.categories.includes(category),
    );
  }

  // Minimum score filter
  if (minScore > 0) {
    filtered = filtered.filter((p) => p.score >= minScore);
  }

  // Sort by score descending
  filtered.sort((a, b) => b.score - a.score);

  // Apply limit
  const results = filtered.slice(0, limit);

  return NextResponse.json({
    vera: 'Agent Directory Search',
    query: q || '(all)',
    filters: {
      chain: chain || null,
      category: category || null,
      minScore: minScore || null,
    },
    total: filtered.length,
    returned: results.length,
    results,
  });
}
