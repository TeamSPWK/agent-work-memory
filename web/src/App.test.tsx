import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { AppShell } from './layout/AppShell'
import { OnboardingLayout } from './layout/OnboardingLayout'
import { PlaceholderScreen } from './screens/PlaceholderScreen'
import { Today } from './screens/Today'
import { NAV_ITEMS } from './lib/seed/navigation'

describe('AppShell + product IA', () => {
  it('renders 6 sidebar items + Today placeholder for /today', () => {
    render(
      <MemoryRouter initialEntries={['/today']}>
        <Routes>
          <Route path="/" element={<AppShell />}>
            <Route path="today" element={<PlaceholderScreen label="Today" />} />
          </Route>
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByText('Agent Work Memory')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Today', level: 1 })).toBeInTheDocument()
    for (const item of NAV_ITEMS) {
      expect(screen.getByRole('link', { name: new RegExp(item.label) })).toBeInTheDocument()
    }
    expect(screen.queryByText(/H1 ·/)).not.toBeInTheDocument()
    expect(screen.queryByText(/검증 지표/)).not.toBeInTheDocument()
  })

  it('Today screen renders KPIs and session timeline', () => {
    render(
      <MemoryRouter initialEntries={['/today']}>
        <Routes>
          <Route path="/" element={<AppShell />}>
            <Route path="today" element={<Today />} />
          </Route>
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: '오늘의 작업 메모리', level: 1 })).toBeInTheDocument()
    expect(screen.getByText('변경 파일')).toBeInTheDocument()
    expect(screen.getByText('위험 신호')).toBeInTheDocument()
    expect(screen.getAllByText('설명 부족 세션').length).toBeGreaterThanOrEqual(2)
    expect(screen.getByText('팀 평균 검토 완료율')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '오늘의 Work Session 타임라인' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Explain Back 채우기/ })).toHaveAttribute(
      'href',
      expect.stringMatching(/^\/sessions\/s-\d+\?tab=explain$/),
    )
  })

  it('onboarding renders wizard without sidebar', () => {
    render(
      <MemoryRouter initialEntries={['/onboarding/ws']}>
        <Routes>
          <Route path="/onboarding" element={<OnboardingLayout />}>
            <Route path="ws" element={<PlaceholderScreen label="워크스페이스 생성" note="온보딩" />} />
          </Route>
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: '워크스페이스 생성', level: 1 })).toBeInTheDocument()
    expect(screen.queryByRole('navigation', { name: '온보딩 단계' })).toBeInTheDocument()
    for (const item of NAV_ITEMS) {
      expect(screen.queryByRole('link', { name: new RegExp(`^${item.label}$`) })).not.toBeInTheDocument()
    }
  })
})
