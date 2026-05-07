# Agent Work Memory PRD

> 제품명은 가칭이다. 후보: WorkTrace, Agent Ledger, Session Blackbox, Context Ledger.
> 이 문서는 상업화보다 기능과 문제 정의를 우선한다.

## 1. Context

### 1.1 CPS Summary

Context:

- AI 에이전트는 코드 작성 보조가 아니라 실제 작업 실행자로 이동하고 있다.
- 팀은 GitHub, 에이전트 세션, 커맨드 로그, 문서에 흩어진 작업 흔적을 함께 봐야 한다.

Problem:

- 에이전트가 만든 변경의 "왜", "무엇", "누가 승인했는가", "무엇을 모르는가"가
  분리되어 협업과 사고 복원이 어려워진다.

Solution:

- 팀 단위로 GitHub 변경, 에이전트 대화, 위험 이벤트, 하루 요약을 연결한 작업 기억
  레이어를 만든다.

AI 에이전트 기반 개발은 이미 코드 작성 보조를 넘어 실제 작업 실행 방식으로
넘어가고 있다. Claude Code, Codex, Cursor 같은 도구는 파일을 읽고, 코드를
수정하고, 명령을 실행하고, 여러 레포를 동시에 다룬다. 이 변화는 비개발자에게
개발 접근성을 열어주지만, 동시에 팀의 작업 맥락을 빠르게 흐리게 만든다.

과거에는 한 사람이 직접 코드를 수정하고 커밋 몇 개로 하루 작업을 설명할 수
있었다. 지금은 한 사람이 여러 에이전트 세션을 열고, 여러 레포에서 수십 개 이상의
커밋과 파일 변경을 만들 수 있다. 작업량은 늘지만 사용자는 자신이 무엇을 요청했고,
에이전트가 무엇을 바꿨고, 어떤 판단을 사람에게 남겼는지 설명하지 못하는 경우가
늘어난다.

이 문제는 비개발자에게 더 선명하지만 개발자에게도 적용된다. 에이전트가 작업을
대신 수행할수록 사람은 코드 작성자가 아니라 작업 지시자, 검토자, 책임자로 이동한다.
그런데 현재 도구는 사람의 작업 기억, 설명 책임, 협업 인수인계를 충분히 도와주지
못한다.

관련 동향:

- Stack Overflow 2025 Developer Survey는 AI 도구 사용 의향이 매우 높지만, AI
  출력 정확도에 대한 신뢰는 낮아지고 있음을 보여준다.
- METR의 2025 연구는 숙련 개발자가 AI 도구를 쓰며 체감 속도와 실제 속도 사이의
  괴리가 발생할 수 있음을 보여준다.
- Google DORA 2025는 AI가 조직의 강점과 약점을 증폭한다고 본다. 좋은 프로세스가
  없는 팀은 AI로 더 빨리 혼란스러워질 수 있다.
- Veracode, GitGuardian, OWASP 계열 보고서는 AI 생성 코드와 citizen development가
  보안, credential, governance 위험을 키울 수 있음을 지적한다.

## 2. Problem

### 2.1 핵심 문제

팀은 AI 에이전트로 더 많은 작업을 만들지만, 그 작업을 설명하고 복원하고 검증하는
능력은 따라가지 못한다.

### 2.2 사용자 관찰

- 비개발자 팀원이 DB 관련 문제를 에이전트에게 해결시키려 했지만 원인과 영향을
  이해하지 못했다.
- 문제가 발생한 뒤에도 어느 대화, 어느 명령, 어느 파일 변경에서 사고가 시작됐는지
  추적하기 어렵다.
- 에이전트 세션 안에서 중요한 결정이 이루어졌지만 팀 공유 문서나 커밋 기록에는
  남지 않는다.
- GitHub 커밋만 보면 무엇이 바뀌었는지는 보이지만 왜 바뀌었는지는 알기 어렵다.
- 에이전트 대화만 보면 의도는 일부 보이지만 실제로 어떤 파일과 시스템이 바뀌었는지
  불완전하다.
- 하루에 여러 레포에서 커밋이 쌓이면 팀원이 오늘 무엇을 했는지 설명하기 어렵다.
- 개발자도 에이전트가 만든 변경을 충분히 읽지 않고 다음 작업으로 넘어가며 맥락을
  잃을 수 있다.

### 2.3 문제를 MECE로 분해

