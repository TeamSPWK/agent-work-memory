import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  RISK_CATEGORIES,
  RISK_DB_INLINE,
  RISK_INCIDENT_ALERT,
  RISK_SIGNALS,
  type RiskCategoryKey,
} from '../lib/seed/risk'
import { Icon } from '../components/Icon'
import { RiskChip } from '../components/RiskChip'

const SEV_CHIP: Record<'high' | 'med' | 'low', { tone: string; label: string }> = {
  high: { tone: 'red', label: '고위험' },
  med: { tone: 'orange', label: '주의' },
  low: { tone: 'neutral', label: '낮음' },
}

export function Risk() {
  const [selected, setSelected] = useState<RiskCategoryKey>('DB')
  const selectedCat = RISK_CATEGORIES.find((c) => c.key === selected) ?? RISK_CATEGORIES[0]
  const signals = RISK_SIGNALS[selected] ?? []

  return (
    <>
      <div className="page-h">
        <div>
          <div className="eyebrow">진입 시점 · Today 위험 카드 클릭, 또는 일상 점검</div>
          <h1>Risk Radar</h1>
          <p>위험 카테고리별로 신호를 모아 본다. 클릭 시 해당 신호 리스트와 cross-link.</p>
        </div>
        <div className="actions">
          <button className="btn" type="button">
            <Icon name="filter" size={14} />
            심각도
          </button>
          <button className="btn" type="button">
            <Icon name="cal" size={14} />
            최근 7일
          </button>
        </div>
      </div>

      <div className="grid-4" role="tablist" aria-label="위험 카테고리" style={{ gap: 12 }}>
        {RISK_CATEGORIES.map((c) => {
          const total = c.count
          const high = c.sev.high
          const med = c.sev.med
          const low = c.sev.low
          const w = (n: number) => (total ? (n / total) * 100 : 0)
          const active = selected === c.key
          return (
            <button
              key={c.key}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setSelected(c.key)}
              className="risk-tile"
              style={{
                cursor: 'pointer',
                textAlign: 'left',
                outline: active ? '2px solid var(--primary-normal)' : '0',
                outlineOffset: -1,
              }}
            >
              <div className="head">
                <div className="row tight" style={{ alignItems: 'center' }}>
                  <Icon name={c.icon} size={16} />
                  <div className="name">{c.name}</div>
                </div>
                <div className="count tnum">{total}</div>
              </div>
              <div className="sev">
                <span>
                  <span className="dot r" /> {high}
                </span>
                <div
                  style={{
                    position: 'relative',
                    height: 6,
                    borderRadius: 999,
                    background: 'var(--bg-subtle)',
                    overflow: 'hidden',
                    display: 'flex',
                  }}
                >
                  <span style={{ width: w(high) + '%', background: 'var(--status-negative)' }} />
                  <span style={{ width: w(med) + '%', background: 'var(--status-cautionary)' }} />
                  <span style={{ width: w(low) + '%', background: 'var(--text-disable)' }} />
                </div>
                <span className="muted" style={{ font: 'var(--t-caption1)' }}>
                  최근 N건
                </span>
              </div>
              <div className="muted" style={{ font: 'var(--t-caption1)' }}>
                {high}고위험 · {med}주의 · {low}낮음
              </div>
            </button>
          )
        })}
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <div className="card-h">
          <h3>
            <Icon name={selectedCat.icon} size={16} /> {selectedCat.name} · 신호 리스트
          </h3>
          <span className="sub">시간 ↔ 세션 ↔ commit cross-link</span>
        </div>

        {selected === 'DB' ? (
          <table className="tbl">
            <thead>
              <tr>
                <th style={{ width: 130 }}>시각</th>
                <th>이벤트</th>
                <th>세션</th>
                <th>심각도</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {RISK_DB_INLINE.map((row, i) => (
                <tr
                  key={row.at + i}
                  style={
                    row.background === 'high' ? { background: 'rgba(255,66,66,0.06)' } : undefined
                  }
                >
                  <td className="tnum muted">{row.at}</td>
                  <td>
                    <div className="strong">{row.title}</div>
                    {row.cmd && (
                      <div className="muted mono" style={{ fontSize: 12 }}>
                        {row.cmd}
                      </div>
                    )}
                  </td>
                  <td>
                    <Link className="link" to={`/sessions/${row.session}`}>
                      {row.session}
                    </Link>
                  </td>
                  <td>
                    <span className={'tag ' + SEV_CHIP[row.sev].tone}>
                      <span className="dot" />
                      {SEV_CHIP[row.sev].label} · {row.cat}
                    </span>
                  </td>
                  <td>
                    <Link
                      className="link"
                      to={
                        i === 0
                          ? `/incidents/${RISK_INCIDENT_ALERT.incidentId}`
                          : `/incidents/${RISK_INCIDENT_ALERT.incidentId}?tab=event`
                      }
                    >
                      {i === 0 ? 'Incident Replay →' : 'detail →'}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table className="tbl">
            <thead>
              <tr>
                <th style={{ width: 130 }}>시각</th>
                <th>이벤트</th>
                <th>세션</th>
                <th>repo</th>
                <th>심각도</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {signals.map((s, i) => (
                <tr
                  key={s.at + i}
                  style={s.sev === 'high' ? { background: 'rgba(255,66,66,0.06)' } : undefined}
                >
                  <td className="tnum muted">{s.at}</td>
                  <td>
                    <div className="strong">{s.title}</div>
                    <div className="muted mono" style={{ fontSize: 12 }}>
                      {s.cmd}
                    </div>
                    <div
                      className="muted"
                      style={{ font: 'var(--t-caption1)', marginTop: 2 }}
                    >
                      {s.note}
                    </div>
                  </td>
                  <td>
                    {s.session !== '—' ? (
                      <Link className="link" to={`/sessions/${s.session}`}>
                        {s.session}
                      </Link>
                    ) : (
                      <span className="muted">—</span>
                    )}
                  </td>
                  <td>
                    {s.repo !== '—' ? (
                      <span
                        className="tag neutral"
                        style={{ fontFamily: 'ui-monospace, monospace', fontSize: 11 }}
                      >
                        {s.repo}
                      </span>
                    ) : (
                      <span className="muted">—</span>
                    )}
                  </td>
                  <td>
                    <RiskChip risk={{ sev: s.sev, cat: selectedCat.name }} />
                  </td>
                  <td>
                    {s.session !== '—' ? (
                      <Link
                        className="link"
                        to={`/incidents/${RISK_INCIDENT_ALERT.incidentId}?tab=event`}
                      >
                        detail →
                      </Link>
                    ) : (
                      <span className="muted">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div
        className="card tight"
        role="alert"
        aria-label="진행 중 사고 알림"
        style={{
          marginTop: 16,
          background: 'var(--accent-light)',
          borderColor: 'transparent',
        }}
      >
        <div className="row between">
          <div>
            <div style={{ font: 'var(--t-label1-strong)', color: 'var(--accent-strong)' }}>
              <Icon name="bolt" size={14} /> {RISK_INCIDENT_ALERT.headline}
            </div>
            <div
              className="muted"
              style={{
                font: 'var(--t-caption1)',
                color: 'var(--accent-strong)',
                marginTop: 4,
              }}
            >
              {RISK_INCIDENT_ALERT.detail}
            </div>
          </div>
          <Link className="btn primary lg" to={`/incidents/${RISK_INCIDENT_ALERT.incidentId}`}>
            <Icon name="incident" size={16} />
            Incident Replay
          </Link>
        </div>
      </div>
    </>
  )
}
