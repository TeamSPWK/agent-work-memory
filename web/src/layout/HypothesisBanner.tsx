import { useParams } from 'react-router-dom'
import { findHypothesis } from '../lib/seed/hypotheses'
import { Icon } from '../components/Icon'

export function HypothesisBanner() {
  const { hyp = '', screen: screenId = '' } = useParams<{ hyp?: string; screen?: string }>()
  const h = findHypothesis(hyp)
  if (!h) return null

  const idx = h.screens.findIndex((s) => s.id === screenId)
  const current = idx >= 0 ? h.screens[idx] : undefined

  if (h.support) {
    return (
      <div className="hyp-banner support">
        <div>
          <div
            className="tag"
            style={{ background: 'var(--bg-subtle)', color: 'var(--text-assistive)' }}
          >
            {h.short} · 지원 화면
          </div>
          <div className="title" style={{ color: 'var(--text-neutral)' }}>
            {h.supportNote} — 상시 운영·관리용.
          </div>
        </div>
        <div className="meta muted" style={{ font: 'var(--t-caption1)' }}>
          가설 검증 지표·번호 표기 없음
        </div>
        <div>
          <div
            className="muted"
            style={{ font: 'var(--t-caption1)', textAlign: 'right', marginBottom: 6 }}
          >
            {idx + 1} / {h.screens.length}
            {current ? ` — ${current.label}` : ''}
          </div>
          <div className="step-pills">
            {h.screens.map((s, i) => (
              <span key={s.id} className={i < idx ? 'done' : i === idx ? 'now' : ''}></span>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="hyp-banner">
      <div>
        <div className="tag">
          {h.short} · {h.primaryPersona}
        </div>
        <div className="title">{h.statement}</div>
      </div>
      <div className="meta">
        <span>검증 지표</span>
        <b>{h.metric}</b>
        <span className="muted tnum">{h.metricFrom}</span>
        <Icon name="arrow" size={14} />
        <b className="tnum" style={{ color: 'var(--primary-normal)' }}>
          {h.metricTo}
        </b>
      </div>
      <div>
        <div
          className="muted"
          style={{ font: 'var(--t-caption1)', textAlign: 'right', marginBottom: 6 }}
        >
          {idx + 1} / {h.screens.length}
          {current ? ` — ${current.label}` : ''}
        </div>
        <div className="step-pills">
          {h.screens.map((s, i) => (
            <span key={s.id} className={i < idx ? 'done' : i === idx ? 'now' : ''}></span>
          ))}
        </div>
      </div>
    </div>
  )
}
