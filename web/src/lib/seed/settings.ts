export type NotifChannel = 'email' | 'slack' | 'channeltalk' | 'inapp'

export const NOTIF_CHANNELS: { id: NotifChannel; label: string }[] = [
  { id: 'email', label: '이메일' },
  { id: 'slack', label: 'Slack' },
  { id: 'channeltalk', label: '채널톡' },
  { id: 'inapp', label: '인앱' },
]

export type NotifRule = {
  event: string
} & Record<NotifChannel, boolean>

export const NOTIF_RULES: NotifRule[] = [
  { event: '고위험 신호 (DB · Secret · Destructive)', email: true,  slack: true,  channeltalk: false, inapp: true },
  { event: '미설명 세션 (24h)',                        email: false, slack: true,  channeltalk: false, inapp: true },
  { event: '기록 변조 검증 깨짐',                       email: true,  slack: true,  channeltalk: true,  inapp: true },
  { event: 'Reviewer 응답 지연 (30분+)',                email: false, slack: true,  channeltalk: false, inapp: true },
  { event: '비용 한도 임박 (Active Op 80%)',            email: true,  slack: false, channeltalk: false, inapp: true },
]

export type ExportState = 'ok' | 'warn'

export type RecentExport = {
  id: string
  at: string
  form: string
  pages: number
  state: ExportState
}

export const RECENT_EXPORTS: RecentExport[] = [
  { id: 'ex-2024Q4', at: '2026-04-01', form: '인공지능기본법 7대 원칙', pages: 38, state: 'ok' },
  { id: 'ex-2024Q3', at: '2026-01-01', form: '인공지능기본법 7대 원칙', pages: 36, state: 'ok' },
  { id: 'ex-2024Q2', at: '2025-10-01', form: '분기 감사 양식',          pages: 24, state: 'ok' },
  { id: 'ex-2024Q1', at: '2025-07-01', form: '분기 감사 양식',          pages: 22, state: 'warn' },
  { id: 'ex-月3',    at: '2025-06-01', form: '월 export',                pages: 12, state: 'ok' },
]

export type NotifChannelToggle = {
  name: string
  value: string
  on: boolean
}

export const PROFILE_CHANNELS: NotifChannelToggle[] = [
  { name: '이메일', value: 'cto@…', on: true },
  { name: 'Slack',  value: '@cto',  on: true },
  { name: '채널톡', value: '미연결', on: false },
]

export type ExternalIntegration = {
  id: 'github' | 'slack' | 'channeltalk'
  label: string
  initial: string
  bg: string
  desc: string
  state: 'connected' | 'idle'
  action: string
}

export const EXTERNAL_INTEGRATIONS: ExternalIntegration[] = [
  {
    id: 'github',
    label: 'GitHub',
    initial: 'G',
    bg: '#0d1117',
    desc: 'repo 4개 매핑 · web-app · ops-handbook · marketing-site · infra',
    state: 'connected',
    action: 'repo 선택',
  },
  {
    id: 'slack',
    label: 'Slack',
    initial: 'S',
    bg: '#611f69',
    desc: '워크스페이스 1개 · #eng-ai #ops-daily 매핑',
    state: 'connected',
    action: '채널 매핑',
  },
  {
    id: 'channeltalk',
    label: '채널톡',
    initial: 'C',
    bg: 'var(--accent-normal)',
    desc: '고객 문의 채널 알림용',
    state: 'idle',
    action: '연결',
  },
]

export type ExportForm = {
  id: 'principles' | 'quarterly' | 'custom'
  name: string
  desc: string
  defaultOn: boolean
}

export const EXPORT_FORMS: ExportForm[] = [
  {
    id: 'principles',
    name: '인공지능기본법 7대 원칙 양식',
    desc: '거버넌스 · 보조수단성 · 보안성 · 책임성 · 투명성 · 공정성 · 안전성. 시행 시점 기본값.',
    defaultOn: true,
  },
  {
    id: 'quarterly',
    name: '분기 감사 양식',
    desc: '변경 · 승인 비율 · Reviewer 응답 시간 통계 중심. 외부 감사 제출용.',
    defaultOn: false,
  },
  {
    id: 'custom',
    name: '커스텀',
    desc: '섹션을 직접 골라 조합. 회사 내부 규정용.',
    defaultOn: false,
  },
]

export type RetentionOption = {
  id: '5y' | '7y' | '10y' | 'forever'
  label: string
  cost: string
  defaultOn: boolean
}

export const RETENTION_OPTIONS: RetentionOption[] = [
  { id: '5y',      label: '5년 · 법정 권고', cost: '포함',             defaultOn: true  },
  { id: '7y',      label: '7년',              cost: '+₩40,000 / mo',  defaultOn: false },
  { id: '10y',     label: '10년',             cost: '+₩80,000 / mo',  defaultOn: false },
  { id: 'forever', label: '영구',             cost: '+₩140,000 / mo', defaultOn: false },
]

export type ScheduleOption = { id: 'quarter' | 'month' | 'off'; label: string; defaultOn: boolean }

export const SCHEDULE_OPTIONS: ScheduleOption[] = [
  { id: 'quarter', label: '분기', defaultOn: true },
  { id: 'month',   label: '월',   defaultOn: false },
  { id: 'off',     label: 'off',  defaultOn: false },
]
