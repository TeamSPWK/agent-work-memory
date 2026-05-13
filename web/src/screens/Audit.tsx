import { useSearchParams } from 'react-router-dom'
import { AUDIT_TABS } from '../lib/seed/navigation'
import { Icon } from '../components/Icon'
import { tabKeyHandler } from '../lib/useTabKeyboard'
import { AuditTrail } from './audit/AuditTrail'
import { Principles } from './audit/Principles'
import { Integrity } from './audit/Integrity'
import { PdfPreview } from './audit/PdfPreview'

const TAB_IDS = AUDIT_TABS.map((t) => t.id)

type TabId = 'trail' | 'principles' | 'integrity' | 'pdf'

const HEADERS: Record<TabId, { eyebrow: string; title: string; sub: string }> = {
  trail: {
    eyebrow: '분기 감사 · 인공지능기본법 점검',
    title: '감사 기록',
    sub: '모든 AI 변경의 변조 불가 시간순 로그. 회계감사·법무 검토 가능 양식으로 내보낼 수 있습니다.',
  },
  principles: {
    eyebrow: '인공지능기본법 · 2026-01-22 시행',
    title: '7대 원칙 적용 상태',
    sub: '이 팀의 운영 정책이 7대 원칙별로 어떻게 충족되는지 한 화면에서 확인합니다.',
  },
  integrity: {
    eyebrow: '변조 불가성 검증',
    title: '기록 변조 검증',
    sub: '각 기록의 변조 방지 서명이 이전 기록과 정확히 연결되는지 확인합니다. 깨진 구간을 시각으로 표시합니다.',
  },
  pdf: {
    eyebrow: '감사 자료 내보내기 · 1-pager',
    title: 'PDF 내보내기 미리보기',
    sub: '회계감사·법무 검토 가능 양식. 한국어 헤더, 회사 정보, 통계, 이벤트 표, 변조 검증 결과.',
  },
}

export function Audit() {
  const [params, setParams] = useSearchParams()
  const raw = params.get('tab') ?? 'trail'
  const tab: TabId = (TAB_IDS.includes(raw) ? raw : 'trail') as TabId
  const head = HEADERS[tab]

  const setTab = (id: TabId) => {
    if (id === 'trail') setParams({}, { replace: true })
    else setParams({ tab: id }, { replace: true })
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
          {tab === 'trail' && (
            <>
              <button className="btn" type="button">
                <Icon name="filter" size={14} />
                필터
              </button>
              <button className="btn" type="button" onClick={() => setTab('integrity')}>
                <Icon name="chain" size={14} />
                기록 변조 검증
              </button>
              <button className="btn primary" type="button" onClick={() => setTab('pdf')}>
                <Icon name="download" size={14} />
                PDF로 내보내기
              </button>
            </>
          )}
          {tab === 'principles' && (
            <>
              <button className="btn" type="button" onClick={() => setTab('trail')}>
                ← 감사 기록
              </button>
              <button className="btn primary" type="button" onClick={() => setTab('pdf')}>
                <Icon name="download" size={14} />
                감사 자료 PDF
              </button>
            </>
          )}
          {tab === 'integrity' && (
            <>
              <button className="btn" type="button" onClick={() => setTab('trail')}>
                ← 감사 기록
              </button>
              <button className="btn primary" type="button">
                <Icon name="play" size={14} />
                다시 검증
              </button>
            </>
          )}
          {tab === 'pdf' && (
            <>
              <button className="btn" type="button" onClick={() => setTab('principles')}>
                ← 컴플라이언스
              </button>
              <button className="btn" type="button">
                CSV로
              </button>
              <button className="btn primary" type="button">
                <Icon name="download" size={14} />
                PDF 다운로드
              </button>
            </>
          )}
        </div>
      </div>

      <div className="seg" role="tablist" aria-label="감사 기록 탭" style={{ marginBottom: 16 }}>
        {AUDIT_TABS.map((t) => (
          <button
            key={t.id}
            id={`audit-tab-${t.id}`}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            aria-controls={`audit-panel-${t.id}`}
            tabIndex={tab === t.id ? 0 : -1}
            className={tab === t.id ? 'active' : ''}
            onClick={() => setTab(t.id as TabId)}
            onKeyDown={tabKeyHandler(
              AUDIT_TABS.map((x) => x.id) as TabId[],
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
        id={`audit-panel-${tab}`}
        aria-labelledby={`audit-tab-${tab}`}
        tabIndex={0}
      >
        {tab === 'trail' && <AuditTrail />}
        {tab === 'principles' && <Principles />}
        {tab === 'integrity' && <Integrity />}
        {tab === 'pdf' && <PdfPreview />}
      </div>
    </>
  )
}
