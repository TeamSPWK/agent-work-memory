# Design System

> 이 문서는 완성형 디자인 시스템이 아니라 MVP 구현을 위한 얇은 제품 UI 규칙이다.
> 목표는 "팀 작업 기억을 빠르게 스캔하고, 위험 맥락을 놓치지 않는 운영형 SaaS UI"다.

## 1. Design Principles

1. Evidence first
   - 모든 요약은 원본 커밋, PR, 세션, 파일 링크로 이어져야 한다.

2. Calm operations
   - 화면은 과장된 랜딩이나 마케팅 톤이 아니라 조용한 업무 도구처럼 보여야 한다.

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
