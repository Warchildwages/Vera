'use client';

import { useEffect, useState } from 'react';

/* ───────────────────── Live API Demo Runner ───────────────────── */

interface DemoStep {
  id: string;
  label: string;
  method: string;
  path: string;
  body?: string;
}

const STEPS: DemoStep[] = [
  { id: 'health', label: 'Vera Health Check', method: 'GET', path: '/api/health' },
  { id: 'discover', label: 'Discover Agents', method: 'GET', path: '/api/discover' },
  { id: 'categories', label: 'Browse Categories', method: 'GET', path: '/api/discover/categories' },
  { id: 'search', label: 'Search Directory', method: 'GET', path: '/api/search?q=tickets' },
  { id: 'leaderboard', label: 'Agent Rankings', method: 'GET', path: '/api/leaderboard' },
  { id: 'luna', label: 'Agent Profile: Luna', method: 'GET', path: '/api/agents/luna' },
  { id: 'compare', label: 'Compare Luna vs Sigil', method: 'GET', path: '/api/agents/compare?ids=luna,sigil' },
  { id: 'skill', label: 'Agent Skill File', method: 'GET', path: '/skill.md' },
  { id: 'evaluate', label: 'Evaluate + On-Chain Attestation', method: 'POST', path: '/api/evaluate', body: '{}' },
];

