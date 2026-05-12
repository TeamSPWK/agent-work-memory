import type { PublicPageId } from '../../lib/seed/public'
import { PUBLIC_ROUTES } from '../../lib/seed/public'

export function PublicStub({ id }: { id: PublicPageId }) {
  const meta = PUBLIC_ROUTES.find((r) => r.id === id)
  return (
    <section className="card" aria-label={`${meta?.label ?? id} placeholder`}>
      <div className="card-h">
        <h2>{meta?.label}</h2>
        <span className="sub">m2.5 S1 스캐폴드 — 시각 이식은 S2에서</span>
      </div>
      <p className="muted">
        라우트 dispatch 검증용 placeholder. {meta?.path} 진입 시 PublicShell 안에서 본 카드가 렌더되면
        m2.5 S1 exit criteria 충족.
      </p>
      <ul className="mono" style={{ font: 'var(--t-caption1)', color: 'var(--text-assistive)' }}>
        <li>id · {id}</li>
        <li>path · {meta?.path}</li>
        <li>noindex · {meta?.noindex ? 'true' : 'false'}</li>
      </ul>
    </section>
  )
}

export const Landing  = () => <PublicStub id="landing" />
export const Pricing  = () => <PublicStub id="pricing" />
export const Signup   = () => <PublicStub id="signup" />
export const Login    = () => <PublicStub id="login" />
export const Reset    = () => <PublicStub id="reset" />
export const Terms    = () => <PublicStub id="terms" />
export const Privacy  = () => <PublicStub id="privacy" />
export const Refund   = () => <PublicStub id="refund" />
export const Business = () => <PublicStub id="business" />
export const Company  = () => <PublicStub id="company" />
export const Status   = () => <PublicStub id="status" />
export const Err404   = () => <PublicStub id="err404" />
export const Err500   = () => <PublicStub id="err500" />
export const Maint    = () => <PublicStub id="maint" />
