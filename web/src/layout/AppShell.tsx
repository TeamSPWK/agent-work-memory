import { Outlet } from 'react-router-dom'
import { AppLogo } from './AppLogo'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'
import { HypothesisBanner } from './HypothesisBanner'

export function AppShell() {
  return (
    <div className="app">
      <AppLogo />
      <Topbar />
      <Sidebar />
      <main className="main">
        <HypothesisBanner />
        <Outlet />
      </main>
    </div>
  )
}
