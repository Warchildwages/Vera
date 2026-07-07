'use client';

import { useEffect, useState } from 'react';

interface HealthData {
  agent: string;
  role: string;
  status: string;
  version: string;
  operations: string[];
  agents: { discovered: number; verified: number; flagged: number };
  uptime: number;
}

interface LeaderboardEntry {
  rank: number;
  agentId: string;
  name: string;
  score: number;
  identity: number;
  capability: number;
  reliability: number;
  verified: boolean;
  transactions: number;
  warnings: number;
  warningText: string[];
}

export default function DashboardPage() {
  const [health, setHealth] = useState<HealthData | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [healthRes, lbRes] = await Promise.all([
          fetch('/api/health'),
          fetch('/api/leaderboard'),
        ]);
        const [healthData, lbData] = await Promise.all([
          healthRes.json(),
          lbRes.json(),
        ]);
        setHealth(healthData);
        setLeaderboard(lbData.rankings || []);
      } catch {
        // Silent fail — page renders with partial data
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <main style={{ padding: '2rem', maxWidth: 960, margin: '0 auto', fontFamily: 'system-ui' }}>
        <h1>🛡️ Vera — Agent Trust Authority</h1>
        <p>Loading dashboard...</p>
      </main>
    );
  }

  return (
    <main style={{ padding: '2rem', maxWidth: 960, margin: '0 auto', fontFamily: 'system-ui', color: '#e0e0e0', background: '#0a0a0f', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ borderBottom: '1px solid #2a2a3a', paddingBottom: '1.5rem', marginBottom: '2rem' }}>
        <h1 style={{ margin: 0, fontSize: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          🛡️ Vera — Agent Trust Authority
        </h1>
        <p style={{ color: '#888', margin: '0.5rem 0 0' }}>
          {health?.role || 'Trust layer for the Casper agent economy'}
          <span style={{ marginLeft: '1rem', color: health?.status === 'healthy' ? '#4caf50' : '#f44336' }}>
            ● {health?.status || 'unknown'}
          </span>
          <span style={{ marginLeft: '1rem', color: '#888', fontSize: '0.9rem' }}>
            v{health?.version || '0.1.0'}
          </span>
        </p>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { label: 'Discovered Agents', value: health?.agents.discovered ?? 0, color: '#2196f3' },
          { label: 'Verified Agents', value: health?.agents.verified ?? 0, color: '#4caf50' },
          { label: 'Flagged Agents', value: health?.agents.flagged ?? 0, color: '#ff9800' },
          { label: 'API Operations', value: health?.operations.length ?? 0, color: '#9c27b0' },
        ].map((card) => (
          <div key={card.label} style={{
            background: '#12121a',
            borderRadius: '12px',
            padding: '1.25rem',
            border: `1px solid ${card.color}33`,
          }}>
            <div style={{ fontSize: '0.85rem', color: '#888', marginBottom: '0.5rem' }}>{card.label}</div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: card.color }}>{card.value}</div>
          </div>
        ))}
      </div>

      {/* Leaderboard */}
      <div style={{ background: '#12121a', borderRadius: '12px', padding: '1.5rem', marginBottom: '2rem', border: '1px solid #2a2a3a' }}>
        <h2 style={{ margin: '0 0 1rem', fontSize: '1.25rem' }}>🏆 Agent Leaderboard</h2>
        {leaderboard && leaderboard.length > 0 ? (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #2a2a3a', color: '#888', fontSize: '0.85rem' }}>
                <th style={{ textAlign: 'left', padding: '0.5rem' }}>Rank</th>
                <th style={{ textAlign: 'left', padding: '0.5rem' }}>Agent</th>
                <th style={{ textAlign: 'right', padding: '0.5rem' }}>Score</th>
                <th style={{ textAlign: 'right', padding: '0.5rem' }}>Identity</th>
                <th style={{ textAlign: 'right', padding: '0.5rem' }}>Capability</th>
                <th style={{ textAlign: 'right', padding: '0.5rem' }}>Reliability</th>
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
                    <div style={{ fontWeight: 'bold' }}>{entry.name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#666' }}>{entry.agentId}</div>
                  </td>
                  <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right', fontWeight: 'bold', color: entry.score >= 80 ? '#4caf50' : entry.score >= 50 ? '#ff9800' : '#f44336' }}>
                    {entry.score}/100
                  </td>
                  <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right', color: '#888' }}>{entry.identity}</td>
                  <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right', color: '#888' }}>{entry.capability}</td>
                  <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right', color: '#888' }}>{entry.reliability}</td>
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
        ) : (
          <p style={{ color: '#888' }}>No agents discovered yet. Run <code>POST /api/evaluate</code> to populate.</p>
        )}
      </div>

      {/* API Explorer */}
      <div style={{ background: '#12121a', borderRadius: '12px', padding: '1.5rem', border: '1px solid #2a2a3a' }}>
        <h2 style={{ margin: '0 0 1rem', fontSize: '1.25rem' }}>🔌 API Explorer</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '0.75rem' }}>
          {[
            { method: 'GET', path: '/api/discover', desc: 'List all discovered agents' },
            { method: 'GET', path: '/api/health', desc: 'Health check' },
            { method: 'GET', path: '/api/leaderboard', desc: 'Ranked agent scores' },
            { method: 'GET', path: '/api/agents/:id', desc: 'Agent profile' },
            { method: 'GET', path: '/api/agents/compare?ids=luna,sigil', desc: 'Side-by-side comparison' },
            { method: 'GET', path: '/api/attestations', desc: 'On-chain attestation history' },
            { method: 'POST', path: '/api/evaluate', desc: 'Run full evaluation + attest' },
            { method: 'POST', path: '/api/register', desc: 'Self-register a new agent' },
            { method: 'POST', path: '/api/report', desc: 'Submit reputation event' },
            { method: 'GET', path: '/api/verify/challenge', desc: 'Get Ed25519 challenge' },
            { method: 'GET', path: '/api/x402/service-info', desc: 'x402 pricing & capabilities' },
          ].map((ep) => (
            <div key={ep.path} style={{
              background: '#0d0d15',
              borderRadius: '8px',
              padding: '0.75rem',
              border: '1px solid #1a1a2a',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                <span style={{
                  fontSize: '0.7rem',
                  fontWeight: 'bold',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  background: ep.method === 'GET' ? '#2196f333' : '#4caf5033',
                  color: ep.method === 'GET' ? '#64b5f6' : '#81c784',
                }}>
                  {ep.method}
                </span>
                <code style={{ fontSize: '0.8rem', color: '#e0e0e0' }}>{ep.path.split('?')[0]}</code>
              </div>
              <div style={{ fontSize: '0.75rem', color: '#666' }}>{ep.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ marginTop: '2rem', padding: '1rem 0', borderTop: '1px solid #2a2a3a', fontSize: '0.85rem', color: '#666', textAlign: 'center' }}>
        Vera — Agent Trust Authority · Casper Agentic Buildathon 2026 ·{' '}
        <a href="https://testnet.cspr.live" target="_blank" rel="noopener noreferrer" style={{ color: '#64b5f6' }}>
          Casper Testnet Explorer
        </a>
      </div>
    </main>
  );
}
