import { useState, type ReactNode } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Icon } from '../../components/Icon'

type BucketKey = 'likely' | 'verified' | 'unknown' | 'irrelevant'

const BUCKETS: { key: BucketKey; label: string; dot: 'y' | 'g' | 'm' | 'gr' }[] = [
  { key: 'likely', label: '원인 후보 (likely)', dot: 'y' },
  { key: 'verified', label: '확실한 증거 (verified)', dot: 'g' },
  { key: 'unknown', label: '불명확 (unknown)', dot: 'm' },
  { key: 'irrelevant', label: '제외 (irrelevant)', dot: 'gr' },
]

const FACT_ROWS: { label: string; value: ReactNode }[] = [
  { label: '시각', value: '2026-05-10 16:25:11 (T0 -6분)' },
  { label: '작업자', value: '개발 리드 (8년차)' },
  { label: '세션 / 도구', value: 's-024 · Cursor' },
  { label: 'repo · 브랜치', value: 'web-app · feat/idx-applicants' },
  {
    label: '명령',
    value: <code className="mono">psql $PROD_URL -f 20260510_add_applicants_idx.sql</code>,
  },
]

const EVIDENCE: { i: string; l: string }[] = [
  { i: 'audit', l: 'Audit Trail · ev-2401 (해시 9c4f7a1)' },
  { i: 'git', l: 'commit f08c4b2 · feat(applicants): add created_at DESC index' },
  { i: 'review', l: 'Reviewer Brief · 의도 vs 결과 — 부수 변경 0' },
  { i: 'db', l: 'Datadog APM · 16:32 lock wait spike' },
  { i: 'file', l: 'db/migrations/20260510_add_applicants_idx.sql · CREATE INDEX CONCURRENTLY' },
]

export function EventDetail() {
  const [, setParams] = useSearchParams()
  const [bucket, setBucket] = useState<BucketKey>('likely')
  const [reason, setReason] = useState(
    '시간 일치 + DB 카테고리 + 사람 승인된 prod 변경. 인덱스 통계 갱신과 lock 경합 가능성. 단정 X.',
  )

  return (
    <div className="grid-split">
      <div className="col">
        <div className="card">
          <div className="card-h">
            <h3>이벤트 핵심 fact</h3>
            <span className="sub">변조 불가 audit row 기반</span>
          </div>
          <table className="tbl">
            <tbody>
              {FACT_ROWS.map((row) => (
                <tr key={row.label}>
                  <td className="muted" style={{ width: 140 }}>
                    {row.label}
                  </td>
                  <td className={typeof row.value === 'string' ? 'tnum' : undefined}>
                    {row.value}
                  </td>
                </tr>
              ))}
              <tr>
                <td className="muted">위험</td>
                <td>
                  <span className="tag red">
                    <span className="dot" />
                    고위험 · DB
                  </span>
                </td>
              </tr>
              <tr>
                <td className="muted">사람 승인</td>
                <td>
                  <span className="tag green">
                    <span className="dot" />
                    turn 7에서 사용자 승인 (16:24:56)
                  </span>
                </td>
              </tr>
              <tr>
                <td className="muted">매칭 commit</td>
                <td>
                  <a className="link mono" href="#commit-f08c4b2">
                    f08c4b2
                  </a>{' '}
                  · score 94%
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="card">
          <div className="card-h">
            <h3>3분리 — 이 이벤트의 인과적 위치</h3>
          </div>
          <div className="grid-3">
            <div className="bucket">
              <div className="hh">
                <span>
                  <span className="dot y" /> 후보
                </span>
              </div>
              <div className="item">
                <div className="strong">prod lock 경합 유발 가능</div>
                <div className="why">
                  CONCURRENTLY 옵션 적용했지만 통계 갱신 시점에 일시적 lock 가능. 시간 일치(6분 전
                  → lock wait 다발).
                </div>
                <span className="badge">근거 3</span>
              </div>
            </div>
            <div className="bucket">
              <div className="hh">
                <span>
                  <span className="dot g" /> 확실
                </span>
              </div>
              <div className="item">
                <div className="strong">prod 환경에서 실행됨</div>
                <div className="why">audit row ev-2401 / DB 로그 / 사용자 승인 turn — 3중 일치.</div>
                <span className="badge">근거 3</span>
              </div>
            </div>
            <div className="bucket">
              <div className="hh">
                <span>
                  <span className="dot m" /> 불명
                </span>
              </div>
              <div className="item">
                <div className="strong">테이블 통계 변경 폭</div>
                <div className="why">
                  applicants 테이블 통계가 인덱스 추가 직후 어떻게 변했는지 미수집 — DB 메트릭 별도
                  확인 필요.
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-h">
            <h3>근거 자료</h3>
            <span className="sub">cross-reference</span>
          </div>
          <ul
            style={{
              margin: 0,
              paddingLeft: 0,
              listStyle: 'none',
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}
          >
            {EVIDENCE.map((r) => (
              <li
                key={r.l}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: 10,
                  border: '1px solid var(--line-soft)',
                  borderRadius: 8,
                }}
              >
                <span className="row tight" style={{ alignItems: 'center' }}>
                  <Icon name={r.i} size={14} />
                  <span>{r.l}</span>
                </span>
                <button className="link" type="button">
                  열기 →
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="col">
        <div className="card tight">
          <div className="eyebrow">분류 변경</div>
          <div role="radiogroup" aria-label="3분리 분류" className="col" style={{ gap: 8, marginTop: 8 }}>
            {BUCKETS.map((o) => (
              <label
                key={o.key}
                className="row between"
                style={{
                  padding: 10,
                  borderRadius: 8,
                  border: '1px solid var(--line-soft)',
                  background: bucket === o.key ? 'var(--primary-light)' : 'var(--bg-base)',
                }}
              >
                <span className="row tight">
                  <span className={'dot ' + o.dot} /> {o.label}
                </span>
                <input
                  type="radio"
                  name="bucket"
                  value={o.key}
                  checked={bucket === o.key}
                  onChange={() => setBucket(o.key)}
                />
              </label>
            ))}
          </div>
          <div className="hr" />
          <div className="fieldset">
            <label htmlFor="event-reason">분류 사유 (audit log에 기록)</label>
            <textarea
              id="event-reason"
              className="focus-stub"
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>
          <button className="btn primary" type="button" style={{ marginTop: 10 }}>
            저장 · 3분리 갱신
          </button>
        </div>

        <div className="card tight">
          <div className="eyebrow">의도 ↔ 결과 미리보기</div>
          <div style={{ font: 'var(--t-label1)', marginTop: 6 }}>
            Reviewer Brief에서 의도(Operator Explain Back)와 실제 변경을 좌우 비교합니다.
          </div>
          <button
            className="btn weak sm"
            type="button"
            style={{ marginTop: 10 }}
            onClick={() => setParams({ tab: 'reviewer' }, { replace: true })}
          >
            <Icon name="review" size={12} />
            Reviewer Brief 열기
          </button>
        </div>

        <div className="card tight">
          <div className="eyebrow">cross-link</div>
          <div className="col" style={{ gap: 6, marginTop: 8 }}>
            <Link className="btn sm" to="/sessions/s-024" style={{ justifyContent: 'flex-start' }}>
              <Icon name="file" size={14} />
              세션 s-024 열기
            </Link>
            <Link className="btn sm" to="/audit" style={{ justifyContent: 'flex-start' }}>
              <Icon name="audit" size={14} />
              Audit Trail row aud-001
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
