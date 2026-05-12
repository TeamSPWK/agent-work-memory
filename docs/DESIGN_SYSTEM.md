# Design System

> 이 문서는 완성형 디자인 시스템이 아니라 MVP 구현을 위한 얇은 제품 UI 규칙이다.
> 목표는 "팀 작업 기억을 빠르게 스캔하고, 위험 맥락을 놓치지 않는 운영형 SaaS UI"다.

## 1. Design Principles

0. **Consistency first** (모든 원칙 위)
   - 같은 트랙(Inside-app / Public) 안에서는 동일 패턴을 유지한다 — 레이아웃,
     typography scale, spacing, a11y role, 컴포넌트 변형. 한 화면에서 결정한
     패턴이 다음 화면에서 사라지면 사용자가 *학습한 mental model*이 깨진다.
   - 트랙이 다르면 *의도적으로 다르게* 한다. Inside-app(데이터 밀도)과
     Public(마케팅)이 같은 stylesheet를 공유해도 max-width·hero·spacing은
     별도 패턴이다. §3.4 참조.
   - 시안과 production 이식이 어긋날 때는 *원칙*을 우선하고 *시안*을 정정한다.
     디자이너 시안의 의도(누구를 위한 화면인가)를 먼저 묻고 적용한다.

1. Evidence first
   - 모든 요약은 원본 커밋, PR, 세션, 파일 링크로 이어져야 한다.

2. Calm operations
   - Inside-app 화면은 과장된 랜딩이나 마케팅 톤이 아니라 조용한 업무 도구처럼
     보여야 한다. Public(외부 마케팅 페이지)은 적용 대상이 아니다 — §3.4·§12.

3. Low recording burden
   - 사용자가 직접 작성해야 하는 필드는 최소화한다.

4. Risk without panic
   - 위험 신호는 선명하게 보여주되 사용자를 겁주거나 탓하지 않는다.

5. Explainable handoff
   - 비개발자의 말과 개발자의 검토 단위가 같은 화면 안에서 만난다.

## 2. Product Tone

사용하는 표현:

- 작업 맥락
- 연결된 변경
- 확인 필요
- 근거
- 불명확한 부분
- 공유 요약
- 위험 신호
- 복원 타임라인

피하는 표현:

- 점수
- 평가
- 감점
- 감시
- 실패자
- 돈 내고 검수받기
- 초보자 교육

## 3. Layout

### 3.1 App Shell

- 좌측 고정 내비게이션
- 상단에는 workspace, date range, sync status
- 본문은 12 column grid
- 카드 중첩 금지
- 랜딩형 hero 금지

### 3.2 Main Width

- Desktop: max 1440px
- Tablet: 100%
- Mobile: 핵심 리스트와 상세를 순차 화면으로 분리

### 3.3 Screen Density

이 제품은 운영 도구이므로 정보 밀도가 어느 정도 필요하다.

- Today: 요약 30%, 타임라인 40%, 위험/확인 필요 30%
- Session Detail: 요약 25%, 연결된 GitHub 증거 35%, Explain Back 40%
- Incident Replay: 타임라인 50%, 증거 패널 30%, 불명확한 부분 20%

### 3.4 Inside-app vs Public — 두 트랙 분리 (m2/m2.5 lock)

같은 stylesheet(Wanted LaaS 토큰 + Pretendard)를 공유하지만 *레이아웃·hero·
spacing은 완전히 다른 트랙*이다.

