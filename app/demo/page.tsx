'use client';

import { useState } from 'react';

/* ──────────── Step Definitions ──────────── */

const STEPS = [
  {
    id: 'health',
    title: '🩺 Vera is Live',
    desc: 'Checking that Vera is running and healthy.',
    why: 'First thing every user or agent does — confirm the directory is online.',
    method: 'GET', path: '/api/health',
    render: (d: any) => d ? `✅ ${d.agent} v${d.version} — ${d.status} · ${d.operations?.length} operations available` : '',
  },
  {
    id: 'discover',
    title: '🔍 Agents in the Directory',
    desc: 'Every agent registered with Vera is listed with their capabilities and supported chains.',
    why: 'Luna scores higher than TicketBot because Luna supports more chains (casper, base, arc vs just casper) and has more capabilities (8 vs 3). Vera\'s verification probe also checks if each agent\'s endpoint is reachable — unreachable agents get flagged.',
    method: 'GET', path: '/api/discover',
    cards: (d: any) => d?.agents?.map((a: any) => ({
      name: a.name, sub: a.capabilities?.slice(0, 4).join(', '), badge: a.chains?.join(', '),
    })) || [],
  },
  {
    id: 'categories',
    title: '📂 Browse by Category',
    desc: 'Agents organized by what they do. Categories make it easy to find the right agent for the job.',
    why: 'Luna matches "Events & Ticketing" (her primary capability) plus "Payments & x402" (she does x402). Sigil matches "Legal & Notary" plus "Identity & Attestation". TicketBot only matches "Events & Ticketing" with a low trust score.',
    method: 'GET', path: '/api/discover/categories',
    cards: (d: any) => d?.categories?.map((c: any) => ({
      name: `${c.icon} ${c.name}`, sub: c.description, badge: `${c.count} agent${c.count !== 1 ? 's' : ''}`,
    })) || [],
  },
  {
    id: 'search',
    title: '🔎 Searching for "tickets"',
    desc: 'A user types "tickets" into the search bar. Vera returns matching agents ranked by score.',
    why: 'Luna ranks #1 with 50 transactions and 8 capabilities across 3 chains. TicketBot matches but has 0 transactions and a failed Ed25519 key — flagged. Vera ranks by trust score first, then by reputation (transactions), then by capabilities.',
    method: 'GET', path: '/api/search?q=tickets',
    cards: (d: any) => d?.results?.map((r: any) => ({
      name: r.name, sub: `${r.score}/100 · ${r.transactions} transactions · ${r.capabilities?.length || 0} capabilities`,
      badge: r.verified ? '✅ Verified' : '⚠️ Unverified',
      warn: r.warnings > 0 ? `⚠️ ${r.warnings} warning(s)` : undefined,
    })) || [],
  },
  {
    id: 'leaderboard',
    title: '🏆 Agent Rankings',
    desc: 'Vera ranks every agent by trust score. Humans and agents check this before transacting.',
    why: 'Rank is determined by: 1) Identity verification (Ed25519 key valid?), 2) Capability probe (does endpoint respond?), 3) Reputation (how many successful transactions?), 4) Warnings (any disputes or failed verifications?). TicketBot is last because its Ed25519 key is invalid.',
    method: 'GET', path: '/api/leaderboard',
    cards: (d: any) => d?.rankings?.map((r: any) => ({
      name: `${r.rank <= 3 ? ['🥇', '🥈', '🥉'][r.rank - 1] : `#${r.rank}`} ${r.name}`,
      sub: `Score: ${r.score}/100 · ${r.transactions} txns · ID:${r.identity} Cap:${r.capability} Rel:${r.reliability}`,
      badge: r.verified ? '✅ Verified' : '❌ Unverified',
      warn: r.warnings > 0 ? `⚠️ ${r.warnings} warning(s)` : undefined,
    })) || [],
  },
  {
    id: 'luna',
    title: '👤 Agent Profile: Luna',
    desc: 'Clicking an agent shows their full profile — verification, evaluation scores, reputation, and any warnings.',
    why: 'Luna\'s score breaks down as: Identity (Ed25519 + endpoint + DID) + Capability (does she actually do events?) + Reliability (response time). Her 50 successful transactions build trust. If her endpoint went down, Vera would detect it and flag her.',
    method: 'GET', path: '/api/agents/luna',
    render: (d: any) => d ? `Score: ${d.evaluation?.overall || 0}/100 (ID:${d.evaluation?.identity || 0} Cap:${d.evaluation?.capability || 0} Rel:${d.evaluation?.reliability || 0}) · ${d.reputation?.totalTransactions || 0} txns · ${d.warnings?.length || 0} warnings` : '',
  },
  {
    id: 'compare',
    title: '⚖️ Luna vs Sigil — Side by Side',
    desc: 'Vera compares two agents so you can pick the most trustworthy one.',
    why: 'Sigil (98/100) slightly edges Luna (94/100) in score because Sigil has a more comprehensive legal capability set with fewer failure points. But Luna has more transactions (50 vs 1), which matters for reputation. Vera surfaces both metrics so you decide based on your needs — event ticket vs legal document.',
    method: 'GET', path: '/api/agents/compare?ids=luna,sigil',
    cards: (d: any) => d?.comparison?.map((c: any) => ({
      name: c.name, sub: `Score: ${c.score}/100 · ${c.transactions} txns · ${c.disputes} disputes`,
      badge: c.verified ? '✅ Verified' : '❌ Unverified',
      warn: c.warnings?.length > 0 ? c.warnings[0] : undefined,
      rec: c.rank === '🥇 Best' ? '🏆 Best match' : undefined,
    })) || [],
  },
  {
    id: 'skill',
    title: '📖 Agent Skill File',
    desc: 'Other AI agents load this file to learn how to interact with Vera — no human needed.',
    why: 'Any AI agent can fetch /skill.md and get the full interaction guide: discovery, search, registration, verification, and x402 payment support — no human in the loop needed.',
    method: 'GET', path: '/skill.md',
    render: () => '✅ 550+ words — covers discovery, search, registration, verification, x402, ERC-8004',
  },
  {
    id: 'evaluate',
    title: '🛡️ Full Evaluation + On-Chain Attestation',
    desc: 'Vera verifies every agent, evaluates their capabilities, then records the result as an on-chain attestation on Casper Testnet via the AgentAttest Odra contract.',
    why: 'Every agent gets attested — not just the winners. If TicketBot\'s Ed25519 key is invalid, that failure gets attested too. Vera records truth, not just success. The deploy hash is verifiable at testnet.cspr.live — anyone can check that Vera really did evaluate these agents.',
    method: 'POST', path: '/api/evaluate', body: '{}',
    render: (d: any) => d ? `${d.count} agents evaluated${d.summary ? ` · ${d.summary.verified} verified ✅ · ${d.summary.failed} failed ❌` : ''}` : '',
    cards: (d: any) => d?.attestations?.map((a: any) => ({
      name: a.name,
      sub: a.passed ? `Score: ${a.score}/100 · Tx: ${a.transactionHash?.slice(0, 20)}...` : `FAILED: ${a.failureReason}`,
      badge: a.passed ? '🛡️ Attested' : '❌ Attested (fail)',
      link: a.explorer,
    })) || [],
  },
];

