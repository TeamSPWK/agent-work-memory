import { useSearchParams } from 'react-router-dom'
import { SETTINGS_TABS } from '../lib/seed/navigation'
import { tabKeyHandler } from '../lib/useTabKeyboard'
import { Profile } from './settings/Profile'
import { Integrations } from './settings/Integrations'
import { Notifications } from './settings/Notifications'
import { AuditExport } from './settings/AuditExport'
import { Billing } from './settings/Billing'

const TAB_IDS = SETTINGS_TABS.map((t) => t.id)

type TabId = 'profile' | 'integrations' | 'notif' | 'export' | 'billing'

const HEADERS: Record<TabId, { eyebrow: string; title: string; sub: string }> = {
  profile: {
    eyebrow: '설정 · 계정',
    title: '프로필 · 계정',
    sub: '본인 계정 · 알림 · 데이터 다운로드 · 계정 삭제.',
  },
  integrations: {
    eyebrow: '설정 · 연동',
    title: '연동',
    sub: 'AI 도구 4종 + GitHub · Slack · 채널톡 + 추가 예정 연동.',
  },
  notif: {
    eyebrow: '설정 · 알림',
    title: '알림',
    sub: '이벤트 × 채널 규칙. 무음 시간대로 알림 부담을 조절합니다.',
  },
  export: {
    eyebrow: '설정 · 감사 자료 내보내기',
    title: '감사 자료 내보내기 설정',
    sub: '양식 · 보존 기간 · 해시 · 자동 내보내기 일정.',
  },
  billing: {
    eyebrow: '설정 · 요금제',
    title: '요금제 · 결제',
    sub: '활성 사용자 단위 가격. VAT 10% 별도, 연결제 25% 할인. 한국 B2B 세금계산서 자동 발행.',
  },
}

export function Settings() {
  const [params, setParams] = useSearchParams()
  const raw = params.get('tab') ?? 'profile'
  const tab: TabId = (TAB_IDS.includes(raw) ? raw : 'profile') as TabId
  const head = HEADERS[tab]

  const setTab = (id: TabId) => {
    if (id === 'profile') setParams({}, { replace: true })
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
      </div>

      <div className="seg" role="tablist" aria-label="설정 탭" style={{ marginBottom: 16 }}>
        {SETTINGS_TABS.map((t) => (
          <button
            key={t.id}
            id={`settings-tab-${t.id}`}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            aria-controls={`settings-panel-${t.id}`}
            tabIndex={tab === t.id ? 0 : -1}
            className={tab === t.id ? 'active' : ''}
            onClick={() => setTab(t.id as TabId)}
            onKeyDown={tabKeyHandler(
              SETTINGS_TABS.map((x) => x.id) as TabId[],
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
        id={`settings-panel-${tab}`}
        aria-labelledby={`settings-tab-${tab}`}
        tabIndex={0}
      >
        {tab === 'profile' && <Profile />}
        {tab === 'integrations' && <Integrations />}
        {tab === 'notif' && <Notifications />}
        {tab === 'export' && <AuditExport />}
        {tab === 'billing' && <Billing />}
      </div>
    </>
  )
}
