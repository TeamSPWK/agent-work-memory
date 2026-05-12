import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Icon } from '../../components/Icon'
import { OnboardingProgress } from './OnboardingProgress'
import {
  ONBOARDING_MEMBERS,
  ONBOARDING_PRINCIPLES_SHORT,
} from '../../lib/seed/onboarding'

export function Reviewer() {
  const [picked, setPicked] = useState<string[]>(['u5'])

  const toggle = (id: string) =>
    setPicked((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))

  const pickedCount = picked.length
  const principleOneActive = pickedCount > 0

  return (
    <>
      <OnboardingProgress step={4} />
      <div className="page-h">
        <div>
          <div className="eyebrow">4 / 5 · 거버넌스 활성</div>
          <h1>AI 변경 검토자(Reviewer)를 지정하세요</h1>
          <p>7대 원칙 §1 거버넌스가 활성화됩니다. 본인이 단독 Reviewer여도 됩니다.</p>
        </div>
      </div>

      <div className="grid-split">
        <div className="card">
          <div className="card-h">
            <h3>워크스페이스 멤버</h3>
            <span className="sub">최소 1명 · 멀티 가능</span>
          </div>
          <div className="col" style={{ gap: 8 }} role="group" aria-label="Reviewer 후보 멤버">
            {ONBOARDING_MEMBERS.map((m) => {
              const checked = picked.includes(m.id)
              return (
                <label
                  key={m.id}
                  className="row between"
                  style={{
                    padding: 12,
                    border: '1px solid var(--line-soft)',
                    borderRadius: 10,
                    background: checked ? 'var(--primary-light)' : 'var(--bg-base)',
                    cursor: 'pointer',
                  }}
                >
                  <span className="row tight" style={{ alignItems: 'center' }}>
                    <div className={'avatar ' + m.color}>{m.initials}</div>
                    <div>
                      <div
                        style={{ font: 'var(--t-label1-strong)', color: 'var(--text-strong)' }}
                      >
                        {m.role}
                      </div>
                      <div className="muted" style={{ font: 'var(--t-caption1)' }}>
                        {m.email} · 마지막 활동 {m.lastActive}
                      </div>
                    </div>
                  </span>
                  <span className="row tight" style={{ alignItems: 'center' }}>
                    <span
                      className={
                        'tag ' +
                        (m.persona === 'Admin'
                          ? 'blue'
                          : m.persona === 'Reviewer'
                            ? 'green'
                            : 'neutral')
                      }
                    >
                      {m.persona}
                    </span>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggle(m.id)}
                      aria-label={`${m.role} 선택`}
                    />
                  </span>
                </label>
              )
            })}
          </div>

          <div className="hr" />
          <div className="fieldset">
            <label htmlFor="invite-emails">새 멤버 초대 (선택)</label>
            <input
              id="invite-emails"
              className="focus-stub"
              placeholder="이메일을 쉼표로 구분 · 예) ops@…, dev@…"
            />
            <div className="hint">
              초대 후 역할은 Workspace → Members에서 변경 가능. 초대 메일에는 워크스페이스명·본인
              이름만 노출.
            </div>
          </div>

          <div className="hr" />
          <div className="row between">
            <Link className="btn" to="/onboarding/import">
              ← 이전
            </Link>
            {pickedCount === 0 ? (
              <button
                className="btn primary lg"
                type="button"
                disabled
                style={{ opacity: 0.5 }}
              >
                완료 <Icon name="arrow" size={14} />
              </button>
            ) : (
              <Link className="btn primary lg" to="/onboarding/done">
                완료 <Icon name="arrow" size={14} />
              </Link>
            )}
          </div>
        </div>

        <div className="col">
          <div className="card tight">
            <div className="eyebrow">7대 원칙 · 거버넌스 (§1) 미리보기</div>
            <ul className="compliance" style={{ marginTop: 8, padding: 0, listStyle: 'none' }}>
              {ONBOARDING_PRINCIPLES_SHORT.map((c, i) => {
                const isFirst = i === 0
                const pending = isFirst && !principleOneActive
                return (
                  <li key={c.name}>
                    <span className={'check ' + (pending ? 'todo' : '')}>
                      {pending ? '…' : '✓'}
                    </span>
                    <div>
                      <div className="pname">{c.name}</div>
                      <div className="pdesc">
                        {isFirst
                          ? pending
                            ? 'Reviewer 미지정 — 지금 지정하면 즉시 활성'
                            : `Reviewer ${pickedCount}명 지정 완료 — 활성`
                          : c.desc + ' · ' + c.note}
                      </div>
                    </div>
                    <span className={'tag ' + (pending ? 'neutral' : 'green')}>
                      {pending ? 'pending' : 'ok'}
                    </span>
                  </li>
                )
              })}
            </ul>
          </div>

          <div
            className="card tight"
            style={{ background: 'var(--primary-light)', borderColor: 'transparent' }}
          >
            <div style={{ font: 'var(--t-label1-strong)', color: 'var(--primary-strong)' }}>
              역할 의미
            </div>
            <ul
              style={{
                margin: '8px 0 0',
                paddingLeft: 18,
                font: 'var(--t-label2)',
                color: 'var(--primary-strong)',
                display: 'flex',
                flexDirection: 'column',
                gap: 6,
              }}
            >
              <li>
                <b>Operator</b> · AI에 작업 시키고 결과 회상
              </li>
              <li>
                <b>Reviewer</b> · AI 변경의 의도-결과 비교, 승인
              </li>
              <li>
                <b>Admin</b> · 워크스페이스·결제·역할·감사 양식 관리
              </li>
            </ul>
          </div>
        </div>
      </div>
    </>
  )
}
