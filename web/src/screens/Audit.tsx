import { useSearchParams } from 'react-router-dom'
import { AUDIT_TABS } from '../lib/seed/navigation'
import { Icon } from '../components/Icon'
import { AuditTrail } from './audit/AuditTrail'
import { Principles } from './audit/Principles'
import { Integrity } from './audit/Integrity'
import { PdfPreview } from './audit/PdfPreview'

const TAB_IDS = AUDIT_TABS.map((t) => t.id)

type TabId = 'trail' | 'principles' | 'integrity' | 'pdf'

const HEADERS: Record<TabId, { eyebrow: string; title: string; sub: string }> = {
  trail: {
    eyebrow: '진입 시점 · 분기 감사 · 인공지능기본법 점검',
    title: 'Audit Trail',
    sub: '모든 AI 변경의 변조 불가 시간순 로그. 회계감사·법무 검토 가능 양식으로 export.',
  },
  principles: {
    eyebrow: '인공지능기본법 · 2026-01-22 시행',
    title: '7대 원칙 적용 상태',
    sub: '이 워크스페이스의 운영 정책이 7대 원칙별로 어떻게 충족되는지 한 화면에서 확인합니다.',
  },
  integrity: {
    eyebrow: '변조 불가성 검증',
    title: '체인 무결성 결과',
    sub: '각 row의 SHA-256 해시 + 직전 hash chain 연결. 깨진 구간을 시각으로 표시합니다.',
  },
  pdf: {
    eyebrow: '감사 자료 export · 1-pager',
    title: 'PDF export 미리보기',
    sub: '회계감사·법무 검토 가능 양식. 한국어 헤더, 회사 정보, 통계, 이벤트 표, 체인 검증 결과.',
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
                체인 검증
              </button>
              <button className="btn primary" type="button" onClick={() => setTab('pdf')}>
                <Icon name="download" size={14} />
                PDF export
              </button>
            </>
          )}
          {tab === 'principles' && (
            <>
              <button className="btn" type="button" onClick={() => setTab('trail')}>
                ← Audit Trail
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
                ← Audit Trail
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

      <div className="seg" role="tablist" aria-label="Audit 탭" style={{ marginBottom: 16 }}>
        {AUDIT_TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            className={tab === t.id ? 'active' : ''}
            onClick={() => setTab(t.id as TabId)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'trail' && <AuditTrail />}
      {tab === 'principles' && <Principles />}
      {tab === 'integrity' && <Integrity />}
      {tab === 'pdf' && <PdfPreview />}
    </>
  )
}
