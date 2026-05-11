import { NavLink } from 'react-router-dom'
import { NAV_ITEMS } from '../lib/seed/navigation'
import { Icon } from '../components/Icon'

export function Sidebar() {
  return (
    <nav className="nav">
      {NAV_ITEMS.map((item) => (
        <NavLink
          key={item.id}
          to={item.to}
          className={({ isActive }) => 'nav-item' + (isActive ? ' active' : '')}
        >
          <Icon name={item.icon} size={16} />
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
