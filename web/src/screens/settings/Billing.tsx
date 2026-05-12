import { useState } from 'react'
import { Icon } from '../../components/Icon'
import {
  BILLING_PLANS,
  BIZ_INFO,
  INVOICES,
  PARTNER_DISCOUNT,
  PAYMENT_METHOD,
  PLAN_USAGE,
  USAGE_ALERTS,
  formatPlanPrice,
} from '../../lib/seed/billing'

const usagePct = Math.min(100, Math.round((PLAN_USAGE.activeOps / PLAN_USAGE.limit) * 100))

export function Billing() {
  const [yearly, setYearly] = useState(false)

  return (
    <>
      <div className="grid-3" style={{ marginBottom: 16 }}>
        <div className="card tight" style={{ gridColumn: 'span 2' }}>
          <div className="row between">
            <div>
              <div className="eyebrow">현재 플랜</div>
              <div
                style={{
                  font: 'var(--t-title3)',
                  color: 'var(--text-strong)',
                  margin: '6px 0 4px',
                }}
              >
                {PLAN_USAGE.plan} · {PLAN_USAGE.price.toLocaleString('ko-KR')}원/월 (VAT 별도)
              </div>
              <div className="muted" style={{ font: 'var(--t-caption1)' }}>
                다음 갱신 · {PLAN_USAGE.nextBillAt} · 토스페이먼츠 카드
              </div>
            </div>
            <button className="btn primary lg" type="button">
              Pro로 업그레이드
            </button>
          </div>
          <div className="hr" />
          <div className="row" style={{ alignItems: 'center', gap: 16 }}>
            <div style={{ flex: 1 }}>
              <div className="row between" style={{ marginBottom: 6 }}>
                <div className="muted" style={{ font: 'var(--t-caption1)' }}>
                  Active Operator 사용량
                </div>
                <div className="strong tnum" style={{ font: 'var(--t-label1-strong)' }}>
                  {PLAN_USAGE.activeOps} / {PLAN_USAGE.limit}명
                </div>
              </div>
              <div
                className="bar"
                role="progressbar"
                aria-label="Active Operator 사용량"
                aria-valuenow={usagePct}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <i style={{ width: usagePct + '%', background: 'var(--accent-normal)' }} />
              </div>
              <div className="muted" style={{ font: 'var(--t-caption1)', marginTop: 6 }}>
                한도 도달 — 추가 작업자 1명 활성 시 자동으로 Team 제안
              </div>
            </div>
          </div>
        </div>

        <div className="card tight">
          <div className="eyebrow">디자인 파트너 (D1)</div>
          <div
            style={{
              font: 'var(--t-label1-strong)',
              color: 'var(--text-strong)',
              margin: '6px 0 4px',
            }}
          >
            {PARTNER_DISCOUNT.label}
          </div>
          <div className="muted" style={{ font: 'var(--t-caption1)' }}>
            {PARTNER_DISCOUNT.period}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="row between" style={{ marginBottom: 14 }}>
          <h3 style={{ margin: 0 }}>플랜 비교</h3>
          <label
            className="row tight"
            style={{ alignItems: 'center', font: 'var(--t-label1)' }}
          >
            <input
              type="checkbox"
              checked={yearly}
              onChange={(e) => setYearly(e.target.checked)}
              aria-label="연결제 25% 할인"
            />
            연결제 25% 할인 (12개월 일시불)
          </label>
        </div>

        <div
          className="grid-4"
          role="group"
          aria-label="플랜 비교"
          style={{ gridTemplateColumns: 'repeat(5, 1fr)', gap: 12 }}
        >
          {BILLING_PLANS.map((p) => (
            <div
              key={p.id}
              className={
                'plan' + (p.current ? ' current' : p.featured ? ' featured' : '')
              }
            >
              <div className="row between">
                <div className="name">{p.name}</div>
                {p.current && <span className="tag blue">현재</span>}
                {p.featured && <span className="tag strong">추천</span>}
              </div>
              <div className="price tnum">
                {formatPlanPrice(p.price, yearly)}
                <span className="per">
                  {yearly && p.price ? ' /년' : p.price ? ' /월' : ''}
                </span>
              </div>
              <div className="muted" style={{ font: 'var(--t-caption1)' }}>
                {p.price ? 'VAT 별도 · ' : ''}
                {p.ops}명 Active OP
              </div>
              <ul>
                <li>보존 {p.retention}</li>
                <li>{p.export ? `Audit export ${p.export}` : 'Audit export 없음'}</li>
                <li>
                  {p.sso
                    ? `SSO/SCIM · ${typeof p.sso === 'string' ? p.sso : 'OAuth'}`
                    : 'SSO 없음'}
                </li>
                <li>{p.id === 'free' ? '1 워크스페이스' : '다중 워크스페이스'}</li>
              </ul>
              <button
                type="button"
                className={'btn ' + (p.featured ? 'primary' : p.current ? 'weak' : '')}
                disabled={p.current}
              >
                {p.current ? '현재 플랜' : p.featured ? '이 플랜으로' : '선택'}
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="grid-2" style={{ marginTop: 16 }}>
        <div className="card">
          <div className="card-h">
            <h3>세금계산서 (한국 B2B 의무)</h3>
            <span className="badge">자동 발행 ON</span>
          </div>
          <div className="grid-2">
            {BIZ_INFO.map((b) => (
              <div key={b.field} className="fieldset">
                <label htmlFor={`biz-${b.field}`}>{b.label}</label>
                <input
                  id={`biz-${b.field}`}
                  className="focus-stub"
                  defaultValue={b.value}
                />
              </div>
            ))}
          </div>
          <div className="hr" />
          <table className="tbl">
            <thead>
              <tr>
                <th>월</th>
                <th>금액</th>
                <th>상태</th>
                <th>
                  <span className="sr-only">다운로드</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {INVOICES.map((r) => (
                <tr key={r.month}>
                  <td className="tnum">{r.month}</td>
                  <td className="tnum">{r.amount}원</td>
                  <td>
                    <span className="tag green">{r.label}</span>
                  </td>
                  <td>
                    <button className="link" type="button" aria-label={`${r.month} 세금계산서 다운로드`}>
                      <Icon name="download" size={12} />
                      다운로드
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card">
          <div className="card-h">
            <h3>결제 수단 · 토스페이먼츠</h3>
          </div>
          <div
            className="card tight"
            style={{ background: 'var(--bg-subtle)', border: 0 }}
          >
            <div className="row between">
              <div>
                <div className="strong">
                  {PAYMENT_METHOD.brand} · ****-****-****-{PAYMENT_METHOD.last4}
                </div>
                <div className="muted" style={{ font: 'var(--t-caption1)' }}>
                  주 결제 수단 · 만료 {PAYMENT_METHOD.expires}
                </div>
              </div>
              <button className="btn sm" type="button">
                변경
              </button>
            </div>
          </div>
          <div className="row tight" style={{ marginTop: 10 }}>
            <button className="btn" type="button">
              <Icon name="plus" size={14} />
              가상계좌 추가
            </button>
            <button className="btn" type="button">
              <Icon name="plus" size={14} />
              카드 추가
            </button>
          </div>

          <div className="hr" />

          <div className="eyebrow">사용량 알림</div>
          <div
            className="col"
            role="group"
            aria-label="사용량 알림"
            style={{ gap: 8, marginTop: 8 }}
          >
            {USAGE_ALERTS.map((a) => (
              <label
                key={a.id}
                className="row between"
                style={{ font: 'var(--t-label1)' }}
              >
                <span>{a.label}</span>
                <input
                  type="checkbox"
                  defaultChecked={a.defaultOn}
                  aria-label={a.label}
                />
              </label>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
