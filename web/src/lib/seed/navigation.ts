export type NavItem = {
  id: string
  label: string
  to: string
  icon: string
  match?: string
}

export const NAV_ITEMS: NavItem[] = [
  { id: 'today', label: 'Today', to: '/today', icon: 'home' },
  { id: 'sessions', label: 'Sessions', to: '/sessions', icon: 'list', match: '/sessions' },
  { id: 'audit', label: 'Audit', to: '/audit', icon: 'audit', match: '/audit' },
  { id: 'risk', label: 'Risk', to: '/risk', icon: 'radar', match: '/risk' },
  { id: 'workspace', label: 'Workspace', to: '/workspace', icon: 'workspace', match: '/workspace' },
  { id: 'settings', label: 'Settings', to: '/settings', icon: 'settings', match: '/settings' },
]

export type TabMeta = { id: string; label: string }

export const AUDIT_TABS: TabMeta[] = [
  { id: 'trail', label: 'Audit Trail' },
  { id: 'principles', label: '7대 원칙' },
  { id: 'integrity', label: '체인 무결성' },
  { id: 'pdf', label: 'PDF export' },
]

export const SESSION_DETAIL_TABS: TabMeta[] = [
  { id: 'explain', label: 'Explain Back' },
  { id: 'share', label: '팀 공유 요약' },
  { id: 'self', label: '셀프 회상' },
]

export const INCIDENT_TABS: TabMeta[] = [
  { id: 'replay', label: 'Replay' },
  { id: 'event', label: 'Event Detail · 3분리' },
  { id: 'reviewer', label: 'Reviewer Brief' },
  { id: 'note', label: 'Incident Note' },
]

export const WORKSPACE_TABS: TabMeta[] = [
  { id: 'members', label: 'Members' },
  { id: 'invite', label: 'Member 초대' },
  { id: 'roles', label: 'Roles & Risk 룰' },
]

export const SETTINGS_TABS: TabMeta[] = [
  { id: 'profile', label: 'Profile & Account' },
  { id: 'integrations', label: 'Integrations' },
  { id: 'notif', label: 'Notifications' },
  { id: 'export', label: 'Audit Export' },
  { id: 'billing', label: 'Plan & Billing' },
]

export type OnboardingStep = { id: string; label: string }

export const ONBOARDING_STEPS: OnboardingStep[] = [
  { id: 'ws', label: '워크스페이스 생성' },
  { id: 'connect', label: 'AI 도구 connect' },
  { id: 'import', label: '첫 세션 import' },
  { id: 'reviewer', label: 'Reviewer 지정' },
  { id: 'done', label: '완료 → Today' },
]