1. 작업 기억 상실
   - 오늘 어떤 레포에서 무엇을 했는지 파악하기 어렵다.
   - 커밋과 대화가 분리되어 하루 작업의 흐름을 복원하기 어렵다.

2. 의도와 결과의 단절
   - 사용자가 에이전트에게 무엇을 의도했는지 커밋에 남지 않는다.
   - 에이전트가 실제로 무엇을 바꿨는지 대화에 정확히 남지 않는다.

3. 위험 이벤트 추적 부재
   - DB 삭제, migration, 권한 변경, 배포, secret 노출, 대량 파일 변경 같은 위험
     작업이 대화/커밋 속에 흩어진다.
   - 사고가 나면 원인 타임라인을 재구성하는 데 시간이 오래 걸린다.

4. 협업 인수인계 실패
   - 비개발자는 개발자에게 "무엇을 바꿨는지"를 설명하지 못한다.
   - 개발자는 비개발자의 에이전트 작업 의도와 판단 근거를 확인하기 어렵다.

5. 에이전트 판단 위임
   - 에이전트 답변이 그럴듯하면 사용자가 검증 없이 받아들인다.
   - 사람은 점점 "내가 무엇을 하고 있는가"보다 "에이전트가 뭘 해줬는가"에 의존한다.

## 3. Product Direction

### 3.1 제품 한 줄 정의

Agent Work Memory는 팀이 AI 에이전트로 수행한 작업을 대화, GitHub 변경, 명령,
위험 이벤트 단위로 기록하고, 하루 작업과 사고 원인을 복원해주는 작업 기억 시스템이다.

### 3.2 제품이 아닌 것

- 바이브코딩 교육 플랫폼이 아니다.
- 유료 검수/멘토링 플랫폼이 아니다.
- AI가 대신 코딩해주는 IDE가 아니다.
- 코드 품질을 자동으로 보증하는 보안 스캐너가 아니다.
- 개발자를 대체하는 에이전트 오케스트레이터가 아니다.

### 3.3 핵심 가치

- 팀원이 오늘 무엇을 했는지 설명할 수 있다.
- 에이전트 세션과 GitHub 변경이 하나의 작업 타임라인으로 연결된다.
- 위험 작업이 발생했을 때 언제, 왜, 어떤 맥락에서 발생했는지 복원할 수 있다.
- 비개발자가 개발자와 협업 가능한 언어로 작업을 공유할 수 있다.
- 개발자도 AI 생성 변경을 검토 가능한 단위로 회고할 수 있다.

### 3.4 시장 진입 관점

유사 제품이 있다는 것은 회피 신호가 아니라 수요 검증 신호로 본다. 다만 초기
포지션은 글로벌 범용 세션 저널이 아니라 국내 팀의 실제 협업 문제에 맞춘다.

초기 타겟:

- 국내 스타트업/프로덕트 팀
- 비개발자 또는 반개발자가 AI 에이전트로 운영/개발 변경을 만드는 팀
- 개발 리드가 AI 기반 변경의 리뷰/운영 책임을 져야 하는 팀

전략:

- 오픈소스/유사 제품에서 검증된 session discovery, local index, terminal wrapper
  패턴은 적극 참고한다.
- 제품의 차별화는 한국어 협업 UX, GitHub evidence graph, incident replay, handoff
  packet에 둔다.
- 글로벌 확장은 국내 팀에서 검증한 workflow를 영어권 팀 운영 언어로 번역한 뒤
  진행한다.

## 4. Personas

### 4.1 Agent Operator

비개발자 또는 반개발자 역할. Claude Code, Codex, Cursor를 사용해 앱, 자동화,
운영 도구를 만든다. 코드를 직접 깊게 이해하지 못해도 업무 문제와 결과물 의도는
잘 안다.

필요:

- 내가 오늘 무엇을 시켰는지 정리
- 개발자에게 공유할 설명 생성
- 위험한 작업을 알아차리는 보조 장치
- 사고 발생 시 세션과 변경 기록 복원

### 4.2 Engineering Lead

팀의 개발 책임자. 비개발자/주니어/에이전트가 만든 변경을 리뷰하고, 운영 리스크를
관리해야 한다.

필요:

- 누가 어떤 레포에서 어떤 에이전트 작업을 했는지 보기
- 위험 이벤트 우선순위 확인
- PR 리뷰 전 작업 의도와 대화 요약 확인
- 사고 시 원인 타임라인 빠르게 복원

