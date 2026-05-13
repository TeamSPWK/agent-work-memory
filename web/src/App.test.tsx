import type { ReactElement } from 'react'
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react'
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
import { Risk } from './screens/Risk'
import { Incident } from './screens/Incident'
import { Workspace } from './screens/Workspace'
import { Settings } from './screens/Settings'
import { PublicShell } from './layout/PublicShell'
import { Landing } from './routes/public/Landing'
import { Pricing } from './routes/public/Pricing'
import { Signup, Login, Reset } from './routes/public/Auth'
import { Company } from './routes/public/Company'
import { Status as PublicStatus } from './routes/public/Status'
import { Terms, Privacy, Refund, Business } from './routes/public/Legal'
import { Err404, Err500, Maint } from './routes/public/Errors'
import { PUBLIC_ROUTES } from './lib/seed/public'
import { Workspace as OnboardingWs } from './screens/onboarding/Workspace'
import { Connect } from './screens/onboarding/Connect'
import { Import as OnboardingImportScreen } from './screens/onboarding/Import'
import { Reviewer } from './screens/onboarding/Reviewer'
import { Done } from './screens/onboarding/Done'
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
    expect(screen.getByRole('heading', { name: '오늘의 작업 타임라인' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /설명 메모 채우기/ })).toHaveAttribute(
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

    expect(screen.getByRole('heading', { name: '작업 세션', level: 1 })).toBeInTheDocument()
    const filter = screen.getByRole('tablist', { name: '도구 필터' })
    for (const tool of ['전체', 'Claude Code', 'Cursor', 'Codex', 'Gemini']) {
      expect(filter).toContainElement(screen.getByRole('tab', { name: tool }))
    }
    expect(screen.getByPlaceholderText('의도·작업자·저장소 검색')).toBeInTheDocument()
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

  it('SessionDetail renders live capture card for ingest sessions (S1.7 seed-id mismatch fix)', async () => {
    const { useIngest } = await import('./lib/useIngest')
    vi.mocked(useIngest).mockReturnValueOnce({
      loading: false,
      sessions: [
        {
          id: 'claude_abc_flow08_4b8bb4',
          tool: 'Claude Code',
          when: '2026-05-13 09:15',
          actor: '로컬 사용자',
          repo: 'agent-work-memory',
          intent: 'M0/S1.7 SessionDetail seed-id mismatch fix',
          risk: null,
          files: 2,
          cmds: 0,
          state: '추가 확인 필요',
          explained: false,
        },
      ],
      workPackets: [],
      auditEvents: [],
      error: null,
    })

    render(
      <MemoryRouter initialEntries={['/sessions/claude_abc_flow08_4b8bb4']}>
        <Routes>
          <Route path="/" element={<AppShell />}>
            <Route path="sessions/:id" element={<SessionDetail />} />
          </Route>
        </Routes>
      </MemoryRouter>,
    )

    expect(
      screen.getByRole('heading', {
        name: 'M0/S1.7 SessionDetail seed-id mismatch fix',
        level: 1,
      }),
    ).toBeInTheDocument()
    // Phase C5 — 라이브 분기가 4 패널 풍부화로 진화. 기본 정보 + 대화 흐름 + 실행된 명령 + 변경 파일.
    // (이전 'role=status 실 캡처 세션 배너'는 C5에서 제거 — 비어있다는 명시는 각 패널 안에서)
    expect(screen.getByRole('heading', { name: '기본 정보' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '대화 흐름' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '실행된 명령' })).toBeInTheDocument()
  })

  it('SessionDetail shows loading state while ingest is in-flight (S1.7)', async () => {
    const { useIngest } = await import('./lib/useIngest')
    vi.mocked(useIngest).mockReturnValueOnce({
      loading: true,
      sessions: [],
      workPackets: [],
      auditEvents: [],
      error: null,
    })

    render(
      <MemoryRouter initialEntries={['/sessions/claude_unknown_x']}>
        <Routes>
          <Route path="/" element={<AppShell />}>
            <Route path="sessions/:id" element={<SessionDetail />} />
          </Route>
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByRole('status', { name: '세션 불러오는 중' })).toBeInTheDocument()
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

    expect(screen.getByRole('heading', { name: '설명 메모', level: 1 })).toBeInTheDocument()
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
    expect(screen.getByRole('link', { name: /← 설명 메모/ })).toHaveAttribute(
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
      screen.getByRole('heading', { name: '내가 시킨 일 다시보기', level: 1 }),
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

    expect(screen.getByRole('heading', { name: '감사 기록', level: 1 })).toBeInTheDocument()
    expect(screen.getByText('AI 변경 검증율 · 30일')).toBeInTheDocument()
    expect(screen.getByText('미검토')).toBeInTheDocument()
    expect(screen.getByText('7대 원칙 적용')).toBeInTheDocument()
    expect(screen.getByText('applicants 테이블 prod 인덱스 적용 완료')).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: '감사 기록', selected: true })).toBeInTheDocument()
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

    expect(screen.getByRole('heading', { name: '감사 기록', level: 1 })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: '감사 기록', selected: true })).toBeInTheDocument()
  })

  it('Audit Trail splits work packets and chain tail when live workPackets exist', async () => {
    const { useIngest } = await import('./lib/useIngest')
    vi.mocked(useIngest).mockReturnValueOnce({
      loading: false,
      sessions: [],
      workPackets: [
        {
          id: 'packet_demo',
          title: 'M0/S1.7 SessionDetail fix',
          repo: 'swk/agent-work-memory',
          summary: '실 ingest id로 navigate 시 404 fix',
          status: 'needs_explanation',
          sessionIds: ['claude_xxx_flow01_aaa'],
          sessionCount: 1,
          needsReviewCount: 1,
          reviewedCount: 0,
          commitCandidateCount: 2,
          confirmedCommitCount: 0,
          riskCount: 0,
          evidenceScore: 60,
          evidenceGrade: '보통',
          lastActivity: '11:47',
          nextAction: '커밋 후보 확인',
        },
      ],
      auditEvents: [
        {
          id: 'evt_x',
          at: '2026-05-13T03:00:00Z',
          type: 'PreToolUse',
          session: 'claude_xxx',
          summary: 'PreToolUse: bash ls',
          actor: 'claude_hook',
          risk: null,
          hash: 'abc123',
          prev: 'def456',
          broken: false,
        },
      ],
      error: null,
    })

    render(
      <MemoryRouter initialEntries={['/audit']}>
        <Routes>
          <Route path="/" element={<AppShell />}>
            <Route path="audit" element={<Audit />} />
          </Route>
        </Routes>
      </MemoryRouter>,
    )

    expect(
      screen.getByRole('heading', { name: '작업 패킷 — 의도로 묶인 변경' }),
    ).toBeInTheDocument()
    expect(screen.getByText('M0/S1.7 SessionDetail fix')).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'Chain tail — 변조 불가성 증거 (PRD §5.5)' }),
    ).toBeInTheDocument()
    expect(screen.getByText('PreToolUse: bash ls')).toBeInTheDocument()
  })

  it('Today shows loading status and hides hero/KPI flash while ingest is in-flight', async () => {
    const { useIngest } = await import('./lib/useIngest')
    vi.mocked(useIngest).mockReturnValueOnce({
      loading: true,
      sessions: [],
      workPackets: [],
      auditEvents: [],
      error: null,
    })

    render(
      <MemoryRouter initialEntries={['/today']}>
        <Routes>
          <Route path="/" element={<AppShell />}>
            <Route path="today" element={<Today />} />
          </Route>
        </Routes>
      </MemoryRouter>,
    )

    // skeleton 모드 — hero/KPI/timeline 시드 텍스트가 로딩 중 안 보여야 한다 (flash 차단)
    expect(screen.queryByText(/오늘 작업 \d+건/)).not.toBeInTheDocument()
    expect(screen.queryByText('오늘의 작업 타임라인')).not.toBeInTheDocument()
    // skeleton hero 자체는 aria-label로 식별
    expect(screen.getByLabelText('오늘 우선 작업 불러오는 중')).toBeInTheDocument()
  })

  it('Sessions hides empty-state CTA while ingest is in-flight', async () => {
    const { useIngest } = await import('./lib/useIngest')
    vi.mocked(useIngest).mockReturnValueOnce({
      loading: true,
      sessions: [],
      workPackets: [],
      auditEvents: [],
      error: null,
    })

    render(
      <MemoryRouter initialEntries={['/sessions']}>
        <Routes>
          <Route path="/" element={<AppShell />}>
            <Route path="sessions" element={<Sessions />} />
          </Route>
        </Routes>
      </MemoryRouter>,
    )

    // skeleton 모드 — 빈 상태 카피·CTA가 로딩 중에 노출되지 않아야 한다
    expect(
      screen.queryByRole('heading', { name: '일치하는 세션이 없습니다.' }),
    ).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /도구 연결/ })).not.toBeInTheDocument()
  })

  it('Audit Trail shows loading status and hides seed flash while ingest is in-flight', async () => {
    const { useIngest } = await import('./lib/useIngest')
    vi.mocked(useIngest).mockReturnValueOnce({
      loading: true,
      sessions: [],
      workPackets: [],
      auditEvents: [],
      error: null,
    })

    render(
      <MemoryRouter initialEntries={['/audit']}>
        <Routes>
          <Route path="/" element={<AppShell />}>
            <Route path="audit" element={<Audit />} />
          </Route>
        </Routes>
      </MemoryRouter>,
    )

    // skeleton 모드 — seed AUDIT_EVENTS의 시드 텍스트가 로딩 중에 노출되지 않아야 한다 (flash 차단)
    expect(
      screen.queryByText('applicants 테이블 prod 인덱스 적용 완료'),
    ).not.toBeInTheDocument()
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
      screen.getByRole('heading', { name: '기록 변조 검증', level: 1 }),
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

    expect(screen.getByRole('heading', { name: 'PDF 내보내기 미리보기', level: 1 })).toBeInTheDocument()
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

    fireEvent.click(screen.getByRole('tab', { name: '기록 변조 검증' }))
    expect(
      screen.getByRole('heading', { name: '기록 변조 검증', level: 1 }),
    ).toBeInTheDocument()

    fireEvent.click(screen.getByRole('tab', { name: 'PDF 내보내기' }))
    expect(
      screen.getByRole('heading', { name: 'PDF 내보내기 미리보기', level: 1 }),
    ).toBeInTheDocument()
  })

  it('Risk renders 8 risk-tile categories and DB inline rows by default', () => {
    render(
      <MemoryRouter initialEntries={['/risk']}>
        <Routes>
          <Route path="/" element={<AppShell />}>
            <Route path="risk" element={<Risk />} />
          </Route>
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: 'Risk Radar', level: 1 })).toBeInTheDocument()
    const tablist = screen.getByRole('tablist', { name: '위험 카테고리' })
    for (const cat of [
      'DB',
      'Secret/Env',
      'Deploy/Infra',
      'Destructive Cmd',
      'Auth/Permission',
      'Migration',
      'Large Diff',
      'Failed Verification',
    ]) {
      expect(tablist).toContainElement(screen.getByRole('tab', { name: new RegExp(cat) }))
    }
    expect(screen.getByRole('tab', { name: /DB/, selected: true })).toBeInTheDocument()
    expect(
      screen.getByText('prod 환경 인덱스 마이그레이션 실행'),
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Incident Replay →/ })).toHaveAttribute(
      'href',
      '/incidents/INC-26-014',
    )
  })

  it('Risk switches signal list when a non-DB category tile is clicked', () => {
    render(
      <MemoryRouter initialEntries={['/risk']}>
        <Routes>
          <Route path="/" element={<AppShell />}>
            <Route path="risk" element={<Risk />} />
          </Route>
        </Routes>
      </MemoryRouter>,
    )

    fireEvent.click(screen.getByRole('tab', { name: /Secret\/Env/ }))
    expect(screen.getByText('NOTION_API_KEY .env 추가')).toBeInTheDocument()
    expect(screen.queryByText('prod 환경 인덱스 마이그레이션 실행')).not.toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: /Secret\/Env · 신호 리스트/ }),
    ).toBeInTheDocument()
  })

  it('Risk incident alert cta links to Incident Replay', () => {
    render(
      <MemoryRouter initialEntries={['/risk']}>
        <Routes>
          <Route path="/" element={<AppShell />}>
            <Route path="risk" element={<Risk />} />
          </Route>
        </Routes>
      </MemoryRouter>,
    )

    const alert = screen.getByRole('alert', { name: '진행 중 사고 알림' })
    expect(alert).toHaveTextContent('prod 사고 발생')
    const cta = screen.getByRole('link', { name: /Incident Replay$/ })
    expect(cta).toHaveAttribute('href', '/incidents/INC-26-014')
  })

  it('Incident defaults to replay tab with canvas + 3 buckets + KPI', () => {
    render(
      <MemoryRouter initialEntries={['/incidents/INC-26-014']}>
        <Routes>
          <Route path="/" element={<AppShell />}>
            <Route path="incidents/:id" element={<Incident />} />
          </Route>
        </Routes>
      </MemoryRouter>,
    )

    expect(
      screen.getByRole('heading', {
        name: '지원자 목록 페이지 9분간 504 (prod)',
        level: 1,
      }),
    ).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: '재생', selected: true })).toBeInTheDocument()
    expect(screen.getByRole('group', { name: '사고 타임라인 캔버스' })).toBeInTheDocument()
    expect(screen.getByText('원인 후보')).toBeInTheDocument()
    expect(screen.getByText('확실한 증거')).toBeInTheDocument()
    expect(screen.getByText('불명확')).toBeInTheDocument()
    expect(screen.getByText('관련 이벤트')).toBeInTheDocument()
    expect(screen.getByRole('status', { name: 'system 감지 mock 한계 안내' })).toBeInTheDocument()
  })

  it('Incident replay canvas mark click updates right-side detail', () => {
    render(
      <MemoryRouter initialEntries={['/incidents/INC-26-014']}>
        <Routes>
          <Route path="/" element={<AppShell />}>
            <Route path="incidents/:id" element={<Incident />} />
          </Route>
        </Routes>
      </MemoryRouter>,
    )

    // 기본 선택은 focus=true 인 e3 (prod 인덱스 마이그레이션 실행)
    expect(screen.getByText('prod 인덱스 마이그레이션 실행')).toBeInTheDocument()

    // e8 (관리자 세션 만료) mark 클릭 → 우측 detail 갱신
    fireEvent.click(screen.getByRole('button', { name: /16:36 · 관리자 세션 만료/ }))
    expect(
      screen.getByRole('heading', { name: '이벤트 상세' }),
    ).toBeInTheDocument()
    const detailHeading = screen.getAllByText('관리자 세션 만료 (정시 갱신)')
    expect(detailHeading.length).toBeGreaterThanOrEqual(1)
  })

  it('Incident note tab renders timeline + draft textarea, append adds a row', () => {
    render(
      <MemoryRouter initialEntries={['/incidents/INC-26-014?tab=note']}>
        <Routes>
          <Route path="/" element={<AppShell />}>
            <Route path="incidents/:id" element={<Incident />} />
          </Route>
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: '사고 메모', level: 1 })).toBeInTheDocument()
    expect(
      screen.getByText(/prod 마이그레이션 직후 시간 일치/),
    ).toBeInTheDocument()
    const textarea = screen.getByLabelText('새 메모')
    expect(textarea).toBeInTheDocument()

    const saveBtn = screen.getByRole('button', { name: /메모 저장/ })
    expect(saveBtn).toBeDisabled()

    fireEvent.change(textarea, { target: { value: '16:42 — lock 해소 확인. 응답시간 회복.' } })
    expect(saveBtn).not.toBeDisabled()
    fireEvent.click(saveBtn)
    expect(screen.getByText(/lock 해소 확인. 응답시간 회복/)).toBeInTheDocument()
  })

  it('Incident event tab renders fact + buckets + classification radiogroup', () => {
    render(
      <MemoryRouter initialEntries={['/incidents/INC-26-014?tab=event']}>
        <Routes>
          <Route path="/" element={<AppShell />}>
            <Route path="incidents/:id" element={<Incident />} />
          </Route>
        </Routes>
      </MemoryRouter>,
    )

    expect(
      screen.getByRole('heading', { name: '이 이벤트가 사고 원인일 가능성', level: 1 }),
    ).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '이벤트 핵심 사실' })).toBeInTheDocument()
    expect(screen.getByRole('radiogroup', { name: '3분리 분류' })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: /원인 후보/, checked: true })).toBeInTheDocument()
    expect(screen.getByLabelText(/분류 사유/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '저장 · 3분리 갱신' })).toBeInTheDocument()
  })

  it('Incident event tab radio group switches buckets on click', () => {
    render(
      <MemoryRouter initialEntries={['/incidents/INC-26-014?tab=event']}>
        <Routes>
          <Route path="/" element={<AppShell />}>
            <Route path="incidents/:id" element={<Incident />} />
          </Route>
        </Routes>
      </MemoryRouter>,
    )

    fireEvent.click(screen.getByRole('radio', { name: /확실한 증거/ }))
    expect(screen.getByRole('radio', { name: /확실한 증거/, checked: true })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: /원인 후보/, checked: false })).toBeInTheDocument()
  })

  it('Incident reviewer tab renders split intent/result + 3 match-line', () => {
    render(
      <MemoryRouter initialEntries={['/incidents/INC-26-014?tab=reviewer']}>
        <Routes>
          <Route path="/" element={<AppShell />}>
            <Route path="incidents/:id" element={<Incident />} />
          </Route>
        </Routes>
      </MemoryRouter>,
    )

    expect(
      screen.getByRole('heading', { name: '검토 요약 — s-024', level: 1 }),
    ).toBeInTheDocument()
    expect(screen.getByText('의도 — Operator 설명 메모 + AI 자동 추출')).toBeInTheDocument()
    expect(screen.getByText('결과 — 실제 변경 · 명령 · DB 영향')).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: '의도 ↔ 결과 매칭' }),
    ).toBeInTheDocument()
    expect(
      screen.getByText(/created_at DESC 단일 컬럼 인덱스 추가 \(의도 = 결과\)/),
    ).toBeInTheDocument()
    expect(
      screen.getByText(/dev → prod 적용 순서 \(의도 = 결과\)/),
    ).toBeInTheDocument()
    expect(
      screen.getByText(/scripts\/run-prod-migration\.sh 1줄 수정/),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /승인 \+ 기록/ })).toBeInTheDocument()
  })

  it('Incident falls back to replay when tab is unknown + mock incident notice for unknown id', () => {
    render(
      <MemoryRouter initialEntries={['/incidents/INC-99-999?tab=bogus']}>
        <Routes>
          <Route path="/" element={<AppShell />}>
            <Route path="incidents/:id" element={<Incident />} />
          </Route>
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByRole('tab', { name: '재생', selected: true })).toBeInTheDocument()
    expect(screen.getByRole('status', { name: 'mock incident 안내' })).toBeInTheDocument()
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
    expect(
      screen.getByRole('heading', { name: /Phase C.*Sprint/, level: 2 }),
    ).toBeInTheDocument()
    // 화면 매트릭스·보류·흔적은 details/summary로 collapse
    expect(screen.getByText(/화면 매트릭스/)).toBeInTheDocument()
    expect(screen.getByText(/보류 결정/)).toBeInTheDocument()
    expect(screen.getByText(/프로토타입 흔적/)).toBeInTheDocument()
    // 활성 Phase C — Local Dogfooding Ready (PhaseStepper + SprintList 헤더 2곳)
    expect(screen.getAllByText(/Local Dogfooding Ready/).length).toBeGreaterThanOrEqual(1)
    // 활성 sprint C2
    expect(screen.getByText('C2')).toBeInTheDocument()
  })

  it('Onboarding Workspace step renders form + progressbar + next link', () => {
    render(
      <MemoryRouter initialEntries={['/onboarding/ws']}>
        <Routes>
          <Route path="/onboarding" element={<OnboardingLayout />}>
            <Route path="ws" element={<OnboardingWs />} />
          </Route>
        </Routes>
      </MemoryRouter>,
    )

    expect(
      screen.getByRole('heading', { name: '워크스페이스를 만듭니다', level: 1 }),
    ).toBeInTheDocument()
    expect(screen.queryByRole('navigation', { name: '온보딩 단계' })).toBeInTheDocument()
    expect(
      screen.getByRole('progressbar', { name: '온보딩 진행' }),
    ).toHaveAttribute('aria-valuenow', '1')
    expect(screen.getByRole('radiogroup', { name: '세그먼트' })).toBeInTheDocument()
    expect(screen.getByRole('radiogroup', { name: '팀 규모' })).toBeInTheDocument()
    expect(screen.getByLabelText('워크스페이스 이름')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /다음 — 도구 연결/ })).toHaveAttribute(
      'href',
      '/onboarding/connect',
    )
    for (const item of NAV_ITEMS) {
      expect(
        screen.queryByRole('link', { name: new RegExp(`^${item.label}$`) }),
      ).not.toBeInTheDocument()
    }
  })

  it('Onboarding Connect Next is disabled until OAuth permits a tool', () => {
    render(
      <MemoryRouter initialEntries={['/onboarding/connect']}>
        <Routes>
          <Route path="/onboarding" element={<OnboardingLayout />}>
            <Route path="connect" element={<Connect />} />
          </Route>
        </Routes>
      </MemoryRouter>,
    )

    // claude_code 1개가 시드에서 connected — Next는 Link로 enabled
    const enabledNext = screen.getByRole('link', { name: /다음 — 첫 세션 import/ })
    expect(enabledNext).toHaveAttribute('href', '/onboarding/import')

    // claude_code 해제 → connectedCount 0 → button disabled + hint 표시
    fireEvent.click(screen.getByRole('button', { name: '연결 해제' }))
    const disabledBtn = screen.getByRole('button', { name: /다음 — 첫 세션 import/ })
    expect(disabledBtn).toBeDisabled()
    // a11y — aria-describedby가 hint와 연결
    expect(disabledBtn).toHaveAttribute('aria-describedby', 'connect-disabled-hint')
    expect(screen.getByText(/최소 1개 AI 도구를 연결한 뒤/)).toHaveAttribute(
      'id',
      'connect-disabled-hint',
    )

    // cursor 연결 → OAuth modal → 허용 → connectedCount 1 → 다시 Link
    fireEvent.click(screen.getAllByRole('button', { name: /연결$/ })[0])
    expect(screen.getByRole('dialog', { name: /OAuth 권한 확인/ })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /허용/ }))
    expect(
      screen.queryByRole('dialog', { name: /OAuth 권한 확인/ }),
    ).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: /다음 — 첫 세션 import/ })).toBeInTheDocument()
  })

  it('Onboarding Import renders 4-step timeline + first session card', () => {
    render(
      <MemoryRouter initialEntries={['/onboarding/import']}>
        <Routes>
          <Route path="/onboarding" element={<OnboardingLayout />}>
            <Route path="import" element={<OnboardingImportScreen />} />
          </Route>
        </Routes>
      </MemoryRouter>,
    )

    expect(
      screen.getByRole('heading', { name: /Cursor에서 가장 최근 세션을 import 중/, level: 1 }),
    ).toBeInTheDocument()
    expect(screen.getByText('권한 확인')).toBeInTheDocument()
    expect(screen.getByText('세션 메타 fetch')).toBeInTheDocument()
    expect(screen.getByText('파일 변경 매칭')).toBeInTheDocument()
    expect(screen.getByText('위험 분석')).toBeInTheDocument()
    expect(screen.getByText('지원서 폼 validation 에러 메시지 한국어로 교체')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /^Reviewer 지정/ })).toHaveAttribute(
      'href',
      '/onboarding/reviewer',
    )
  })

  it('Onboarding Reviewer toggles members and reflects §1 governance state', () => {
    render(
      <MemoryRouter initialEntries={['/onboarding/reviewer']}>
        <Routes>
          <Route path="/onboarding" element={<OnboardingLayout />}>
            <Route path="reviewer" element={<Reviewer />} />
          </Route>
        </Routes>
      </MemoryRouter>,
    )

    expect(
      screen.getByRole('heading', { name: /AI 변경 검토자.*지정하세요/, level: 1 }),
    ).toBeInTheDocument()
    // 시드 default 'u5' 선택
    expect(
      screen.getByRole('checkbox', { name: 'CTO 겸직 대표 선택', checked: true }),
    ).toBeInTheDocument()
    expect(screen.getByText('Reviewer 1명 지정 완료 — 활성')).toBeInTheDocument()

    // 해제 → pending 상태
    fireEvent.click(screen.getByRole('checkbox', { name: 'CTO 겸직 대표 선택' }))
    expect(screen.getByText('Reviewer 미지정 — 지금 지정하면 즉시 활성')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /완료/ }),
    ).toBeDisabled()

    // 다른 멤버 선택 → 다시 활성 + 완료 Link
    fireEvent.click(screen.getByRole('checkbox', { name: '개발 리드 (8년차) 선택' }))
    expect(screen.getByText('Reviewer 1명 지정 완료 — 활성')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /^완료/ })).toHaveAttribute(
      'href',
      '/onboarding/done',
    )
  })

  it('Onboarding Done renders 5분 mock KPI + Today jump link', () => {
    render(
      <MemoryRouter initialEntries={['/onboarding/done']}>
        <Routes>
          <Route path="/onboarding" element={<OnboardingLayout />}>
            <Route path="done" element={<Done />} />
          </Route>
        </Routes>
      </MemoryRouter>,
    )

    expect(
      screen.getByText('온보딩 완료 — 첫 세션이 Today에 도착했습니다'),
    ).toBeInTheDocument()
    expect(screen.getByText('4분 38초')).toBeInTheDocument()
    expect(screen.getByText('목표 5분 이하 — 통과')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Today 열기/ })).toHaveAttribute('href', '/today')
    expect(screen.getByText(/시연용 mock/)).toBeInTheDocument()
  })

  it('Workspace defaults to Members with 4 KPI + 6-row table + audit footer', () => {
    render(
      <MemoryRouter initialEntries={['/workspace']}>
        <Routes>
          <Route path="/" element={<AppShell />}>
            <Route path="workspace" element={<Workspace />} />
          </Route>
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: '구성원', level: 1 })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: '구성원', selected: true })).toBeInTheDocument()
    // KPI 4
    expect(screen.getByText('활성 멤버')).toBeInTheDocument()
    expect(screen.getByText('평균 검토 응답')).toBeInTheDocument()
    // 14분 (avgReviewMin) + KPI 'Reviewer' 라벨 + 'Admin' 라벨 등 중복 텍스트는 KPI .l 클래스로 좁힘
    expect(screen.getByText('14분')).toBeInTheDocument()
    const kpiLabels = Array.from(document.querySelectorAll('.kpi .l')).map((el) => el.textContent)
    expect(kpiLabels).toEqual(['활성 멤버', 'Reviewer', 'Admin', '평균 검토 응답'])
    // 멤버 6명
    expect(screen.getByText('멤버 6명')).toBeInTheDocument()
    expect(screen.getByText('운영 매니저 (4년차)')).toBeInTheDocument()
    expect(screen.getByText('CFO (외주 회계)')).toBeInTheDocument()
    // persona tag: Reviewer 2명(u3, u4) + Admin 2명(u5, u6)
    const personaTags = Array.from(document.querySelectorAll('table.tbl .tag')).map(
      (el) => el.textContent,
    )
    expect(personaTags.filter((t) => t === 'Reviewer').length).toBe(2)
    expect(personaTags.filter((t) => t === 'Admin').length).toBe(2)
    // 비활성 멤버(CFO) 1명
    expect(screen.getByText('비활성')).toBeInTheDocument()
    // Audit footer
    expect(
      screen.getByText(/역할 변경 · 초대 · 삭제는 모두 감사 기록에 자동 저장/),
    ).toBeInTheDocument()
  })

  it('Workspace switches to invite tab via query, renders email chips + role radiogroup', () => {
    render(
      <MemoryRouter initialEntries={['/workspace?tab=invite']}>
        <Routes>
          <Route path="/" element={<AppShell />}>
            <Route path="workspace" element={<Workspace />} />
          </Route>
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: '초대', level: 1 })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: '초대', selected: true })).toBeInTheDocument()
    // 이메일 시드 2개 추가됨
    expect(screen.getByText('2명 추가됨 · 초대 메일은 한국어로 발송됩니다.')).toBeInTheDocument()
    // 역할 radiogroup
    expect(screen.getByRole('radiogroup', { name: '사전 지정 역할' })).toBeInTheDocument()
    // 무료 역할 Reviewer가 default — DSA Art.25 사용자에게 유리한 기본값
    expect(screen.getByRole('radio', { name: /Reviewer/ })).toBeChecked()
    // 발송 버튼
    expect(
      screen.getByRole('button', { name: /2명에게 초대 메일 발송/ }),
    ).toBeInTheDocument()
  })

  it('Workspace invite: typing + Enter adds chip + clears input; Reviewer radio updates preview', () => {
    render(
      <MemoryRouter initialEntries={['/workspace?tab=invite']}>
        <Routes>
          <Route path="/" element={<AppShell />}>
            <Route path="workspace" element={<Workspace />} />
          </Route>
        </Routes>
      </MemoryRouter>,
    )

    const input = screen.getByLabelText('초대 이메일') as HTMLInputElement
    fireEvent.change(input, { target: { value: 'hi@team.test' } })
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(input.value).toBe('')
    expect(screen.getByText('3명 추가됨 · 초대 메일은 한국어로 발송됩니다.')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('radio', { name: /Reviewer/ }))
    // 메일 미리보기에 Reviewer 라벨 반영
    expect(screen.getByText('Reviewer', { selector: 'b' })).toBeInTheDocument()
  })

  it('Workspace roles tab renders 8-category × 3-role matrix + legend chips', () => {
    render(
      <MemoryRouter initialEntries={['/workspace?tab=roles']}>
        <Routes>
          <Route path="/" element={<AppShell />}>
            <Route path="workspace" element={<Workspace />} />
          </Route>
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: '역할 · 위험 규칙', level: 1 })).toBeInTheDocument()
    expect(screen.getByText('매트릭스 · 8 카테고리 × 3 역할 = 24 셀')).toBeInTheDocument()
    // 8 카테고리 모두
    for (const cat of [
      'DB',
      'Secret/Env',
      'Deploy/Infra',
      'Destructive Cmd',
      'Auth/Permission',
      'Migration',
      'Large Diff',
      'Failed Verification',
    ]) {
      expect(screen.getByText(cat)).toBeInTheDocument()
    }
    // role=status 변경 안내 박스
    expect(screen.getByRole('status', { name: '역할 변경 안내' })).toBeInTheDocument()
    expect(screen.getByText(/매트릭스 1셀이라도 변경하면 audit log/)).toBeInTheDocument()
  })

  it('Workspace tab buttons navigate via query param', async () => {
    render(
      <MemoryRouter initialEntries={['/workspace']}>
        <Routes>
          <Route path="/" element={<AppShell />}>
            <Route path="workspace" element={<Workspace />} />
          </Route>
        </Routes>
      </MemoryRouter>,
    )

    fireEvent.click(screen.getByRole('tab', { name: '역할 · 위험 규칙' }))
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: '역할 · 위험 규칙', level: 1 })).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: /← 구성원/ }))
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: '구성원', level: 1 })).toBeInTheDocument()
    })
  })

  it('Workspace falls back to Members when tab query is unknown', () => {
    render(
      <MemoryRouter initialEntries={['/workspace?tab=bogus']}>
        <Routes>
          <Route path="/" element={<AppShell />}>
            <Route path="workspace" element={<Workspace />} />
          </Route>
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByRole('tab', { name: '구성원', selected: true })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '구성원', level: 1 })).toBeInTheDocument()
  })

  it('Settings defaults to Profile tab — 5 tabs in tablist + grid forms + danger zone', () => {
    render(
      <MemoryRouter initialEntries={['/settings']}>
        <Routes>
          <Route path="/" element={<AppShell />}>
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: '프로필 · 계정', level: 1 })).toBeInTheDocument()
    // 5 tabs
    for (const t of [
      '프로필 · 계정',
      '연동',
      '알림',
      '감사 자료 내보내기',
      '요금제 · 결제',
    ]) {
      expect(screen.getByRole('tab', { name: t })).toBeInTheDocument()
    }
    expect(
      screen.getByRole('tab', { name: '프로필 · 계정', selected: true }),
    ).toBeInTheDocument()
    // 기본 정보 fields
    expect(screen.getByLabelText('표시 이름')).toHaveValue('CTO 겸직 대표')
    expect(screen.getByLabelText('역할 (워크스페이스 기준)')).toBeDisabled()
    // 알림 채널 3개 (cto@…/@cto/미연결)
    expect(screen.getByLabelText('이메일 알림 채널')).toBeChecked()
    expect(screen.getByLabelText('채널톡 알림 채널')).not.toBeChecked()
    // 위험 액션 region
    expect(screen.getByRole('region', { name: '위험 액션' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '계정 삭제 진행' })).toBeInTheDocument()
  })

  it('Settings Integrations: 4 AI tools + 3 external services + 예정 통합', () => {
    render(
      <MemoryRouter initialEntries={['/settings?tab=integrations']}>
        <Routes>
          <Route path="/" element={<AppShell />}>
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: '연동', level: 1 })).toBeInTheDocument()
    // AI 도구 4종 + 외부 서비스 3 — 각 이름 모두 한 번씩
    for (const name of ['Claude Code', 'Cursor', 'Codex', 'ChatGPT', 'GitHub', 'Slack', '채널톡']) {
      expect(screen.getByText(name)).toBeInTheDocument()
    }
    // 상태 — Claude Code(connected) / ChatGPT(error) / Cursor·Codex(idle)
    expect(screen.getAllByText('연결됨').length).toBeGreaterThanOrEqual(3) // claude_code + github + slack
    expect(screen.getByText('오류')).toBeInTheDocument()
    // 예정 통합
    expect(screen.getByText('Jira · 지원 예정')).toBeInTheDocument()
    expect(screen.getByText('Notion · 지원 예정')).toBeInTheDocument()
  })

  it('Settings Notifications: 5×4 rule matrix + 무음 시간대 weekend default + Slack mock', () => {
    render(
      <MemoryRouter initialEntries={['/settings?tab=notif']}>
        <Routes>
          <Route path="/" element={<AppShell />}>
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: '알림', level: 1 })).toBeInTheDocument()
    expect(screen.getByText('5개 이벤트 × 4 채널')).toBeInTheDocument()
    // 행 5개 — 각 이벤트 텍스트
    for (const e of [
      '고위험 신호 (DB · Secret · Destructive)',
      '미설명 세션 (24h)',
      '기록 변조 검증 깨짐',
      'Reviewer 응답 지연 (30분+)',
      '비용 한도 임박 (Active Op 80%)',
    ]) {
      expect(screen.getByText(e)).toBeInTheDocument()
    }
    // 매트릭스: 고위험 × email default checked
    expect(
      screen.getByLabelText('고위험 신호 (DB · Secret · Destructive) — 이메일'),
    ).toBeChecked()
    // 미설명 × email default unchecked
    expect(screen.getByLabelText('미설명 세션 (24h) — 이메일')).not.toBeChecked()
    // 무음 시간대 — 토/일 default checked, 평일 unchecked
    expect(screen.getByLabelText('토요일 무음')).toBeChecked()
    expect(screen.getByLabelText('월요일 무음')).not.toBeChecked()
    // Slack mock 미리보기
    expect(screen.getByText(/🚨 고위험 신호 — DB · prod/)).toBeInTheDocument()
  })

  it('Settings Audit Export: 3 forms + 4 retention + 3 schedule radiogroups + 5 recent exports', () => {
    render(
      <MemoryRouter initialEntries={['/settings?tab=export']}>
        <Routes>
          <Route path="/" element={<AppShell />}>
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: '감사 자료 내보내기 설정', level: 1 })).toBeInTheDocument()
    // 3 radiogroups
    expect(screen.getByRole('radiogroup', { name: 'PDF 양식' })).toBeInTheDocument()
    expect(screen.getByRole('radiogroup', { name: '보존 기간' })).toBeInTheDocument()
    expect(screen.getByRole('radiogroup', { name: '자동 export 일정' })).toBeInTheDocument()
    // PDF 양식 — 7대 원칙 default checked
    expect(screen.getByLabelText('인공지능기본법 7대 원칙 양식')).toBeChecked()
    expect(screen.getByLabelText('분기 감사 양식')).not.toBeChecked()
    // 보존 — 5년 default
    expect(screen.getByLabelText('5년 · 법정 권고')).toBeChecked()
    expect(screen.getByLabelText('영구')).not.toBeChecked()
    // 자동 export 일정 — 분기 default
    expect(screen.getByLabelText('분기')).toBeChecked()
    // 최근 export 5건
    expect(screen.getByText('최근 export 5건')).toBeInTheDocument()
    expect(screen.getAllByText('검증 OK').length).toBe(4)
    expect(screen.getByText('부분 누락')).toBeInTheDocument()
    // SHA-256 변경 불가
    expect(screen.getByText('SHA-256')).toBeInTheDocument()
  })

  it('Settings Billing tab: current plan + usage progressbar + 5 plan cards + 세금계산서 + 결제수단', () => {
    render(
      <MemoryRouter initialEntries={['/settings?tab=billing']}>
        <Routes>
          <Route path="/" element={<AppShell />}>
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: '요금제 · 결제', level: 1 })).toBeInTheDocument()
    // 현재 플랜 (Team · 100,000원/월) — 외부 PUBLIC_TIERS와 정합
    expect(screen.getByText(/Team · 100,000원\/월/)).toBeInTheDocument()
    // 무제한 플랜이라 progressbar 없음 — "무제한 플랜" 안내 텍스트
    expect(screen.getByText(/무제한 플랜 — Active Operator는 청구 단위로만/)).toBeInTheDocument()
    // 3 플랜 비교 group — 외부 Free/Team/Business와 정합
    const plans = screen.getByRole('group', { name: '플랜 비교' })
    for (const n of ['Free', 'Team', 'Business']) {
      expect(within(plans).getByText(n)).toBeInTheDocument()
    }
    // 현재/추천 태그 (Team이 둘 다 보유)
    expect(within(plans).getByText('현재')).toBeInTheDocument()
    expect(within(plans).getByText('추천')).toBeInTheDocument()
    // 현재 플랜 버튼 disabled (3개 중 Team)
    expect(screen.getByRole('button', { name: '현재 플랜' })).toBeDisabled()
    // 세금계산서 4 필드 (htmlFor)
    expect(screen.getByLabelText('사업자등록번호')).toHaveValue('000-00-00000')
    expect(screen.getByLabelText('발행 이메일')).toHaveValue('finance@workspace-a.com')
    // 청구서 3건 + 다운로드 a11y
    expect(screen.getByRole('button', { name: '2026-04 세금계산서 다운로드' })).toBeInTheDocument()
    // 결제 수단 (신한카드 ****1234)
    expect(screen.getByText(/신한카드 · \*\*\*\*-\*\*\*\*-\*\*\*\*-1234/)).toBeInTheDocument()
    // 사용량 알림 — 80%/100%/±20% 모두 default checked (소비자 보호 default on)
    expect(screen.getByLabelText('Active OP 80% 도달')).toBeChecked()
    expect(screen.getByLabelText('월 청구액 ±20% 변동')).toBeChecked()
  })

  it('Settings Billing: 연결제 25% toggle switches plan prices to /년 with discount math', () => {
    render(
      <MemoryRouter initialEntries={['/settings?tab=billing']}>
        <Routes>
          <Route path="/" element={<AppShell />}>
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </MemoryRouter>,
    )

    const plans = screen.getByRole('group', { name: '플랜 비교' })
    // 월간 default — Team 100,000원, Business 300,000원
    expect(within(plans).getByText('100,000원')).toBeInTheDocument()
    expect(within(plans).getByText('300,000원')).toBeInTheDocument()
    // 연결제 toggle — Team = round(100000 * 0.75 * 12 / 1000) * 1000 = 900,000원/년
    fireEvent.click(screen.getByRole('checkbox', { name: '연결제 25% 할인' }))
    expect(within(plans).getByText('900,000원')).toBeInTheDocument()
    // Business = round(300000 * 0.75 * 12 / 1000) * 1000 = 2,700,000원/년
    expect(within(plans).getByText('2,700,000원')).toBeInTheDocument()
  })

  it('Settings tab navigation: click tab updates query + heading', async () => {
    render(
      <MemoryRouter initialEntries={['/settings']}>
        <Routes>
          <Route path="/" element={<AppShell />}>
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </MemoryRouter>,
    )

    fireEvent.click(screen.getByRole('tab', { name: '감사 자료 내보내기' }))
    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: '감사 자료 내보내기 설정', level: 1 }),
      ).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('tab', { name: '프로필 · 계정' }))
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: '프로필 · 계정', level: 1 })).toBeInTheDocument()
    })
  })

  it('Settings falls back to Profile when tab is unknown', () => {
    render(
      <MemoryRouter initialEntries={['/settings?tab=bogus']}>
        <Routes>
          <Route path="/" element={<AppShell />}>
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </MemoryRouter>,
    )

    expect(
      screen.getByRole('tab', { name: '프로필 · 계정', selected: true }),
    ).toBeInTheDocument()
  })

  it('PublicShell mounts topbar + footer + no dev hyp banner on /landing', () => {
    render(
      <MemoryRouter initialEntries={['/landing']}>
        <Routes>
          <Route element={<PublicShell />}>
            <Route path="landing" element={<Landing />} />
          </Route>
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByRole('banner')).toBeInTheDocument()
    expect(screen.getByRole('contentinfo')).toBeInTheDocument()
    // 외부 페이지에서 dev 가설 배너는 표시되지 않음 — /dev/status로 분리됨
    expect(
      screen.queryByRole('region', { name: '가설 검증 배너' }),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('region', { name: '외부 페이지 안내' }),
    ).not.toBeInTheDocument()
    // top nav 메뉴 4개 (footer link와 분리)
    const topMenu = screen.getByRole('navigation', { name: '외부 메뉴' })
    expect(screen.getByLabelText('AWM 홈')).toBeInTheDocument()
    for (const label of ['제품', '가격', '회사', '상태']) {
      expect(within(topMenu).getByRole('link', { name: label })).toBeInTheDocument()
    }
    // CTA — 로그인 + 5분 시작
    expect(screen.getByRole('link', { name: '로그인' })).toHaveAttribute('href', '/login')
    expect(screen.getByRole('link', { name: '5분 시작' })).toHaveAttribute('href', '/signup')
    // 사업자 미등록 placeholder
    expect(screen.getByText('[사업자 등록 후 입력]')).toBeInTheDocument()
    expect(screen.getByText('[신고 후 입력]')).toBeInTheDocument()
    // Landing h1 — 질문형(audience 확장 후)
    expect(
      screen.getByRole('heading', { level: 1, name: /어제 AI에게 시킨 일/ }),
    ).toBeInTheDocument()
  })

  it('PublicShell — /company도 dev 안내 배너 없이 깔끔', () => {
    render(
      <MemoryRouter initialEntries={['/company']}>
        <Routes>
          <Route element={<PublicShell />}>
            <Route path="company" element={<Company />} />
          </Route>
        </Routes>
      </MemoryRouter>,
    )

    expect(
      screen.queryByRole('region', { name: '외부 페이지 안내' }),
    ).not.toBeInTheDocument()
    expect(screen.queryByText('측정 지표 없음')).not.toBeInTheDocument()
    expect(
      screen.getByRole('heading', { level: 1, name: /AI가 만든 변경을/ }),
    ).toBeInTheDocument()
  })

  it('StatusBoard — 외부 페이지 가설 섹션이 PUBLIC_HYPS를 표시한다', () => {
    render(
      <MemoryRouter initialEntries={['/dev/status']}>
        <Routes>
          <Route path="/" element={<AppShell />}>
            <Route path="dev/status" element={<StatusBoard />} />
          </Route>
        </Routes>
      </MemoryRouter>,
    )

    const sectionSummary = screen.getByText(/외부 페이지 가설/)
    // 가설 영역 토글 펼치기
    fireEvent.click(sectionSummary)
    // landing/pricing/signup 가설 statement 모두 표시
    expect(
      screen.getByText(/30초 안에 핵심 가치 \+ CTA 클릭이 발생하면/),
    ).toBeInTheDocument()
    expect(
      screen.getByText(/티어 \+ Active Operator 정의 \+ 디자인 파트너 50%/),
    ).toBeInTheDocument()
    expect(
      screen.getByText(/이메일 \+ Google OAuth \+ 한국어 카피로/),
    ).toBeInTheDocument()
  })

  it('14 PUBLIC_ROUTES dispatch — 모든 라우트가 실제 페이지로 mount', () => {
    const elements: Record<string, ReactElement> = {
      '/landing': <Landing />,
      '/pricing': <Pricing />,
      '/signup': <Signup />,
      '/login': <Login />,
      '/reset': <Reset />,
      '/company': <Company />,
      '/status': <PublicStatus />,
      '/legal/terms': <Terms />,
      '/legal/privacy': <Privacy />,
      '/legal/refund': <Refund />,
      '/legal/business': <Business />,
      '/404': <Err404 />,
      '/500': <Err500 />,
      '/maintenance': <Maint />,
    }
    expect(PUBLIC_ROUTES).toHaveLength(14)
    expect(new Set(Object.keys(elements))).toEqual(
      new Set(PUBLIC_ROUTES.map((r) => r.path)),
    )

    for (const route of PUBLIC_ROUTES) {
      const { unmount } = render(
        <MemoryRouter initialEntries={[route.path]}>
          <Routes>
            <Route element={<PublicShell />}>
              <Route path={route.path} element={elements[route.path]} />
            </Route>
          </Routes>
        </MemoryRouter>,
      )
      // 실제 페이지 컴포넌트가 PublicShell 내부에 mount — main 영역에 콘텐츠 존재
      const main = screen.getByRole('main')
      expect(main).not.toBeEmptyDOMElement()
      unmount()
    }
  })

  it('Landing /landing — Hero 질문형 h1 + 3 가치(회상·검토·복원) + 2 news + 4 flow + 3 tiers + 7 FAQ', () => {
    render(
      <MemoryRouter initialEntries={['/landing']}>
        <Routes>
          <Route element={<PublicShell />}>
            <Route path="landing" element={<Landing />} />
          </Route>
        </Routes>
      </MemoryRouter>,
    )

    // Hero — 질문형 h1 + 학생/초심자 안내
    expect(
      screen.getByRole('heading', { level: 1, name: /어제 AI에게 시킨 일/ }),
    ).toBeInTheDocument()
    expect(screen.getByText(/개인은 무료\(보존 7일\)\. 학생 · 인디 사용자도/)).toBeInTheDocument()
    // dev 가설/법 chip은 더 이상 hero에 표시되지 않음
    expect(screen.queryByText(/2026-01-22 시행됨/)).not.toBeInTheDocument()

    // CTA (signup + pricing 보기) — hero + dark CTA 등 여러 곳에 존재
    const signupCTAs = screen.getAllByRole('link', { name: /5분 안에 시작하기/ })
    expect(signupCTAs.length).toBeGreaterThanOrEqual(2)
    expect(signupCTAs[0]).toHaveAttribute('href', '/signup')

    // 3 가치 카드 — H 라벨 제거, 평이한 한국어
    expect(screen.getByRole('heading', { level: 3, name: '회상' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 3, name: '검토' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 3, name: '복원' })).toBeInTheDocument()
    // 출처 없는 mock 숫자(62% / 62분 등) 제거 확인
    expect(screen.queryByText(/62%/)).not.toBeInTheDocument()
    expect(screen.queryByText(/62분/)).not.toBeInTheDocument()
    // H1/H2/H3 가치 태그 제거
    expect(screen.queryByText(/^H1$/)).not.toBeInTheDocument()
    expect(screen.queryByText(/^H2$/)).not.toBeInTheDocument()

    // 외부 보도 2개로 축약(Replit + PocketOS만)
    expect(screen.getByText(/Replit · DB 삭제/)).toBeInTheDocument()
    expect(screen.getByText(/PocketOS · 9초 삭제/)).toBeInTheDocument()
    expect(screen.queryByText(/UK 학생 33% AI 작성/)).not.toBeInTheDocument()
    expect(screen.queryByText(/METR · 체감/)).not.toBeInTheDocument()

    // 4 flow steps + H 라벨 제거
    for (const s of ['01', '02', '03', '04']) {
      expect(screen.getByText(s)).toBeInTheDocument()
    }
    expect(screen.getByText('AI 도구 연결')).toBeInTheDocument()
    expect(screen.getByText('자동 기록')).toBeInTheDocument()
    expect(screen.getByText('자동 요약')).toBeInTheDocument()
    expect(screen.getByText('검토 · 공유')).toBeInTheDocument()
    // H4 · 5분 온보딩 같은 내부 가설 라벨 부재
    expect(screen.queryByText(/H4 · 5분 온보딩/)).not.toBeInTheDocument()

    // 7원칙 카드는 제거됨 (1인 운영 환경/Reviewer SLA 등)
    expect(screen.queryByText(/Reviewer SLA 1인 운영/)).not.toBeInTheDocument()

    // 3 tiers + 디자인 파트너 chip
    expect(screen.getByText('디자인 파트너 5팀 한정 50%')).toBeInTheDocument()
    const tierList = screen.getByRole('group', { name: '플랜 미리보기' })
    for (const n of ['Free', 'Team', 'Business']) {
      expect(within(tierList).getByText(n)).toBeInTheDocument()
    }

    // FAQ 7개 + 학생/개인 안내 포함
    expect(screen.getByText('AWM은 정확히 무엇을 해주나요?')).toBeInTheDocument()
    expect(screen.getByText('개인도 쓸 수 있나요? 학생도?')).toBeInTheDocument()
    expect(screen.getByText('AI 처음 써보는데 사용할 수 있나요?')).toBeInTheDocument()

    // dark CTA strip
    expect(screen.getByText('5분이면 첫 세션이 자동 기록됩니다.')).toBeInTheDocument()
  })

  it('Pricing /pricing — 3 tier full(items 전체) + dp-chip + AOP 정의 + 비교표 12행 + FAQ 5 + dark CTA', () => {
    render(
      <MemoryRouter initialEntries={['/pricing']}>
        <Routes>
          <Route element={<PublicShell />}>
            <Route path="pricing" element={<Pricing />} />
          </Route>
        </Routes>
      </MemoryRouter>,
    )

    // Hero h2
    expect(
      screen.getByRole('heading', { level: 2, name: '일하는 사람만 카운트합니다.' }),
    ).toBeInTheDocument()
    // dp-chip-row role=region (정적 프로모션 배너)
    expect(
      screen.getByRole('region', { name: '디자인 파트너 안내' }),
    ).toBeInTheDocument()
    // 3 tier group(role=group — Landing tier와 동일 패턴)
    const tiers = screen.getByRole('group', { name: '플랜 비교' })
    for (const n of ['Free', 'Team', 'Business']) {
      expect(within(tiers).getByText(n)).toBeInTheDocument()
    }
    // 디자인 파트너 chip Team tier
    expect(within(tiers).getByText('디자인 파트너 5팀 한정 50%')).toBeInTheDocument()
    // tier items 풀(랜딩은 slice(0,4)지만 가격은 전체) — 'Audit 보존 5년' Business item
    expect(within(tiers).getByText(/Audit 보존 5년/)).toBeInTheDocument()
    // Business CTA → /company (디자인 파트너 신청)
    const bizCTA = within(tiers).getByRole('link', { name: '디자인 파트너 신청' })
    expect(bizCTA).toHaveAttribute('href', '/company')

    // Active Operator 정의 note
    expect(
      screen.getByRole('note', { name: 'Active Operator 정의' }),
    ).toBeInTheDocument()

    // 비교표 — 12행 × 3 컬럼
    const compareTable = screen.getByRole('table', { name: '플랜 비교표' })
    const bodyRows = within(compareTable).getAllByRole('row').slice(1) // header 제외
    expect(bodyRows).toHaveLength(12)
    // 'Audit 보존 기간' 행 — Free 7일 / Team 90일 / Business 5년
    expect(within(compareTable).getByText('7일')).toBeInTheDocument()
    expect(within(compareTable).getByText('90일')).toBeInTheDocument()
    expect(within(compareTable).getByText('5년')).toBeInTheDocument()

    // FAQ 5건
    for (const q of [
      '미사용 시 환불되나요?',
      'Operator 외 멤버는 무료인가요?',
      '인공지능기본법 자동 보고서가 정말 PDF로 나오나요?',
      '다운타임·SLA는 어떻게 되나요?',
      '데이터는 어디에 저장되나요?',
    ]) {
      expect(screen.getByText(q)).toBeInTheDocument()
    }
    // 환불 정책 + 회사 페이지 link — footer에도 같은 라벨 존재하므로 main scope로
    const main = screen.getByRole('main')
    expect(within(main).getByRole('link', { name: '환불 정책' })).toHaveAttribute(
      'href',
      '/legal/refund',
    )
    expect(within(main).getByRole('link', { name: '회사 페이지' })).toHaveAttribute(
      'href',
      '/company',
    )

    // dark CTA
    expect(screen.getByText('가격을 보셨으면 다음은 5분.')).toBeInTheDocument()
  })

  it('Signup /signup — form + 약관 필수 체크 + OAuth + 가입 후 5분 미리보기', () => {
    render(
      <MemoryRouter initialEntries={['/signup']}>
        <Routes>
          <Route element={<PublicShell />}>
            <Route path="signup" element={<Signup />} />
          </Route>
        </Routes>
      </MemoryRouter>,
    )

    // h2 + audience 카피
    expect(
      screen.getByRole('heading', { level: 2, name: '5분 안에 워크스페이스 만들기.' }),
    ).toBeInTheDocument()
    expect(screen.getByText(/개인·학생도 평가용으로/)).toBeInTheDocument()

    // 내부 가설 라벨 부재 (H4 / PRD §)
    expect(screen.queryByText(/H4 화면/)).not.toBeInTheDocument()
    expect(screen.queryByText(/PRD §/)).not.toBeInTheDocument()

    // OAuth 버튼 + 이메일/비밀번호 필드
    expect(screen.getByRole('button', { name: /Google로 계속하기/ })).toBeInTheDocument()
    expect(screen.getByLabelText('이메일')).toBeInTheDocument()
    expect(screen.getByLabelText(/비밀번호/)).toBeInTheDocument()

    // 필수 약관 체크박스 — 정통망법 §22 명시적 동의, 기본 unchecked + submit disabled
    const submit = screen.getByRole('button', {
      name: /가입하고 워크스페이스 만들기/,
    })
    expect(submit).toBeDisabled()
    const required = screen.getByRole('checkbox', { name: /\(필수\)/ })
    expect(required).not.toBeChecked()
    fireEvent.click(required)
    expect(required).toBeChecked()
    expect(submit).not.toBeDisabled()
    fireEvent.click(required)
    expect(submit).toBeDisabled()

    // 5분 미리보기 5단계
    const aside = screen.getByLabelText('가입 후 진행 미리보기')
    expect(within(aside).getByText(/1\. 워크스페이스 생성/)).toBeInTheDocument()
    expect(
      within(aside).getByText(/5\. 완료 · Today 화면으로 이동/),
    ).toBeInTheDocument()
    expect(within(aside).getByText('≤ 5분')).toBeInTheDocument()

    // 약관 링크
    const main = screen.getByRole('main')
    expect(within(main).getByRole('link', { name: '이용약관' })).toHaveAttribute(
      'href',
      '/legal/terms',
    )
    expect(within(main).getByRole('link', { name: '개인정보처리방침' })).toHaveAttribute(
      'href',
      '/legal/privacy',
    )
    expect(within(main).getByRole('link', { name: '로그인' })).toHaveAttribute(
      'href',
      '/login',
    )
  })

  it('Login /login — form + 매직 링크 + 로그인 유지 + 재설정 link', () => {
    render(
      <MemoryRouter initialEntries={['/login']}>
        <Routes>
          <Route element={<PublicShell />}>
            <Route path="login" element={<Login />} />
          </Route>
        </Routes>
      </MemoryRouter>,
    )

    expect(
      screen.getByRole('heading', { level: 2, name: '다시 오신 것을 환영합니다.' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Google로 계속하기/ })).toBeInTheDocument()
    expect(screen.getByLabelText('이메일')).toBeInTheDocument()
    expect(screen.getByLabelText('비밀번호')).toBeInTheDocument()
    expect(
      screen.getByRole('checkbox', { name: /이 기기에서 로그인 유지/ }),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /이메일로 매직 링크 받기/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^로그인$/ })).toBeInTheDocument()

    const main = screen.getByRole('main')
    expect(
      within(main).getByRole('link', { name: '비밀번호를 잊으셨나요?' }),
    ).toHaveAttribute('href', '/reset')
    expect(within(main).getByRole('link', { name: '가입하기' })).toHaveAttribute(
      'href',
      '/signup',
    )

    // 워크스페이스 안내 aside
    const aside = screen.getByLabelText('워크스페이스 안내')
    expect(
      within(aside).getByText(/이메일 1개 = 워크스페이스 N개/),
    ).toBeInTheDocument()
    expect(
      within(aside).getByRole('link', { name: '비밀번호 재설정' }),
    ).toHaveAttribute('href', '/reset')
  })

  it('Reset /reset — submit toggles sent state + mail preview', () => {
    render(
      <MemoryRouter initialEntries={['/reset']}>
        <Routes>
          <Route element={<PublicShell />}>
            <Route path="reset" element={<Reset />} />
          </Route>
        </Routes>
      </MemoryRouter>,
    )

    // 초기 상태
    expect(
      screen.getByRole('heading', { level: 2, name: '비밀번호 재설정.' }),
    ).toBeInTheDocument()
    const emailInput = screen.getByLabelText('가입 이메일') as HTMLInputElement
    expect(emailInput).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: '재설정 링크 보내기' }),
    ).toBeInTheDocument()

    // 발송 mail mock — 발송 전에도 우측에 미리보기 노출
    const aside = screen.getByLabelText('발송 메일 미리보기')
    expect(
      within(aside).getByText('[AWM] 비밀번호 재설정 안내'),
    ).toBeInTheDocument()
    expect(within(aside).getByText('비밀번호 재설정하기')).toBeInTheDocument()

    // submit → sent state
    fireEvent.change(emailInput, { target: { value: 'someone@company.com' } })
    fireEvent.submit(emailInput.form!)
    expect(
      screen.getByRole('heading', { level: 2, name: '재설정 링크를 보냈습니다.' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('발송 완료')

    // 다시 보내기 → 폼 복귀
    fireEvent.click(screen.getByRole('button', { name: '다른 이메일로 다시 보내기' }))
    expect(
      screen.getByRole('heading', { level: 2, name: '비밀번호 재설정.' }),
    ).toBeInTheDocument()
  })

  it('Company /company — 일반 회사 소개 톤 (1인 표현 부재) + 디자인 파트너 모집 + 사업자 정보', () => {
    render(
      <MemoryRouter initialEntries={['/company']}>
        <Routes>
          <Route element={<PublicShell />}>
            <Route path="company" element={<Company />} />
          </Route>
        </Routes>
      </MemoryRouter>,
    )

    // Hero h1
    expect(
      screen.getByRole('heading', { level: 1, name: /AI가 만든 변경을/ }),
    ).toBeInTheDocument()

    // 1인 표현 외부 노출 부재
    const main = screen.getByRole('main')
    expect(within(main).queryByText(/1인 창업자/)).not.toBeInTheDocument()
    expect(within(main).queryByText(/1인 운영/)).not.toBeInTheDocument()
    expect(within(main).queryByText(/왜 1인/)).not.toBeInTheDocument()

    // 미션 + 안 하는 것 (섹션당 h2 1개 + h3 1개)
    expect(
      screen.getByRole('heading', { level: 2, name: 'AI 자율성과 검토 가능성을 동시에.' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { level: 3, name: '지킬 수 있는 약속만.' }),
    ).toBeInTheDocument()
    expect(screen.getByText(/24\/7 SLA · 실시간 채팅 응답/)).toBeInTheDocument()
    expect(screen.getByText(/엔터프라이즈 영업 · 온사이트 미팅/)).toBeInTheDocument()

    // 연락 + 디자인 파트너 (sec-partner h2 1개 + h3 2개)
    expect(
      screen.getByRole('heading', { level: 2, name: '연락과 디자인 파트너 모집.' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { level: 3, name: '먼저 메일 또는 채널톡으로.' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { level: 3, name: '선착순 5팀 · 50% 할인 · 격주 인터뷰 1회.' }),
    ).toBeInTheDocument()

    // 메일 보내기 — mailto 링크
    const mailLink = within(main).getByRole('link', { name: /메일 보내기/ })
    expect(mailLink.getAttribute('href')).toMatch(/^mailto:/)
    // 디자인 파트너 신청 — mailto subject 포함
    const partnerLink = within(main).getByRole('link', { name: '디자인 파트너 신청' })
    expect(partnerLink.getAttribute('href')).toMatch(/^mailto:/)

    // 마지막 CTA — signup + status 두 링크
    expect(
      within(main).getByRole('link', { name: /5분 안에 워크스페이스 만들기/ }),
    ).toHaveAttribute('href', '/signup')
    expect(within(main).getByRole('link', { name: /상태 페이지 보기/ })).toHaveAttribute(
      'href',
      '/status',
    )
  })

  it('Status /status — 준비 단계 안내 + 5 서비스 행 + 공개 예정 지표 4 + 사고 이력 빈 상태', () => {
    render(
      <MemoryRouter initialEntries={['/status']}>
        <Routes>
          <Route element={<PublicShell />}>
            <Route path="status" element={<PublicStatus />} />
          </Route>
        </Routes>
      </MemoryRouter>,
    )

    // Hero
    expect(
      screen.getByRole('heading', { level: 1, name: /현재 AWM은/ }),
    ).toBeInTheDocument()
    expect(screen.getByText(/v2\.0 출시 전이라 production 시스템/)).toBeInTheDocument()

    // 1인 표현 부재
    const main = screen.getByRole('main')
    expect(within(main).queryByText(/1인 창업자/)).not.toBeInTheDocument()
    expect(within(main).queryByText(/1인 운영/)).not.toBeInTheDocument()

    // 5 서비스 행
    const services = screen.getByRole('list', { name: '서비스 구성요소 상태' })
    const rows = within(services).getAllByRole('listitem')
    expect(rows).toHaveLength(5)
    expect(within(services).getByText('웹 콘솔 (web)')).toBeInTheDocument()
    expect(within(services).getByText('API · Audit Layer')).toBeInTheDocument()
    expect(within(services).getByText('PDF export (§27)')).toBeInTheDocument()

    // 모든 상태가 '준비 중' (pre-launch)
    const preLaunchBadges = within(services).getAllByText('준비 중')
    expect(preLaunchBadges).toHaveLength(5)

    // 공개 예정 지표 4
    const promises = screen.getByRole('list', { name: '공개 예정 지표 목록' })
    const promiseRows = within(promises).getAllByRole('listitem')
    expect(promiseRows).toHaveLength(4)
    expect(within(promises).getByText('30일 uptime')).toBeInTheDocument()
    expect(within(promises).getByText('주요 사고 이력')).toBeInTheDocument()

    // 사고 이력 빈 상태
    expect(
      screen.getByRole('heading', { level: 2, name: '현재 기록된 사고 없음.' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('status', { name: '사고 이력 없음' })).toBeInTheDocument()

    // 알림 신청 mailto
    const alertCta = within(main).getByRole('link', { name: /메일로 알림 신청/ })
    expect(alertCta.getAttribute('href')).toMatch(/^mailto:/)

    // cross-link to company + pricing
    expect(within(main).getByRole('link', { name: '회사 페이지' })).toHaveAttribute(
      'href',
      '/company',
    )
    expect(within(main).getByRole('link', { name: '가격 페이지' })).toHaveAttribute(
      'href',
      '/pricing',
    )
  })

  it('Legal /legal/terms — LegalShell + 목차 12 + 본문 placeholder + 1인 외부 노출 X', () => {
    render(
      <MemoryRouter initialEntries={['/legal/terms']}>
        <Routes>
          <Route element={<PublicShell />}>
            <Route path="legal/terms" element={<Terms />} />
          </Route>
        </Routes>
      </MemoryRouter>,
    )

    expect(
      screen.getByRole('heading', { level: 2, name: '이용약관' }),
    ).toBeInTheDocument()

    // 목차 12 항목 (terms TOC)
    const toc = screen.getByRole('complementary', { name: '목차' })
    const tocItems = within(toc).getAllByRole('listitem')
    expect(tocItems).toHaveLength(12)
    expect(within(toc).getByText('제1조 (목적)')).toBeInTheDocument()
    expect(within(toc).getByText('제12조 (개정 이력)')).toBeInTheDocument()

    // 자문 callout
    expect(screen.getByRole('heading', { level: 4, name: '법무 자문 후 작성 예정' })).toBeInTheDocument()

    // 1인 외부 노출 부재
    const main = screen.getByRole('main')
    expect(within(main).queryByText(/1인 창업자/)).not.toBeInTheDocument()
    expect(within(main).queryByText(/1인 운영/)).not.toBeInTheDocument()
    // PRD § 외부 노출 부재 (§27 법령 번호는 OK)
    expect(within(main).queryByText(/PRD §/)).not.toBeInTheDocument()
    expect(within(main).queryByText(/§11\.5/)).not.toBeInTheDocument()
    // 내부 버전 라벨 부재
    expect(within(main).queryByText(/v0\.2/)).not.toBeInTheDocument()

    // TOC anchor 정합 — TOC 12 링크 모두 본문 h3 id sec-0~11과 매칭
    const tocLinks = within(toc).getAllByRole('link')
    expect(tocLinks).toHaveLength(12)
    tocLinks.forEach((link, i) => {
      const href = link.getAttribute('href')
      expect(href).toBe(`#sec-${i}`)
      const target = main.querySelector(`#sec-${i}`)
      expect(target).not.toBeNull()
      expect(target?.tagName.toLowerCase()).toBe('h3')
    })

    // refund cross-link
    expect(within(main).getByRole('link', { name: '환불 정책' })).toHaveAttribute(
      'href',
      '/legal/refund',
    )
  })

  it('Legal /legal/privacy — 목차 12 + 핵심 callout 2 + §27 법령 번호 노출 OK', () => {
    render(
      <MemoryRouter initialEntries={['/legal/privacy']}>
        <Routes>
          <Route element={<PublicShell />}>
            <Route path="legal/privacy" element={<Privacy />} />
          </Route>
        </Routes>
      </MemoryRouter>,
    )

    expect(
      screen.getByRole('heading', { level: 2, name: '개인정보처리방침' }),
    ).toBeInTheDocument()
    const toc = screen.getByRole('complementary', { name: '목차' })
    expect(within(toc).getAllByRole('listitem')).toHaveLength(12)
    expect(
      screen.getByRole('heading', { level: 4, name: 'AWM은 AI 도구의 원문 대화를 저장하지 않습니다' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { level: 4, name: '§27 권고 보존 항목 (2026-01-22 시행)' }),
    ).toBeInTheDocument()

    // 보유 기간 표 — 3 티어
    const main = screen.getByRole('main')
    expect(within(main).getByText('7일')).toBeInTheDocument()
    expect(within(main).getByText('90일')).toBeInTheDocument()
    expect(within(main).getByText('5년 (인공지능기본법 §27 권고)')).toBeInTheDocument()

    // PRD § 외부 노출 부재
    expect(within(main).queryByText(/PRD §/)).not.toBeInTheDocument()
    expect(within(main).queryByText(/§11\.5/)).not.toBeInTheDocument()
  })

  it('Legal /legal/refund — 3-column 환불 표 + 디자인 파트너/트라이얼/정가 결제', () => {
    render(
      <MemoryRouter initialEntries={['/legal/refund']}>
        <Routes>
          <Route element={<PublicShell />}>
            <Route path="legal/refund" element={<Refund />} />
          </Route>
        </Routes>
      </MemoryRouter>,
    )

    expect(
      screen.getByRole('heading', { level: 2, name: '환불 정책' }),
    ).toBeInTheDocument()

    // TOC 5항 (refund)
    const toc = screen.getByRole('complementary', { name: '목차' })
    expect(within(toc).getAllByRole('listitem')).toHaveLength(5)

    // 3-column 환불 표 — 디자인 파트너 / 트라이얼 / 정가 결제 header
    const table = screen.getByRole('table', { name: '환불 조건' })
    expect(within(table).getByRole('columnheader', { name: '디자인 파트너' })).toBeInTheDocument()
    expect(within(table).getByRole('columnheader', { name: '트라이얼' })).toBeInTheDocument()
    expect(within(table).getByRole('columnheader', { name: '정가 결제' })).toBeInTheDocument()

    // 토스페이먼츠 SLA + PopBill
    const main = screen.getByRole('main')
    expect(
      within(main).getByRole('heading', { level: 3, name: /결제 취소 SLA \(토스페이먼츠\)/ }),
    ).toBeInTheDocument()
    expect(within(main).getByText(/PopBill을 통해 자동 정정/)).toBeInTheDocument()
  })

  it('Legal /legal/business — 사업자 정보 placeholder + 회사/상태 cross-link + 1인 부재', () => {
    render(
      <MemoryRouter initialEntries={['/legal/business']}>
        <Routes>
          <Route element={<PublicShell />}>
            <Route path="legal/business" element={<Business />} />
          </Route>
        </Routes>
      </MemoryRouter>,
    )

    expect(
      screen.getByRole('heading', { level: 2, name: '사업자 정보' }),
    ).toBeInTheDocument()
    const toc = screen.getByRole('complementary', { name: '목차' })
    expect(within(toc).getAllByRole('listitem')).toHaveLength(4)

    // 사업자 정보 4행 — bizNo/ecommNo/주소 placeholder
    const main = screen.getByRole('main')
    expect(within(main).getByText('[사업자 등록 후 입력]')).toBeInTheDocument()
    expect(within(main).getByText('[신고 후 입력]')).toBeInTheDocument()
    expect(within(main).getByText('[사업장 등록 후 입력]')).toBeInTheDocument()

    // company + status cross-link
    expect(within(main).getByRole('link', { name: '회사 페이지' })).toHaveAttribute(
      'href',
      '/company',
    )
    expect(within(main).getByRole('link', { name: '상태 페이지' })).toHaveAttribute(
      'href',
      '/status',
    )

    // 1인 외부 노출 부재 (디자인 소스의 "1인 운영 안내" 섹션 제거됨)
    expect(within(main).queryByText(/1인 창업자/)).not.toBeInTheDocument()
    expect(within(main).queryByText(/1인 운영/)).not.toBeInTheDocument()
  })

  it('Err404 /404 — code 404 + 제목 + 3 cross-link', () => {
    render(
      <MemoryRouter initialEntries={['/404']}>
        <Routes>
          <Route element={<PublicShell />}>
            <Route path="404" element={<Err404 />} />
          </Route>
        </Routes>
      </MemoryRouter>,
    )

    const main = screen.getByRole('main')
    const card = within(main).getByLabelText('404 — 페이지 없음')
    expect(within(card).getByText('404')).toBeInTheDocument()
    expect(
      within(card).getByRole('heading', { level: 1, name: '찾으시는 페이지를 찾을 수 없습니다.' }),
    ).toBeInTheDocument()

    // 3 cross-link
    expect(within(card).getByRole('link', { name: /Today로/ })).toHaveAttribute('href', '/today')
    expect(within(card).getByRole('link', { name: '랜딩' })).toHaveAttribute('href', '/landing')
    expect(within(card).getByRole('link', { name: /상태 페이지/ })).toHaveAttribute('href', '/status')

    // 1인 외부 노출 부재
    expect(within(card).queryByText(/1인/)).not.toBeInTheDocument()
  })

  it('Err500 /500 — code 500 + 외부 의존성 안내 + status inline link', () => {
    render(
      <MemoryRouter initialEntries={['/500']}>
        <Routes>
          <Route element={<PublicShell />}>
            <Route path="500" element={<Err500 />} />
          </Route>
        </Routes>
      </MemoryRouter>,
    )

    const main = screen.getByRole('main')
    const card = within(main).getByLabelText('500 — 서버 오류')
    expect(within(card).getByText('500')).toBeInTheDocument()
    expect(
      within(card).getByRole('heading', { level: 1, name: '일시적인 오류가 발생했습니다.' }),
    ).toBeInTheDocument()
    expect(within(card).getByText(/OpenAI · Anthropic · 토스페이먼츠/)).toBeInTheDocument()

    // desc 본문 안의 inline 상태 페이지 link + 하단 cross-link 둘 다 /status로
    const statusLinks = within(card).getAllByRole('link', { name: /상태 페이지/ })
    expect(statusLinks.length).toBeGreaterThanOrEqual(2)
    statusLinks.forEach((l) => expect(l).toHaveAttribute('href', '/status'))
  })

  it('Maint /maintenance — code emoji + cau variant + 점검 안내', () => {
    render(
      <MemoryRouter initialEntries={['/maintenance']}>
        <Routes>
          <Route element={<PublicShell />}>
            <Route path="maintenance" element={<Maint />} />
          </Route>
        </Routes>
      </MemoryRouter>,
    )

    const main = screen.getByRole('main')
    const card = within(main).getByLabelText('유지보수 안내')
    // emoji span — aria-label로 SR 노출
    expect(within(card).getByLabelText('유지보수')).toBeInTheDocument()
    expect(
      within(card).getByRole('heading', { level: 1, name: '잠시 점검 중입니다.' }),
    ).toBeInTheDocument()
    expect(within(card).getByText(/평균 10~20분 내 복구/)).toBeInTheDocument()
  })
})
