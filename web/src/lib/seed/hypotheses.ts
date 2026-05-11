import type { Persona } from '../../state/ui'

export type ScreenMeta = {
  id: string
  label: string
  icon: string
  pay?: boolean
}

export type HypothesisMeta = {
  id: string
  label: string
  short: string
  primaryPersona: Persona
  statement?: string
  metric?: string
  metricFrom?: string
  metricTo?: string
  pay?: boolean
  support?: boolean
  supportNote?: string
  screens: ScreenMeta[]
}

export const HYPOTHESES: HypothesisMeta[] = [
  {
    id: 'h1',
    label: 'H1 · Operator 회상 사이클',
    short: 'H1',
    primaryPersona: 'Operator',
    statement:
      'Today + Explain Back이 있으면, AI 작업자는 어제 시킨 일을 회상·기록·팀 공유까지 자율적으로 돈다.',
    metric: '미설명 세션 비율',
    metricFrom: '62%',
    metricTo: '≤ 15%',
    screens: [
      { id: 'today', label: 'Today', icon: 'home' },
      { id: 'sessions', label: 'Sessions', icon: 'list' },
      { id: 'detail', label: 'Session Detail', icon: 'file' },
      { id: 'explain', label: 'Explain Back', icon: 'pencil' },
      { id: 'share', label: '팀 공유 요약', icon: 'share' },
      { id: 'self', label: '셀프 회상 (어제)', icon: 'book' },
    ],
  },
  {
    id: 'h2',
    label: 'H2 · Compliance 결제 트리거',
    short: 'H2',
    primaryPersona: 'Admin',
    statement:
      '변조 불가 해시 + 7대 원칙 패널 + PDF export가 한 화면에 있으면, Admin은 인공지능기본법 시행 전 Pro로 결제한다.',
    metric: '결제 트리거 전환율',
    metricFrom: '—',
    metricTo: '≥ 30%',
    pay: true,
    screens: [
      { id: 'audit', label: 'Audit Trail', icon: 'audit', pay: true },
      { id: 'compliance', label: '7대 원칙 패널', icon: 'check' },
      { id: 'integrity', label: '체인 무결성 검증', icon: 'chain' },
      { id: 'pdf', label: 'PDF export 미리보기', icon: 'download' },
      { id: 'billing', label: 'Plan & Billing', icon: 'settings', pay: true },
    ],
  },
  {
    id: 'h3',
    label: 'H3 · 10분 1차 원인 도출',
    short: 'H3',
    primaryPersona: 'Reviewer',
    statement:
      'timeline + 3분리(후보·확실·불명) + cross-reference가 있으면, 사고 후 1차 원인 평균 도출 시간이 60분 → 10분이 된다.',
    metric: '1차 원인 도출 시간 (median)',
    metricFrom: '62분',
    metricTo: '≤ 10분',
    pay: true,
    screens: [
      { id: 'radar', label: 'Risk Radar', icon: 'radar' },
      { id: 'replay', label: 'Incident Replay', icon: 'incident', pay: true },
      { id: 'event', label: 'Event Detail · 3분리', icon: 'warn' },
      { id: 'reviewer', label: 'Reviewer Brief 연결', icon: 'review' },
      { id: 'note', label: 'Incident Note', icon: 'pencil' },
    ],
  },
  {
    id: 'h4',
    label: 'H4 · 5분 first-value 온보딩',
    short: 'H4',
    primaryPersona: 'Admin',
    statement:
      'AI 도구 connect → 첫 세션 import → Today 행 1개 표시가 5분 안에 끝나면, 디자인 파트너는 트라이얼 시작 후 결제 결정에 자율적으로 진입한다.',
    metric: '온보딩 완료 시간 (median)',
    metricFrom: '—',
    metricTo: '≤ 5분',
    pay: true,
    screens: [
      { id: 'ws', label: '워크스페이스 생성', icon: 'workspace' },
      { id: 'connect', label: 'AI 도구 connect', icon: 'link' },
      { id: 'import', label: '첫 세션 import', icon: 'download' },
      { id: 'reviewer', label: 'Reviewer 지정', icon: 'review' },
      { id: 'done', label: '완료 → Today', icon: 'check' },
    ],
  },
  {
    id: 'ws',
    label: 'Workspace',
    short: 'Workspace',
    primaryPersona: 'Admin',
    support: true,
    supportNote: '지원 화면 — 상시 사용 · 가설 검증 대상 아님',
    screens: [
      { id: 'members', label: 'Members', icon: 'workspace' },
      { id: 'invite', label: 'Member 초대', icon: 'share' },
      { id: 'roles', label: 'Roles & Risk 룰', icon: 'lock' },
    ],
  },
  {
    id: 'settings',
    label: 'Settings',
    short: 'Settings',
    primaryPersona: 'Admin',
    support: true,
    supportNote: '지원 화면 — 상시 사용 · 가설 검증 대상 아님',
    screens: [
      { id: 'profile', label: 'Profile & Account', icon: 'settings' },
      { id: 'integrations', label: 'Integrations', icon: 'link' },
      { id: 'notif', label: 'Notifications', icon: 'bell' },
      { id: 'export', label: 'Audit Export', icon: 'download' },
    ],
  },
]

export const PERSONAS: Persona[] = ['Operator', 'Reviewer', 'Admin']

export function findHypothesis(id: string): HypothesisMeta | undefined {
  return HYPOTHESES.find((h) => h.id === id)
}

export function findScreen(hypId: string, screenId: string): ScreenMeta | undefined {
  return findHypothesis(hypId)?.screens.find((s) => s.id === screenId)
}
