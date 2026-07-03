import Link from 'next/link';

export default function Home() {
  return (
    <main style={{ padding: '2rem', maxWidth: 800, margin: '0 auto', fontFamily: 'system-ui' }}>
      <h1>Vera — Agent Trust Authority</h1>
      <p>Vera discovers agents on the Casper registry, verifies their identity, tests their capabilities, and aggregates reputation.</p>
      <ul>
        <li><Link href="/api/discover">GET /api/discover</Link> — List agents</li>
        <li><Link href="/api/evaluate">POST /api/evaluate</Link> — Evaluate all agents</li>
        <li><Link href="/api/health">GET /api/health</Link> — Health check</li>
      </ul>
    </main>
  );
}