### 4.3 Solo Builder

혼자 여러 프로젝트를 AI 에이전트로 빠르게 만드는 사용자.

필요:

- 하루 작업 요약
- 여러 레포 커밋 정리
- 다음 날 이어서 작업할 맥락 복원
- 내가 이해하지 못한 변경 표시

### 4.4 AI Agent

Claude Code, Codex, Cursor 등. 직접 사용자로 보지는 않지만 이벤트를 남겨야 하는
작업 주체다.

필요:

- 작업 시작/종료 시 컨텍스트 기록
- 수정 파일, 명령, 실패 로그, 결정 사항을 구조화해서 남기는 프로토콜

## 5. Core Product Concept

### 5.1 Evidence Graph

모든 작업은 이벤트로 남는다.

- user prompt
- agent response summary
- command run
- file changed
- commit created
- branch changed
- PR opened
- DB/migration event
- deploy event
- risk signal
- human note
- daily wiki entry

이 이벤트를 시간순으로 묶고, 같은 작업으로 추정되는 이벤트를 하나의 Work Session에
연결한다.

### 5.2 Daily Work Memory

하루 단위로 다음을 자동 생성한다.

- 오늘 작업한 레포
- 오늘의 Work Session 목록
- 주요 변경 사항
- 생성/수정된 커밋과 PR
- 위험 이벤트
- 아직 설명이 부족한 작업
- 내일 이어서 봐야 할 TODO
- 팀 공유용 요약

### 5.3 Incident Replay

문제가 발생했을 때 특정 시점부터 역추적한다.

예:

- DB가 삭제됐다.
- 어느 세션에서 DB 관련 명령이 실행됐는가?
- 그 전에 사용자는 무엇을 요청했는가?
- 에이전트는 어떤 판단을 제안했는가?
- 어떤 파일, migration, env, seed, script가 변경됐는가?
- 어떤 커밋/브랜치/PR에 포함됐는가?

### 5.4 Explain Back

사용자가 작업을 마친 뒤 직접 설명할 수 있게 만든다.

필드:

- 내가 요청한 것
- 에이전트가 바꾼 것
- 내가 확인한 것
- 아직 모르는 것
- 팀원에게 물어봐야 할 것

이 기능은 교육처럼 보이면 안 된다. "시험"이 아니라 "협업 가능한 작업 요약"으로
보여야 한다.

### 5.5 Adjacent Ideas to Combine

사용자가 제안한 Daily Wiki, 세션 요약, 사고 복원 외에 MVP 이후 접목할 수 있는
아이디어다.

1. PR Review Brief
   - PR이 올라오면 에이전트 세션과 커밋을 연결해 "검토자가 봐야 할 의도, 위험,
     확인 질문"을 자동 생성한다.

2. Repo Context Map
   - 레포별로 최근 AI 작업이 집중된 영역을 지도처럼 보여준다. 예: auth, billing,
     db, infra, workflow.

3. Knowledge Debt Radar
   - 반복적으로 "모름", "확인 필요", "추정", "일단" 같은 표현이 남는 영역을
     추적해 팀의 이해 부채를 보여준다.

4. Agent Habit Profile
   - 특정 사용자나 팀이 에이전트에게 자주 시키는 작업 유형, 검증 누락 패턴,
     위험 명령 패턴을 요약한다.

5. Handoff Packet
   - 다른 팀원이 이어받을 때 필요한 세션 요약, 관련 커밋, 남은 질문, 위험 파일을
     하나의 인수인계 패킷으로 만든다.

6. Dangerous Action Confirmations
   - DB 삭제, migration rollback, env 변경, 권한 변경처럼 위험한 작업이 감지되면
     나중에 복원 가능한 확인 메모를 남기게 한다.

## 6. MVP Scope

### 6.1 MVP 목표

GitHub 연동과 수동/반자동 에이전트 세션 기록을 이용해 "오늘 팀이 AI 에이전트로
무엇을 했는지"를 복원하는 첫 버전을 만든다.

### 6.2 포함 기능

1. Team Workspace
   - 팀 생성
   - 멤버 목록
   - GitHub 계정/레포 연결
   - 로컬 에이전트 세션 업로드 또는 붙여넣기

