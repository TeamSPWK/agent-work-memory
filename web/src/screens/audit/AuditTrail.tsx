import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { AUDIT_EVENTS, AUDIT_STATS } from '../../lib/seed/audit'
import { Icon } from '../../components/Icon'
import { RiskChip } from '../../components/RiskChip'
import { useIngest } from '../../lib/useIngest'
import { KpiGridSkeleton, TableRowsSkeleton } from '../../components/Skeleton'

const RANGES = ['오늘', '주', '월', '30일', '분기'] as const
type Range = (typeof RANGES)[number]

export function AuditTrail() {
  const ingest = useIngest()
  // loading 중에는 seed 표시 안 함(목업→실데이터 flash 차단). 실 데이터 있으면 실 우선, 없을 때만 seed fallback.
  const isLive = !ingest.loading && (ingest.workPackets.length > 0 || ingest.auditEvents.length > 0)
  const showSeed = !ingest.loading && !isLive
  const events = isLive ? ingest.auditEvents : showSeed ? AUDIT_EVENTS : []
  const workPackets = isLive ? ingest.workPackets : []
  const [range, setRange] = useState<Range>('30일')
  const [, setParams] = useSearchParams()

  if (ingest.loading) {
    return (
      <>
        <KpiGridSkeleton />
        <div className="card">
          <TableRowsSkeleton rows={8} cols={5} />
        </div>
      </>
    )
  }

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
              {AUDIT_STATS.reviewed} / {AUDIT_STATS.totalChanges}건 검토자 승인
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
            검토 대기열로 →
          </button>
        </div>

        <div className="card tight">
          <div className="kpi">
            <div className="l">기록 변조 검증</div>
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

      {workPackets.length > 0 && (
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="card-h">
            <h3>작업 패킷 — 의도로 묶인 변경</h3>
            <span className="sub">세션을 의도 단위로 묶어 본 작업의 *왜·무엇*을 요약</span>
          </div>
          <table className="tbl">
            <thead>
              <tr>
                <th>작업</th>
                <th style={{ width: 130 }}>레포</th>
                <th style={{ width: 90 }}>세션</th>
                <th style={{ width: 100 }}>커밋 후보</th>
                <th style={{ width: 80 }}>위험</th>
                <th style={{ width: 100 }}>증거</th>
                <th style={{ width: 130 }}>마지막 활동</th>
              </tr>
            </thead>
            <tbody>
              {workPackets.slice(0, 12).map((p) => (
                <tr key={p.id}>
                  <td>
                    <div
                      style={{
                        font: 'var(--t-label1-strong)',
                        color: 'var(--text-strong)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        maxWidth: 460,
                      }}
                      title={p.title}
                    >
                      {p.title || '(제목 없음)'}
                    </div>
                    <div
                      className="muted"
                      style={{
                        font: 'var(--t-caption1)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        maxWidth: 460,
                      }}
                      title={p.summary}
                    >
                      {p.summary || p.nextAction}
                    </div>
                  </td>
                  <td className="mono muted" style={{ font: 'var(--t-caption1)' }}>
                    {p.repo || '(미연결)'}
                  </td>
                  <td className="tnum">
                    {p.sessionCount}
                    {p.needsReviewCount > 0 && (
                      <span className="muted" style={{ font: 'var(--t-caption1)' }}>
                        {' · '}
                        {p.needsReviewCount} 확인
                      </span>
                    )}
                  </td>
                  <td className="tnum muted">
                    {p.commitCandidateCount}
                    {p.confirmedCommitCount > 0 && ` (✓${p.confirmedCommitCount})`}
                  </td>
                  <td>
                    {p.riskCount > 0 ? (
                      <span className="tag" style={{ background: 'var(--bg-subtle)' }}>
                        {p.riskCount}건
                      </span>
                    ) : (
                      <span className="muted">—</span>
                    )}
                  </td>
                  <td>
                    <span
                      className="tag"
                      style={{
                        background:
                          p.evidenceGrade === '좋음'
                            ? 'var(--c-green-95)'
                            : p.evidenceGrade === '보통'
                              ? 'var(--bg-subtle)'
                              : 'var(--c-orange-95)',
                        color:
                          p.evidenceGrade === '좋음'
                            ? 'var(--status-positive)'
                            : p.evidenceGrade === '보통'
                              ? 'var(--text-neutral)'
                              : 'var(--c-orange-30)',
                      }}
                    >
                      {p.evidenceGrade}
                    </span>
                  </td>
                  <td className="tnum muted" style={{ font: 'var(--t-caption1)' }}>
                    {p.lastActivity}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="card">
        <div className="card-h">
          <h3>Chain tail — 변조 불가성 증거 (PRD §5.5)</h3>
          <span className="sub">SHA-256 chain 마지막 N건. prev·hash 변경 시 verify 깨짐</span>
        </div>
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
              <th style={{ width: 240 }}>변조 방지 서명</th>
            </tr>
          </thead>
          <tbody>
            {events.map((e) => (
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
