import { Icon } from '../../components/Icon'
import {
  EXPORT_FORMS,
  RECENT_EXPORTS,
  RETENTION_OPTIONS,
  SCHEDULE_OPTIONS,
} from '../../lib/seed/settings'

export function AuditExport() {
  return (
    <div className="grid-split">
      <div className="col">
        <div className="card">
          <div className="card-h">
            <h3>PDF 양식</h3>
            <span className="sub">기본은 인공지능기본법 7대 원칙</span>
          </div>
          <fieldset
            className="col"
            role="radiogroup"
            aria-label="PDF 양식"
            style={{ gap: 8, border: 0, padding: 0, margin: 0 }}
          >
            <legend className="sr-only" style={{ position: 'absolute', left: -9999 }}>
              PDF 양식
            </legend>
            {EXPORT_FORMS.map((f) => (
              <label
                key={f.id}
                className="row between"
                style={{
                  padding: 14,
                  border: '1px solid var(--line-soft)',
                  borderRadius: 10,
                  background: f.defaultOn ? 'var(--primary-light)' : 'var(--bg-base)',
                  cursor: 'pointer',
                }}
              >
                <span style={{ display: 'flex', flexDirection: 'column' }}>
                  <span
                    style={{
                      font: f.defaultOn ? 'var(--t-label1-strong)' : 'var(--t-label1)',
                      color: f.defaultOn ? 'var(--primary-strong)' : 'var(--text-strong)',
                    }}
                  >
                    {f.name}
                  </span>
                  <span className="muted" style={{ font: 'var(--t-caption1)', marginTop: 2 }}>
                    {f.desc}
                  </span>
                </span>
                <input
                  type="radio"
                  name="export-form"
                  defaultChecked={f.defaultOn}
                  aria-label={f.name}
                />
              </label>
            ))}
          </fieldset>
        </div>

        <div className="card">
          <div className="card-h">
            <h3>보존 기간</h3>
            <span className="sub">변경 시 비용 영향</span>
          </div>
          <fieldset
            className="row tight"
            role="radiogroup"
            aria-label="보존 기간"
            style={{ flexWrap: 'wrap', border: 0, padding: 0, margin: 0 }}
          >
            <legend className="sr-only" style={{ position: 'absolute', left: -9999 }}>
              보존 기간
            </legend>
            {RETENTION_OPTIONS.map((o) => (
              <label
                key={o.id}
                style={{
                  padding: '10px 14px',
                  border: '1px solid var(--line-soft)',
                  borderRadius: 8,
                  background: o.defaultOn ? 'var(--primary-light)' : 'var(--bg-base)',
                  color: o.defaultOn ? 'var(--primary-strong)' : 'var(--text-normal)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2,
                  cursor: 'pointer',
                }}
              >
                <span className="row tight">
                  <input
                    type="radio"
                    name="retain"
                    defaultChecked={o.defaultOn}
                    aria-label={o.label}
                  />
                  <span
                    style={{
                      font: o.defaultOn ? 'var(--t-label1-strong)' : 'var(--t-label1)',
                    }}
                  >
                    {o.label}
                  </span>
                </span>
                <span
                  className="muted"
                  style={{
                    font: 'var(--t-caption1)',
                    color: o.defaultOn ? 'var(--primary-strong)' : 'var(--text-assistive)',
                  }}
                >
                  {o.cost}
                </span>
              </label>
            ))}
          </fieldset>
        </div>

        <div className="grid-2">
          <div className="card">
            <div className="card-h">
              <h3>해시 알고리즘</h3>
            </div>
            <div
              className="row between"
              style={{
                padding: 12,
                border: '1px solid var(--line-soft)',
                borderRadius: 10,
                background: 'var(--bg-subtle)',
              }}
            >
              <div>
                <div style={{ font: 'var(--t-label1-strong)', color: 'var(--text-strong)' }}>
                  SHA-256
                </div>
                <div className="muted" style={{ font: 'var(--t-caption1)' }}>
                  변경 불가 · 변조 불가성 설계의 핵심. 알고리즘 변경 시 chain 재계산 필요.
                </div>
              </div>
              <span className="tag neutral">
                <Icon name="lock" size={10} />
                변경 불가
              </span>
            </div>
          </div>

          <div className="card">
            <div className="card-h">
              <h3>자동 export 일정</h3>
            </div>
            <fieldset
              className="row tight"
              role="radiogroup"
              aria-label="자동 export 일정"
              style={{ border: 0, padding: 0, margin: 0 }}
            >
              <legend className="sr-only" style={{ position: 'absolute', left: -9999 }}>
                자동 export 일정
              </legend>
              {SCHEDULE_OPTIONS.map((o) => (
                <label
                  key={o.id}
                  style={{
                    flex: 1,
                    padding: 12,
                    borderRadius: 8,
                    textAlign: 'center',
                    border: '1px solid var(--line-soft)',
                    background: o.defaultOn ? 'var(--primary-light)' : 'var(--bg-base)',
                    color: o.defaultOn ? 'var(--primary-strong)' : 'var(--text-normal)',
                    font: o.defaultOn ? 'var(--t-label1-strong)' : 'var(--t-label1)',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="radio"
                    name="sched"
                    defaultChecked={o.defaultOn}
                    aria-label={o.label}
                    style={{ marginRight: 6 }}
                  />
                  {o.label}
                </label>
              ))}
            </fieldset>
            <div className="muted" style={{ font: 'var(--t-caption1)', marginTop: 10 }}>
              다음 자동 export · 2026-07-01 (KST)
            </div>
          </div>
        </div>
      </div>

      <div className="col">
        <div className="card tight">
          <div className="eyebrow">최근 export {RECENT_EXPORTS.length}건</div>
          <div className="col" style={{ gap: 6, marginTop: 8 }}>
            {RECENT_EXPORTS.map((e) => (
              <div
                key={e.id}
                className="row between"
                style={{
                  padding: 10,
                  border: '1px solid var(--line-soft)',
                  borderRadius: 8,
                }}
              >
                <div>
                  <div style={{ font: 'var(--t-label1-strong)', color: 'var(--text-strong)' }}>
                    {e.form}
                  </div>
                  <div className="muted" style={{ font: 'var(--t-caption1)' }}>
                    {e.at} · {e.pages}p · {e.id}
                  </div>
                </div>
                {e.state === 'ok' ? (
                  <span className="tag green">
                    <span className="dot" />
                    검증 OK
                  </span>
                ) : (
                  <span className="tag orange">
                    <span className="dot" />
                    부분 누락
                  </span>
                )}
              </div>
            ))}
          </div>
          <button className="btn primary" type="button" style={{ marginTop: 10, width: '100%' }}>
            <Icon name="download" size={14} />
            지금 export
          </button>
        </div>

        <div
          className="card tight"
          style={{ background: 'var(--bg-subtle)', borderColor: 'transparent' }}
        >
          <div className="eyebrow" style={{ color: 'var(--text-assistive)' }}>
            운영 원칙
          </div>
          <div className="muted" style={{ font: 'var(--t-caption1)', marginTop: 4 }}>
            자동 export는 KST 09:00에 실행되며, 결과 PDF는 Settings · Profile 이메일로 발송됩니다.
            실패 시 즉시 재시도하지 않고 무음 시간대 후 1회 재시도.
          </div>
        </div>
      </div>
    </div>
  )
}