| 차원 | Inside-app (운영 콘솔) | Public (마케팅 페이지) |
|------|----------------------|----------------------|
| 라우트 prefix | `/` (현재) → `/app/*` (m2.5/S3 예정) | `/landing`, `/pricing`, `/legal/*`, `/company` 등 |
| Layout | `AppShell` — sidebar 248px + main 풀폭 | `PublicShell` — sticky top-bar + outlet + footer |
| 너비 정책 | **풀폭** — `.main`에 max-width 없음. 데이터 밀도 우선 | **중앙 정렬** — `.pub-inner` max-width 1120 + padding 24 |
| Hero | 없음 — `.page-h` eyebrow + h1 + sub만 (§3.1 "랜딩형 hero 금지") | 큰 1컬럼 hero — h1 64px, letter-spacing -0.025em, max-width 880 |
| Section padding | `.main` padding 24·32, 카드별 내부 spacing | `.sec` padding 96 (vertical) — 토스 패턴 |
| 가로 grid | KPI 4 + 테이블 + 4탭 비교표 동시 표시 OK | 회피 — val-grid·flow-grid 같은 *내부 카드 grid*만 사용 |
| 톤 (§2) | Calm operations — 조용한 업무 도구 | 마케팅 — 짧은 카피, 큰 typo, 시각적 강조 OK |
| dev 메타 | `/dev/status`에 가설 추적·SCREENS 매트릭스 | **금지** — PageBand 같은 가설 메타 외부 노출 X |

선례 (m2/m2.5):
- Inside-app — `screens/Today.tsx`, `screens/Audit.tsx`, `screens/Settings.tsx`
- Public — `routes/public/Landing.tsx`, `routes/public/Pricing.tsx`

## 4. Navigation

Primary nav:

- Today
- Sessions
- Repositories
- Capture Setup
- Risk Radar
- Incident Replay
- Wiki
- Team Settings

Navigation behavior:

- 현재 위치는 좌측 active state로 표시한다.
- 위험 이벤트가 있으면 Risk Radar에 badge를 표시한다.
- 사용자가 하루 리뷰를 마치지 않았으면 Today에 subtle reminder를 표시한다.

## 5. Color Tokens

팔레트는 단색 계열로 흐르지 않게 한다.

### 5.1 Neutral

- Background: `#F7F8FA`
- Surface: `#FFFFFF`
- Surface Muted: `#F1F3F5`
- Border: `#DDE1E6`
- Text Strong: `#17202A`
- Text: `#394452`
- Text Muted: `#6B7684`

### 5.2 Accent

- Primary: `#2563EB`
- Primary Hover: `#1D4ED8`
- Focus Ring: `#93C5FD`

### 5.3 Semantic

- Risk High: `#DC2626`
- Risk Medium: `#D97706`
- Risk Low: `#4B5563`
- Success: `#059669`
- Info: `#0891B2`
- Unknown: `#7C3AED`

주의:

- 화면 전체를 보라/남색 계열로 덮지 않는다.
- 위험 색은 badge, border, icon에 제한적으로 사용한다.
- 배경 gradient나 장식용 blob은 쓰지 않는다.

## 6. Typography

- Font family: system sans-serif
- Base size: 14px
- Body line height: 1.5
- Heading line height: 1.25
- Letter spacing: 0

Scale:

- Page title: 24px / 600
- Section title: 16px / 600
- Card title: 14px / 600
- Body: 14px / 400
- Metadata: 12px / 400
- Badge: 12px / 500

## 7. Spacing

- 4px: tiny gap
- 8px: compact control gap
- 12px: card internal gap
- 16px: section internal gap
- 24px: page section gap
- 32px: major layout gap

Card radius:

- Default: 8px
- Buttons: 6px
- Inputs: 6px
- Badges: 999px

## 8. Components

### 8.1 Work Card

사용 위치:

- Today 레포별 작업
- Session list
- Wiki list

구성:

- title
- repo/tool metadata
- time range
- linked commits count
- risk badge
- explanation status

상태:

- normal
- needs explanation
- has risk
- reviewed

### 8.2 Evidence Link

원본으로 이동하는 작은 링크 컴포넌트.

유형:

- commit
- PR
- file
- session
- command
- wiki note

규칙:

- 요약 옆에 항상 배치한다.
- 외부 링크와 내부 링크를 시각적으로 구분한다.

### 8.3 Risk Badge

유형:

- Database
- Migration
- Auth
- Secret
- Infra
- Destructive
- Large Diff
- Failed Verification

규칙:

- badge만으로 의미를 전달하지 않는다.
- hover나 detail에서 왜 위험으로 잡혔는지 보여준다.

