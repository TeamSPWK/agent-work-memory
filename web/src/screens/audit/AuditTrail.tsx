import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { AUDIT_EVENTS, AUDIT_STATS } from '../../lib/seed/audit'
import { Icon } from '../../components/Icon'
import { RiskChip } from '../../components/RiskChip'

const RANGES = ['오늘', '주', '월', '30일', '분기'] as const
type Range = (typeof RANGES)[number]

export function AuditTrail() {
  const [range, setRange] = useState<Range>('30일')
  const [, setParams] = useSearchParams()

  return (
    <>
      <div className="grid-4" style={{ marginBottom: 16 }}>
        <div className="card tight">
          <div className="kpi">
            <div className="l">AI 변경 검증율 · 30일</div>
            <div className="v">
              {AUDIT_STATS.reviewedRate}
              <span style={{ font: 'var(--t-heading3)' }}>%</span>
            </div>
            <div className="muted tnum" style={{ font: 'var(--t-caption1)' }}>
              {AUDIT_STATS.reviewed} / {AUDIT_STATS.totalChanges}건 Reviewer 승인
            </div>
          </div>
          <div className="bar" style={{ marginTop: 10 }}>
            <i style={{ width: AUDIT_STATS.reviewedRate + '%' }} />
          </div>
        </div>

        <div className="card tight">
          <div className="kpi">
            <div className="l">미검토</div>
            <div className="v" style={{ color: 'var(--accent-strong)' }}>
              {AUDIT_STATS.unreviewed}
            </div>
            <div className="delta neg">15% — 인공지능기본법 권고 ≤ 10%</div>
          </div>
          <button className="btn weak sm" type="button" style={{ marginTop: 10 }}>
            Reviewer Brief 큐로 →
          </button>
        </div>

        <div className="card tight">
          <div className="kpi">
            <div className="l">체인 무결성</div>
            <div className="v" style={{ color: 'var(--status-positive)' }}>
              ✓ {AUDIT_STATS.integrityTotal.toLocaleString('ko-KR')}건
            </div>
            <div className="delta neg">깨진 {AUDIT_STATS.integrityBroken}건 — 5/10 13:05</div>
          </div>
          <button
            className="btn weak sm"
            type="button"
            style={{ marginTop: 10 }}
            onClick={() => setParams({ tab: 'integrity' }, { replace: true })}
          >
            <Icon name="chain" size={12} />
            검증 결과 →
          </button>
        </div>

        <div className="card tight">
          <div className="kpi">
            <div className="l">7대 원칙 적용</div>
            <div className="v">
              {AUDIT_STATS.principlesOk}{' '}
              <span className="muted" style={{ font: 'var(--t-heading3)' }}>
                / {AUDIT_STATS.principlesTotal}
              </span>
            </div>
            <div className="muted" style={{ font: 'var(--t-caption1)' }}>
              2개 항목 보강 권고
            </div>
          </div>
          <button
            className="btn weak sm"
            type="button"
            style={{ marginTop: 10 }}
            onClick={() => setParams({ tab: 'principles' }, { replace: true })}
          >
            <Icon name="check" size={12} />
            컴플라이언스 패널 →
          </button>
        </div>
      </div>

      <div className="card">
        <div className="row between" style={{ marginBottom: 12 }}>
          <div className="seg" role="tablist" aria-label="기간">
            {RANGES.map((r) => (
              <button
                key={r}
                type="button"
                className={range === r ? 'active' : ''}
                onClick={() => setRange(r)}
              >
                {r}
              </button>
            ))}
          </div>
          <div className="row tight">
            <select
              className="focus-stub"
              aria-label="사용자 필터"
              style={{
                height: 32,
                padding: '0 10px',
                border: '1px solid var(--line-soft)',
                borderRadius: 8,
                background: 'var(--bg-base)',
              }}
            >
              <option>모든 사용자</option>
              <option>운영 매니저 (4년차)</option>
              <option>개발 리드 (8년차)</option>
            </select>
            <select
              className="focus-stub"
              aria-label="위험 카테고리"
              style={{
                height: 32,
                padding: '0 10px',
                border: '1px solid var(--line-soft)',
                borderRadius: 8,
                background: 'var(--bg-base)',
              }}
            >
              <option>모든 위험 카테고리</option>
              <option>DB</option>
              <option>Secret/Env</option>
              <option>Deploy/Infra</option>
            </select>
          </div>
        </div>

        <table className="tbl">
          <thead>
            <tr>
              <th style={{ width: 130 }}>시각</th>
              <th>이벤트</th>
              <th>작업자</th>
              <th>위험</th>
              <th style={{ width: 240 }}>해시 체인</th>
            </tr>
          </thead>
          <tbody>
            {AUDIT_EVENTS.map((e) => (
              <tr key={e.id} className={e.broken ? 'broken' : ''}>
                <td className="tnum muted" style={{ font: 'var(--t-caption1)' }}>
                  {e.at}
                </td>
                <td>
                  <div style={{ font: 'var(--t-label1-strong)', color: 'var(--text-strong)' }}>
                    {e.summary}
                  </div>
                  <div className="muted" style={{ font: 'var(--t-caption1)' }}>
                    <span className="badge">{e.type}</span> · 세션 {e.session}
                  </div>
                </td>
                <td>{e.actor}</td>
                <td>
                  <RiskChip risk={e.risk} />
                </td>
                <td>
                  <span className={'chain-mark' + (e.broken ? ' broken' : '')}>
                    <Icon name={e.broken ? 'warn' : 'chain'} size={12} />
                    <span className="mono">{e.hash}</span>
                    <span className="muted">←</span>
                    <span className="mono">{e.prev}</span>
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
