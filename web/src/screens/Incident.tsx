import { useParams, useSearchParams } from 'react-router-dom'
import { INCIDENT_TABS } from '../lib/seed/navigation'
import { INCIDENT } from '../lib/seed/incident'
import { Icon } from '../components/Icon'
import { tabKeyHandler } from '../lib/useTabKeyboard'
import { Replay } from './incident/Replay'
import { Note } from './incident/Note'
import { EventDetail } from './incident/EventDetail'
import { ReviewerBrief } from './incident/ReviewerBrief'

const TAB_IDS = INCIDENT_TABS.map((t) => t.id)

type TabId = 'replay' | 'event' | 'reviewer' | 'note'

const HEADERS: Record<TabId, { eyebrow: string; title: string; sub: string }> = {
  replay: {
    eyebrow: `진입 시점 · prod 사고 직후 · ${INCIDENT.id}`,
    title: INCIDENT.title,
    sub: '가로축 시간(분), 세로축 카테고리. 클릭 시 우측 상세. 원인 단정 X — 후보·확실·불명 분리.',
  },
  event: {
    eyebrow: '사건 마커 · prod 인덱스 마이그레이션 (16:25)',
    title: '이 이벤트가 사고 원인일 가능성',
    sub: '3분리(후보·확실·불명) + 근거 자료 + 사람이 분류 변경하는 화면.',
  },
  reviewer: {
    eyebrow: '진입 시점 · 사고 재생 → 의도/결과 비교',
    title: '검토 요약 — s-024',
    sub: 'Operator의 *의도* vs 실제 *결과*를 좌우로 본다. 부수 변경이 있는지 즉시 확인.',
  },
  note: {
    eyebrow: `사고 누적 메모 · ${INCIDENT.id}`,
    title: '사고 메모',
    sub: '조사 진행을 누적 작성. 각 메모는 자동 시각 기록 + 변조 불가 감사 기록 행이 됩니다.',
  },
}

export function Incident() {
  const { id = '' } = useParams<{ id?: string }>()
  const [params, setParams] = useSearchParams()
  const raw = params.get('tab') ?? 'replay'
  const tab: TabId = (TAB_IDS.includes(raw) ? raw : 'replay') as TabId
  const head = HEADERS[tab]
  const isMockIncident = id !== INCIDENT.id

  const setTab = (next: TabId) => {
    if (next === 'replay') setParams({}, { replace: true })
    else setParams({ tab: next }, { replace: true })
  }

  return (
    <>
      <div className="page-h">
        <div>
          <div className="eyebrow">{head.eyebrow}</div>
          <h1>{head.title}</h1>
          <p>{head.sub}</p>
        </div>
        <div className="actions">
          {tab === 'replay' && (
            <>
              <span className="timer-chip" aria-label="사고 경과">
                <span className="pulse" /> {INCIDENT.elapsedMin}:00 경과
              </span>
              <button className="btn" type="button" onClick={() => setTab('note')}>
                <Icon name="pencil" size={14} />
                사고 메모
              </button>
            </>
          )}
          {tab === 'note' && (
            <>
              <button className="btn" type="button" onClick={() => setTab('replay')}>
                ← 재생
              </button>
              <button className="btn" type="button">
                <Icon name="share" size={14} />
                Slack 공유
              </button>
              <button className="btn primary" type="button">
                <Icon name="download" size={14} />
                사후 분석 양식
              </button>
            </>
          )}
          {tab === 'event' && (
            <>
              <button className="btn" type="button" onClick={() => setTab('replay')}>
                ← 재생
              </button>
              <button className="btn primary" type="button" onClick={() => setTab('reviewer')}>
                의도/결과 비교 →
              </button>
            </>
          )}
          {tab === 'reviewer' && (
            <button className="btn" type="button" onClick={() => setTab('event')}>
              ← 이벤트 상세
            </button>
          )}
        </div>
      </div>

      {isMockIncident && (
        <div
          className="card tight"
          role="status"
          aria-label="mock incident 안내"
          style={{
            marginBottom: 16,
            background: 'var(--c-orange-95)',
            borderColor: 'transparent',
            color: 'var(--c-orange-30)',
          }}
        >
          ⓘ 데모 mock 한계 — 이 incident(<code>{id}</code>)의 데이터는 채워지지 않았습니다.
          아래는 참고용으로 <code>{INCIDENT.id}</code>의 데이터를 표시합니다.
        </div>
      )}

      <div className="seg" role="tablist" aria-label="Incident 탭" style={{ marginBottom: 16 }}>
        {INCIDENT_TABS.map((t) => (
          <button
            key={t.id}
            id={`incident-tab-${t.id}`}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            aria-controls={`incident-panel-${t.id}`}
            tabIndex={tab === t.id ? 0 : -1}
            className={tab === t.id ? 'active' : ''}
            onClick={() => setTab(t.id as TabId)}
            onKeyDown={tabKeyHandler(
              INCIDENT_TABS.map((x) => x.id) as TabId[],
              tab,
              setTab,
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div
        role="tabpanel"
        id={`incident-panel-${tab}`}
        aria-labelledby={`incident-tab-${tab}`}
        tabIndex={0}
      >
        {tab === 'replay' && <Replay />}
        {tab === 'note' && <Note />}
        {tab === 'event' && <EventDetail />}
        {tab === 'reviewer' && <ReviewerBrief />}
      </div>
    </>
  )
}
