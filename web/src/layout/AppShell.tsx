import { Outlet } from 'react-router-dom'
import { AppLogo } from './AppLogo'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'

export function AppShell() {
  return (
    <div className="app">
      <AppLogo />
      <Topbar />
      <Sidebar />
      <main className="main">
        <Outlet />
      </main>
    </div>
  )
}
