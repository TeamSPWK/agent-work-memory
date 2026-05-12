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
import {
  Landing,
  Pricing,
  Signup,
  Login,
  Reset,
  Terms,
  Privacy,
  Refund,
  Business,
  Company,
  Status as PublicStatus,
  Err404,
  Err500,
  Maint,
} from './routes/public/PublicStub'
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
    expect(screen.getByRole('tab', { name: 'Replay', selected: true })).toBeInTheDocument()
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
      screen.getByRole('heading', { name: '이벤트 detail' }),
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

    expect(screen.getByRole('heading', { name: 'Incident Note', level: 1 })).toBeInTheDocument()
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
    expect(screen.getByRole('heading', { name: '이벤트 핵심 fact' })).toBeInTheDocument()
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
      screen.getByRole('heading', { name: 'Reviewer Brief — s-024', level: 1 }),
    ).toBeInTheDocument()
    expect(screen.getByText('의도 — Operator Explain Back + AI 자동 추출')).toBeInTheDocument()
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

    expect(screen.getByRole('tab', { name: 'Replay', selected: true })).toBeInTheDocument()
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

    // claude_code 해제 → connectedCount 0 → button disabled
    fireEvent.click(screen.getByRole('button', { name: '연결 해제' }))
    expect(
      screen.getByRole('button', { name: /다음 — 첫 세션 import/ }),
    ).toBeDisabled()

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

    expect(screen.getByRole('heading', { name: 'Members', level: 1 })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Members', selected: true })).toBeInTheDocument()
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
      screen.getByText(/역할 변경 · 초대 · 삭제는 모두 Audit Trail에 자동 기록/),
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

    expect(screen.getByRole('heading', { name: 'Member 초대', level: 1 })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Member 초대', selected: true })).toBeInTheDocument()
    // 이메일 시드 2개 추가됨
    expect(screen.getByText('2명 추가됨 · 초대 메일은 한국어로 발송됩니다.')).toBeInTheDocument()
    // 역할 radiogroup
    expect(screen.getByRole('radiogroup', { name: '사전 지정 역할' })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: /Operator/ })).toBeChecked()
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

    expect(screen.getByRole('heading', { name: 'Roles & Risk 룰', level: 1 })).toBeInTheDocument()
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

    fireEvent.click(screen.getByRole('tab', { name: 'Roles & Risk 룰' }))
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Roles & Risk 룰', level: 1 })).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: /← Members/ }))
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Members', level: 1 })).toBeInTheDocument()
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

    expect(screen.getByRole('tab', { name: 'Members', selected: true })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Members', level: 1 })).toBeInTheDocument()
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

    expect(screen.getByRole('heading', { name: 'Profile & Account', level: 1 })).toBeInTheDocument()
    // 5 tabs
    for (const t of [
      'Profile & Account',
      'Integrations',
      'Notifications',
      'Audit Export',
      'Plan & Billing',
    ]) {
      expect(screen.getByRole('tab', { name: t })).toBeInTheDocument()
    }
    expect(
      screen.getByRole('tab', { name: 'Profile & Account', selected: true }),
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

    expect(screen.getByRole('heading', { name: 'Integrations', level: 1 })).toBeInTheDocument()
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

    expect(screen.getByRole('heading', { name: 'Notifications', level: 1 })).toBeInTheDocument()
    expect(screen.getByText('5개 이벤트 × 4 채널')).toBeInTheDocument()
    // 행 5개 — 각 이벤트 텍스트
    for (const e of [
      '고위험 신호 (DB · Secret · Destructive)',
      '미설명 세션 (24h)',
      '체인 무결성 깨짐',
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

    expect(screen.getByRole('heading', { name: 'Audit Export 설정', level: 1 })).toBeInTheDocument()
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

    expect(screen.getByRole('heading', { name: 'Plan & Billing', level: 1 })).toBeInTheDocument()
    // 현재 플랜 (Starter · 100,000원/월) + 한도 5/5 progressbar
    expect(screen.getByText(/Starter · 100,000원\/월/)).toBeInTheDocument()
    expect(screen.getByText('5 / 5명')).toBeInTheDocument()
    const usageBar = screen.getByRole('progressbar', { name: 'Active Operator 사용량' })
    expect(usageBar).toHaveAttribute('aria-valuenow', '100')
    // 5 플랜 비교 group
    const plans = screen.getByRole('group', { name: '플랜 비교' })
    for (const n of ['Free', 'Starter', 'Team', 'Pro', 'Enterprise']) {
      expect(within(plans).getByText(n)).toBeInTheDocument()
    }
    // 현재/추천 태그
    expect(within(plans).getByText('현재')).toBeInTheDocument()
    expect(within(plans).getByText('추천')).toBeInTheDocument()
    // 현재 플랜 버튼 disabled (5개 중 Starter만)
    expect(screen.getByRole('button', { name: '현재 플랜' })).toBeDisabled()
    // 세금계산서 4 필드 (htmlFor)
    expect(screen.getByLabelText('사업자등록번호')).toHaveValue('000-00-00000')
    expect(screen.getByLabelText('발행 이메일')).toHaveValue('finance@workspace-a.com')
    // 청구서 3건 + 다운로드 a11y
    expect(screen.getByRole('button', { name: '2026-04 세금계산서 다운로드' })).toBeInTheDocument()
    // 결제 수단 (신한카드 ****1234)
    expect(screen.getByText(/신한카드 · \*\*\*\*-\*\*\*\*-\*\*\*\*-1234/)).toBeInTheDocument()
    // 사용량 알림 — 80%/100% default checked, ±20% default unchecked
    expect(screen.getByLabelText('Active OP 80% 도달')).toBeChecked()
    expect(screen.getByLabelText('월 청구액 ±20% 변동')).not.toBeChecked()
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
    // 월간 default — Starter 100,000원 (헤더 카드의 100,000원과 분리)
    expect(within(plans).getByText('100,000원')).toBeInTheDocument()
    // 연결제 toggle
    fireEvent.click(screen.getByRole('checkbox', { name: '연결제 25% 할인' }))
    // Starter = round(100000 * 0.75 * 12 / 1000) * 1000 = 900,000원/년
    expect(within(plans).getByText('900,000원')).toBeInTheDocument()
    // Enterprise(null) → "협의"
    expect(within(plans).getByText('협의')).toBeInTheDocument()
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

    fireEvent.click(screen.getByRole('tab', { name: 'Audit Export' }))
    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: 'Audit Export 설정', level: 1 }),
      ).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('tab', { name: 'Profile & Account' }))
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Profile & Account', level: 1 })).toBeInTheDocument()
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
      screen.getByRole('tab', { name: 'Profile & Account', selected: true }),
    ).toBeInTheDocument()
  })

  it('PublicShell mounts topbar + footer + page-band on /landing with hyp banner', () => {
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
    // landing 가설 배너(region) — 'Hero scroll-depth · CTA 클릭율' 지표
    expect(screen.getByRole('region', { name: '가설 검증 배너' })).toBeInTheDocument()
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
    // PublicStub heading h2
    expect(screen.getByRole('heading', { name: '랜딩', level: 2 })).toBeInTheDocument()
  })

  it('PublicShell shows non-hyp band on routes without PUBLIC_HYPS (e.g. /company)', () => {
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
      screen.getByRole('region', { name: '외부 페이지 안내' }),
    ).toBeInTheDocument()
    expect(screen.getByText('측정 지표 없음')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '회사', level: 2 })).toBeInTheDocument()
  })

  it('All 14 public routes dispatch to their PublicStub', () => {
    const elements: Record<string, ReactElement> = {
      '/landing': <Landing />,
      '/pricing': <Pricing />,
      '/signup': <Signup />,
      '/login': <Login />,
      '/reset': <Reset />,
      '/legal/terms': <Terms />,
      '/legal/privacy': <Privacy />,
      '/legal/refund': <Refund />,
      '/legal/business': <Business />,
      '/company': <Company />,
      '/status': <PublicStatus />,
      '/404': <Err404 />,
      '/500': <Err500 />,
      '/maintenance': <Maint />,
    }
    expect(Object.keys(elements)).toHaveLength(PUBLIC_ROUTES.length)

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
      expect(
        screen.getByRole('heading', { name: route.label, level: 2 }),
      ).toBeInTheDocument()
      expect(screen.getByText(`path · ${route.path}`)).toBeInTheDocument()
      expect(
        screen.getByText(`noindex · ${route.noindex ? 'true' : 'false'}`),
      ).toBeInTheDocument()
      unmount()
    }
  })
})
