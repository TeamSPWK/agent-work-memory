export type Persona = 'Operator' | 'Reviewer' | 'Admin'
export type AvatarColor = 'blue' | 'violet' | 'green' | 'orange'

export type WsMember = {
  id: string
  role: string
  email: string
  persona: Persona
  active: boolean
  lastActive: string
  review: boolean
  initials: string
  color: AvatarColor
}

export const WS_MEMBERS: WsMember[] = [
  { id: 'u1', role: '운영 매니저 (4년차)', email: 'ops@…',  persona: 'Operator', active: true,  lastActive: '5분 전',     review: false, initials: 'OM', color: 'blue' },
  { id: 'u2', role: '마케터 (2년차)',       email: 'mkt@…', persona: 'Operator', active: true,  lastActive: '오늘 11:18', review: false, initials: 'MK', color: 'violet' },
  { id: 'u3', role: '개발 리드 (8년차)',    email: 'dev@…', persona: 'Reviewer', active: true,  lastActive: '16:25',      review: true,  initials: 'DL', color: 'green' },
  { id: 'u4', role: '프론트엔드 (3년차)',  email: 'fe@…',  persona: 'Reviewer', active: true,  lastActive: '16:10',      review: true,  initials: 'FE', color: 'orange' },
  { id: 'u5', role: 'CTO 겸직 대표',         email: 'cto@…', persona: 'Admin',    active: true,  lastActive: '방금',        review: true,  initials: 'CT', color: 'blue' },
  { id: 'u6', role: 'CFO (외주 회계)',       email: 'cfo@…', persona: 'Admin',    active: false, lastActive: '어제 11:42', review: false, initials: 'CF', color: 'violet' },
]

export const WS_MEMBERS_KPI = {
  active: 5,
  reviewers: 2,
  admins: 2,
  avgReviewMin: 14,
} as const

export type MatrixCell = 'view' | 'review' | 'approve' | 'none'

export type RiskRoleRow = {
  cat: string
  Operator: MatrixCell
  Reviewer: MatrixCell
  Admin: MatrixCell
}

export const RISK_ROLE_MATRIX: RiskRoleRow[] = [
  { cat: 'DB',                   Operator: 'view',   Reviewer: 'review', Admin: 'approve' },
  { cat: 'Secret/Env',           Operator: 'none',   Reviewer: 'review', Admin: 'approve' },
  { cat: 'Deploy/Infra',         Operator: 'view',   Reviewer: 'review', Admin: 'approve' },
  { cat: 'Destructive Cmd',      Operator: 'none',   Reviewer: 'review', Admin: 'approve' },
  { cat: 'Auth/Permission',      Operator: 'view',   Reviewer: 'review', Admin: 'approve' },
  { cat: 'Migration',            Operator: 'view',   Reviewer: 'review', Admin: 'approve' },
  { cat: 'Large Diff',           Operator: 'review', Reviewer: 'review', Admin: 'approve' },
  { cat: 'Failed Verification',  Operator: 'none',   Reviewer: 'review', Admin: 'approve' },
]