### 8.4 Timeline Item

구성:

- time
- actor
- event type
- summary
- evidence links
- risk status

이벤트 유형:

- session_started
- prompt_submitted
- command_run
- file_changed
- commit_created
- pr_opened
- verification_failed
- wiki_created

### 8.5 Explain Back Panel

필드:

- 내가 요청한 것
- 에이전트가 바꾼 것
- 내가 확인한 것
- 아직 모르는 것
- 팀원에게 물어볼 것

규칙:

- 각 필드는 짧은 bullet 편집에 적합해야 한다.
- 빈 필드는 "작성 필요"보다 "확인하면 좋은 부분"으로 표현한다.

### 8.6 Empty State

나쁜 예:

- "데이터가 없습니다."

좋은 예:

- "GitHub는 연결됐습니다. 첫 커밋이나 세션이 들어오면 Today에 자동으로 정리됩니다."

### 8.7 Terminal Adapter Card

사용 위치:

- Capture Setup
- Team Settings

구성:

- adapter name
- status
- environment
- captured events
- setup command
- privacy note

규칙:

- 설치 명령은 복사하기 쉬운 monospace block으로 보여준다.
- connected/ready/planned/needs setup 상태를 구분한다.
- 사용자가 앱으로 작업을 옮겨야 한다는 인상을 주지 않는다.

## 9. MVP Screens

### 9.1 Today

필수 구성:

- date picker
- sync status
- repo activity summary
- work timeline
- needs explanation list
- risk events
- daily wiki draft button

### 9.2 Sessions

필수 구성:

- session list
- add session button
- tool filter
- linked/unlinked filter
- risk filter

### 9.3 Add Session

필수 구성:

- tool selector
- title
- session summary input
- optional raw transcript input
- related repo selector
- AI extraction preview
- suggested commit/PR links

### 9.4 Capture Setup

필수 구성:

- GitHub App status
- Claude Code Hook install command
- Codex CLI wrapper command
- Cursor CLI wrapper command
- Local Git Hook install command
- terminal event preview
- privacy defaults
- raw transcript opt-in state

### 9.5 Risk Radar

필수 구성:

- risk category tabs
- severity filter
- timeline
- affected repo/file
- linked session
- status: unreviewed, acknowledged, resolved

### 9.6 Incident Replay

필수 구성:

- date range
- repo filter
- keyword input
- suspected timeline
- evidence panel
- unknowns panel
- incident note save

## 10. Accessibility

- 모든 interactive element는 keyboard focus가 보여야 한다.
- 색상만으로 위험도를 전달하지 않는다.
- badge에는 텍스트 label을 포함한다.
- timeline은 시간순 구조가 screen reader에서도 읽혀야 한다.
- 버튼 텍스트는 동사로 시작한다.

## 11. Implementation Notes

MVP에서는 shadcn/ui 또는 유사한 headless component 기반으로 충분하다.

우선 필요한 컴포넌트:

- Button
- Input
- Textarea
- Select
- Badge
- Tabs
- Dialog
- Table
- Timeline
- Date Picker
- Toast

아이콘은 lucide 계열을 우선 사용한다.

## 12. Public Pages — 토스 패턴 (m2.5 lock)

외부 마케팅 페이지(랜딩·가격·가입·법무·회사·상태·에러)는 *모든 audience —
AI를 처음 써본 사람·전문가·학생·일반 잠재 고객 — 가 30초 안에 제품을 이해할 수
있어야 한다*. 한국 B2B SMB 우선이므로 토스(toss.im, tosspayments) 마케팅 페이지
패턴을 기반으로 한다.

### 12.1 핵심 패턴 4가지

1. **중앙 정렬 max-width 컨테이너**
   - 모든 섹션 안쪽 `.pub-inner` (max-width 1120 + padding 24) — 한국어 가독성
     우선, 1920px 모니터에서 시선 분산 회피
   - `.pub-shell` 자체는 envelope 효과(border + radius) 없음. background만

