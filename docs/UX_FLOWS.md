# UX Flows

> 목표: 사용자가 기록 노동을 한다고 느끼지 않게 하면서, 팀이 AI 에이전트 작업을
> 설명하고 복원할 수 있게 만든다.

## 1. Product UX Decision

이 제품은 랜딩 페이지 중심이 아니라 앱 중심으로 시작한다.

- 첫 화면은 Today 대시보드다.
- 스크롤형 소개 페이지보다 좌측 내비게이션 기반 작업 화면이 적합하다.
- 온보딩은 별도 설명 페이지가 아니라 실제 연결/수집/요약 단계 안에 녹인다.
- 사용자는 "학습"하러 들어오는 것이 아니라 "오늘 작업을 복원"하러 들어온다.

## 2. Core UX Bet

사용자는 모든 것을 직접 기록하지 않는다.

제품이 자동으로 수집한다:

- GitHub commit
- PR
- changed files
- author
- timestamp
- branch
- risky path

사용자는 중요한 순간에만 확인한다:

- 어떤 세션이 어떤 변경과 연결되는지
- 자동 요약이 맞는지
- 팀에 공유 가능한지
- 위험 이벤트의 의도와 검증 상태가 맞는지

## 3. Roles

### 3.1 Operator

Claude Code, Codex, Cursor 같은 에이전트로 실제 작업을 수행하는 사람.

필요한 것:

- 오늘 내가 무엇을 시켰는지 보기
- 에이전트가 무엇을 바꿨는지 이해하기
- 팀원에게 설명 가능한 요약 만들기
- 위험 작업을 놓치지 않기

### 3.2 Reviewer

팀 리드, 개발자, 운영 담당자.

필요한 것:

- 변경의 의도 확인
- 위험 파일/명령 확인
- PR 리뷰 전에 맥락 파악
- 사고 발생 시 원인 후보 복원

### 3.3 Admin

워크스페이스와 GitHub 연결을 관리하는 사람.

필요한 것:

- 팀/레포 연결
- 권한 범위 관리
- 보존 기간과 공개 범위 설정
- 위험 규칙 설정

## 4. Automation vs Manual Touchpoints

| Step | 자동화 가능 | 사용자 개입 | 이유 |
| --- | --- | --- | --- |
| GitHub 연결 | 일부 | GitHub 권한 승인, 레포 선택 | 외부 계정 권한이 필요하다. |
| 커밋/PR 수집 | 가능 | 없음 | GitHub API/Webhook으로 처리한다. |
| 위험 파일 감지 | 가능 | 규칙 수정 | 팀마다 위험 경로가 다르다. |
| Claude Code 세션 캡처 | 가능 | hook 설치 승인 | 로컬 도구 설정이 필요하다. |
| Codex 세션 캡처 | 일부 | 세션 요약/스킬 실행 | 도구별 이벤트 접근성이 다르다. |
| 세션-커밋 연결 | 일부 | 연결 후보 확인 | AI 추정이 틀릴 수 있다. |
| Daily Wiki 생성 | 가능 | 공유 전 확인 | 팀 공유 문서이므로 사람 확인이 필요하다. |
| Incident Replay | 일부 | 원인 후보 선택/확정 | 사고 원인은 자동 단정하면 위험하다. |
| Explain Back | 일부 | 짧은 확인/수정 | 사용자가 실제로 이해했는지 보강한다. |

## 5. Flow 1: First Workspace Setup

목표:

- 팀이 첫날 바로 GitHub 활동을 볼 수 있게 한다.

단계:

1. 사용자가 워크스페이스를 만든다.
2. GitHub 계정을 연결한다.
3. 수집할 org/repo를 선택한다.
4. 팀원을 초대한다.
5. 위험 경로 기본값을 확인한다.
6. Today 화면으로 이동한다.

성공 상태:

- Today에 "아직 수집된 작업 없음"이 아니라 "연결된 레포와 다음 수집 예정 상태"가
  보인다.
- 사용자는 다음 행동을 안다: 작업 후 GitHub activity가 자동으로 들어오거나,
  세션 요약을 추가하면 된다.

### 5.1 Flow 1A: Local MVP First Run

목표:

- 사용자가 별도 계정 연결 없이 실제 로컬 에이전트 작업 기억을 바로 본다.

단계:

1. 사용자가 `npm run mvp`를 실행한다.
2. 제품이 로컬 Claude/Codex 세션 파일을 탐지한다.
3. 제품이 최근 세션을 summary-only로 ingest한다.
4. Today 화면에 레포 후보, 세션, 위험 신호, 타임라인이 표시된다.
5. 사용자는 Capture Setup에서 어떤 도구가 탐지됐는지 확인한다.

핵심 UX:

- 첫 화면은 랜딩이나 설문이 아니라 실제 Today 대시보드다.
- 사용자가 대화를 붙여넣기 전에도 최근 작업 맥락이 자동으로 보인다.
- GitHub 연동 전에는 commit/PR 연결을 확정하지 않고 "연결 필요" 상태로 둔다.

## 6. Flow 2: End of Agent Session

목표:

- 사용자가 에이전트 작업을 끝낸 뒤 1분 안에 팀 공유 가능한 작업 맥락을 남긴다.
- 터미널 기반 Claude Code/Codex/Cursor 사용자는 별도 웹 입력 없이 세션 증거를
  남길 수 있어야 한다.

