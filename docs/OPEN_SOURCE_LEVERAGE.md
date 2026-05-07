# Open Source Leverage Plan

> 목표: 유사 제품을 피하지 않는다. 이미 검증된 session discovery, local index,
> terminal wrapper 패턴을 참고해 품질을 빠르게 올리고, 국내 팀 협업/사고 복원
> workflow로 차별화한다.

## 1. Current Finding

2026년 기준 AI coding agent session tooling은 이미 빠르게 생기고 있다.

가까운 레퍼런스:

- rwd: Claude Code/Codex 하루 세션을 journal로 만든다.
- AgentsView: 여러 agent session directory를 감시하고 SQLite/FTS로 검색한다.
- Code Insights: Claude Code, Cursor, Codex CLI, Copilot CLI 세션을 local knowledge
  base와 dashboard로 분석한다.
- Entropic: `~/.claude`, `~/.codex`, `~/.gemini`를 자동 탐지해 desktop dashboard로 보여준다.
- Polpo: Claude/Codex/Gemini/OpenCode/Goose session directory를 자동 탐지하고 watcher를 붙인다.

이것은 우리 제품을 접을 이유가 아니다. 오히려 다음이 검증됐다는 뜻이다.

- AI coding session은 로컬에 많이 남는다.
- 사용자는 여러 agent를 섞어 쓴다.
- session discovery와 local dashboard는 명확한 수요가 있다.
- secret masking과 local-first 기본값은 중요하다.

## 2. What We Borrow Conceptually

직접 코드 복사 전에는 반드시 라이선스와 구조를 확인한다. 현재 단계에서는 구현
아이디어만 참고한다.

| Area | Reference | Why |
| --- | --- | --- |
| Daily journal | rwd | 세션을 하루 단위 narrative로 묶는 UX가 좋다. |
| SQLite/FTS local index | AgentsView, Code Insights | 대량 session search에는 파일 스캔만으로 부족하다. |
| Multi-agent paths | Code Insights, Polpo, Entropic | Claude/Codex/Gemini 경로 자동 탐지에 참고할 수 있다. |
| Terminal wrapper | SpecStory, Polpo | CLI agent를 감싸는 방식이 검증되어 있다. |
| Secret masking | rwd, OpenUsage 계열 | 원문 처리 전 로컬 redaction은 필수다. |

## 3. Discovery Paths

MVP에서 우선 참고하는 경로:

```txt
Claude Code: ~/.claude/projects/**/*.jsonl
Codex CLI:   ~/.codex/sessions/**/*.jsonl
Gemini CLI:  ~/.gemini/tmp/**/*.json
```

보류:

```txt
Cursor: platform workspace storage
Copilot CLI: ~/.copilot/session-state/
VS Code Copilot Chat: VS Code workspaceStorage
OpenCode: ~/.local/share/opencode/opencode.db
Goose: ~/.config/goose/sessions.db
```

Cursor/Copilot/VS Code 계열은 storage 경로가 넓고 non-agent 데이터가 섞일 수 있어
자동 raw scan을 늦춘다. 사용자가 명시적으로 연결한 뒤 처리한다.

## 4. Implemented Now

현재 CLI에 `discover` 명령을 추가했다.

```bash
npm run cli -- discover
npm run cli -- discover --json
npm run cli -- discover --no-write
```

동작:

- Claude/Codex/Gemini 후보 경로 존재 여부 확인
- session file count
- total bytes
- 최근 파일 metadata
- `.awm/discovery.json` 저장

수집하지 않는 것:

- raw transcript content
- prompt text
- command output
- Cursor workspaceStorage 전체

## 5. Product Decision

session discovery는 차별화 영역이 아니다. 최대한 빠르고 안전하게 구현한다.

차별화 영역:

- discovery 결과를 GitHub commit/PR/file evidence와 연결
- risk/unknown/handoff item 추출
- incident replay
- 한국어 팀 협업 UX
- 국내 비개발자/운영자 AI 작업 흐름에 맞춘 onboarding

## 6. Sources

- rwd: https://www.rewind.day/
- AgentsView: https://www.agentsview.io/
- Code Insights: https://code-insights.app/docs/getting-started/introduction
- Entropic: https://github.com/Dimension-AI-Technologies/Entropic
- Polpo: https://github.com/pugliatechs/polpo