2. GitHub Activity Ingestion
   - 연결된 레포 목록
   - 날짜별 commit 수집
   - branch, PR, changed files 요약
   - author 기준 활동 묶기
   - diff 기반 변경 유형 분류

3. Agent Session Capture
   - 세션 제목
   - 도구: Claude Code, Codex, Cursor, Other
   - 사용자 프롬프트 요약
   - 에이전트 응답 요약
   - 실행 명령
   - 수정 파일
   - 실패/오류 로그
   - 사람이 남긴 메모

4. Session ↔ Git Linker
   - 세션 시간대와 Git 커밋 시간대 매칭
   - 수정 파일 경로 기반 매칭
   - branch 이름 기반 매칭
   - 사용자가 수동으로 연결/해제

5. Risk Radar
   - DB, migration, seed, schema, SQL 파일 변경
   - auth, permission, token, secret, env 파일 변경
   - deploy, Docker, CI/CD, infra 변경
   - delete/drop/truncate/reset 명령
   - 대량 파일 변경
   - 실패한 테스트/빌드 로그

6. Daily Wiki
   - 날짜별 자동 문서
   - 오늘 한 일
   - 레포별 변경
   - 세션별 의도와 결과
   - 위험 이벤트
   - 내일 이어서 할 일
   - 팀 공유 요약

7. Incident Replay
   - 날짜/레포/위험 신호로 필터
   - 이벤트 타임라인
   - 관련 세션, 커밋, 파일, 명령 연결
   - "무엇이 원인이었을 가능성이 큰가" 요약

8. Explain Back Note
   - 작업자가 세션 종료 시 1분 메모 작성
   - 내가 요청한 것 / 바뀐 것 / 확인한 것 / 모르는 것
   - 팀 공유용으로 변환

### 6.3 MVP 제외

- 실시간 화면 녹화
- 모든 Claude/Codex 내부 세션 자동 수집
- 코드 실행 샌드박스
- 자체 AI 코딩 에이전트
- 자동 롤백
- 보안 취약점 정밀 스캔
- 엔터프라이즈 SSO
- 결제/과금

### 6.4 현재 로컬 MVP

첫 실행 가능한 MVP는 GitHub App보다 로컬 에이전트 세션 인덱스를 먼저 검증한다.

포함:

- `npm run mvp` 단일 명령으로 빌드, 세션 ingest, 로컬 API 서버 실행
- Claude Code `~/.claude/projects/**/*.jsonl` discovery/ingest
- Codex CLI `~/.codex/sessions/**/*.jsonl` discovery/ingest
- 세션별 의도 후보, 명령 후보, 위험 신호, 타임라인 생성
- Today와 Sessions 화면에 실제 ingest 결과 연결
- Today에서는 상위 레포 5개, 확인할 세션 5개, 위험 후보 5개만 기본 표시
- 세션 시간대와 가까운 로컬 Git 커밋 후보를 최대 3개까지 연결
- 운영자가 커밋 후보를 `연결 확인`하면 세션-커밋 확정 연결 저장
- Sessions에서 운영자가 `검토 완료` / `추가 확인 필요` 판단을 저장
- 저장된 리뷰 판단을 다음 ingest와 Review queue에 반영
- raw transcript 기본 미저장, summary-only, secret masking

아직 포함하지 않음:

- GitHub OAuth/GitHub App 실제 연동
- 세션과 commit/PR의 자동 확정 연결
- 팀 서버 저장/동기화
- Claude settings 자동 병합

## 7. Product Surfaces

### 7.1 단일 웹 제품

장점:

- 팀 단위 Source of Truth를 만들기 쉽다.
- GitHub App, 레포, 멤버, Daily Wiki를 한 곳에서 관리할 수 있다.
- 여러 에이전트 도구를 중립적으로 흡수할 수 있다.
- 사고 복원과 팀 회고 화면은 웹 대시보드가 적합하다.

단점:

- 에이전트 세션 원본을 자동으로 잡기 어렵다.
- 사용자가 세션을 수동으로 붙여넣으면 입력 부담이 생긴다.
- Claude Code/Codex 작업 중 즉시 개입하기 어렵다.

### 7.2 Claude/Codex 플러그인 또는 스킬

장점:

