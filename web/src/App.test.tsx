import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { AppShell } from './layout/AppShell'
import { OnboardingLayout } from './layout/OnboardingLayout'
import { PlaceholderScreen } from './screens/PlaceholderScreen'
import { Today } from './screens/Today'
import { Sessions } from './screens/Sessions'
import { SessionDetail } from './screens/SessionDetail'
import { ExplainBack } from './screens/ExplainBack'
import { Share } from './screens/Share'
import { SelfRecall } from './screens/SelfRecall'
import { Audit } from './screens/Audit'
import { StatusBoard } from './screens/dev/StatusBoard'
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
      expect.stringMatching(/^\/sessions\/s-\d+\/explain$/),
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

  it('ExplainBack renders 5 fields composer for s-024', () => {
    render(
      <MemoryRouter initialEntries={['/sessions/s-024/explain']}>
        <Routes>
          <Route path="/" element={<AppShell />}>
            <Route path="sessions/:id/explain" element={<ExplainBack />} />
          </Route>
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: 'Explain Back 노트', level: 1 })).toBeInTheDocument()
    for (const label of ['의도', '결과', '검증', '미해결', '핸드오프']) {
      expect(screen.getByLabelText(new RegExp(label))).toBeInTheDocument()
    }
    expect(screen.getByRole('link', { name: /← 세션/ })).toHaveAttribute('href', '/sessions/s-024')
    expect(screen.getByRole('link', { name: /저장 후 공유/ })).toHaveAttribute(
      'href',
      '/sessions/s-024/share',
    )
  })

  it('ExplainBack falls back when id is unknown', () => {
    render(
      <MemoryRouter initialEntries={['/sessions/s-999/explain']}>
        <Routes>
          <Route path="/" element={<AppShell />}>
            <Route path="sessions/:id/explain" element={<ExplainBack />} />
          </Route>
        </Routes>
      </MemoryRouter>,
    )

    expect(
      screen.getByRole('heading', { name: '세션을 찾을 수 없습니다', level: 1 }),
    ).toBeInTheDocument()
  })

  it('Share renders summary preview + channels + back link', () => {
    render(
      <MemoryRouter initialEntries={['/sessions/s-024/share']}>
        <Routes>
          <Route path="/" element={<AppShell />}>
            <Route path="sessions/:id/share" element={<Share />} />
          </Route>
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: '팀 공유 요약', level: 1 })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '요약 미리보기' })).toBeInTheDocument()
    expect(screen.getByText(/B2B SaaS 워크스페이스 · AI 작업 요약/)).toBeInTheDocument()
    for (const ch of ['Slack #ai-work', 'Notion · 일일 메모리', '이메일 (팀 메일링)']) {
      expect(screen.getByText(ch)).toBeInTheDocument()
    }
    expect(screen.getByRole('link', { name: /← Explain Back/ })).toHaveAttribute(
      'href',
      '/sessions/s-024/explain',
    )
  })

  it('Share copy button toggles label after clipboard write', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
    })

    render(
      <MemoryRouter initialEntries={['/sessions/s-024/share']}>
        <Routes>
          <Route path="/" element={<AppShell />}>
            <Route path="sessions/:id/share" element={<Share />} />
          </Route>
        </Routes>
      </MemoryRouter>,
    )

    const btn = screen.getByRole('button', { name: '전체 복사' })
    fireEvent.click(btn)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: '복사 완료' })).toBeInTheDocument()
    })
    expect(writeText).toHaveBeenCalled()
  })

  it('Share falls back when id is unknown', () => {
    render(
      <MemoryRouter initialEntries={['/sessions/s-999/share']}>
        <Routes>
          <Route path="/" element={<AppShell />}>
            <Route path="sessions/:id/share" element={<Share />} />
          </Route>
        </Routes>
      </MemoryRouter>,
    )

    expect(
      screen.getByRole('heading', { name: '세션을 찾을 수 없습니다', level: 1 }),
    ).toBeInTheDocument()
  })

  it('SelfRecall renders yesterday session split layout', () => {
    render(
      <MemoryRouter initialEntries={['/sessions/yesterday']}>
        <Routes>
          <Route path="/" element={<AppShell />}>
            <Route path="sessions/yesterday" element={<SelfRecall />} />
          </Route>
        </Routes>
      </MemoryRouter>,
    )

    expect(
      screen.getByRole('heading', { name: '셀프 회상 — 어제 한 일', level: 1 }),
    ).toBeInTheDocument()
    expect(screen.getByText('나만 보는 회상 모드')).toBeInTheDocument()
    expect(screen.getByText('주간 리포트 자동 생성 cron')).toBeInTheDocument()
    expect(screen.getByLabelText('오늘의 셀프 핸드오프')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /저장 후 Today로/ })).toHaveAttribute('href', '/today')
  })

  it('Audit defaults to trail tab with KPI cards and event table', () => {
    render(
      <MemoryRouter initialEntries={['/audit']}>
        <Routes>
          <Route path="/" element={<AppShell />}>
            <Route path="audit" element={<Audit />} />
          </Route>
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: 'Audit Trail', level: 1 })).toBeInTheDocument()
    expect(screen.getByText('AI 변경 검증율 · 30일')).toBeInTheDocument()
    expect(screen.getByText('미검토')).toBeInTheDocument()
    expect(screen.getByText('7대 원칙 적용')).toBeInTheDocument()
    expect(screen.getByText('applicants 테이블 prod 인덱스 적용 완료')).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Audit Trail', selected: true })).toBeInTheDocument()
  })

  it('Audit principles tab links upgrade cta to settings export', () => {
    render(
      <MemoryRouter initialEntries={['/audit?tab=principles']}>
        <Routes>
          <Route path="/" element={<AppShell />}>
            <Route path="audit" element={<Audit />} />
          </Route>
        </Routes>
      </MemoryRouter>,
    )

    expect(
      screen.getByRole('heading', { name: '7대 원칙 적용 상태', level: 1 }),
    ).toBeInTheDocument()
    expect(screen.getByText('원칙별 체크리스트')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /업그레이드/ })).toHaveAttribute(
      'href',
      '/settings?tab=export',
    )
  })

  it('Audit falls back to trail when tab query is unknown', () => {
    render(
      <MemoryRouter initialEntries={['/audit?tab=nope']}>
        <Routes>
          <Route path="/" element={<AppShell />}>
            <Route path="audit" element={<Audit />} />
          </Route>
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: 'Audit Trail', level: 1 })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Audit Trail', selected: true })).toBeInTheDocument()
  })

  it('Audit integrity tab shows mock notice + broken row detail', () => {
    render(
      <MemoryRouter initialEntries={['/audit?tab=integrity']}>
        <Routes>
          <Route path="/" element={<AppShell />}>
            <Route path="audit" element={<Audit />} />
          </Route>
        </Routes>
      </MemoryRouter>,
    )

    expect(
      screen.getByRole('heading', { name: '체인 무결성 결과', level: 1 }),
    ).toBeInTheDocument()
    expect(screen.getByRole('status', { name: 'mock 한계 안내' })).toBeInTheDocument()
    expect(screen.getByText(/ev-2396 · expected_prev=ad9912f · stored_prev=BROKEN/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '백필 후보로 분류' })).toBeInTheDocument()
  })

  it('Audit pdf tab renders pdf-frame preview + file format seg', () => {
    render(
      <MemoryRouter initialEntries={['/audit?tab=pdf']}>
        <Routes>
          <Route path="/" element={<AppShell />}>
            <Route path="audit" element={<Audit />} />
          </Route>
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: 'PDF export 미리보기', level: 1 })).toBeInTheDocument()
    expect(screen.getByText(/AI 변경 감사 자료/)).toBeInTheDocument()
    expect(screen.getByRole('tablist', { name: '파일 형식' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'PDF (한국어)' })).toHaveClass('active')
    expect(screen.getByText(/가설 H2 검증 포인트/)).toBeInTheDocument()
  })

  it('Audit tab buttons navigate via query param', () => {
    render(
      <MemoryRouter initialEntries={['/audit']}>
        <Routes>
          <Route path="/" element={<AppShell />}>
            <Route path="audit" element={<Audit />} />
          </Route>
        </Routes>
      </MemoryRouter>,
    )

    fireEvent.click(screen.getByRole('tab', { name: '체인 무결성' }))
    expect(
      screen.getByRole('heading', { name: '체인 무결성 결과', level: 1 }),
    ).toBeInTheDocument()

    fireEvent.click(screen.getByRole('tab', { name: 'PDF export' }))
    expect(
      screen.getByRole('heading', { name: 'PDF export 미리보기', level: 1 }),
    ).toBeInTheDocument()
  })

  it('StatusBoard renders phases + sprints + screens matrix', () => {
    render(
      <MemoryRouter initialEntries={['/dev/status']}>
        <Routes>
          <Route path="/" element={<AppShell />}>
            <Route path="dev/status" element={<StatusBoard />} />
          </Route>
        </Routes>
      </MemoryRouter>,
    )

    expect(
      screen.getByRole('heading', { name: /Agent Work Memory.*현황판/, level: 1 }),
    ).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Phase', level: 2 })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'm2 Sprint', level: 2 })).toBeInTheDocument()
    // 화면 매트릭스·보류·흔적은 details/summary로 collapse
    expect(screen.getByText(/화면 매트릭스/)).toBeInTheDocument()
    expect(screen.getByText(/보류 결정/)).toBeInTheDocument()
    expect(screen.getByText(/프로토타입 흔적/)).toBeInTheDocument()
    // 진행 중 Phase 1 m2 Build 표시
    expect(screen.getByText(/m2 Build/)).toBeInTheDocument()
    // 완료된 sprint
    expect(screen.getByText('S2.5.c')).toBeInTheDocument()
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
