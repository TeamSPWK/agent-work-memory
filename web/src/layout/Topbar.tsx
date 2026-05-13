import { useLocation } from 'react-router-dom'
import { useUi } from '../state/ui'
import type { Persona } from '../state/ui'
import { NAV_ITEMS } from '../lib/seed/navigation'
import { WORKSPACES } from '../lib/seed/workspaces'
import { Icon } from '../components/Icon'
import { isLocalEnv } from '../lib/env'

const PERSONAS: Persona[] = ['Operator', 'Reviewer', 'Admin']

export function Topbar() {
  const { persona, setPersona, theme, toggleTheme, workspaceId, setWorkspaceId } = useUi()
  const { pathname } = useLocation()
  const current = NAV_ITEMS.find((item) => pathname === item.to || pathname.startsWith(item.to + '/'))
  // Phase C8a C3 — dev 메타 inside-app 격리. 페르소나 토글은 *시연용 mock*이므로
  // 운영 도메인에서는 자동 숨김. 로컬에서만 디자인 시연 가능.
  const local = isLocalEnv()

  return (
    <header className="topbar">
      <div className="crumb">
        <Icon name="workspace" size={14} />
        <select
          value={workspaceId}
          onChange={(e) => setWorkspaceId(e.target.value)}
          aria-label="워크스페이스 전환"
          style={{
            border: 0,
            background: 'transparent',
            font: 'var(--t-label1-strong)',
            color: 'var(--text-strong)',
          }}
        >
          {WORKSPACES.map((w) => (
            <option key={w.id} value={w.id} disabled={w.disabled}>
              {w.name}
              {w.disabled ? ' (비활성)' : ''}
            </option>
          ))}
        </select>
        {current && (
          <>
            <Icon name="chev" size={12} />
            <b>{current.label}</b>
          </>
        )}
      </div>

      <div className="topright">
        {local && (
          <>
            <span className="muted" style={{ font: 'var(--t-caption1)' }}>
              시연용 페르소나
            </span>
            <PersonaToggle value={persona} onChange={setPersona} />
          </>
        )}
        <button
          className="icon-btn"
          onClick={toggleTheme}
          title="테마 전환"
          aria-label="테마 전환"
        >
          <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={16} />
        </button>
      </div>
    </header>
  )
}

function PersonaToggle({ value, onChange }: { value: Persona; onChange: (p: Persona) => void }) {
  return (
    <div className="persona-toggle" role="tablist" aria-label="페르소나 시연 토글">
      {PERSONAS.map((p) => (
        <button key={p} className={value === p ? 'active' : ''} onClick={() => onChange(p)}>
          {p}
        </button>
      ))}
    </div>
  )
}
