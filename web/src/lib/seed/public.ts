export type PublicPageId =
  | 'landing'
  | 'pricing'
  | 'signup'
  | 'login'
  | 'reset'
  | 'terms'
  | 'privacy'
  | 'refund'
  | 'business'
  | 'company'
  | 'status'
  | 'err404'
  | 'err500'
  | 'maint'

export type PublicNavLink = {
  id: PublicPageId
  label: string
  to: string
}

export const PUBLIC_TOP_NAV: PublicNavLink[] = [
  { id: 'landing', label: '제품',   to: '/landing' },
  { id: 'pricing', label: '가격',   to: '/pricing' },
  { id: 'company', label: '회사',   to: '/company' },
  { id: 'status',  label: '상태',   to: '/status' },
]

export type PublicHyp = {
  statement: string
  metric: string
  metricFrom: string
  metricTo: string
}

export const PUBLIC_HYPS: Partial<Record<PublicPageId, PublicHyp>> = {
  landing: {
    statement: '30초 안에 핵심 가치 + CTA 클릭이 발생하면, 디자인 파트너 인터뷰 신청률 ≥ 5%.',
    metric: 'Hero scroll-depth · CTA 클릭율',
    metricFrom: '—',
    metricTo: '≥ 5%',
  },
  pricing: {
    statement: '티어 + Active Operator 정의 + 디자인 파트너 50% chip이 한 화면에 있으면, 트라이얼 시작률 ≥ 15%.',
    metric: '트라이얼 시작률',
    metricFrom: '—',
    metricTo: '≥ 15%',
  },
  signup: {
    statement: '이메일 + Google OAuth + 한국어 카피로, 가입 → H4 화면 1 도달까지 ≤ 90초.',
    metric: '가입 → H4-1 도달 시간 (median)',
    metricFrom: '—',
    metricTo: '≤ 90초',
  },
}

export type PublicBiz = {
  company: string
  ceo: string
  email: string
  channel: string
  bizNo: string
  ecommNo: string
  address: string
  data: string
  updated: string
}

const env = (typeof import.meta !== 'undefined' ? import.meta.env : {}) as Record<
  string,
  string | undefined
>

export const PUBLIC_BIZ: PublicBiz = {
  company: 'Spacewalk',
  ceo: 'jay',
  email: 'jay@spacewalk.tech',
  channel: '채널톡 (영업시간 응답)',
  bizNo: env.VITE_BIZ_NO ?? '',
  ecommNo: env.VITE_ECOMM_NO ?? '',
  address: env.VITE_BIZ_ADDR ?? '',
  data: 'Supabase Tokyo · 5년 보존 (인공지능기본법 §27 권고)',
  updated: '2026-05-12',
}

export function bizNoOrPlaceholder(): string {
  return PUBLIC_BIZ.bizNo || '[사업자 등록 후 입력]'
}

export function ecommNoOrPlaceholder(): string {
  return PUBLIC_BIZ.ecommNo || '[신고 후 입력]'
}

export type PublicRouteMeta = {
  id: PublicPageId
  path: string
  label: string
  noindex: boolean
}

export const PUBLIC_ROUTES: PublicRouteMeta[] = [
  { id: 'landing',  path: '/landing',         label: '랜딩',                  noindex: false },
  { id: 'pricing',  path: '/pricing',         label: '가격',                  noindex: false },
  { id: 'signup',   path: '/signup',          label: '회원가입',              noindex: true },
  { id: 'login',    path: '/login',           label: '로그인',                noindex: true },
  { id: 'reset',    path: '/reset',           label: '비밀번호 재설정',       noindex: true },
  { id: 'terms',    path: '/legal/terms',     label: '이용약관',              noindex: true },
  { id: 'privacy',  path: '/legal/privacy',   label: '개인정보처리방침',      noindex: true },
  { id: 'refund',   path: '/legal/refund',    label: '환불 정책',             noindex: true },
  { id: 'business', path: '/legal/business',  label: '사업자 정보',           noindex: true },
  { id: 'company',  path: '/company',         label: '회사',                  noindex: false },
  { id: 'status',   path: '/status',          label: '상태 페이지',           noindex: false },
  { id: 'err404',   path: '/404',             label: '404 — 페이지 없음',     noindex: true },
  { id: 'err500',   path: '/500',             label: '500 — 서버 오류',       noindex: true },
  { id: 'maint',    path: '/maintenance',     label: '유지보수',              noindex: true },
]