- 작업 중 자연스럽게 이벤트를 남길 수 있다.
- 사용자의 프롬프트와 에이전트 응답 맥락을 더 잘 보존한다.
- "세션 종료 요약", "위험 이벤트 기록", "오늘 위키 업데이트" 같은 습관을
  에이전트 워크플로우에 직접 심을 수 있다.

단점:

- 도구별 구현 방식이 다르고 안정성이 낮을 수 있다.
- 팀 전체 Source of Truth로 쓰기에는 부족하다.
- 특정 도구에 종속되면 Cursor, GitHub Copilot, Devin, Lovable 등 확장이 어렵다.

### 7.3 로컬 CLI / Git Hook

장점:

- git commit, branch, diff, command 로그를 로컬에서 잡기 좋다.
- Claude Code/Codex 실행 래퍼로 확장 가능하다.
- 개발자에게는 자연스러운 설치 방식이다.
- Claude Code, Codex, Cursor를 터미널에서 쓰는 사용자의 실제 흐름을 보존한다.

단점:

- 비개발자에게 설치 부담이 크다.
- 보안/권한/로컬 파일 접근에 민감하다.
- 팀 온보딩 난도가 올라간다.

### 7.3.1 터미널 기반 캡처 우선순위

MVP에서 터미널 캡처는 별도 부가 기능이 아니라 핵심 수집 경로다.

우선순위:

1. Claude Code Hook
   - SessionStart, UserPromptSubmit, PreToolUse, PostToolUse, SessionEnd 이벤트를
     이용해 세션 맥락과 위험 명령을 수집한다.

2. Local Git Hook
   - 에이전트 도구와 무관하게 branch, commit, changed files, risky path를 남긴다.

3. Codex CLI Adapter
   - wrapper 또는 skill 기반으로 session summary, cwd, git diff, handoff note를
     수집한다.

4. Cursor CLI Adapter
   - 초기에는 세션 종료 요약과 로컬 git evidence 중심으로 수집한다.

### 7.4 권장 결정

하이브리드로 간다.

1. 중심 제품은 팀 웹 앱이다.
   - Daily Wiki, Incident Replay, GitHub Activity, 팀 공유는 웹 앱에서 한다.

2. 캡처 표면은 여러 개로 둔다.
   - GitHub App: 커밋/PR/diff 수집
   - Manual Session Import: 초반 MVP에서 가장 빠른 세션 입력
   - Claude Code Hook: 터미널 세션과 tool call 맥락 수집
   - Agent Skill/Plugin: Claude/Codex 세션 요약을 구조화
   - Local CLI/Git Hook: 명령/파일/세션 자동 캡처

3. MVP는 GitHub App + Claude Code Hook + 수동 세션 import로 시작한다.
   - 자동화 욕심보다 핵심 가치 검증이 먼저다.
   - 사용자가 "오늘 작업을 복원할 수 있다"는 가치를 느끼는지 확인한다.

## 8. Information Architecture

### 8.1 Main Navigation

- Today
- Sessions
- Repositories
- Risk Radar
- Incident Replay
- Wiki
- Team Settings

### 8.2 Today

오늘의 기본 화면.

구성:

- 날짜 선택
- 팀/개인 필터
- 오늘 작업한 레포 카드
- Work Session 타임라인
- 위험 이벤트 목록
- 자동 Daily Wiki
- "팀 공유 요약 복사" 버튼

### 8.3 Sessions

에이전트 세션을 기록하고 GitHub 변경과 연결한다.

구성:

- 새 세션 추가
- 도구 선택
- 대화 요약 입력/붙여넣기
- 명령/파일/오류 로그 입력
- 관련 commit/PR 연결
- Explain Back Note

### 8.4 Repositories

GitHub 활동을 레포 기준으로 본다.

구성:

- 연결 레포 목록
- 오늘/주간 커밋
- 변경 파일 heatmap
- 위험 파일 변경
- 관련 세션

### 8.5 Risk Radar

위험 이벤트를 먼저 보여준다.

위험 카테고리:

- Database
- Migration
- Auth/Permission
- Secret/Env
- Deploy/Infra
- Delete/Destructive Command
- Large Diff
- Failed Verification

### 8.6 Incident Replay

사고 발생 시 증거를 시간순으로 재구성한다.

입력:

- 날짜 범위
- 레포
- 키워드
- 위험 카테고리
- 관련 사람/세션

출력:

- 타임라인
- 의심 이벤트
- 관련 대화 요약
- 관련 커밋/파일/명령
- 아직 불명확한 부분