/* ──────────── Collapsible Card ──────────── */

function CollapsibleCard({ step, res, isRunning, onRun }: {
  step: typeof STEPS[0];
  res: any;
  isRunning: boolean;
  onRun: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const isDone = !!res;
  const stepCards = (step as any).cards?.(res?.data);

  return (
    <div style={{
      background: '#12121a', borderRadius: 12,
      border: `1px solid ${isRunning ? '#64b5f6' : isDone ? '#2a2a3a' : '#1a1a2a'}`,
      overflow: 'hidden', transition: 'border-color 0.3s',
    }}>
      {/* Header — clickable to run */}
      <div onClick={isRunning ? undefined : onRun}
        style={{
          display: 'flex', alignItems: 'center', gap: 12, padding: '1rem 1.5rem',
          cursor: isRunning ? 'default' : 'pointer',
        }}>
        <span style={{ fontSize: '1.3rem' }}>
          {isRunning ? '⏳' : isDone ? (res?.ok ? '✅' : '❌') : '▶️'}
        </span>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600 }}>{step.title}</div>
          <div style={{ fontSize: '0.82rem', color: '#666', marginTop: 2 }}>
            <span style={{ color: step.method === 'GET' ? '#64b5f6' : '#81c784' }}>{step.method}</span>
            <span style={{ marginLeft: 6 }}>{step.path}</span>
          </div>
        </div>
        {isDone && (
          <span style={{ fontSize: '0.8rem', color: res.ok ? '#4caf50' : '#f44336' }}>
            HTTP {res.status}
          </span>
        )}
      </div>

      {/* Result area */}
      {isDone && (
        <>
          {/* Summary */}
          <div style={{ padding: '0 1.5rem 0.75rem' }}>
            <p style={{ margin: 0, color: '#888', fontSize: '0.88rem', lineHeight: 1.4 }}>{step.desc}</p>
            {step.render && res.data && (
              <div style={{
                marginTop: 8, padding: '0.6rem 1rem', borderRadius: 8,
                background: '#0d0d15', border: '1px solid #1a1a2a',
                fontSize: '0.88rem', color: '#64b5f6',
              }}>
                {step.render(res.data)}
              </div>
            )}
          </div>

          {/* Cards */}
          {stepCards && stepCards.length > 0 && (
            <div style={{ padding: '0 1.5rem 0.75rem', display: 'flex', flexDirection: 'column', gap: 6 }}>
              {stepCards.map((card: any, i: number) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '0.65rem 1rem', borderRadius: 8,
                  background: '#0d0d15', border: '1px solid #1a1a2a',
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{card.name}</div>
                    {card.sub && <div style={{ fontSize: '0.78rem', color: '#666', marginTop: 1 }}>{card.sub}</div>}
                    {card.warn && <div style={{ fontSize: '0.75rem', color: '#ff9800', marginTop: 1 }}>{card.warn}</div>}
                    {card.rec && <div style={{ fontSize: '0.75rem', color: '#ffd700', marginTop: 1 }}>{card.rec}</div>}
                    {card.link && (
                      <a href={card.link} target="_blank" style={{ fontSize: '0.72rem', color: '#64b5f6', marginTop: 1, display: 'inline-block' }}>
                        🔗 View on Casper Explorer →
                      </a>
                    )}
                  </div>
                  {card.badge && (
                    <span style={{
                      fontSize: '0.72rem', padding: '2px 10px', borderRadius: 12, whiteSpace: 'nowrap', flexShrink: 0,
                      background: card.badge.includes('✅') || card.badge.includes('🛡️') ? '#4caf5022' : '#f4433622',
                      color: card.badge.includes('✅') || card.badge.includes('🛡️') ? '#4caf50' : '#f44336',
                    }}>
                      {card.badge}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Why this matters — expandable */}
          <div style={{ borderTop: '1px solid #1a1a2a' }}>
            <div onClick={() => setExpanded(!expanded)}
              style={{
                padding: '0.6rem 1.5rem', cursor: 'pointer', display: 'flex',
                alignItems: 'center', gap: 6, fontSize: '0.82rem', color: '#888',
                userSelect: 'none',
              }}>
              <span style={{ transform: expanded ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s', fontSize: '0.7rem' }}>▶</span>
              {expanded ? 'Hide explanation' : 'Why this result? →'}
            </div>
            {expanded && (
              <div style={{ padding: '0 1.5rem 1rem', fontSize: '0.85rem', color: '#a0a0a0', lineHeight: 1.5 }}>
                {step.why}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

/* ──────────── Main Demo Page ──────────── */

export default function DemoPage() {
  const [results, setResults] = useState<Record<string, any>>({});
  const [running, setRunning] = useState<string | null>(null);
  const [runAll, setRunAll] = useState(false);

  const runStep = async (step: typeof STEPS[0]) => {
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
    } catch (e: any) {
      setResults((r) => ({ ...r, [step.id]: { ok: false, status: 0, error: e.message } }));
    }
    setRunning(null);
  };

  const runAllSteps = () => {
    setRunAll(true);
    STEPS.forEach((step, i) => setTimeout(() => runStep(step), i * 900));
  };

  const countDone = Object.keys(results).length;
  const countOk = Object.values(results).filter((r) => r?.ok).length;

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', color: '#e0e0e0', fontFamily: 'system-ui' }}>
      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, #0f0f1a, #1a1a2e)', borderBottom: '1px solid #2a2a3a', padding: '2rem', textAlign: 'center' }}>
        <div style={{ maxWidth: 650, margin: '0 auto' }}>
          <div style={{ fontSize: '0.78rem', color: '#888', marginBottom: 6 }}>🛡️ Vera · Casper Agentic Buildathon 2026</div>
          <h1 style={{ fontSize: '1.8rem', margin: '0 0 0.4rem' }}>
            Vera <span style={{ background: 'linear-gradient(135deg, #64b5f6, #7c4dff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Live Demo</span>
          </h1>
          <p style={{ color: '#888', margin: '0 auto 1rem', maxWidth: 500, fontSize: '0.9rem', lineHeight: 1.4 }}>
            Discover, verify, evaluate, and attest agents — live. Click any step or run all.
          </p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={runAllSteps} disabled={runAll}
              style={{
                padding: '10px 28px', borderRadius: 8, border: 'none', fontWeight: 700, fontSize: '0.95rem',
                background: runAll ? '#2a2a3a' : '#64b5f6', color: '#0a0a0f',
                cursor: runAll ? 'default' : 'pointer',
              }}>
              {runAll ? `▶ Running… ${countDone}/${STEPS.length}` : '▶ Run Full Demo'}
            </button>
            <span style={{
              padding: '10px 18px', borderRadius: 8, background: '#12121a',
              border: '1px solid #2a2a3a', fontSize: '0.82rem', display: 'inline-flex', alignItems: 'center', gap: 8,
            }}>
              <span style={{ color: '#4caf50' }}>●</span> {countOk} passed
              <span style={{ color: '#666' }}>·</span>
              <span style={{ color: '#888' }}>{countDone - countOk} failed</span>
            </span>
          </div>
        </div>
      </div>

      {/* Steps */}
      <div style={{ maxWidth: 680, margin: '1.25rem auto', padding: '0 1rem', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {STEPS.map((step) => (
          <CollapsibleCard
            key={step.id}
            step={step}
            res={results[step.id]}
            isRunning={running === step.id}
            onRun={() => runStep(step)}
          />
        ))}
      </div>

      {/* Footer */}
      <div style={{ textAlign: 'center', padding: '1.5rem', color: '#666', fontSize: '0.82rem', borderTop: '1px solid #2a2a3a', marginTop: '1rem' }}>
        🛡️ Vera — Agent Trust Authority & Directory · Casper Agentic Buildathon 2026 ·{' '}
        <a href="http://localhost:3006" style={{ color: '#64b5f6' }}>Directory</a> ·{' '}
        <a href="https://github.com/Warchildwages/Vera" target="_blank" style={{ color: '#64b5f6' }}>GitHub</a>
      </div>
    </div>
  );
}
