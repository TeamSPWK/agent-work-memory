import { useParams } from 'react-router-dom'
import { useUi } from '../state/ui'
import type { Persona } from '../state/ui'
import { PERSONAS, findHypothesis, findScreen } from '../lib/seed/hypotheses'
import { WORKSPACES } from '../lib/seed/workspaces'
import { Icon } from '../components/Icon'

export function Topbar() {
  const { persona, setPersona, theme, toggleTheme, workspaceId, setWorkspaceId } = useUi()
  const { hyp = '', screen: screenId = '' } = useParams<{ hyp?: string; screen?: string }>()
  const h = findHypothesis(hyp)
  const screen = findScreen(hyp, screenId)

  return (
    <header className="topbar">
      <div className="crumb">
        <Icon name="workspace" size={14} />
        <select
          value={workspaceId}
          onChange={(e) => setWorkspaceId(e.target.value)}
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
        {h && (
          <>
            <Icon name="chev" size={12} />
            <span>{h.short}</span>
          </>
        )}
        {screen && (
          <>
            <Icon name="chev" size={12} />
            <b>{screen.label}</b>
          </>
        )}
      </div>

      <div className="topright">
        <span className="muted" style={{ font: 'var(--t-caption1)' }}>
          시연용 페르소나
        </span>
        <PersonaToggle value={persona} onChange={setPersona} />
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
