import { Icon } from '../../components/Icon'
import { ONBOARDING_TOOLS } from '../../lib/seed/onboarding'
import { EXTERNAL_INTEGRATIONS } from '../../lib/seed/settings'

const stateLabel = {
  connected: '연결됨',
  idle: '미연결',
  error: '오류',
} as const

const stateTag = {
  connected: 'green',
  idle: 'neutral',
  error: 'red',
} as const

export function Integrations() {
  return (
    <>
      <div className="card">
        <div className="card-h">
          <h3>AI 도구</h3>
          <span className="sub">H4 온보딩과 동일 4종</span>
        </div>
        <div className="grid-2" style={{ gap: 12 }}>
          {ONBOARDING_TOOLS.map((t) => (
            <div key={t.key} className="card tight">
              <div className="row between">
                <div className="row tight" style={{ alignItems: 'center' }}>
                  <div
                    className="avatar"
                    aria-hidden="true"
                    style={{
                      background: 'var(--text-strong)',
                      borderRadius: 8,
                      width: 32,
                      height: 32,
                      color: 'var(--bg-base)',
                    }}
                  >
                    {t.name[0]}
                  </div>
                  <div>
                    <div style={{ font: 'var(--t-label1-strong)', color: 'var(--text-strong)' }}>
                      {t.name}
                    </div>
                    <div className="muted" style={{ font: 'var(--t-caption1)' }}>
                      {t.desc}
                    </div>
                  </div>
                </div>
                <span className={'tag ' + stateTag[t.state]}>
                  <span className="dot" />
                  {stateLabel[t.state]}
                </span>
              </div>
              <div className="hr" />
              <div
                className="row between"
                style={{ font: 'var(--t-caption1)', color: 'var(--text-assistive)' }}
              >
                <span>
                  마지막 동기 ·{' '}
                  {t.state === 'connected'
                    ? '방금 전'
                    : t.state === 'error'
                      ? '재시도 필요'
                      : '—'}
                </span>
                <div className="row tight">
                  <button className="btn sm" type="button">
                    {t.state === 'connected' ? '끊기' : '재연결'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <div className="card-h">
          <h3>외부 서비스</h3>
          <span className="sub">GitHub · Slack · 채널톡</span>
        </div>
        <div className="col" style={{ gap: 10 }}>
          {EXTERNAL_INTEGRATIONS.map((s) => (
            <div
              key={s.id}
              className="row between"
              style={{ padding: 14, border: '1px solid var(--line-soft)', borderRadius: 10 }}
            >
              <div className="row tight" style={{ alignItems: 'center' }}>
                <div
                  className="avatar"
                  aria-hidden="true"
                  style={{
                    background: s.bg,
                    borderRadius: 8,
                    width: 32,
                    height: 32,
                    color: '#fff',
                  }}
                >
                  {s.initial}
                </div>
                <div>
                  <div style={{ font: 'var(--t-label1-strong)', color: 'var(--text-strong)' }}>
                    {s.label}
                  </div>
                  <div className="muted" style={{ font: 'var(--t-caption1)' }}>
                    {s.desc}
                  </div>
                </div>
              </div>
              <div className="row tight">
                {s.state === 'connected' ? (
                  <span className="tag green">
                    <span className="dot" />
                    연결됨
                  </span>
                ) : (
                  <span className="tag neutral">미연결</span>
                )}
                <button
                  className={'btn sm' + (s.state === 'idle' ? ' primary' : '')}
                  type="button"
                >
                  {s.state === 'idle' ? (
                    <>
                      <Icon name="link" size={12} />
                      {s.action}
                    </>
                  ) : (
                    s.action
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div
        className="card tight"
        style={{ marginTop: 16, background: 'var(--bg-subtle)', borderColor: 'transparent' }}
      >
        <div className="row between">
          <div>
            <div style={{ font: 'var(--t-label1-strong)', color: 'var(--text-neutral)' }}>
              예정 통합
            </div>
            <div className="muted" style={{ font: 'var(--t-caption1)', marginTop: 4 }}>
              필요 의견이 누적되면 우선순위에 따라 진행합니다.
            </div>
          </div>
          <div className="row tight">
            <span className="tag neutral">Jira · 지원 예정</span>
            <span className="tag neutral">Notion · 지원 예정</span>
          </div>
        </div>
      </div>
    </>
  )
}
