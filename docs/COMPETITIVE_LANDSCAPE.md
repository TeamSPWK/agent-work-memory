# Competitive Landscape

> 조사일: 2026-05-07  
> 결론: 유사 제품과 오픈소스는 이미 있다. 이것은 회피할 이유가 아니라 검증 신호다.
> 대부분은 개인 생산성/세션 분석/LLM observability에 머물러 있고, "팀 단위 작업
> 책임, 사고 복원, GitHub 증거 연결"은 아직 명확한 승자가 없다.

## 1. Executive Summary

Agent Work Memory가 단순히 "AI 코딩 세션을 요약해 Daily Note로 만든다"에 머물면
이미 있는 제품과 강하게 겹친다. 하지만 겹친다고 해서 버릴 필요는 없다. 오히려
유사 제품과 오픈소스를 활용해 기본 수집/파싱/로컬 대시보드 품질을 빠르게 끌어올리고,
국내 팀의 협업/운영 문제에 맞춘 워크플로우로 차별화해야 한다.

가장 유사한 영역:

- AI coding session journal
- local-first AI coding dashboard
- persistent memory for coding agents
- terminal agent telemetry

우리가 더 강하게 잡아야 할 영역:

- 팀 단위 source of truth
- GitHub commit/PR/file evidence와 세션 의도 연결
- 위험 이벤트와 incident replay
- 비개발자/개발자 사이의 handoff packet
- "이 사람이 무엇을 했는가"보다 "이 작업을 팀이 설명/복원할 수 있는가"

따라서 제품 포지셔닝은 다음 문장으로 좁혀야 한다.

> AI coding session journal이 아니라, 팀이 AI 에이전트 작업의 의도와 결과와 위험을
> GitHub 증거에 연결해 복원하는 work memory blackbox.

## 2. Closest Products

### 2.1 rwd

링크:

- https://www.rewind.day/

요약:

- Claude Code와 Codex 세션을 하루 단위로 분석해 Markdown daily note를 만든다.
- work summary, key decisions, questions, model corrections를 뽑는다.
- 무료/MIT, 사용자가 API key를 가져오는 모델.

겹치는 부분:

- Daily Wiki/Daily Review와 매우 유사하다.
- Claude Code/Codex 세션을 읽어 하루 회고를 만든다는 접근이 같다.

다른 부분:

- 개인 daily journal에 가깝다.
- 팀 권한, GitHub evidence graph, incident replay, 위험 이벤트 관리가 핵심은 아니다.

판단:

- "오늘 뭐 했지?" 기능은 이미 있다.
- 우리는 daily note 자체를 주력으로 삼으면 안 된다.

### 2.2 Code Insights

링크:

- https://code-insights.app/docs/getting-started/introduction

요약:

- Claude Code, Cursor, Codex CLI, Copilot CLI, VS Code Copilot Chat 세션을 파싱한다.
- 로컬 SQLite knowledge base에 저장한다.
- terminal analytics와 browser dashboard를 제공한다.

겹치는 부분:

- 멀티 에이전트 세션 파싱
- 로컬 지식 기반
- 브라우저 대시보드

다른 부분:

- 개인/로컬 분석 도구 성격이 강하다.
- 팀 협업 증거, PR/incident 중심 workflow는 아직 핵심 포지션이 아니다.

판단:

- 로컬 CLI + dashboard만 만들면 이쪽과 정면 충돌한다.
- 팀/리스크/감사 가능한 evidence layer로 가야 한다.

### 2.3 SpecStory

링크:

- https://docs.specstory.com/integrations/terminal-coding-agents/index

요약:

- Claude Code, Cursor CLI, Codex CLI, Gemini CLI를 wrapper로 실행해 터미널 대화를
  Markdown으로 저장/공유한다.

겹치는 부분:

- terminal-first agent session capture
- Markdown archive
- 공유 가능한 AI conversation history

다른 부분:

- 대화 보존과 문서화에 더 가깝다.
- GitHub changed files, risk event, incident replay 중심은 아니다.

판단:

