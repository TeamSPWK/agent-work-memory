import { Outlet, NavLink } from 'react-router-dom'
import { AppLogo } from './AppLogo'
import { ONBOARDING_STEPS } from '../lib/seed/navigation'

export function OnboardingLayout() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 24px',
          borderBottom: '1px solid var(--line-soft, #ebebee)',
        }}
      >
        <AppLogo />
        <nav style={{ display: 'flex', gap: 8 }} aria-label="온보딩 단계">
          {ONBOARDING_STEPS.map((s, i) => (
            <NavLink
              key={s.id}
              to={`/onboarding/${s.id}`}
              style={({ isActive }) => ({
                padding: '6px 10px',
                borderRadius: 999,
                font: 'var(--t-label2)',
                color: isActive ? 'var(--text-on-color)' : 'var(--text-assistive)',
                background: isActive ? 'var(--primary-normal, #0066ff)' : 'var(--bg-subtle)',
                textDecoration: 'none',
              })}
            >
              {i + 1}. {s.label}
            </NavLink>
          ))}
        </nav>
      </header>
      <main style={{ flex: 1, padding: '32px 24px', maxWidth: 880, margin: '0 auto', width: '100%' }}>
        <Outlet />
      </main>
    </div>
  )
}
