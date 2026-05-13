import { Link } from 'react-router-dom'
import { SESSIONS } from '../lib/seed/sessions'
import { Icon } from '../components/Icon'
import { RiskChip } from '../components/RiskChip'
import { useIngest } from '../lib/useIngest'
import { TodayHeroSkeleton, KpiGridSkeleton, TableRowsSkeleton } from '../components/Skeleton'
import { useT } from '../lib/i18n'

const TODAY_COUNT = { changed: 22, risk: 4, unexplained: 3 }

const TODAY_TODO = [
  'prod 인덱스 적용 후 응답시간 모니터링 (개발 리드)',
  'Notion 동기화 키 노출 확인 (운영 매니저)',
  '결제 재시도 UI 검토 요약 확인 (개발 리드)',
]

export function Today() {
  const t = useT()
  const ingest = useIngest()
  // 목업→실데이터 flash 차단: loading 중에는 base 비움.
  // 실 데이터 있으면 우선, 없을 때만 seed fallback.
  const isLive = !ingest.loading && ingest.sessions.length > 0
  const showSeed = !ingest.loading && !isLive
  const base = isLive ? ingest.sessions : showSeed ? SESSIONS : []
  // `ingest --limit 30` 응답은 *최근 30* 세션이라 startedAt에 날짜 정보가 없다.
  // 실 데이터일 땐 hero 카피의 "오늘"이 정확히 *오늘만* 의미하지 않는다 — M0/S2 측정 후 카피 정정.
  const recent = base.filter((s) => s.when.startsWith('오늘') || isLive)
  const unexplained = base.filter((s) => !s.explained)
  const firstUnexplainedId = unexplained[0]?.id ?? recent[0]?.id

  return (
    <>
      <div className="page-h">
        <div>
          <div className="eyebrow">{t('today.eyebrow')}</div>
          <h1>{t('today.title')}</h1>
          <p>{t('today.sub')}</p>
        </div>
        <div className="actions">
          <button className="btn" type="button">
            <Icon name="cal" size={14} />
            오늘 · 5월 13일
          </button>
          {firstUnexplainedId ? (
            <Link className="btn primary" to={`/sessions/${firstUnexplainedId}/explain`}>
              <Icon name="pencil" size={14} />
              {t('common.fillExplain')} ({unexplained.length})
            </Link>
          ) : (
            <button className="btn primary" type="button" disabled>
              <Icon name="pencil" size={14} />
              {t('common.fillExplain')} (0)
            </button>
          )}
        </div>
      </div>

      {ingest.loading ? (
        <>
          <TodayHeroSkeleton />
          <KpiGridSkeleton />
          <div className="grid-split">
            <div className="card">
              <TableRowsSkeleton rows={5} cols={3} />
            </div>
            <div className="col">
              <div className="card tight">
                <TableRowsSkeleton rows={3} cols={2} />
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
      {/* Hero — 오늘 가장 시급한 단일 action */}
      <section
        className="today-hero"
        aria-label="오늘 우선 작업"
        style={{ marginBottom: 16 }}
      >
        {unexplained.length > 0 && firstUnexplainedId ? (
          <>
            <div>
              <div className="eyebrow">{t('today.hero.eyebrow.todo')}</div>
              <h2 className="today-hero-h">
                오늘 작업 {recent.length}건 중{' '}
                <span style={{ color: 'var(--accent-strong)' }}>
                  {unexplained.length}건
                </span>
                이 아직 설명되지 않았어요.
              </h2>
              <p className="today-hero-sub">{t('today.hero.sub.todo')}</p>
            </div>
            <Link
              className="btn primary lg"
              to={`/sessions/${firstUnexplainedId}/explain`}
            >
              <Icon name="pencil" size={14} /> {t('common.fillExplain.first')}
            </Link>
          </>
        ) : (
          <>
            <div>
              <div className="eyebrow">{t('today.hero.eyebrow.done')}</div>
              <h2 className="today-hero-h">
                {t('today.hero.title.done', { total: recent.length })}
              </h2>
              <p className="today-hero-sub">
                {t('today.hero.sub.done', { risk: TODAY_COUNT.risk })}
              </p>
            </div>
            <Link className="btn lg" to="/risk">
              <Icon name="radar" size={14} /> {t('common.viewRisk')}
            </Link>
          </>
        )}
      </section>

      <div className="grid-4" style={{ marginBottom: 16 }}>
        <Kpi label={t('today.kpi.changed')} value={TODAY_COUNT.changed} delta="+8 어제 대비" deltaTone="pos" />
        <Kpi
          label={t('today.kpi.risk')}
          value={TODAY_COUNT.risk}
          valueColor="var(--status-negative)"
          delta="+2 어제 대비"
          deltaTone="neg"
        />
        <Kpi
          label={t('today.kpi.unexplained')}
          value={TODAY_COUNT.unexplained}
          valueColor="var(--accent-strong)"
          delta="-1 어제 대비"
        />
        <Kpi label={t('today.kpi.reviewRate')} value={76} unit="%" delta="▲ 4%p" deltaTone="pos" />
      </div>

      <div className="grid-split">
        <div className="card">
          <div className="card-h">
            <h3>{t('today.section.timeline')}</h3>
            <span className="sub">{t('today.section.timelineSub')}</span>
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
              <h3>{t('today.section.unexplained')}</h3>
              <span className="badge">{t('today.section.unexplainedHint')}</span>
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
              <h3>{t('today.section.tomorrow')}</h3>
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
              {TODAY_TODO.map((todo) => (
                <li key={todo}>{todo}</li>
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
      )}
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
