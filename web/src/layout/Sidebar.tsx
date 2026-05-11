import { NavLink } from 'react-router-dom'
import { HYPOTHESES } from '../lib/seed/hypotheses'
import { Icon } from '../components/Icon'

export function Sidebar() {
  return (
    <nav className="nav">
      {HYPOTHESES.map((h) => (
        <div key={h.id}>
          <div className="nav-group">{h.label}</div>
          {h.screens.map((s, i) => (
            <NavLink
              key={s.id}
              to={`/${h.id}/${s.id}`}
              className={({ isActive }) => 'nav-item' + (isActive ? ' active' : '')}
            >
              <span className="num">{i + 1}</span>
              <Icon name={s.icon} size={16} />
              <span>{s.label}</span>
              {s.pay && <span className="pay">결제</span>}
            </NavLink>
          ))}
        </div>
      ))}
    </nav>
  )
}
