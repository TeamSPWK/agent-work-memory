import type { MessageKey } from '../i18n'

/* 라벨은 i18nKey로 분리. 컴포넌트가 useT()로 변환.
 * label은 i18n catalog 누락 시 fallback + 테스트 가독성용으로만 남긴다 (한국어 default). */

export type NavItem = {
  id: string
  label: string
  i18nKey: MessageKey
  to: string
  icon: string
  match?: string
  /** true면 로컬 실행환경(localhost/127.0.0.1/0.0.0.0)에서만 사이드바에 노출. 운영 배포 시 숨김. */
  devOnly?: boolean
}

export const NAV_ITEMS: NavItem[] = [
  { id: 'today', label: '오늘', i18nKey: 'nav.today', to: '/today', icon: 'home' },
  { id: 'sessions', label: '작업 세션', i18nKey: 'nav.sessions', to: '/sessions', icon: 'list', match: '/sessions' },
  { id: 'audit', label: '감사 기록', i18nKey: 'nav.audit', to: '/audit', icon: 'audit', match: '/audit' },
  { id: 'risk', label: '위험 추적', i18nKey: 'nav.risk', to: '/risk', icon: 'radar', match: '/risk' },
  { id: 'workspace', label: '팀', i18nKey: 'nav.workspace', to: '/workspace', icon: 'workspace', match: '/workspace' },
  { id: 'settings', label: '설정', i18nKey: 'nav.settings', to: '/settings', icon: 'settings', match: '/settings' },
  { id: 'dev', label: '개발 상태', i18nKey: 'nav.dev', to: '/dev/status', icon: 'gear', match: '/dev', devOnly: true },
]

export type TabMeta = { id: string; label: string }

export const AUDIT_TABS: TabMeta[] = [
  { id: 'trail', label: '감사 기록' },
  { id: 'principles', label: '7대 원칙' },
  { id: 'integrity', label: '기록 변조 검증' },
  { id: 'pdf', label: 'PDF 내보내기' },
]

export const SESSION_DETAIL_TABS: TabMeta[] = [
  { id: 'explain', label: '설명 메모' },
  { id: 'share', label: '팀 공유 요약' },
  { id: 'self', label: '내가 시킨 일 다시보기' },
]

export const INCIDENT_TABS: TabMeta[] = [
  { id: 'replay', label: '재생' },
  { id: 'event', label: '이벤트 상세' },
  { id: 'reviewer', label: '검토 요약' },
  { id: 'note', label: '사고 노트' },
]

export const WORKSPACE_TABS: TabMeta[] = [
  { id: 'members', label: '구성원' },
  { id: 'invite', label: '초대' },
  { id: 'roles', label: '역할 · 위험 규칙' },
]

export const SETTINGS_TABS: TabMeta[] = [
  { id: 'profile', label: '프로필 · 계정' },
  { id: 'integrations', label: '연동' },
  { id: 'notif', label: '알림' },
  { id: 'export', label: '감사 자료 내보내기' },
  { id: 'billing', label: '요금제 · 결제' },
]

export type OnboardingStep = { id: string; label: string }

export const ONBOARDING_STEPS: OnboardingStep[] = [
  { id: 'ws', label: '팀 만들기' },
  { id: 'connect', label: 'AI 도구 연결' },
  { id: 'import', label: '첫 세션 가져오기' },
  { id: 'reviewer', label: '검토자 지정' },
  { id: 'done', label: '완료 → 오늘' },
]
