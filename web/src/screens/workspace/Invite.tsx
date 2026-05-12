import { useState, type KeyboardEvent } from 'react'
import { Icon } from '../../components/Icon'

type Role = 'Operator' | 'Reviewer' | 'Admin'

const ROLES: { id: Role; sub: string }[] = [
  { id: 'Operator', sub: 'AI에 작업 시키고 회상' },
  { id: 'Reviewer', sub: '변경 검토·승인' },
  { id: 'Admin', sub: '워크스페이스 관리' },
]

export function Invite() {
  const [emails, setEmails] = useState<string[]>(['ops@…', 'design@…'])
  const [draft, setDraft] = useState('')
  /* 무료 역할(Reviewer)이 기본값 — 사용자가 명시적으로 Operator 선택해야만 비용 발생 (DSA Art.25 사용자에게 유리한 기본값) */
  const [role, setRole] = useState<Role>('Reviewer')

  const addEmail = () => {
    const v = draft.trim().replace(/,$/, '')
    if (!v) return
    setEmails((prev) => [...prev, v])
    setDraft('')
  }

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addEmail()
    }
  }

  return (
    <div className="grid-split">
      <div className="card">
        <div className="card-h">
          <h3>초대 정보</h3>
          <span className="sub">한 번에 여러 명 가능</span>
        </div>

        <fieldset className="fieldset" style={{ border: 0, padding: 0, margin: 0 }}>
          <legend
            style={{
              font: 'var(--t-label1-strong)',
              color: 'var(--text-strong)',
              padding: 0,
              marginBottom: 6,
            }}
          >
            이메일
          </legend>
          <div
            className="row tight"
            style={{
              flexWrap: 'wrap',
              padding: 8,
              border: '1px solid var(--line-soft)',
              borderRadius: 8,
              background: 'var(--bg-base)',
            }}
          >
            {emails.map((e, i) => (
              <span key={`${e}-${i}`} className="tag blue" style={{ height: 26, paddingRight: 4 }}>
                {e}
                <button
                  type="button"
                  aria-label={`${e} 제거`}
                  onClick={() => setEmails((prev) => prev.filter((_, j) => j !== i))}
                  style={{
                    border: 0,
                    background: 'transparent',
                    color: 'inherit',
                    cursor: 'pointer',
                  }}
                >
                  <Icon name="x" size={10} />
                </button>
              </span>
            ))}
            <input
              aria-label="초대 이메일"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={onKey}
              placeholder="이메일 입력 후 Enter / 쉼표"
              style={{
                border: 0,
                outline: 0,
                background: 'transparent',
                flex: 1,
                minWidth: 180,
                color: 'var(--text-normal)',
                font: 'var(--t-label1)',
              }}
            />
          </div>
          <div className="hint">{emails.length}명 추가됨 · 초대 메일은 한국어로 발송됩니다.</div>
        </fieldset>

        <div className="hr" />

        <fieldset
          className="fieldset"
          role="radiogroup"
          aria-label="사전 지정 역할"
          style={{ border: 0, padding: 0, margin: 0 }}
        >
          <legend
            style={{
              font: 'var(--t-label1-strong)',
              color: 'var(--text-strong)',
              padding: 0,
              marginBottom: 6,
            }}
          >
            사전 지정 역할
          </legend>
          <div className="row tight">
            {ROLES.map((r) => {
              const selected = role === r.id
              return (
                <label
                  key={r.id}
                  className="row tight"
                  style={{
                    padding: '10px 14px',
                    border: '1px solid var(--line-soft)',
                    borderRadius: 8,
                    background: selected ? 'var(--primary-light)' : 'var(--bg-base)',
                    color: selected ? 'var(--primary-strong)' : 'var(--text-normal)',
                    font: selected ? 'var(--t-label1-strong)' : 'var(--t-label1)',
                    cursor: 'pointer',
                    flex: 1,
                  }}
                >
                  <input
                    type="radio"
                    name="invite-role"
                    checked={selected}
                    onChange={() => setRole(r.id)}
                  />
                  <span style={{ display: 'flex', flexDirection: 'column' }}>
                    {r.id}
                    <span className="muted" style={{ font: 'var(--t-caption1)' }}>
                      {r.sub}
                    </span>
                  </span>
                </label>
              )
            })}
          </div>
        </fieldset>

        <div className="hr" />
        <div className="muted" style={{ font: 'var(--t-caption1)', marginBottom: 12 }}>
          <Icon name="lock" size={12} /> 안내 — Agent Work Memory는 *원문 transcript를 저장하지 않습니다*. 세션 메타·코드 변경 요약만 보관.
        </div>

        <div className="row" style={{ justifyContent: 'flex-end' }}>
          <button className="btn primary lg" type="button" disabled={emails.length === 0}>
            <Icon name="mail" size={14} />
            {emails.length}명에게 초대 메일 발송
          </button>
        </div>
      </div>

      <div className="col">
        <div className="card tight">
          <div className="eyebrow">초대 메일 미리보기</div>
          <div
            style={{
              marginTop: 8,
              padding: 14,
              border: '1px solid var(--line-soft)',
              borderRadius: 10,
              background: 'var(--bg-subtle)',
              font: 'var(--t-label2)',
              color: 'var(--text-neutral)',
            }}
          >
            <div
              style={{
                font: 'var(--t-label1-strong)',
                color: 'var(--text-strong)',
                marginBottom: 6,
              }}
            >
              새 워크스페이스 · Agent Work Memory에 초대되셨습니다
            </div>
            <p style={{ margin: '0 0 8px' }}>안녕하세요,</p>
            <p style={{ margin: '0 0 8px' }}>
              Agent Work Memory를 시범 운영 중인 워크스페이스에 <b>{role}</b> 권한으로 초대드립니다.
              AI 도구(Claude Code · Cursor · Codex · ChatGPT)로 한 작업을 자동 기록하고, 7대 원칙 기준 감사 로그를 보존합니다.
            </p>
            <p style={{ margin: '0 0 8px' }}>
              현재 이 워크스페이스는 <b>1인 운영자</b>가 디자인 파트너로 직접 운영합니다.
              답변은 영업일 기준 1~2일 안에 드립니다 (24/7 지원은 없습니다).
            </p>
            <p style={{ margin: '0 0 8px' }}>
              원문 transcript는 저장하지 않으며, 세션 메타 · 코드 변경 요약 · 명령 로그만 보관합니다.
            </p>
            <div className="row tight" style={{ marginTop: 10 }}>
              <button className="btn primary sm" type="button">
                초대 수락
              </button>
              <button className="btn sm" type="button">
                개인정보처리방침
              </button>
            </div>
          </div>
        </div>

        <div
          className="card tight"
          style={{ background: 'var(--primary-light)', borderColor: 'transparent' }}
        >
          <div style={{ font: 'var(--t-label1-strong)', color: 'var(--primary-strong)' }}>
            자동 메시지 편집 가능
          </div>
          <div
            className="muted"
            style={{ font: 'var(--t-caption1)', color: 'var(--primary-strong)', marginTop: 4 }}
          >
            우측 미리보기는 발송 직전 한 번 더 편집 가능합니다. 발신자는 워크스페이스 Admin 이름으로 표시.
          </div>
        </div>
      </div>
    </div>
  )
}