단계:

1. 사용자가 Sessions에서 "Add Session"을 누른다.
2. 도구를 선택한다: Claude Code, Codex, Cursor, Other.
3. 세션 요약 또는 대화 일부를 붙여넣는다.
4. 제품이 intent, changed area, risk, unresolved question을 추출한다.
5. 제품이 같은 시간대의 commit/PR 후보를 제안한다.
6. 사용자가 맞는 연결을 확인한다.
7. Explain Back Note를 확인한다.

MVP 현재 구현:

- Sessions 화면에서 "세션 추가"로 수동 요약을 저장한다.
- 저장된 요약은 로컬 `.awm/sessions`에 남고 다음 ingest 결과에 포함된다.
- 자동 탐지되지 않은 Claude/Codex/Cursor 작업도 같은 리뷰 큐에서 확인한다.

수동 개입을 줄이는 방법:

- 세션 원문 전체를 요구하지 않는다.
- "요약만 붙여넣기"를 허용한다.
- GitHub 후보 연결을 먼저 제안한다.
- Explain Back은 긴 양식이 아니라 4~5개 짧은 필드로 둔다.

### 6.1 Flow 2A: Terminal Capture Setup

목표:

- 사용자가 평소처럼 터미널에서 Claude Code, Codex, Cursor를 실행해도 작업 기억이
  자동으로 남게 한다.

단계:

1. 사용자가 Capture Setup 화면을 연다.
2. 팀 workspace token을 확인한다.
3. 현재 레포에서 `awm repo link`를 실행한다.
4. Claude Code 사용자는 `awm capture install claude`를 실행한다.
5. Codex/Cursor 사용자는 `awm capture wrap codex` 또는 `awm capture wrap cursor-agent`를
   사용한다.
6. 제품은 terminal event preview를 보여준다.
7. 사용자는 원문 저장 여부와 command output 저장 여부를 선택한다.

핵심 UX:

- 웹 앱은 설치와 상태 확인만 맡는다.
- 실제 작업은 사용자의 터미널에서 계속된다.
- capture가 실패해도 GitHub App과 Git Hook 증거가 남아야 한다.

## 7. Flow 3: Daily Review

목표:

- 하루가 끝났을 때 사용자가 오늘 작업을 복원하고 내일 이어갈 수 있게 한다.

단계:

1. Today 화면에서 날짜를 선택한다.
2. 제품이 레포별 작업, 세션, 위험 이벤트를 묶어 보여준다.
3. 사용자는 "Needs Explanation" 항목만 확인한다.
4. Daily Wiki 초안을 생성한다.
5. 사용자는 공유 범위를 선택한다: private, team, repo note.
6. Wiki에 저장한다.

핵심 UX:

- 모든 작업을 읽게 하지 않는다.
- 위험하거나 설명이 부족한 작업만 앞으로 끌어올린다.
- "오늘 한 일"보다 "오늘 설명 가능한 일/설명 부족한 일"을 구분한다.

## 8. Flow 4: Incident Replay

목표:

- 사고가 발생했을 때 10분 안에 1차 원인 후보를 만든다.

단계:

1. 사용자가 Incident Replay를 연다.
2. 날짜 범위, 레포, 키워드를 입력한다.
3. 제품이 위험 이벤트 타임라인을 만든다.
4. 관련 세션, 커밋, 파일, PR을 연결한다.
5. 제품이 원인 후보와 불명확한 부분을 분리한다.
6. 사용자가 Incident Note를 저장한다.

주의:

- 제품은 원인을 단정하지 않는다.
- "확실한 증거", "가능성 높은 후보", "불명확한 부분"을 분리한다.
- 원본 링크를 항상 제공한다.

## 9. Flow 5: PR Review Brief

목표:

- 리뷰어가 PR을 보기 전에 에이전트 작업 맥락을 빠르게 이해한다.

단계:

1. PR이 생성되거나 업데이트된다.
2. 제품이 관련 세션과 커밋을 찾는다.
3. 리뷰어용 요약을 만든다.
4. 위험 파일, 큰 diff, 검증 누락, 질문 후보를 표시한다.
5. 리뷰어가 GitHub PR로 이동한다.

MVP에서는 PR comment 자동 작성까지 하지 않는다. 먼저 앱 안에서 brief를 보여준다.

## 10. Screen Sequence

첫 MVP 화면 순서:

1. Workspace Setup
2. GitHub Connect
3. Today
4. Capture Setup
5. Add Session
6. Session Detail
7. Daily Wiki Draft
8. Risk Radar
9. Incident Replay

앱 내 기본 내비게이션:

- Today
- Sessions
- Repositories
- Capture Setup
- Risk Radar
- Incident Replay
- Wiki
- Team Settings

## 11. UX Constraints

- 사용자를 감시당하는 사람처럼 느끼게 하지 않는다.
- "평가", "점수", "감점" 언어를 쓰지 않는다.
- 수동 입력은 하루 3분을 넘기지 않는 것을 목표로 한다.
- 모든 AI 요약에는 근거 링크를 제공한다.
- 위험 이벤트는 무섭게 경고하기보다 복원 가능한 맥락으로 보여준다.
- 비개발자도 이해할 수 있는 말과 개발자가 검토할 수 있는 원본을 함께 제공한다.