- "세션을 저장한다"는 기능은 commodity가 될 가능성이 높다.
- 저장 이후 팀이 무엇을 판단할 수 있는지가 차별점이어야 한다.

### 2.4 AgentsView

링크:

- https://www.agentsview.io/

요약:

- 로컬 머신의 AI coding agent session files를 읽는다.
- Claude Code, Codex, Copilot, Cursor, Gemini, OpenHands 등 20개 에이전트를 지원한다.
- SQLite 기반 로컬-first desktop/web app이며 PostgreSQL sync도 제공한다.

겹치는 부분:

- 멀티 에이전트 세션 파일 수집
- local-first dashboard
- 선택적 팀/멀티머신 sync

다른 부분:

- session browsing과 insight가 중심이다.
- 팀 단위 incident blackbox, GitHub evidence graph, handoff workflow는 우리가 더
  선명하게 잡을 수 있다.

판단:

- 매우 가까운 인접 제품이다.
- 우리는 "세션 브라우저"가 되면 안 되고 "협업/사고 복원 레이어"가 되어야 한다.

### 2.5 Entropic

링크:

- https://github.com/Dimension-AI-Technologies/Entropic

요약:

- Claude Code, OpenAI Codex, Google Gemini를 위한 desktop/CLI 도구.
- TODO, chat history, Git history, commit activity를 통합 대시보드로 보여준다.
- `~/.claude`, `~/.codex`, `~/.gemini`를 자동 탐지한다.

겹치는 부분:

- session history와 Git history를 함께 본다.
- 여러 레포/여러 에이전트를 통합한다.

다른 부분:

- desktop companion 성격이 강하다.
- 우리처럼 팀 운영/위험/incident note를 제품 중심으로 놓지는 않는다.

판단:

- 가장 직접적인 오픈소스 레퍼런스 중 하나다.
- 기능만 따라가면 이길 이유가 없다. 팀 workflow와 리스크 언어가 필요하다.

### 2.6 CodeFire

링크:

- https://codefire.app/

요약:

- Claude Code, Codex, Gemini, OpenCode를 위한 context engine.
- persistent memory, agent-to-agent handoff, living work log, git intelligence를 제공한다.
- MCP setup과 integrated terminal을 강조한다.

겹치는 부분:

- persistent memory
- work log
- agent handoff
- git intelligence

다른 부분:

- 에이전트가 다음 작업을 더 잘 하게 만드는 context layer에 가깝다.
- 우리는 사람이 팀에 설명하고 사고를 복원하는 accountability layer를 목표로 한다.

판단:

- 컨셉적으로 매우 강한 경쟁자다.
- 우리는 "agent memory"보다 "team work memory / incident evidence" 쪽으로
  언어를 고정해야 한다.

## 3. Adjacent Products

### 3.1 OpenUsage

링크:

- https://openusage.sh/

요약:

- Claude Code, Codex CLI, Cursor, Copilot, Gemini CLI 등의 quota, spend, rate limit,
  model usage, session telemetry를 로컬 dashboard로 보여준다.

겹치는 부분:

- terminal-first
- mixed-tool workflow
- local telemetry

다른 부분:

- 비용/사용량/쿼터 추적이 중심이다.
- 작업 의도, GitHub 변경, 위험 이벤트, incident replay는 주력이 아니다.

### 3.2 cctop / agentop

링크:

- https://cctop.app/
- https://pypi.org/project/agentop/0.1.2/

요약:

- 여러 AI coding agent session을 모니터링하고 terminal/editor로 돌아가게 해주는
  htop/nvtop류 도구.

겹치는 부분:

- local terminal agent monitoring

다른 부분:

- 현재 실행 중인 세션 상태 관리가 중심이다.
- 장기 작업 기억, 팀 공유, 사고 복원은 핵심이 아니다.

### 3.3 Langfuse / AgentOps / Arize Phoenix

링크:

- https://langfuse.com/
- https://github.com/AgentOps-AI/agentops
- https://arize.com/docs/phoenix/

요약:

- LLM app/agent observability, trace, eval, prompt management, cost tracking을 제공한다.

