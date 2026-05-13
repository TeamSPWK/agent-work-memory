import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { SESSIONS } from '../lib/seed/sessions'
import { SESSION_DETAIL } from '../lib/seed/sessionDetail'
import { Icon } from '../components/Icon'

type FieldKey = 'intent' | 'result' | 'verify' | 'open' | 'handoff'

type FieldMeta = {
  key: FieldKey
  label: string
  hint: string
  min: number
  rows: number
}

const FIELDS: FieldMeta[] = [
  { key: 'intent', label: '의도', hint: '내가 요청한 것', min: 30, rows: 3 },
  { key: 'result', label: '결과', hint: '에이전트가 바꾼 것', min: 30, rows: 3 },
  { key: 'verify', label: '검증', hint: '내가 직접 확인한 것', min: 20, rows: 2 },
  { key: 'open', label: '미해결', hint: '아직 모르는 것', min: 10, rows: 2 },
  { key: 'handoff', label: '핸드오프', hint: '팀에게 물어볼 것', min: 10, rows: 2 },
]

const INITIAL: Record<FieldKey, string> = {
  intent: '지원자 목록 페이지가 느려서, created_at 기준 최신순 정렬 인덱스를 추가하라고 했음.',
  result: 'applicants 테이블에 created_at DESC 단일 컬럼 인덱스 생성. dev → prod 마이그레이션 실행.',
  verify: 'dev에서 EXPLAIN ANALYZE로 1.4s → 84ms 확인. prod 적용 후 메트릭 미확인.',
  open: 'prod 실행 시점 16:25 직후 lock wait 다발 발생 — 인덱스 영향인지 별개 이슈인지 모름.',
  handoff: '(개발 리드) prod 적용 후 30분간 응답시간 모니터링 결과 알려줘.',
}

export function ExplainBack() {
  const { id = '' } = useParams<{ id?: string }>()
  const session = SESSIONS.find((s) => s.id === id)
  const [v, setV] = useState(INITIAL)
  const completion =
    FIELDS.reduce((acc, f) => acc + Math.min(1, v[f.key].length / f.min), 0) / FIELDS.length

  if (!session) {
    return (
      <div className="card" style={{ padding: 24 }}>
        <h1 style={{ font: 'var(--t-title3)', color: 'var(--text-strong)', margin: 0 }}>
          세션을 찾을 수 없습니다
        </h1>
        <Link className="btn" to="/sessions" style={{ marginTop: 16, display: 'inline-flex' }}>
          ← Sessions 목록으로
        </Link>
      </div>
    )
  }

  return (
    <>
      <div className="page-h">
        <div>
          <div className="eyebrow">오늘 화면에서 "설명 부족" 클릭</div>
          <h1>설명 메모</h1>
          <p>점수·평가가 아닌 *협업 가능한 작업 요약*입니다. 팀 회상과 인수인계에만 쓰입니다.</p>
        </div>
        <div className="actions">
          <Link className="btn" to={`/sessions/${session.id}`}>
            ← 세션
          </Link>
          <Link className="btn primary" to={`/sessions/${session.id}/share`}>
            <Icon name="check" size={14} />
            저장 후 공유
          </Link>
        </div>
      </div>

      {session.id !== SESSION_DETAIL.id && (
        <div
          className="card tight"
          style={{
            marginBottom: 16,
            background: 'var(--c-orange-95)',
            borderColor: 'transparent',
            color: 'var(--c-orange-30)',
          }}
        >
          ⓘ 데모 예시 — 이 세션의 설명 메모 초안은 아직 채워지지 않았습니다. 아래는 참고용 예시 데이터입니다.
        </div>
      )}

      <div className="grid-split">
        <div className="card">
          <div className="card-h">
            <h3>5필드 · {Math.round(completion * 100)}% 채워짐</h3>
            <div style={{ width: 180 }}>
              <div className="bar">
                <i style={{ width: completion * 100 + '%' }} />
              </div>
            </div>
          </div>
          <div className="col" style={{ gap: 16 }}>
            {FIELDS.map((f) => (
              <div className="fieldset" key={f.key}>
                <label htmlFor={`eb-${f.key}`}>
                  {f.label}
                  <span className="muted" style={{ marginLeft: 8, font: 'var(--t-caption1)' }}>
                    {f.hint}
                  </span>
                </label>
                <textarea
                  id={`eb-${f.key}`}
                  className="focus-stub"
                  rows={f.rows}
                  value={v[f.key]}
                  onChange={(e) => setV({ ...v, [f.key]: e.target.value })}
                />
                <div className="hint tnum">{v[f.key].length}자</div>
              </div>
            ))}
          </div>
        </div>

        <div className="col">
          <div className="card tight">
            <div className="eyebrow">참고</div>
            <div
              style={{
                font: 'var(--t-label1-strong)',
                color: 'var(--text-strong)',
                margin: '4px 0 8px',
              }}
            >
              이 노트가 들어가는 곳
            </div>
            <ul
              style={{
                margin: 0,
                paddingLeft: 16,
                color: 'var(--text-neutral)',
                display: 'flex',
                flexDirection: 'column',
                gap: 6,
              }}
            >
              <li>팀 공유 요약 (오늘 페이지 카드)</li>
              <li>검토 요약 — *의도* 좌측 패널</li>
              <li>감사 기록 — 작업자 의도 기록 (감사 자료)</li>
              <li>사고 발생 시 사고 재생 사이드바</li>
            </ul>
          </div>

          <div className="card tight">
            <div className="eyebrow">AI 보조</div>
            <div
              style={{
                font: 'var(--t-label1-strong)',
                color: 'var(--text-strong)',
                margin: '4px 0 8px',
              }}
            >
              <Icon name="sparkle" size={14} /> 자동 추출 초안
            </div>
            <div className="muted" style={{ font: 'var(--t-label2)', marginBottom: 10 }}>
              세션의 turn 1·2·6·7과 명령 로그에서 의도·결과·검증을 추출했습니다. 직접 손보세요.
            </div>
            <button className="btn weak sm" type="button">
              <Icon name="sparkle" size={12} />초안 다시 생성
            </button>
          </div>

          <div className="card tight">
            <div className="eyebrow">알림 정책</div>
            <div className="muted" style={{ font: 'var(--t-label2)', marginTop: 6 }}>
              매시간 알림은 보내지 않습니다. *오늘 첫 화면*에 누적되어 자율적으로 처리합니다 (PRD §9 운영 룰).
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
