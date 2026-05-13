import { Link } from 'react-router-dom'
import { SESSIONS } from '../lib/seed/sessions'
import { Icon } from '../components/Icon'
import { RiskChip } from '../components/RiskChip'
import { useIngest } from '../lib/useIngest'

const TODAY_COUNT = { changed: 22, risk: 4, unexplained: 3 }

const TODAY_TODO = [
  'prod 인덱스 적용 후 응답시간 모니터링 (개발 리드)',
  'Notion 동기화 키 노출 확인 (운영 매니저)',
  '결제 재시도 UI Reviewer Brief 검토 (개발 리드)',
]

export function Today() {
  const ingest = useIngest()
  // 실 데이터가 있으면 seed 위에 병합 (seed는 fallback)
  const base = ingest.sessions.length > 0 ? ingest.sessions : SESSIONS
  // `ingest --limit 30` 응답은 *최근 30* 세션이라 startedAt에 날짜 정보가 없다.
  // 실 데이터일 땐 hero 카피의 "오늘"이 정확히 *오늘만* 의미하지 않는다 — M0/S2 측정 후 카피 정정.
  const recent = base.filter((s) => s.when.startsWith('오늘') || ingest.sessions.length > 0)
  const unexplained = base.filter((s) => !s.explained)
  const firstUnexplainedId = unexplained[0]?.id ?? recent[0]?.id

  return (
    <>
      <div className="page-h">
        <div>
          <div className="eyebrow">진입 시점 · 매일 첫 화면</div>
          <h1>오늘의 작업 메모리</h1>
          <p>
            오늘 무엇을 시켰고, 어떤 위험이 있었고, 무엇이 아직 설명 안 됐는지 한 화면에서 확인하세요.
          </p>
        </div>
        <div className="actions">
          <button className="btn" type="button">
            <Icon name="cal" size={14} />
            오늘 · 5월 10일
          </button>
          {firstUnexplainedId ? (
            <Link className="btn primary" to={`/sessions/${firstUnexplainedId}/explain`}>
              <Icon name="pencil" size={14} />
              Explain Back 채우기 ({unexplained.length})
            </Link>
          ) : (
            <button className="btn primary" type="button" disabled>
              <Icon name="pencil" size={14} />
              Explain Back 채우기 (0)
            </button>
          )}
        </div>
      </div>

      {/* Hero — 오늘 가장 시급한 단일 action */}
      <section
        className="today-hero"
        aria-label="오늘 우선 작업"
        style={{ marginBottom: 16 }}
      >
        {unexplained.length > 0 && firstUnexplainedId ? (
          <>
            <div>
              <div className="eyebrow">지금 채워야 할 것</div>
              <h2 className="today-hero-h">
                오늘 작업 {recent.length}건 중{' '}
                <span style={{ color: 'var(--accent-strong)' }}>
                  {unexplained.length}건
                </span>
                이 아직 설명되지 않았어요.
              </h2>
              <p className="today-hero-sub">
                Explain Back을 채우면 팀이 검토 가능한 5문장 요약으로 자동 변환됩니다.
              </p>
            </div>
            <Link
              className="btn primary lg"
              to={`/sessions/${firstUnexplainedId}/explain`}
            >
              <Icon name="pencil" size={14} /> 첫 세션부터 채우기
            </Link>
          </>
        ) : (
          <>
            <div>
              <div className="eyebrow">완료</div>
              <h2 className="today-hero-h">
                오늘 작업 {recent.length}건 모두 검토되었습니다.
              </h2>
              <p className="today-hero-sub">
                위험 신호 {TODAY_COUNT.risk}건은 Risk Radar에서 추적 중입니다.
              </p>
            </div>
            <Link className="btn lg" to="/risk">
              <Icon name="radar" size={14} /> 위험 신호 보기
            </Link>
          </>
        )}
      </section>

      <div className="grid-4" style={{ marginBottom: 16 }}>
        <Kpi label="변경 파일" value={TODAY_COUNT.changed} delta="+8 어제 대비" deltaTone="pos" />
        <Kpi
          label="위험 신호"
          value={TODAY_COUNT.risk}
          valueColor="var(--status-negative)"
          delta="+2 어제 대비"
          deltaTone="neg"
        />
        <Kpi
          label="설명 부족 세션"
          value={TODAY_COUNT.unexplained}
          valueColor="var(--accent-strong)"
          delta="-1 어제 대비"
        />
        <Kpi label="팀 평균 검토 완료율" value={76} unit="%" delta="▲ 4%p" deltaTone="pos" />
      </div>

      <div className="grid-split">
        <div className="card">
          <div className="card-h">
            <h3>오늘의 Work Session 타임라인</h3>
            <span className="sub">아침 → 저녁 순</span>
          </div>
          <div className="timeline">
            {recent.map((s) => (
              <div key={s.id} className={'ev' + (s.risk ? ' risk' : s.explained ? ' ok' : '')}>
                <div className="t">
                  {s.when} · {s.tool}
                </div>
                <div className="h">{s.intent}</div>
                <div className="b">
                  {s.actor} · {s.repo} · {s.files}개 파일 / {s.cmds}개 명령
                </div>
                <div style={{ display: 'flex', gap: 6, marginTop: 6, alignItems: 'center' }}>
                  <RiskChip risk={s.risk} />
                  {s.explained ? (
                    <span className="tag green">설명 완료</span>
                  ) : (
                    <span className="tag orange">설명 부족</span>
                  )}
                  <Link className="link" to={`/sessions/${s.id}`}>
                    세부 →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="col">
          <div className="card tight">
            <div className="card-h">
              <h3>설명 부족 세션</h3>
              <span className="badge">팀 공유 전 채움</span>
            </div>
            <div className="col" style={{ gap: 8 }}>
              {unexplained.map((s) => (
                <Link
                  key={s.id}
                  to={`/sessions/${s.id}`}
                  style={{
                    textAlign: 'left',
                    border: '1px solid var(--line-soft)',
                    borderRadius: 10,
                    padding: 10,
                    background: 'var(--bg-base)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 4,
                  }}
                >
                  <div style={{ font: 'var(--t-label1-strong)', color: 'var(--text-strong)' }}>
                    {s.intent}
                  </div>
                  <div className="muted" style={{ font: 'var(--t-caption1)' }}>
                    {s.when} · {s.actor} · {s.repo}
                  </div>
                  <div>
                    <RiskChip risk={s.risk} />
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div className="card tight">
            <div className="card-h">
              <h3>내일 이어서 봐야 할 TODO</h3>
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
              {TODAY_TODO.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </div>

          <div
            className="card tight"
            style={{ background: 'var(--primary-light)', borderColor: 'transparent' }}
          >
            <div className="row between">
              <div>
                <div style={{ font: 'var(--t-label1-strong)', color: 'var(--primary-strong)' }}>
                  팀 공유 요약 한 번에 복사
                </div>
                <div
                  className="muted"
                  style={{ font: 'var(--t-caption1)', color: 'var(--primary-strong)' }}
                >
                  오늘 작업 {recent.length}개 · 위험 {recent.filter((s) => s.risk).length}건 · 설명 부족{' '}
                  {unexplained.length}건
                </div>
              </div>
              {firstUnexplainedId ? (
                <Link className="btn weak" to={`/sessions/${firstUnexplainedId}/share`}>
                  <Icon name="copy" size={14} />
                  복사 화면으로
                </Link>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

type KpiProps = {
  label: string
  value: number
  unit?: string
  valueColor?: string
  delta?: string
  deltaTone?: 'pos' | 'neg'
}

function Kpi({ label, value, unit, valueColor, delta, deltaTone }: KpiProps) {
  return (
    <div className="card tight">
      <div className="kpi">
        <div className="l">{label}</div>
        <div className="v" style={valueColor ? { color: valueColor } : undefined}>
          {value}
          {unit ? <span style={{ font: 'var(--t-heading3)' }}>{unit}</span> : null}
        </div>
        {delta ? <div className={'delta' + (deltaTone ? ' ' + deltaTone : '')}>{delta}</div> : null}
      </div>
    </div>
  )
}
