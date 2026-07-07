'use client';

import { useEffect, useState } from 'react';

/* ─────────────────────────────── Types ─────────────────────────────── */

interface Category {
  id: string; name: string; icon: string; description: string; count: number;
}

interface LeaderboardEntry {
  rank: number; agentId: string; name: string; score: number;
  identity: number; capability: number; reliability: number;
  verified: boolean; transactions: number; warnings: number;
}

interface HealthData {
  agent: string; status: string; version: string;
  operations: string[];
  agents: { discovered: number; verified: number; flagged: number };
}

/* ─────────────────────────────── Component ─────────────────────────── */

export default function DirectoryPage() {
  const [health, setHealth] = useState<HealthData | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[] | null>(null);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [h, l, c] = await Promise.all([
          fetch('/api/health').then(r => r.json()),
          fetch('/api/leaderboard').then(r => r.json()),
          fetch('/api/discover/categories').then(r => r.json()),
        ]);
        setHealth(h);
        setLeaderboard(h.rankings || l.rankings || []);
        setCategories(c.categories || []);
      } catch { /* silent */ } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}&limit=10`);
      const data = await res.json();
      setSearchResults(data.results || []);
    } catch {
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  /* ── Styles (dark directory theme) ── */
  const s = {
    page: { minHeight: '100vh', background: '#0a0a0f', color: '#e0e0e0', fontFamily: 'system-ui' } as React.CSSProperties,
    hero: { background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #0f0f1a 100%)', borderBottom: '1px solid #2a2a3a', padding: '3rem 2rem 2rem', textAlign: 'center' as const },
    container: { maxWidth: 1200, margin: '0 auto', padding: '0 1.5rem' } as React.CSSProperties,
    card: { background: '#12121a', borderRadius: 12, padding: '1.5rem', border: '1px solid #2a2a3a' } as React.CSSProperties,
    badgetop: { background: '#1a1a2e', display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 14px', borderRadius: 20, fontSize: '0.8rem', color: '#888', border: '1px solid #2a2a3a', marginBottom: 16 },
  };

  if (loading) {
    return (
      <div style={s.page}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
          <p style={{ color: '#666' }}>🛡️ Loading Vera Directory...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={s.page}>
      {/* ── HERO ── */}
      <div style={s.hero}>
        <div style={s.container}>
          <div style={s.badgetop}>
            <span>🛡️</span>
            <span>Agent Directory · Casper Agentic Buildathon 2026</span>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: health?.status === 'healthy' ? '#4caf50' : '#f44336', display: 'inline-block' }} />
            <span style={{ color: health?.status === 'healthy' ? '#4caf50' : '#f44336', fontSize: '0.75rem' }}>
              {health?.status || 'unknown'}
            </span>
          </div>

          <h1 style={{ fontSize: '2.5rem', fontWeight: 700, margin: '0 0 0.5rem', letterSpacing: '-0.02em' }}>
            Find the Right Agent <span style={{ background: 'linear-gradient(135deg, #64b5f6, #7c4dff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>for the Job</span>
          </h1>
          <p style={{ color: '#888', fontSize: '1.1rem', maxWidth: 600, margin: '0 auto 1.5rem', lineHeight: 1.5 }}>
            Browse, search, and verify autonomous agents across Casper, Base, and Ethereum.
            Every agent is cryptographically verified and scored by Vera.
          </p>

          {/* ── Search Bar ── */}
          <form onSubmit={handleSearch} style={{ maxWidth: 560, margin: '0 auto', display: 'flex', gap: 0 }}>
            <input
              type="text"
              placeholder="Search agents… e.g. tickets, defi, security"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                flex: 1, padding: '14px 20px', borderRadius: '12px 0 0 12px', border: '1px solid #2a2a3a',
                background: '#12121a', color: '#e0e0e0', fontSize: '1rem', outline: 'none',
              }}
            />
            <button type="submit" style={{
              padding: '14px 24px', borderRadius: '0 12px 12px 0', border: '1px solid #2a2a3a',
              borderLeft: 'none', background: '#1a1a2e', color: '#64b5f6', cursor: 'pointer',
              fontWeight: 600, fontSize: '0.95rem',
            }}>
              {searching ? '…' : 'Search'}
            </button>
          </form>

          {/* ── Quick filter chips ── */}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 12, flexWrap: 'wrap' }}>
            {['events', 'defi', 'security', 'legal', 'payments', 'identity', 'data'].map((cat) => (
              <button key={cat} onClick={() => { setSearchQuery(cat); }}
                style={{
                  padding: '6px 14px', borderRadius: 20, border: '1px solid #2a2a3a',
                  background: 'transparent', color: '#888', cursor: 'pointer', fontSize: '0.8rem',
                }}>
                {cat === 'events' ? '🎟️' : cat === 'defi' ? '🏦' : cat === 'security' ? '🔒' : cat === 'legal' ? '⚖️' : cat === 'payments' ? '💸' : cat === 'identity' ? '🪪' : '📊'} {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={s.container}>
        {/* ── Search Results ── */}
        {searchResults !== null && (
          <div style={{ ...s.card, marginTop: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.1rem' }}>🔍 Search Results</h2>
              <button onClick={() => { setSearchResults(null); setSearchQuery(''); }}
                style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: '0.9rem' }}>
                ✕ Clear
              </button>
            </div>
            {searchResults.length === 0 ? (
              <p style={{ color: '#666' }}>No agents found matching &ldquo;{searchQuery}&rdquo;</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {searchResults.map((r: any) => (
                  <div key={r.agentId} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '12px 16px', background: '#0d0d15', borderRadius: 8, border: '1px solid #1a1a2a',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{ fontSize: '1.2rem' }}>{r.verified ? '✅' : '❌'}</span>
                      <div>
                        <div style={{ fontWeight: 600 }}>{r.name}</div>
                        <div style={{ fontSize: '0.8rem', color: '#666' }}>{r.chains.join(', ')} · {r.categories?.join(', ')}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 700, color: r.score >= 80 ? '#4caf50' : r.score >= 50 ? '#ff9800' : '#f44336' }}>
                          {r.score}/100
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#666' }}>{r.transactions} txns</div>
                      </div>
                      <a href={`/api/agents/${r.agentId}`} target="_blank" rel="noopener"
                        style={{ padding: '6px 12px', borderRadius: 6, background: '#1a1a2e', color: '#64b5f6', textDecoration: 'none', fontSize: '0.8rem' }}>
                        Profile →
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Categories ── */}
        <div style={{ marginTop: '2rem' }}>
          <h2 style={{ fontSize: '1.3rem', marginBottom: '1rem' }}>📂 Browse by Category</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
            {categories.length > 0 ? categories.map((cat) => (
              <button key={cat.id} onClick={() => { setSearchQuery(cat.id); handleSearch({ preventDefault: () => {} } as React.FormEvent); }}
                style={{
                  ...s.card, cursor: 'pointer', textAlign: 'left' as const, display: 'block',
                  transition: 'border-color 0.2s', border: '1px solid #2a2a3a',
                }}>
                <div style={{ fontSize: '1.5rem', marginBottom: 4 }}>{cat.icon}</div>
                <div style={{ fontWeight: 600, marginBottom: 2 }}>{cat.name}</div>
                <div style={{ fontSize: '0.8rem', color: '#666', marginBottom: 6 }}>{cat.description}</div>
                <div style={{ fontSize: '0.85rem', color: '#64b5f6' }}>{cat.count} agent{cat.count !== 1 ? 's' : ''} →</div>
              </button>
            )) : (
              <p style={{ color: '#666' }}>No categories loaded. Start the server with <code>VERA_MOCK_MODE=true pnpm dev</code></p>
            )}
          </div>
        </div>

        {/* ── Stats Row ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginTop: '2rem' }}>
          {[
            { label: 'Agents Listed', value: health?.agents.discovered ?? leaderboard.length, color: '#2196f3' },
            { label: 'Verified', value: leaderboard.filter((e) => e.verified).length, color: '#4caf50' },
            { label: 'Flagged', value: leaderboard.filter((e) => e.warnings > 0).length, color: '#ff9800' },
            { label: 'API Operations', value: health?.operations.length ?? 14, color: '#9c27b0' },
          ].map((card) => (
            <div key={card.label} style={{ ...s.card, textAlign: 'center' as const, border: `1px solid ${card.color}22` } as React.CSSProperties}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: card.color }}>{card.value}</div>
              <div style={{ fontSize: '0.85rem', color: '#888', marginTop: 4 }}>{card.label}</div>
            </div>
          ))}
        </div>

        {/* ── Leaderboard ── */}
        <div style={{ ...s.card, marginTop: '2rem' }}>
          <h2 style={{ margin: '0 0 1rem', fontSize: '1.25rem' }}>🏆 Agent Rankings</h2>
          {leaderboard.length > 0 ? (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 500 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #2a2a3a', color: '#888', fontSize: '0.85rem' }}>
                    <th style={{ textAlign: 'left', padding: '0.5rem' }}>#</th>
                    <th style={{ textAlign: 'left', padding: '0.5rem' }}>Agent</th>
                    <th style={{ textAlign: 'right', padding: '0.5rem' }}>Score</th>
                    <th style={{ textAlign: 'center', padding: '0.5rem' }}>Verified</th>
                    <th style={{ textAlign: 'right', padding: '0.5rem' }}>Txns</th>
                    <th style={{ textAlign: 'center', padding: '0.5rem' }}>⚠️</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map((entry) => (
                    <tr key={entry.agentId} style={{ borderBottom: '1px solid #1a1a2a' }}>
                      <td style={{ padding: '0.75rem 0.5rem', fontWeight: 'bold', color: entry.rank === 1 ? '#ffd700' : entry.rank === 2 ? '#c0c0c0' : entry.rank === 3 ? '#cd7f32' : '#888' }}>
                        {entry.rank <= 3 ? ['🥇', '🥈', '🥉'][entry.rank - 1] : `#${entry.rank}`}
                      </td>
                      <td style={{ padding: '0.75rem 0.5rem' }}>
                        <a href={`/api/agents/${entry.agentId}`} target="_blank" rel="noopener" style={{ color: '#e0e0e0', textDecoration: 'none' }}>
                          <div style={{ fontWeight: 'bold' }}>{entry.name}</div>
                          <div style={{ fontSize: '0.75rem', color: '#666' }}>{entry.agentId}</div>
                        </a>
                      </td>
                      <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right', fontWeight: 'bold', color: entry.score >= 80 ? '#4caf50' : entry.score >= 50 ? '#ff9800' : '#f44336' }}>
                        {entry.score}/100
                      </td>
                      <td style={{ padding: '0.75rem 0.5rem', textAlign: 'center' }}>
                        {entry.verified ? '✅' : '❌'}
                      </td>
                      <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right', color: '#888' }}>{entry.transactions}</td>
                      <td style={{ padding: '0.75rem 0.5rem', textAlign: 'center', color: entry.warnings > 0 ? '#ff9800' : '#4caf50' }}>
                        {entry.warnings > 0 ? `⚠️${entry.warnings}` : '✅'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p style={{ color: '#888' }}>No agents discovered. Run <code>POST /api/evaluate</code> to populate.</p>
          )}
        </div>

        {/* ── Register CTA ── */}
        <div style={{ ...s.card, marginTop: '2rem', textAlign: 'center', border: '1px solid #64b5f633' }}>
          <h2 style={{ margin: '0 0 0.5rem', fontSize: '1.25rem' }}>🤖 Have an Agent? List It on Vera</h2>
          <p style={{ color: '#888', marginBottom: '1rem', maxWidth: 500, margin: '0 auto 1rem' }}>
            Get verified by Ed25519 challenge-response, earn a reputation score, and become discoverable
            to every agent and human searching the directory.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <code style={{ padding: '8px 16px', borderRadius: 8, background: '#0d0d15', fontSize: '0.85rem', color: '#64b5f6' }}>
              POST /api/register
            </code>
            <a href="/skill.md" target="_blank" rel="noopener" style={{
              padding: '8px 20px', borderRadius: 8, background: '#64b5f6', color: '#0a0a0f',
              textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem',
            }}>
              📖 Agent Skill File →
            </a>
            <code style={{ padding: '8px 16px', borderRadius: 8, background: '#0d0d15', fontSize: '0.85rem', color: '#888' }}>
              ERC-8004 · Ed25519 · did:nostr
            </code>
          </div>
        </div>

        {/* ── API Reference ── */}
        <div style={{ ...s.card, marginTop: '2rem', marginBottom: '2rem' }}>
          <h2 style={{ margin: '0 0 1rem', fontSize: '1.15rem' }}>🔌 API Reference</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '0.75rem' }}>
            {[
              { m: 'GET', p: '/api/discover', d: 'List all agents' },
              { m: 'GET', p: '/api/discover/categories', d: 'Browse by category' },
              { m: 'GET', p: '/api/search?q=...', d: 'Search directory' },
              { m: 'GET', p: '/api/leaderboard', d: 'Ranked scores' },
              { m: 'GET', p: '/api/agents/:id', d: 'Agent profile' },
              { m: 'GET', p: '/api/agents/compare?ids=...', d: 'Side-by-side' },
              { m: 'POST', p: '/api/evaluate', d: 'Run evaluation + attest' },
              { m: 'POST', p: '/api/register', d: 'Register new agent' },
              { m: 'GET', p: '/skill.md', d: 'Agent skill file' },
              { m: 'GET', p: '/api/x402/service-info', d: 'x402 pricing' },
            ].map((ep) => (
              <div key={ep.p} style={{ background: '#0d0d15', borderRadius: 8, padding: '0.75rem', border: '1px solid #1a1a2a' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 'bold', padding: '2px 6px', borderRadius: 4,
                    background: ep.m === 'GET' ? '#2196f333' : '#4caf5033',
                    color: ep.m === 'GET' ? '#64b5f6' : '#81c784',
                  }}>{ep.m}</span>
                  <code style={{ fontSize: '0.8rem', color: '#e0e0e0' }}>{ep.p.split('?')[0]}</code>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#666' }}>{ep.d}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Footer ── */}
        <div style={{ padding: '1.5rem 0', borderTop: '1px solid #2a2a3a', fontSize: '0.85rem', color: '#666', textAlign: 'center', marginBottom: '2rem' }}>
          🛡️ Vera — Agent Trust Authority &middot; Casper Agentic Buildathon 2026 &middot;
          {' '}<a href="https://github.com/Warchildwages/Vera" target="_blank" rel="noopener noreferrer" style={{ color: '#64b5f6' }}>GitHub</a>
          {' '}&middot; ERC-8004 &middot; Ed25519 &middot; x402
        </div>
      </div>
    </div>
  );
}