겹치는 부분:

- agent trace
- tool call 관찰
- cost/quality monitoring

다른 부분:

- 개발자가 만든 LLM 애플리케이션의 production observability가 중심이다.
- Claude Code/Codex 사용자가 로컬 터미널에서 만든 GitHub 변경의 팀 협업 맥락을
  복원하는 제품은 아니다.

판단:

- 기술적으로 일부 tracing 아이디어를 참고할 수 있다.
- 경쟁자는 아니지만 "observability"라는 단어를 쓰면 이 카테고리와 헷갈린다.

### 3.4 LinearB / Swarmia / Jellyfish / DX

링크:

- https://linearb.io/platform/software-engineering-intelligence
- https://github.com/marketplace/swarmia
- https://jellyfish.co/

요약:

- Git, PR, Jira, Linear, Slack 등 개발 조직 데이터를 분석하는 software engineering
  intelligence 플랫폼이다.

겹치는 부분:

- GitHub/PR 기반 팀 가시성
- 개발 생산성/작업 흐름 분석
- AI-assisted PR/AI activity 감지로 확장 중

다른 부분:

- 조직 생산성 지표, DORA, cycle time, bottleneck 분석이 중심이다.
- 개별 AI agent session의 의도/대화/명령/위험 이벤트와 GitHub 변경을 연결하는
  blackbox는 아니다.

판단:

- 장기적으로 엔터프라이즈 예산 경쟁자가 될 수 있다.
- 초기 제품은 developer productivity score가 아니라 incident/handoff utility로
  시작해야 한다.

## 4. Opportunity Map

### 이미 검증된 영역

- 개인 daily journal
- local session browser
- AI agent usage/cost dashboard
- persistent memory for agents
- generic LLM observability
- PR/code review automation

이 영역은 버리는 것이 아니라 참고/활용/통합 후보로 본다.

### 아직 덜 점유된 영역

- 비개발자/개발자 협업용 AI 작업 설명 패킷
- AI agent 작업의 incident replay
- GitHub evidence와 terminal session evidence의 양방향 연결
- 위험 이벤트 중심 Daily Wiki
- "내가 잘했나?"가 아니라 "팀이 이 작업을 설명하고 복원할 수 있나?"에 집중한 UX
- 국내 팀의 비개발자 AI 개발/운영 협업 문제에 맞춘 언어와 워크플로우

## 5. Strategic Recommendation

제품명을 임시로 Agent Work Memory라고 두더라도, 내부 포지션은 다음처럼 잡는다.

### 단독 포지션으로는 약한 영역

- AI coding daily journal
- Claude Code memory tool
- developer productivity analytics
- LLM observability dashboard
- AI code review tool
- terminal session viewer

이 기능들은 제품 안에 있어도 된다. 다만 제품의 첫 문장, 첫 화면, 구매 이유가 되면
이미 있는 도구와 차이가 흐려진다.

### 강하게 잡아야 할 포지션

- AI agent work blackbox for teams
- Incident replay for AI-assisted development
- GitHub + terminal evidence graph
- Handoff packet for non-developer operators and engineering teams
- Daily risk memory, not daily productivity report

### Korea-first wedge

국내 시장에서는 "개발자 생산성 분석"보다 다음 문제가 더 선명하다.

1. 비개발자/기획자/운영자가 Claude Code, Codex, Cursor로 실제 변경을 만든다.
2. 개발자는 결과물을 리뷰해야 하지만 사용자의 의도와 대화 맥락을 모른다.
3. DB, 배포, 권한, 결제, 운영 데이터 문제가 생기면 누가 어떤 판단으로 변경했는지
   복원하기 어렵다.
4. 팀은 AI 사용을 막을 수 없지만, 사용자가 무엇을 했는지 설명할 수 있어야 한다.

따라서 국내 첫 포지션은 다음이 좋다.

> AI 에이전트로 개발/운영하는 팀을 위한 작업 블랙박스.  
> 비개발자도 설명 가능하게, 개발자는 검토 가능하게, 사고는 복원 가능하게.

### MVP 차별화 기준