### 8.7 Wiki

자동으로 쌓이는 팀 작업 지식.

문서 유형:

- Daily Note
- Weekly Digest
- Incident Note
- Repo Context
- Decision Log
- Agent Usage Pattern

## 9. Data Model Draft

### 9.1 Workspace

- id
- name
- members
- connectedGitHubOrgs
- repositories

### 9.2 WorkSession

- id
- workspaceId
- title
- tool
- startedAt
- endedAt
- actor
- intentSummary
- agentSummary
- commands
- changedFiles
- linkedCommits
- linkedPRs
- riskSignals
- explainBack
- confidence

### 9.3 GitEvent

- id
- repository
- branch
- commitSha
- author
- timestamp
- message
- filesChanged
- diffSummary
- riskSignals

### 9.4 RiskSignal

- id
- type
- severity
- sourceEventId
- sourceSessionId
- evidence
- explanation
- status

### 9.5 WikiEntry

- id
- type
- date
- workspaceId
- title
- content
- linkedSessions
- linkedGitEvents
- linkedRiskSignals

## 10. GitHub Integration

### 10.1 MVP 수집 대상

- repositories
- commits
- pull requests
- changed files
- commit authors
- timestamps
- PR titles and bodies
- branch names

### 10.2 분석 방식

- commit message만 믿지 않는다.
- changed file path와 diff summary를 함께 본다.
- 위험 경로 패턴을 먼저 잡는다.
  - `db/`
  - `migrations/`
  - `schema`
  - `.env`
  - `secrets`
  - `auth`
  - `permission`
  - `docker`
  - `.github/workflows`
  - `infra`

### 10.3 GitHub 연동의 한계

- 사용자의 의도는 GitHub만으로 알 수 없다.
- 에이전트가 어떤 대화 끝에 변경했는지는 알 수 없다.
- 로컬에서 실행한 destructive command는 GitHub에 남지 않을 수 있다.

따라서 GitHub는 "결과 증거"이고, Agent Session은 "의도와 과정 증거"다.

## 11. Agent Session Capture Strategy

### Phase 1: Manual Import

- 사용자가 세션 요약을 붙여넣는다.
- 에이전트에게 "오늘 작업 요약을 이 포맷으로 남겨줘" 템플릿을 제공한다.
- 가장 빠르게 제품 가치를 검증한다.

### Phase 2: Agent Skill / Prompt Protocol

- Claude/Codex에게 세션 종료 시 WorkSession JSON을 생성하게 하는 스킬/프롬프트를
  제공한다.
- 사용자가 결과를 웹 앱에 붙여넣거나 API로 보낸다.
- 도구 종속성을 낮추면서 자동화 수준을 높인다.

### Phase 3: Local CLI

- `awm start`, `awm note`, `awm commit-link`, `awm end` 같은 명령을 제공한다.
- git diff, branch, command 로그를 수집한다.
- 개발자/파워유저용으로 제공한다.

### Phase 4: Deep Integrations

- Claude Code, Codex, Cursor, GitHub Copilot 등 도구별 캡처 플러그인을 검토한다.
- 단, 핵심 제품은 도구 중립성을 유지한다.

## 12. User Flows

### 12.1 하루 작업 회고

1. 사용자가 Today 화면을 연다.
2. GitHub에서 오늘 커밋과 PR이 자동으로 들어온다.
3. 사용자가 오늘 사용한 에이전트 세션 요약을 추가한다.
4. 시스템이 세션과 커밋을 연결 후보로 제안한다.
5. 사용자가 연결을 확인한다.
6. Daily Wiki가 생성된다.
7. 사용자는 팀 공유 요약을 복사한다.

### 12.2 에이전트 세션 종료

1. 사용자가 Claude Code/Codex 작업을 마친다.
2. 세션 요약 템플릿을 실행한다.
3. WorkSession 형식으로 요약이 생성된다.
4. 웹 앱에 붙여넣는다.
5. 관련 커밋/PR이 자동 추천된다.
6. Explain Back Note를 1분 작성한다.

### 12.3 사고 복원

1. DB 문제가 발생한다.
2. 사용자가 Incident Replay에서 날짜와 레포를 선택한다.
3. 시스템이 DB/migration/delete 관련 이벤트를 우선 표시한다.
4. 관련 세션 대화 요약, 명령, 파일 변경, 커밋을 함께 보여준다.
5. 팀은 원인 후보와 아직 모르는 부분을 확인한다.
6. Incident Note가 생성된다.

