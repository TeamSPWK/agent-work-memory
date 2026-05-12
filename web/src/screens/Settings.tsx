import { useSearchParams } from 'react-router-dom'
import { SETTINGS_TABS } from '../lib/seed/navigation'
import { Profile } from './settings/Profile'
import { Integrations } from './settings/Integrations'
import { Notifications } from './settings/Notifications'
import { AuditExport } from './settings/AuditExport'
import { Billing } from './settings/Billing'

const TAB_IDS = SETTINGS_TABS.map((t) => t.id)

type TabId = 'profile' | 'integrations' | 'notif' | 'export' | 'billing'

const HEADERS: Record<TabId, { eyebrow: string; title: string; sub: string }> = {
  profile: {
    eyebrow: 'Settings · Profile',
    title: 'Profile & Account',
    sub: '본인 계정 · 알림 · 데이터 다운로드 · 계정 삭제.',
  },
  integrations: {
    eyebrow: 'Settings · Integrations',
    title: 'Integrations',
    sub: 'AI 도구 4종 + GitHub · Slack · 채널톡 + 예정 통합.',
  },
  notif: {
    eyebrow: 'Settings · Notifications',
    title: 'Notifications',
    sub: '이벤트 × 채널 룰. 무음 시간대로 1인 운영 sustainability 확보.',
  },
  export: {
    eyebrow: 'Settings · Audit Export',
    title: 'Audit Export 설정',
    sub: '양식 · 보존 기간 · 해시 · 자동 export 일정.',
  },
  billing: {
    eyebrow: '진입 시점 · 컴플라이언스 패널 → 업그레이드',
    title: 'Plan & Billing',
    sub: 'per-active-Operator 가격. VAT 10% 별도, 연결제 25% 할인. 한국 B2B 세금계산서 자동 발행.',
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

      <div className="seg" role="tablist" aria-label="Settings 탭" style={{ marginBottom: 16 }}>
        {SETTINGS_TABS.map((t) => (
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

      {tab === 'profile' && <Profile />}
      {tab === 'integrations' && <Integrations />}
      {tab === 'notif' && <Notifications />}
      {tab === 'export' && <AuditExport />}
      {tab === 'billing' && <Billing />}
    </>
  )
}
