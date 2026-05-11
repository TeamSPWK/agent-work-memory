import { Link } from 'react-router-dom'
import { SESSIONS } from '../lib/seed/sessions'
import { Icon } from '../components/Icon'

// mock — s-025 시나리오 전용 hardcode. yesterday filter 결과와 무관하게 고정.
const SELF_INTENT =
  '매주 월요일 9시에 지난 주 지원자/면접/오퍼 통계를 자동 생성해 운영 채널에 보내달라.'
const SELF_RESULT = 'Vercel cron으로 weekly-report 함수 등록. 슬랙 webhook URL은 .env로 분리.'
const RESULT_FILES = [
  'api/cron/weekly-report.ts (added · +84 / -0)',
  'vercel.json (modified · +6 / -0)',
  '.env.example (modified · +2 / -0)',
]

export function SelfRecall() {
  const yesterday = SESSIONS.filter((s) => s.when.startsWith('어제'))

  return (
    <>
      <div className="page-h">
        <div>
          <div className="eyebrow">진입 시점 · 어제·지난주 작업 회상이 필요할 때</div>
          <h1>셀프 회상 — 어제 한 일</h1>
          <p>며칠 전 자기가 시킨 작업도 같은 의도/결과 분리로 다시 본다 (Reviewer Brief 셀프 모드).</p>
        </div>
        <div className="actions">
          <button className="btn" type="button">
            <Icon name="cal" size={14} />
            어제 · 5월 9일
          </button>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div className="row between">
          <div className="row tight" style={{ alignItems: 'center' }}>
            <Icon name="book" size={16} />
            <div>
              <div className="strong" style={{ font: 'var(--t-label1-strong)' }}>
                나만 보는 회상 모드
              </div>
              <div className="muted" style={{ font: 'var(--t-caption1)' }}>
                어제 작업 {yesterday.length}건 · 검토 완료. 셀프 핸드오프 노트만 작성 가능.
              </div>
            </div>
          </div>
          <div>
            <span className="persona-mark op">Operator · 셀프</span>
          </div>
        </div>
      </div>

      {yesterday.length === 0 ? (
        <div className="card" style={{ padding: 24 }}>
          <p style={{ font: 'var(--t-body2)', color: 'var(--text-assistive)', margin: 0 }}>
            어제 처리된 세션이 없습니다.
          </p>
        </div>
      ) : null}

      {yesterday.map((s) => (
        <div key={s.id} className="split">
          <div>
            <div className="lh">의도 · 어제 내가 시킨 것 (Explain Back)</div>
            <div
              style={{
                font: 'var(--t-heading3)',
                color: 'var(--text-strong)',
                marginBottom: 8,
              }}
            >
              {s.intent}
            </div>
            <div className="muted" style={{ font: 'var(--t-label2)', marginBottom: 12 }}>
              {s.when} · {s.tool} · {s.repo}
            </div>
            <div className="fieldset">
              <label>의도</label>
              <div
                className="card tight"
                style={{ background: 'var(--bg-subtle)', border: 0 }}
              >
                {SELF_INTENT}
              </div>
              <label>결과</label>
              <div
                className="card tight"
                style={{ background: 'var(--bg-subtle)', border: 0 }}
              >
                {SELF_RESULT}
              </div>
            </div>
          </div>
          <div>
            <div className="lh">결과 · 어제 적용된 것</div>
            <div style={{ font: 'var(--t-label1)', marginBottom: 8 }}>
              변경 파일 {s.files} / 명령 {s.cmds}
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
              {RESULT_FILES.map((f) => (
                <li key={f} className="mono">
                  {f}
                </li>
              ))}
            </ul>
            <div className="hr" />
            <div className="match-line ok">
              <Icon name="check" size={14} />
              의도 ↔ 결과 일치 — cron 등록 + 통계 함수
            </div>
            <div className="match-line extra">
              <Icon name="warn" size={14} />
              의도 외 부수 변경 — .env.example 갱신 (저위험)
            </div>

            <div className="hr" />
            <div className="fieldset">
              <label htmlFor="self-handoff">오늘의 셀프 핸드오프</label>
              <textarea
                id="self-handoff"
                className="focus-stub"
                rows={3}
                placeholder="(나에게) 다음 주 월요일 9:05에 첫 발송 결과 확인. 통계 누락 항목 있으면 SQL 검토."
              />
            </div>
            <Link className="btn primary" to="/today" style={{ marginTop: 10 }}>
              <Icon name="check" size={14} />
              저장 후 Today로
            </Link>
          </div>
        </div>
      ))}
    </>
  )
}
