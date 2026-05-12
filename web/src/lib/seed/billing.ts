export type PlanUsage = {
  plan: string
  price: number
  activeOps: number
  limit: number | string
  nextBillAt: string
}

/* 외부 Pricing 페이지(PUBLIC_TIERS)와 동일 SSOT.
 * 디자인 파트너 50% 적용 후 월 ₩50,000 → publicLanding.ts Team priceStrike와 일치.
 * Active Operator 정의: 지난 30일 1회 이상 AI 작업이 기록된 사용자. */
export const PLAN_USAGE: PlanUsage = {
  plan: 'Team',
  price: 100000,
  activeOps: 5,
  limit: '무제한',
  nextBillAt: '2026-06-01',
}

export type BillingPlan = {
  id: 'free' | 'team' | 'business'
  name: string
  price: number | null
  ops: number | string
  retention: string
  export: string | false
  sso: string | boolean
  current?: boolean
  featured?: boolean
}

/* 외부 PUBLIC_TIERS와 가격·이름·보존·export 정합.
 * Free 보존 7일, Team ₩100,000, Business ₩300,000. */
export const BILLING_PLANS: BillingPlan[] = [
  { id: 'free',     name: 'Free',     price: 0,      ops: 1,        retention: '7일',  export: false,             sso: false },
  { id: 'team',     name: 'Team',     price: 100000, ops: '무제한',  retention: '90일', export: 'PDF · CSV',       sso: false, current: true, featured: true },
  { id: 'business', name: 'Business', price: 300000, ops: '무제한',  retention: '5년',  export: 'PDF 양식 커스터마이즈', sso: 'SCIM' },
]

export type InvoiceState = 'issued' | 'pending'

export type Invoice = {
  month: string
  amount: string
  state: InvoiceState
  label: string
}

export const INVOICES: Invoice[] = [
  { month: '2026-04', amount: '100,000', state: 'issued', label: '발행 완료' },
  { month: '2026-03', amount: '100,000', state: 'issued', label: '발행 완료' },
  { month: '2026-02', amount: '100,000', state: 'issued', label: '발행 완료' },
]

export type PaymentMethod = {
  brand: string
  last4: string
  expires: string
  primary: boolean
}

export const PAYMENT_METHOD: PaymentMethod = {
  brand: '신한카드',
  last4: '1234',
  expires: '03/29',
  primary: true,
}

export type UsageAlert = {
  id: 'op80' | 'op100' | 'amount20'
  label: string
  defaultOn: boolean
}

export const USAGE_ALERTS: UsageAlert[] = [
  { id: 'op80',    label: 'Active OP 80% 도달',          defaultOn: true },
  { id: 'op100',   label: 'Active OP 100% 도달 (한도 초과)', defaultOn: true },
  { id: 'amount20', label: '월 청구액 ±20% 변동',           defaultOn: true },
]

export type BizInfo = {
  field: 'bizno' | 'company' | 'rep' | 'invoiceEmail'
  label: string
  value: string
}

export const BIZ_INFO: BizInfo[] = [
  { field: 'bizno',        label: '사업자등록번호', value: '000-00-00000' },
  { field: 'company',      label: '상호',           value: '(주) 워크스페이스 A' },
  { field: 'rep',          label: '대표자명',       value: '김대표' },
  { field: 'invoiceEmail', label: '발행 이메일',    value: 'finance@workspace-a.com' },
]

export type PartnerDiscount = {
  label: string
  period: string
  monthly: number
}

export const PARTNER_DISCOUNT: PartnerDiscount = {
  label: '디자인 파트너 50% 할인 적용 중 (Team)',
  period: '2026-04 ~ 2026-09 · 월 50,000원 (VAT 별도). 만료 60일 전 안내.',
  monthly: 50000,
}

export const YEARLY_DISCOUNT_RATE = 0.75 // 25% off when paid annually

export function formatPlanPrice(price: number | null, yearly: boolean) {
  if (price == null) return '협의'
  const value = yearly ? Math.round((price * YEARLY_DISCOUNT_RATE * 12) / 1000) * 1000 : price
  return value.toLocaleString('ko-KR') + '원'
}
