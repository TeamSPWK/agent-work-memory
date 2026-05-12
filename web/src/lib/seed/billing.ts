export type PlanUsage = {
  plan: string
  price: number
  activeOps: number
  limit: number
  nextBillAt: string
}

export const PLAN_USAGE: PlanUsage = {
  plan: 'Starter',
  price: 100000,
  activeOps: 5,
  limit: 5,
  nextBillAt: '2026-06-01',
}

export type BillingPlan = {
  id: 'free' | 'starter' | 'team' | 'pro' | 'ent'
  name: string
  price: number | null
  ops: number | string
  retention: string
  export: string | false
  sso: string | boolean
  current?: boolean
  featured?: boolean
}

export const BILLING_PLANS: BillingPlan[] = [
  { id: 'free',    name: 'Free',       price: 0,      ops: 1,    retention: '30일', export: false,           sso: false },
  { id: 'starter', name: 'Starter',    price: 100000, ops: 5,    retention: '90일', export: 'CSV',           sso: false, current: true },
  { id: 'team',    name: 'Team',       price: 250000, ops: 15,   retention: '1년',  export: 'CSV+PDF',       sso: false, featured: true },
  { id: 'pro',     name: 'Pro',        price: 500000, ops: 30,   retention: '3년',  export: 'CSV+PDF+JSON',  sso: true },
  { id: 'ent',     name: 'Enterprise', price: null,   ops: '협의', retention: '협의', export: '전체',         sso: 'SCIM' },
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
  { id: 'amount20', label: '월 청구액 ±20% 변동',           defaultOn: false },
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
  label: '6개월 50% 할인 적용 중',
  period: '2026-04 ~ 2026-09 · 월 50,000원 (VAT 별도). 만료 60일 전 안내.',
  monthly: 50000,
}

export const YEARLY_DISCOUNT_RATE = 0.75 // 25% off when paid annually

export function formatPlanPrice(price: number | null, yearly: boolean) {
  if (price == null) return '협의'
  const value = yearly ? Math.round((price * YEARLY_DISCOUNT_RATE * 12) / 1000) * 1000 : price
  return value.toLocaleString('ko-KR') + '원'
}
