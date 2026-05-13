import { Outlet } from 'react-router-dom'
import { AppLogo } from './AppLogo'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'

/**
 * AppShell — 데스크탑 1440px 기준 콘솔 레이아웃.
 * outer(app-shell)는 viewport 전체 배경 담당, inner(.app)는 max-width 1440 + 가운데 정렬.
 * 1440 미만에서는 viewport 풀폭으로 자동 반응형.
 */
export function AppShell() {
  return (
    <div className="app-shell">
      <div className="app">
        <AppLogo />
        <Topbar />
        <Sidebar />
        <main className="main">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