## 13. AI Features

AI는 코드를 대신 쓰는 주체가 아니라 작업 기억을 정리하는 보조자로 사용한다.

### 13.1 Summarization

- 세션 요약
- diff 요약
- commit 묶음 요약
- Daily Wiki 생성

### 13.2 Classification

- 변경 유형 분류
- 위험 이벤트 분류
- 레포별 작업 테마 분류

### 13.3 Explanation

- 비개발자용 설명
- 개발자용 상세 설명
- "내가 모르는 것" 후보 추출

### 13.4 Linking

- 세션과 커밋 연결 후보
- 명령과 파일 변경 연결 후보
- 위험 이벤트와 PR 연결 후보

## 14. Success Metrics

상업 지표는 MVP에서 제외한다.

### 14.1 기능 가치 지표

- Daily Wiki 생성 수
- 세션-커밋 연결률
- 위험 이벤트 탐지 수
- Explain Back Note 작성률
- 팀 공유 요약 복사/내보내기 수
- 사고 복원에 걸린 시간

### 14.2 사용자 행동 지표

- 사용자가 하루 작업을 설명하는 데 걸리는 시간
- 개발자가 비개발자의 작업 맥락을 이해하는 데 걸리는 시간
- "모르는 변경"으로 표시된 항목 수
- 다음 날 이어서 작업할 때 참조한 Wiki 수

### 14.3 품질 지표

- 잘못 연결된 세션/커밋 비율
- 놓친 위험 이벤트 비율
- Daily Wiki 수정률
- 팀원이 유용하다고 평가한 요약 비율

## 15. UX Principles

- 교육처럼 보이지 않는다.
- 과금이나 검수 상품을 노출하지 않는다.
- "감시"처럼 보이지 않는다. 개인 평가 도구가 아니라 팀의 작업 기억 도구다.
- AI가 사용자를 평가하는 느낌을 주지 않는다.
- 위험 이벤트는 비난이 아니라 복구 가능한 맥락으로 보여준다.
- 개발자와 비개발자 모두가 읽을 수 있는 언어로 쓴다.
- 원본 증거로 돌아갈 수 있어야 한다.

## 16. Privacy and Security

이 제품은 민감한 작업 데이터를 다룬다.

원칙:

- GitHub 권한은 최소 권한으로 시작한다.
- secret/env 파일 내용은 저장하지 않고 경로와 위험 신호만 저장한다.
- 대화 원문 전체 저장은 선택 사항으로 둔다.
- 기본은 요약 저장이다.
- 팀 관리자는 레포별 수집 범위를 설정할 수 있어야 한다.
- 위험 명령 원문은 마스킹 규칙을 적용한다.
- 삭제 가능한 데이터 정책이 필요하다.

민감 데이터:

- private repo diff
- API key
- DB connection string
- 고객 데이터
- 내부 인프라 정보
- 에이전트 세션 대화 원문

## 17. Risks and Tradeoffs

### 17.1 사용자가 기록을 귀찮아할 수 있다

대응:

- GitHub 자동 수집으로 기본 가치를 먼저 제공한다.
- 세션 입력은 1분 템플릿으로 시작한다.
- 붙여넣기만 해도 Daily Wiki가 좋아지는 구조로 만든다.

### 17.2 감시 도구처럼 보일 수 있다

대응:

- 개인 평가 지표를 만들지 않는다.
- "누가 잘못했나"보다 "무슨 일이 있었나"를 중심에 둔다.
- 개인 productivity rank 금지.

### 17.3 세션 자동 캡처가 어렵다

대응:

- MVP는 수동 import로 간다.
- 플러그인/스킬은 보조 캡처 표면으로 둔다.
- 핵심 제품은 도구 중립적인 웹 워크스페이스로 유지한다.

### 17.4 GitHub diff 분석이 부정확할 수 있다

대응:

- AI 요약에 confidence를 붙인다.
- 원본 commit/diff 링크를 항상 제공한다.
- 사용자가 연결을 수정할 수 있게 한다.

## 18. Open Questions

1. 첫 MVP는 GitHub OAuth/GitHub App까지 바로 붙일 것인가, 아니면 로컬 샘플 데이터로
   먼저 UI를 검증할 것인가?
