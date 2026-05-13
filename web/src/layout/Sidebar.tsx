import { NavLink } from 'react-router-dom'
import { NAV_ITEMS } from '../lib/seed/navigation'
import { Icon } from '../components/Icon'
import { useT } from '../lib/i18n'
import { isLocalEnv } from '../lib/env'

export function Sidebar() {
  const t = useT()
  const local = isLocalEnv()
  // 운영 배포에서는 devOnly 메뉴 숨김. 로컬에서는 dev/status 등 본인 dogfooding 화면 노출.
  const items = NAV_ITEMS.filter((item) => !item.devOnly || local)
  return (
    <nav className="nav">
      {items.map((item) => (
        <NavLink
          key={item.id}
          to={item.to}
          className={({ isActive }) =>
            'nav-item' + (isActive ? ' active' : '') + (item.devOnly ? ' nav-item-dev' : '')
          }
        >
          <Icon name={item.icon} size={16} />
          <span>{t(item.i18nKey)}</span>
          {item.devOnly && (
            <span className="nav-item-badge" aria-hidden="true">
              DEV
            </span>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