1. 세션 요약보다 GitHub evidence 연결을 먼저 보여준다.
2. Daily Wiki보다 Risk/Unknowns를 먼저 보여준다.
3. "생산성"보다 "복원 가능성"을 측정한다.
4. 개인 로컬 앱보다 팀 workspace를 전제로 한다.
5. Claude Code hook은 수집 수단이고, 제품의 본질은 incident/handoff workflow다.

## 6. Product Implication

현재 구현한 CLI와 Capture Setup은 방향이 맞다. 다만 다음 단계에서 단순히 세션을
많이 수집하는 쪽으로 가면 기존 제품과 겹친다.

다음 구현 우선순위는 이렇게 잡는다.

1. `.awm/events.jsonl`을 Today/Risk Radar로 연결한다.
2. 이벤트를 "risk", "unknown", "handoff needed"로 분류한다.
3. GitHub mock data와 terminal event를 하나의 timeline으로 합친다.
4. Incident Replay에서 원인 후보/확실한 증거/불명확한 부분을 분리한다.
5. Daily Wiki는 마지막 산출물로 둔다.

## 7. Open Source Leverage Plan

유사 제품은 경쟁자인 동시에 레퍼런스/부품 후보로 본다. 단, 라이선스와 제품 방향을
분리해서 판단한다.

### 7.1 참고할 수 있는 구현 영역

1. Session discovery
   - `~/.claude`, `~/.codex`, `~/.gemini`, Cursor/Copilot 계열 session 파일 탐색 방식
   - 참고 후보: Entropic, AgentsView, Code Insights류

2. Local index
   - SQLite/FTS 기반 로컬 검색
   - session file parsing pipeline
   - 참고 후보: AgentsView, Code Insights

3. Daily journal generation
   - 하루 단위 세션 요약과 Markdown 생성
   - 참고 후보: rwd

4. Terminal wrapper
   - Claude/Codex/Cursor CLI를 감싸는 실행 방식
   - 참고 후보: SpecStory, OpenUsage 계열

5. Usage/cost telemetry
   - 모델 사용량, 비용, quota tracking
   - 참고 후보: OpenUsage

### 7.2 직접 베끼면 안 되는 영역

- 브랜드/카피/정보 구조
- proprietary 제품의 내부 구현 추정
- 라이선스가 불명확한 코드
- 세션 원문을 과도하게 저장하는 기본값
- 개인 productivity score 중심 UX

### 7.3 우리 제품으로 재구성할 영역

오픈소스가 제공하는 parser/indexer가 있더라도 최종 UX는 다음 구조로 재구성한다.

- Session -> WorkSession
- Commit/PR -> Evidence
- Risk keyword/path -> RiskSignal
- Unknown/question -> Handoff item
- Time window -> Incident Replay
- Day -> Daily Risk Memory

### 7.4 Build / Borrow / Partner

Build:

- 팀 workspace
- GitHub evidence graph
- Incident Replay
- Handoff Packet
- 한국어 UX/copy

Borrow or reference:

- session file discovery
- local SQLite schema
- terminal wrapper mechanics
- daily note generation prompt

Partner or integrate later:

- Linear/Jira/Slack/Notion
- existing engineering intelligence tools
- existing LLM observability tools

## 8. Sources

- rwd: https://www.rewind.day/
- Code Insights: https://code-insights.app/docs/getting-started/introduction
- SpecStory terminal coding agents: https://docs.specstory.com/integrations/terminal-coding-agents/index
- AgentsView: https://www.agentsview.io/
- Entropic: https://github.com/Dimension-AI-Technologies/Entropic
- CodeFire: https://codefire.app/
- OpenUsage: https://openusage.sh/
- Langfuse: https://langfuse.com/
- AgentOps: https://github.com/AgentOps-AI/agentops
- Arize Phoenix: https://arize.com/docs/phoenix/
- LinearB SEI: https://linearb.io/platform/software-engineering-intelligence
- Swarmia GitHub Marketplace: https://github.com/marketplace/swarmia
- Jellyfish: https://jellyfish.co/
