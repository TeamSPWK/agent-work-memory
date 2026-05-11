export default function App() {
  return (
    <main style={{ padding: '48px 32px', maxWidth: 720, margin: '0 auto' }}>
      <h1 style={{ font: 'var(--t-title2)', color: 'var(--text-strong)', margin: 0 }}>
        Agent Work Memory
      </h1>
      <p style={{ font: 'var(--t-body1)', color: 'var(--text-assistive)', marginTop: 8 }}>
        m2 S1 — Vite + React + TS + Wanted LaaS 토큰 부트스트랩.
      </p>

      <section style={{ marginTop: 32 }}>
        <h2 style={{ font: 'var(--t-heading2)', color: 'var(--text-strong)' }}>
          토큰 적용 확인
        </h2>
        <div
          style={{
            marginTop: 16,
            padding: 16,
            background: 'var(--surface-card)',
            border: '1px solid var(--line-soft, #ebebee)',
            borderRadius: 12,
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
            gap: 12,
          }}
        >
          <Swatch label="primary" color="var(--c-blue-45)" />
          <Swatch label="accent" color="var(--c-orange-50)" />
          <Swatch label="negative" color="var(--c-red-50)" />
          <Swatch label="positive" color="var(--c-green-50)" />
          <Swatch label="cool-30" color="var(--c-cool-30)" />
          <Swatch label="cool-10" color="var(--c-cool-10)" />
        </div>
      </section>
    </main>
  )
}

function Swatch({ label, color }: { label: string; color: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ height: 40, background: color, borderRadius: 8 }} />
      <span style={{ font: 'var(--t-label2)', color: 'var(--text-neutral)' }}>{label}</span>
    </div>
  )
}