2. 세션 데이터는 원문 저장을 허용할 것인가, 요약만 저장할 것인가?
3. 팀 관리자가 개인 세션을 어디까지 볼 수 있어야 하는가?
4. Claude Code/Codex 스킬은 내부 팀용으로 먼저 만들 것인가, 공개 플러그인 형태를
   염두에 둘 것인가?
5. Daily Wiki는 자체 위키로 둘 것인가, Notion/GitHub Wiki/Markdown export를 우선할 것인가?
6. 위험 이벤트의 첫 분류 기준은 코드 경로 기반으로 충분한가, 명령 로그까지 요구할 것인가?

## 19. MVP Build Plan

### Sprint 0: Prototype Data and UX

- 샘플 GitHub activity JSON
- 샘플 agent session JSON
- Today 화면
- Daily Wiki 생성 화면
- Risk Radar 화면
- Incident Replay 화면

목표:

- 사용자가 "이걸 보면 오늘 작업을 복원할 수 있다"고 느끼는지 확인한다.

### Sprint 1: GitHub Integration

- GitHub App 또는 OAuth 검토
- 레포/커밋/PR 수집
- changed files 기반 위험 신호
- Daily Wiki 자동 생성

목표:

- 실제 GitHub 활동만으로 하루 작업 초안을 만든다.

### Sprint 2: Session Import

- 세션 수동 import
- WorkSession schema
- 세션-커밋 연결 후보
- Explain Back Note

목표:

- GitHub 결과와 에이전트 의도를 연결한다.

### Sprint 3: Incident Replay

- 위험 이벤트 타임라인
- 관련 세션/커밋/파일 연결
- Incident Note 생성

목표:

- DB/배포/권한 사고를 10분 안에 1차 복원한다.

## 20. Initial Decision

현재 결정:

- 제품은 팀 기반 웹 앱으로 시작한다.
- 이름은 임시로 Agent Work Memory로 둔다.
- Claude/Codex 플러그인/스킬은 핵심 제품이 아니라 캡처 어댑터로 본다.
- 첫 MVP는 상업 기능 없이 Today, GitHub Activity, Session Import, Risk Radar,
  Daily Wiki에 집중한다.

이 결정은 GitHub 연동과 세션 데이터 접근 가능성을 확인한 뒤 다시 검토한다.

## 21. Research References

제품 판단에 참고한 외부 동향이다.

1. [Stack Overflow Developer Survey 2025: AI](https://survey.stackoverflow.co/2025/ai)
   - AI 도구 사용 의향은 높지만 AI 출력 신뢰는 낮아지는 흐름을 보여준다.

2. [METR: Early 2025 AI Experienced Open-Source Developer Study](https://metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study/)
   - 숙련 개발자의 AI 사용에서 체감 생산성과 실제 생산성 사이의 간극을 다룬다.

3. [Google DORA Report 2025](https://dora.dev/dora-report-2025/)
   - AI가 조직의 기존 강점과 약점을 증폭할 수 있다는 관점을 제공한다.

4. [OpenAI: Introducing Codex](https://openai.com/index/introducing-codex/)
   - 클라우드 기반 소프트웨어 엔지니어링 에이전트가 보편화되는 흐름을 보여준다.

5. [Anthropic Economic Index: Software Development](https://www.anthropic.com/research/impact-software-development?pubDate=20250519)
   - 소프트웨어 개발에서 AI가 코드 작성뿐 아니라 수정, 디버깅, 설명 작업에도 쓰이는
     변화를 보여준다.

6. [GitGuardian State of Secrets Sprawl Report 2026](https://www.gitguardian.com/state-of-secrets-sprawl-report-2026)
   - AI 도구와 대규모 코드 생산 환경에서 secret 유출과 governance 문제가 커지는
     흐름을 보여준다.

7. [Veracode GenAI Code Security Report](https://www.veracode.com/blog/genai-code-security-report/)
   - AI 생성 코드의 보안 취약점과 검증 필요성을 다룬다.

8. [OWASP Citizen Development Risk: Security Misconfiguration](https://owasp.org/www-project-citizen-development-top10-security-risks/content/2022/en/CD-SEC-07-Security-Misconfiguration)
   - 비전문 개발 환경에서 설정 오류와 거버넌스 문제가 어떻게 발생하는지 참고할 수
     있다.
