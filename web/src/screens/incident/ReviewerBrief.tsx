import { useState } from 'react'
import { SESSION_DETAIL } from '../../lib/seed/sessionDetail'
import { Icon } from '../../components/Icon'

const EXPLAIN_BACK: { label: string; text: string }[] = [
  { label: '의도', text: '지원자 목록 페이지 느림 → created_at DESC 인덱스 추가' },
  { label: '결과', text: 'dev → prod 마이그레이션 실행, 1.4s → 84ms 확인' },
  { label: '검증', text: 'dev에서 EXPLAIN ANALYZE 확인, prod 메트릭 미확인' },
  { label: '미해결', text: 'prod 적용 시점 직후 lock 영향 미확인' },
  { label: '핸드오프', text: '30분 모니터링 결과 공유 요청' },
]

const AI_QUESTIONS = [
  'prod 적용 직후 응답시간을 어디서 모니터링하기로 했나요?',
  'CONCURRENTLY 옵션 외에 lock 회피 전략이 있었나요?',
  'applicants 외 join 테이블의 plan 영향을 검토했나요?',
]

const DB_IMPACT = [
  'applicants 테이블 · 인덱스 idx_applicants_created_at 추가',
  '인덱스 빌드 동안 짧은 통계 갱신 (CONCURRENTLY 옵션)',
  '관련 테이블 join 쿼리 plan 변경 가능성',
]

type MatchKind = 'ok' | 'extra'

const MATCH_LINES: { kind: MatchKind; text: string }[] = [
  { kind: 'ok', text: '일치 — created_at DESC 단일 컬럼 인덱스 추가 (의도 = 결과)' },
  { kind: 'ok', text: '일치 — dev → prod 적용 순서 (의도 = 결과)' },
  {
    kind: 'extra',
    text: '부수 변경 — scripts/run-prod-migration.sh 1줄 수정 (의도에 없음 · 저위험)',
  },
]

export function ReviewerBrief() {
  const [memo, setMemo] = useState('')

  return (
    <>
      <div className="split" style={{ marginBottom: 16 }}>
        <div>
          <div className="lh">의도 — Operator 설명 메모 + AI 자동 추출</div>

          <div className="eyebrow" style={{ marginBottom: 6 }}>
            설명 메모 · 직접 작성
          </div>
          <div
            className="card tight"
            style={{ background: 'var(--bg-subtle)', border: 0, marginBottom: 12 }}
          >
            <div className="strong" style={{ font: 'var(--t-label1-strong)', marginBottom: 6 }}>
              의도 / 결과 / 검증 / 미해결 / 핸드오프
            </div>
            <ul
              style={{
                margin: 0,
                paddingLeft: 18,
                color: 'var(--text-neutral)',
                display: 'flex',
                flexDirection: 'column',
                gap: 4,
                font: 'var(--t-label1)',
              }}
            >
              {EXPLAIN_BACK.map((row) => (
                <li key={row.label}>
                  <b>{row.label}</b>: {row.text}
                </li>
              ))}
            </ul>
          </div>

          <div className="eyebrow" style={{ marginBottom: 6 }}>
            AI 자동 추출 · prompt 요약
          </div>
          <div className="card tight" style={{ background: 'var(--primary-light)', border: 0 }}>
            <div className="muted" style={{ font: 'var(--t-caption1)', marginBottom: 6 }}>
              turn 1 / 4 / 6 핵심
            </div>
            <div style={{ font: 'var(--t-label1)' }}>
              "applicants 테이블 created_at 정렬 인덱스 없는 듯. dev에서 한 번 돌리고 prod로." —
              인덱스 *단일 컬럼*, *prod까지 적용* 의도.
            </div>
          </div>

          <div className="hr" />
          <div className="eyebrow">질문 후보 (AI · 3개)</div>
          <div className="col" style={{ gap: 6, marginTop: 6 }}>
            {AI_QUESTIONS.map((q) => (
              <div
                key={q}
                className="row between"
                style={{
                  padding: 10,
                  borderRadius: 8,
                  border: '1px solid var(--line-soft)',
                  background: 'var(--bg-base)',
                }}
              >
                <span style={{ font: 'var(--t-label1)' }}>{q}</span>
                <button className="btn sm" type="button">
                  <Icon name="share" size={12} />
                  슬랙으로
                </button>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="lh">결과 — 실제 변경 · 명령 · DB 영향</div>

          <div className="eyebrow" style={{ marginBottom: 6 }}>
            변경 파일 ({SESSION_DETAIL.files.length})
          </div>
          <div className="col" style={{ gap: 6, marginBottom: 12 }}>
            {SESSION_DETAIL.files.map((f) => (
              <div
                key={f.path}
                className="row between"
                style={{
                  padding: 10,
                  border: '1px solid var(--line-soft)',
                  borderRadius: 8,
                }}
              >
                <code className="mono">{f.path}</code>
                <span className="mono muted">{f.lines}</span>
              </div>
            ))}
          </div>

          <div className="eyebrow" style={{ marginBottom: 6 }}>
            실행된 명령 ({SESSION_DETAIL.commands.length})
          </div>
          <ul
            style={{
              margin: 0,
              paddingLeft: 0,
              listStyle: 'none',
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
            }}
          >
            {SESSION_DETAIL.commands.map((c, i) => (
              <li
                key={i}
                style={{ padding: 8, border: '1px solid var(--line-soft)', borderRadius: 8 }}
              >
                <div className="row between">
                  <span className="muted tnum" style={{ font: 'var(--t-caption1)' }}>
                    {c.t}
                  </span>
                  {c.risk ? (
                    <span className={'tag ' + (c.risk.sev === 'high' ? 'red' : 'orange')}>
                      <span className="dot" />
                      {c.risk.sev}
                    </span>
                  ) : (
                    <span className="tag neutral">정보</span>
                  )}
                </div>
                <code className="mono" style={{ display: 'block', marginTop: 4 }}>
                  {c.cmd}
                </code>
              </li>
            ))}
          </ul>

          <div className="hr" />
          <div className="eyebrow">DB 영향 추정</div>
          <ul
            style={{
              margin: 0,
              paddingLeft: 18,
              color: 'var(--text-neutral)',
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
              font: 'var(--t-label1)',
            }}
          >
            {DB_IMPACT.map((row) => (
              <li key={row}>{row}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="card">
        <div className="card-h">
          <h3>의도 ↔ 결과 매칭</h3>
          <span className="sub">일치 부분 / 의도 외 부수 변경</span>
        </div>
        {MATCH_LINES.map((m) => (
          <div key={m.text} className={'match-line ' + m.kind}>
            <Icon name={m.kind === 'ok' ? 'check' : 'warn'} size={14} />
            {m.text}
          </div>
        ))}

        <div className="hr" />
        <div className="row between">
          <div className="muted" style={{ font: 'var(--t-caption1)' }}>
            검토 액션은 감사 기록에 남습니다 (검토자·시각·메모).
          </div>
          <div className="row tight">
            <label htmlFor="reviewer-memo" className="visually-hidden" style={{ display: 'none' }}>
              검토 메모
            </label>
            <input
              id="reviewer-memo"
              className="focus-stub"
              placeholder="짧은 메모 (선택)"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              style={{
                width: 280,
                height: 32,
                padding: '0 10px',
                border: '1px solid var(--line-soft)',
                borderRadius: 8,
                background: 'var(--bg-base)',
              }}
            />
            <button className="btn danger" type="button">
              차단
            </button>
            <button className="btn" type="button">
              추가 확인
            </button>
            <button className="btn primary" type="button">
              <Icon name="check" size={14} />
              승인 + 기록
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