2. **1컬럼 중앙 정렬 Hero**
   - h1 64px / 800 weight / letter-spacing -0.025em / max-width 880
   - 좌-우 grid 분리 금지(시안에서 *데모 카드를 우측에 배치*한 패턴은 토스
     패턴 아님). 부가 콘텐츠는 hero 아래 별도 `.sec.tight`로 분리
   - CTA 2개 중앙 정렬 — 1차(채움) + 2차(투명 outline)

3. **충분한 vertical spacing**
   - `.sec` padding 96 (tight는 64) — Inside-app 24·32 대비 3배 이상
   - 섹션 간 시각적 호흡, 카드 내부 spacing은 그대로 16·20·24

4. **큰 typography + 평이한 한국어**
   - section h2 36px / 700 / letter-spacing -0.018em
   - body 16px, line-height 1.7
   - *질문형 hero* 가능 ("어제 AI에게 시킨 일, 오늘 다시 설명할 수 있나요?")
   - 전문 용어·내부 가설명·mock 수치 금지 (§12.3)

### 12.2 컴포넌트 — `.pub-*` 클래스

- `.pub-shell` — full-bleed surface (background만)
- `.pub-inner` — max-width 1120 + 중앙 정렬 + padding 24 (모든 섹션 안쪽)
- `.pub-topbar` — sticky top, border-bottom. inner에 brand + 4메뉴 + CTA 2
- `.pub-footer` — bg-elevated, 4컬럼 link grid + 사업자 정보(env-aware)
- `.hero` — 1컬럼 중앙, 큰 typo, gradient 약하게
- `.preview-card` — hero 아래 별도 섹션용, max-width 720 중앙
- `.sec / .sec.center / .sec.alt / .sec.dark / .sec.tight` — 섹션 base
- `.val-grid / .news-grid / .flow-grid / .tier-grid` — inner 안 내부 카드 grid
- `.dp-chip-row / .aop-def / .compare` — 가격 페이지 전용

### 12.3 외부 노출 금지 항목

마케팅 페이지에서 *외부 audience가 절대 보면 안 되는 것*:

| 금지 항목 | 시안에서 발견된 위치 | 처리 |
|----------|---------------------|------|
| 내부 가설 라벨 H1·H2·H3·H4 | 가치 카드 tag, flow 단계명, tier item, PUBLIC_COMPARE 행명 | 평이한 한국어로 치환 (회상·검토·복원 등) |
| mock vmetric 숫자 (62%·62분 등) | 가치 카드 from→to | 제거 또는 *상황 묘사*로 치환 |
| 내부 버전 라벨 (v0.1·v0.2) | "v0.1 화면 보기" 링크, PageBand "v0.2 · 외부" | 제거 |
| PRD 섹션 번호 (§1.4·§11.5) | 외부 보도 lead, 원문 transcript 안내 | 제거 |
| 자기 워크스페이스 데이터 가정 | "워크스페이스 자동 점검 5/7 충족" 7원칙 카드 | 가입 전 페이지에선 제거. 후속 sprint에서 *기능 미리보기* 형태로 |
| dev 가설 메타 (PageBand) | 상단 가설 statement + 측정 지표 띠 | `/dev/status` 로 이동 |

### 12.4 audience 원칙 (PRD §4.2)

랜딩의 한 줄 정의는 PRD §4.2의 *AI 사용자(Operator)* 변형을 기본으로:

> *"AWM은 AI에게 시킨 일을 1분 만에 다시 설명할 수 있게 해줍니다."*

다른 페이지(가격·법무·회사) 카피도 같은 한 줄 정의를 일관되게 변형한다.
청자별 변형은 PRD §4.2 표 참조.

### 12.5 dev 메타 분리

가설 추적, 가설별 측정 지표 from→to, sprint 진행률, SCREENS 매트릭스는
**`/dev/status`** 한 군데에만 노출. 외부 페이지 안 어디에도 dev 메타가
보이면 안 된다 — PageBand 컴포넌트 제거가 그 정합 (m2.5 refactor `502f1df`).
