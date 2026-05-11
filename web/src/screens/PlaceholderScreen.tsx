import { useParams } from 'react-router-dom'
import { findHypothesis, findScreen } from '../lib/seed/hypotheses'

export function PlaceholderScreen() {
  const { hyp = '', screen: screenId = '' } = useParams<{ hyp?: string; screen?: string }>()
  const h = findHypothesis(hyp)
  const s = findScreen(hyp, screenId)

  if (!h || !s) {
    return <div className="card">화면을 찾을 수 없습니다.</div>
  }

  return (
    <div className="card" style={{ padding: 24 }}>
      <div style={{ font: 'var(--t-caption1)', color: 'var(--text-assistive)' }}>
        {h.short} · {s.icon}
      </div>
      <h1 style={{ font: 'var(--t-title3)', color: 'var(--text-strong)', margin: '8px 0 12px' }}>
        {s.label}
      </h1>
      <p style={{ font: 'var(--t-body2)', color: 'var(--text-assistive)', margin: 0 }}>
        S2.1 골격 — 화면 stub. S2.2 이후 v0.1 시안 내용으로 채워집니다.
      </p>
      <div
        style={{
          marginTop: 16,
          padding: 12,
          background: 'var(--bg-subtle)',
          borderRadius: 8,
          font: 'var(--t-label2)',
          color: 'var(--text-neutral)',
        }}
      >
        route: <code>/{hyp}/{screenId}</code>
      </div>
    </div>
  )
}
