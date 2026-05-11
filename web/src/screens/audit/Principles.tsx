import { Link } from 'react-router-dom'
import { COMPLIANCE, AUDIT_STATS } from '../../lib/seed/audit'
import { Icon } from '../../components/Icon'

export function Principles() {
  const okCount = COMPLIANCE.filter((p) => p.state === 'ok').length
  const warnCount = COMPLIANCE.length - okCount
  const unexplainedPct = Math.round((AUDIT_STATS.unreviewed / AUDIT_STATS.totalChanges) * 100)

  return (
    <div className="grid-split">
      <div className="card">
        <div className="card-h">
          <h3>원칙별 체크리스트</h3>
          <span className="badge">
            {okCount} / {COMPLIANCE.length} 충족 · {warnCount} 보강 권고
          </span>
        </div>
        <ul className="compliance" style={{ margin: 0, padding: 0, listStyle: 'none' }}>
          {COMPLIANCE.map((p) => (
            <li key={p.name}>
              <span
                className={
                  'check ' + (p.state === 'ok' ? '' : p.state === 'warn' ? 'warn' : 'todo')
                }
              >
                {p.state === 'ok' ? '✓' : p.state === 'warn' ? '!' : ''}
              </span>
              <div>
                <div className="pname">{p.name}</div>
                <div className="pdesc">
                  {p.desc} · {p.note}
                </div>
              </div>
              <div>
                <span className={'tag ' + (p.state === 'ok' ? 'green' : 'orange')}>
                  {p.state === 'ok' ? '충족' : '보강 권고'}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="col">
        <div className="card tight">
          <div className="eyebrow">시연 노트</div>
          <div
            style={{
              font: 'var(--t-label1-strong)',
              color: 'var(--text-strong)',
              margin: '4px 0 8px',
            }}
          >
            왜 한 화면이 결제 트리거인가
          </div>
          <ul
            style={{
              margin: 0,
              paddingLeft: 18,
              color: 'var(--text-neutral)',
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
            }}
          >
            <li>법무·CFO 외주 회의에서 *바로 보여줄 자료*</li>
            <li>"적용 안 됨" 항목 1개라도 있으면 미루기 어려움</li>
            <li>Pro 플랜에서 PDF + 자동 보강 알림 활성화</li>
          </ul>
        </div>

        <div className="card tight">
          <div className="eyebrow">미설명 세션 영향</div>
          <div className="row between" style={{ alignItems: 'flex-end', marginTop: 8 }}>
            <div>
              <div className="muted" style={{ font: 'var(--t-caption1)' }}>
                투명성 원칙 — 미설명 세션
              </div>
              <div className="strong tnum" style={{ font: 'var(--t-title3)' }}>
                {AUDIT_STATS.unreviewed} / {AUDIT_STATS.totalChanges}
              </div>
            </div>
            <Link className="btn weak sm" to="/today">
              <Icon name="pencil" size={12} />
              Explain Back 큐
            </Link>
          </div>
          <div className="bar" style={{ marginTop: 12 }}>
            <i style={{ width: unexplainedPct + '%', background: 'var(--accent-normal)' }} />
          </div>
          <div className="muted" style={{ font: 'var(--t-caption1)', marginTop: 6 }}>
            {unexplainedPct}% — 권고 ≤ 10%까지{' '}
            {Math.max(0, AUDIT_STATS.unreviewed - Math.floor(AUDIT_STATS.totalChanges * 0.1))}
            세션 더 채우면 충족
          </div>
        </div>

        <div
          className="card tight"
          style={{ background: 'var(--primary-light)', borderColor: 'transparent' }}
        >
          <div className="row between">
            <div>
              <div style={{ font: 'var(--t-label1-strong)', color: 'var(--primary-strong)' }}>
                현재 플랜 · Starter
              </div>
              <div
                className="muted"
                style={{
                  font: 'var(--t-caption1)',
                  color: 'var(--primary-strong)',
                }}
              >
                PDF export · 자동 보강 알림은 Team / Pro에서 제공
              </div>
            </div>
            <Link className="btn primary" to="/settings?tab=export">
              업그레이드 →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