export default function DemoPage() {
  const [results, setResults] = useState<Record<string, any>>({});
  const [running, setRunning] = useState<string | null>(null);
  const [status, setStatus] = useState<Record<string, 'pending' | 'running' | 'done' | 'error'>>({});
  const [startAll, setStartAll] = useState(false);

  const runStep = async (step: DemoStep) => {
    setStatus((s) => ({ ...s, [step.id]: 'running' }));
    setRunning(step.id);
    try {
      const opts: RequestInit = { method: step.method };
      if (step.body) {
        opts.headers = { 'Content-Type': 'application/json' };
        opts.body = step.body;
      }
      const res = await fetch(step.path, opts);
      const text = await res.text();
      let data: any;
      try { data = JSON.parse(text); } catch { data = text; }
      setResults((r) => ({ ...r, [step.id]: { ok: res.ok, status: res.status, data } }));
      setStatus((s) => ({ ...s, [step.id]: 'done' }));
    } catch (e: any) {
      setResults((r) => ({ ...r, [step.id]: { ok: false, error: e.message } }));
      setStatus((s) => ({ ...s, [step.id]: 'error' }));
    }
    setRunning(null);
  };

  useEffect(() => {
    if (startAll) {
      STEPS.forEach((step, i) => {
        setTimeout(() => runStep(step), i * 600);
      });
    }
  }, [startAll]);

  const s = {
    page: { minHeight: '100vh', background: '#0a0a0f', color: '#e0e0e0', fontFamily: 'system-ui', padding: '2rem' },
    container: { maxWidth: 960, margin: '0 auto' },
    card: { background: '#12121a', borderRadius: 12, border: '1px solid #2a2a3a', overflow: 'hidden' },
    header: { background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 100%)', borderBottom: '1px solid #2a2a3a', padding: '1.5rem 2rem' },
  };

  return (
    <div style={s.page}>
      <div style={s.container}>
        {/* Header */}
        <div style={{ ...s.card, marginBottom: '1.5rem' }}>
          <div style={s.header}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span style={{ fontSize: '1.5rem' }}>🛡️</span>
              <h1 style={{ margin: 0, fontSize: '1.5rem' }}>Vera Demo — Live Walkthrough</h1>
              <span style={{ marginLeft: 'auto', fontSize: '0.8rem', color: '#888' }}>
                Casper Agentic Buildathon 2026
              </span>
            </div>
            <p style={{ margin: 0, color: '#888', fontSize: '0.9rem' }}>
              Every API endpoint called live. Click a step or run all.
            </p>
          </div>
          <div style={{ padding: '1rem 2rem', display: 'flex', gap: 8 }}>
            <button onClick={() => setStartAll(true)} disabled={startAll}
              style={{
                padding: '10px 24px', borderRadius: 8, border: 'none',
                background: startAll ? '#2a2a3a' : '#64b5f6', color: '#0a0a0f',
                fontWeight: 600, cursor: startAll ? 'default' : 'pointer', fontSize: '0.9rem',
              }}>
              {startAll ? '▶ Running All...' : '▶ Run All Demos'}
            </button>
            <button onClick={() => { setResults({}); setStatus({}); setStartAll(false); }}
              style={{
                padding: '10px 16px', borderRadius: 8, border: '1px solid #2a2a3a',
                background: 'transparent', color: '#888', cursor: 'pointer', fontSize: '0.85rem',
              }}>
              ✕ Clear
            </button>
          </div>
        </div>

        {/* Demo Steps */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {STEPS.map((step) => {
            const stat = status[step.id] || 'pending';
            const res = results[step.id];
            return (
              <div key={step.id} style={{ ...s.card }}>
                {/* Step Header */}
                <div
                  onClick={() => runStep(step)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '1rem 1.5rem', cursor: 'pointer',
                    borderBottom: res ? '1px solid #1a1a2a' : 'none',
                    background: stat === 'running' ? '#1a1a2e' : 'transparent',
                  }}>
                  {/* Status Icon */}
                  <span style={{ fontSize: '1.2rem' }}>
                    {stat === 'running' ? '⏳' : stat === 'done' ? (res?.ok ? '✅' : '❌') : stat === 'error' ? '⚠️' : '▶️'}
                  </span>
                  {/* Label */}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{step.label}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                      <span style={{
                        fontSize: '0.7rem', fontWeight: 'bold', padding: '1px 6px', borderRadius: 3,
                        background: step.method === 'GET' ? '#2196f333' : step.method === 'POST' ? '#4caf5033' : '#ff980033',
                        color: step.method === 'GET' ? '#64b5f6' : step.method === 'POST' ? '#81c784' : '#ffb74d',
                      }}>{step.method}</span>
                      <code style={{ fontSize: '0.8rem', color: '#666' }}>{step.path}</code>
                    </div>
                  </div>
                  {res && (
                    <span style={{ fontSize: '0.8rem', color: res.ok ? '#4caf50' : '#f44336' }}>
                      {res.status || 'ERROR'}
                    </span>
                  )}
                </div>

                {/* Response */}
                {res && (
                  <div style={{ padding: '0 1.5rem 1rem' }}>
                    <pre style={{
                      background: '#0d0d15', borderRadius: 8, padding: '1rem',
                      fontSize: '0.8rem', color: '#a0a0a0', overflow: 'auto',
                      maxHeight: 320, whiteSpace: 'pre-wrap', wordBreak: 'break-all',
                      margin: 0, border: '1px solid #1a1a2a',
                    }}>
                      {typeof res.data === 'string' ? res.data : JSON.stringify(res.data, null, 2)}
                    </pre>
                    {/* Key insights */}
                    {res.data?.vera && (
                      <div style={{ marginTop: 8, fontSize: '0.85rem', color: '#64b5f6' }}>
                        ℹ️ {res.data.vera}
                        {res.data.count !== undefined && ` · ${res.data.count} items`}
                        {res.data.total !== undefined && ` · ${res.data.total} total`}
                        {res.data.rankings && ` · Top: ${res.data.summary?.topAgent || ''}`}
                        {res.data.casperAttestation && ` · 🛡️ On-chain attest: ${res.data.casperAttestation.transactionHash?.slice(0, 20)}...`}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div style={{ textAlign: 'center', padding: '2rem 0', color: '#666', fontSize: '0.85rem' }}>
          🛡️ Vera — Agent Trust Authority & Directory · Casper Agentic Buildathon 2026
        </div>
      </div>
    </div>
  );
}
