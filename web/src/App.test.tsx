import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { AppShell } from './layout/AppShell'
import { OnboardingLayout } from './layout/OnboardingLayout'
import { PlaceholderScreen } from './screens/PlaceholderScreen'
import { Today } from './screens/Today'
import { Sessions } from './screens/Sessions'
import { SessionDetail } from './screens/SessionDetail'
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

  it('Sessions list renders tool filter + table with 7 rows', () => {
    render(
      <MemoryRouter initialEntries={['/sessions']}>
        <Routes>
          <Route path="/" element={<AppShell />}>
            <Route path="sessions" element={<Sessions />} />
          </Route>
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: 'Sessions', level: 1 })).toBeInTheDocument()
    const filter = screen.getByRole('tablist', { name: '도구 필터' })
    for (const tool of ['All', 'Claude Code', 'Cursor', 'Codex', 'Gemini']) {
      expect(filter).toContainElement(screen.getByRole('button', { name: tool }))
    }
    expect(screen.getByPlaceholderText('의도·작업자·repo 검색')).toBeInTheDocument()
    expect(screen.getAllByRole('link', { name: '열기 →' })).toHaveLength(7)
  })

  it('SessionDetail renders prompts, commands, files, matches for s-024', () => {
    render(
      <MemoryRouter initialEntries={['/sessions/s-024']}>
        <Routes>
          <Route path="/" element={<AppShell />}>
            <Route path="sessions/:id" element={<SessionDetail />} />
          </Route>
        </Routes>
      </MemoryRouter>,
    )

    expect(
      screen.getByRole('heading', {
        name: 'applicants 테이블 인덱스 추가 (created_at DESC)',
        level: 1,
      }),
    ).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '대화 맥락 (turn별 요약)' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '실행된 명령' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '변경 파일' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '매칭 commit 후보' })).toBeInTheDocument()
    expect(screen.getByText('f08c4b2')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '← 리스트' })).toHaveAttribute('href', '/sessions')
  })

  it('SessionDetail falls back when id is unknown', () => {
    render(
      <MemoryRouter initialEntries={['/sessions/s-999']}>
        <Routes>
          <Route path="/" element={<AppShell />}>
            <Route path="sessions/:id" element={<SessionDetail />} />
          </Route>
        </Routes>
      </MemoryRouter>,
    )

    expect(
      screen.getByRole('heading', { name: '세션을 찾을 수 없습니다', level: 1 }),
    ).toBeInTheDocument()
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
