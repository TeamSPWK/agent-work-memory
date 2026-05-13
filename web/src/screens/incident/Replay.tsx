import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  INCIDENT,
  INCIDENT_X_MAX,
  INCIDENT_X_MIN,
  type IncidentBucketItem,
} from '../../lib/seed/incident'
import { Icon } from '../../components/Icon'

const SEV_SIZE: Record<'high' | 'med' | 'low', number> = { high: 18, med: 14, low: 10 }
const X_TICKS = [-10, -8, -6, -4, -2, 0, 2, 4, 6, 8, 10]

function BucketCard({
  variant,
  label,
  items,
  tag,
  withInvestigate,
}: {
  variant: 'y' | 'g' | 'm'
  label: string
  items: IncidentBucketItem[]
  tag: 'orange' | 'green' | 'violet'
  withInvestigate?: boolean
}) {
  return (
    <div className="bucket">
      <div className="hh">
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span className={'dot ' + variant} />
          {label}
        </span>
        <span className={'tag ' + tag}>{items.length}</span>
      </div>
      {items.map((it) => (
        <div key={it.id} className="item">
          <div style={{ font: 'var(--t-label1-strong)', color: 'var(--text-strong)' }}>
            {it.title}
          </div>
          <div className="why">{it.why}</div>
          <div className="row between" style={{ marginTop: 4 }}>
            <span className="badge">근거 {it.evidenceCount}</span>
            {withInvestigate && (
              <button className="btn sm" type="button">
                조사 시작
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

const EVENTS_BY_ID = new Map(INCIDENT.events.map((e) => [e.id, e]))

export function Replay() {
  const [selected, setSelected] = useState<string>(
    INCIDENT.events.find((e) => e.focus)?.id ?? INCIDENT.events[0].id,
  )
  const [, setParams] = useSearchParams()
  const ev = EVENTS_BY_ID.get(selected) ?? INCIDENT.events[0]
  const xPct = (x: number) => ((x - INCIDENT_X_MIN) / (INCIDENT_X_MAX - INCIDENT_X_MIN)) * 100
  /* INCIDENT 시드는 mount 시점 상수 — render마다 재계산 불필요 */
  const totalBuckets = useMemo(
    () =>
      INCIDENT.buckets.likely.length +
      INCIDENT.buckets.verified.length +
      INCIDENT.buckets.unknown.length,
    [],
  )
  const highEvents = useMemo(
    () => INCIDENT.events.filter((e) => e.sev === 'high').length,
    [],
  )

  return (
    <>
      <div
        className="card tight"
        role="status"
        aria-label="system 감지 mock 한계 안내"
        style={{
          marginBottom: 16,
          background: 'var(--c-orange-95)',
          borderColor: 'transparent',
          color: 'var(--c-orange-30)',
        }}
      >
        ⓘ 데모 mock 한계 — 표시된 *system 감지* 이벤트(엣지 모니터·Datadog APM·support inbox)는
        외부 메트릭 mock입니다. 실 연동은 m2 S5 이후 별도 sprint.
      </div>

      <div className="grid-4" style={{ marginBottom: 16 }}>
        <div className="card tight">
          <div className="kpi">
            <div className="l">사고 시작 후</div>
            <div className="v tnum">{INCIDENT.elapsedMin}분</div>
            <div className="muted" style={{ font: 'var(--t-caption1)' }}>
              16:31 detected · 16:34 acknowledged
            </div>
          </div>
        </div>
        <div className="card tight">
          <div className="kpi">
            <div className="l">1차 원인 도출 평균</div>
            <div className="v tnum" style={{ color: 'var(--primary-normal)' }}>
              {INCIDENT.avgRootCauseMin}분
            </div>
            <div className="delta pos">▼ 51분 (도구 도입 전 62분 대비)</div>
          </div>
        </div>
        <div className="card tight">
          <div className="kpi">
            <div className="l">관련 이벤트</div>
            <div className="v tnum">{INCIDENT.events.length}</div>
            <div className="muted" style={{ font: 'var(--t-caption1)' }}>
              위험 ↑ {highEvents}건
            </div>
          </div>
        </div>
        <div className="card tight">
          <div className="kpi">
            <div className="l">3분리 진행</div>
            <div className="v tnum">{totalBuckets}건</div>
            <div className="muted" style={{ font: 'var(--t-caption1)' }}>
              후보 {INCIDENT.buckets.likely.length} · 확실 {INCIDENT.buckets.verified.length} · 불명{' '}
              {INCIDENT.buckets.unknown.length}
            </div>
          </div>
        </div>
      </div>

      <div className="grid-split">
        <div className="col">
          <div className="card">
            <div className="card-h">
              <h3>시간순 이벤트 타임라인</h3>
              <div
                className="row tight"
                style={{
                  alignItems: 'center',
                  font: 'var(--t-caption1)',
                  color: 'var(--text-assistive)',
                }}
              >
                <span>
                  <span className="dot r" /> 고위험
                </span>
                <span>
                  <span className="dot y" /> 주의
                </span>
                <span>
                  <span className="dot gr" /> 낮음
                </span>
              </div>
            </div>
            <div className="incident-canvas" role="group" aria-label="사고 타임라인 캔버스">
              {INCIDENT.rows.map((r, ri) => (
                <div key={r.key} className="ic-row">
                  <div className="lab">{r.label}</div>
                  {INCIDENT.events
                    .filter((e) => e.row === ri)
                    .map((e) => (
                      <button
                        key={e.id}
                        type="button"
                        aria-label={`${e.at} · ${e.title}`}
                        aria-pressed={selected === e.id}
                        className={'ic-mark ' + e.sev + (selected === e.id ? ' now' : '')}
                        style={{
                          left: `calc(${xPct(e.x)}% - ${SEV_SIZE[e.sev] / 2}px)`,
                          width: SEV_SIZE[e.sev],
                          height: SEV_SIZE[e.sev],
                        }}
                        onClick={() => setSelected(e.id)}
                        title={e.title}
                      >
                        {e.sev === 'high' ? '!' : ''}
                      </button>
                    ))}
                </div>
              ))}
              <div className="ic-axis">
                {X_TICKS.map((x) => (
                  <span key={x}>
                    {x === 0 ? (
                      <b style={{ color: 'var(--status-negative)' }}>T0 16:31</b>
                    ) : x > 0 ? (
                      `+${x}m`
                    ) : (
                      `${x}m`
                    )}
                  </span>
                ))}
              </div>
            </div>
            <div className="row" style={{ marginTop: 14 }}>
              <span className="muted" style={{ font: 'var(--t-caption1)' }}>
                <Icon name="filter" size={12} /> 필터 · 카테고리 8개 / 작업자 / 위험 심각도 / 키워드
              </span>
            </div>
          </div>

          <div className="grid-3">
            <BucketCard
              variant="y"
              label="원인 후보"
              items={INCIDENT.buckets.likely}
              tag="orange"
            />
            <BucketCard
              variant="g"
              label="확실한 증거"
              items={INCIDENT.buckets.verified}
              tag="green"
            />
            <BucketCard
              variant="m"
              label="불명확"
              items={INCIDENT.buckets.unknown}
              tag="violet"
              withInvestigate
            />
          </div>
        </div>

        <div className="col">
          <div className="card tight">
            <div className="card-h">
              <h3>이벤트 상세</h3>
              <span className="sub">{ev.at}</span>
            </div>
            <div style={{ font: 'var(--t-heading3)', color: 'var(--text-strong)' }}>{ev.title}</div>
            <div className="row tight" style={{ margin: '6px 0 12px' }}>
              <span
                className={
                  'tag ' + (ev.sev === 'high' ? 'red' : ev.sev === 'med' ? 'orange' : 'neutral')
                }
              >
                <span className="dot" />
                {ev.sev}
              </span>
              <span className="tag neutral">{ev.lab}</span>
              {ev.system && <span className="tag blue">시스템 감지</span>}
            </div>

            <div className="hr" />
            <div className="eyebrow">관련 자료</div>
            <div className="col" style={{ gap: 6, marginTop: 8 }}>
              {ev.session && (
                <Link
                  className="btn sm"
                  to={`/sessions/${ev.session}`}
                  style={{ justifyContent: 'flex-start' }}
                >
                  <Icon name="file" size={14} />
                  세션 {ev.session} 열기
                </Link>
              )}
              <button
                className="btn sm"
                type="button"
                style={{ justifyContent: 'flex-start' }}
                onClick={() => setParams({ tab: 'reviewer' }, { replace: true })}
              >
                <Icon name="review" size={14} />
                검토 요약 — 의도 vs 결과
              </button>
              <button
                className="btn sm"
                type="button"
                style={{ justifyContent: 'flex-start' }}
              >
                <Icon name="git" size={14} />
                매칭 커밋 f08c4b2
              </button>
              <Link
                className="btn sm"
                to="/audit"
                style={{ justifyContent: 'flex-start' }}
              >
                <Icon name="audit" size={14} />
                감사 기록 행 aud-001
              </Link>
            </div>

            <div className="hr" />
            <div className="eyebrow">이 분류 사유</div>
            <div className="muted" style={{ font: 'var(--t-caption1)', marginTop: 6 }}>
              prod 환경 변경 명령 패턴 + 사람 미승인 단계 + lock 경합 메트릭과 시간 일치.
            </div>
            <div className="row tight" style={{ marginTop: 8 }}>
              <button
                className="btn primary sm"
                type="button"
                onClick={() => setParams({ tab: 'event' }, { replace: true })}
              >
                <Icon name="warn" size={12} />
                이 후보를 상세 분석
              </button>
            </div>
          </div>

          <div
            className="card tight"
            style={{ background: 'var(--accent-light)', borderColor: 'transparent' }}
          >
            <div style={{ font: 'var(--t-label1-strong)', color: 'var(--accent-strong)' }}>
              <Icon name="warn" size={14} /> 가설 H3 검증 포인트
            </div>
            <div
              className="muted"
              style={{ font: 'var(--t-caption1)', color: 'var(--accent-strong)', marginTop: 4 }}
            >
              "Risk Radar → Replay → 후보 클릭 → Reviewer Brief 의도/결과 → 1차 원인 메모" 사이클이
              10분 안에 끝나는지 시연.
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
