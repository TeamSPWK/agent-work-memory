# Terminal Capture Strategy

> 제품의 실제 캡처 표면은 웹 앱보다 터미널에 더 가깝다. 웹 앱은 팀의 기억 저장소이고,
> 터미널 어댑터는 사용자가 평소처럼 작업하는 흐름에서 증거를 남긴다.

## 1. Why Terminal First

Claude Code, Codex, Cursor는 앱 UI만 쓰는 제품이 아니다. 실제 팀에서는 터미널에서
레포를 열고 에이전트를 실행하는 흐름이 많다.

따라서 MVP의 캡처 전략은 다음 순서를 따른다.

1. GitHub App으로 결과 증거를 자동 수집한다.
2. Claude Code hook으로 터미널 세션 맥락을 수집한다.
3. Local Git Hook으로 도구와 무관한 변경 증거를 남긴다.
4. Codex/Cursor는 wrapper 또는 session summary 방식으로 시작한다.
5. 깊은 도구별 연동은 실제 사용 빈도와 API 안정성을 본 뒤 진행한다.

## 2. Capture Surfaces

### 2.1 GitHub App

수집:

- commits
- pull requests
- changed files
- authors
- timestamps
- branch names

역할:

- 무엇이 바뀌었는지에 대한 결과 증거
- 세션과 연결할 기준 데이터
- Daily Wiki와 Incident Replay의 기본 타임라인

### 2.2 Claude Code Hook

Claude Code는 hooks를 통해 세션 시작, 사용자 프롬프트 제출, 도구 실행 전후, 세션
종료 같은 이벤트를 받을 수 있다. 공식 hook payload에는 `session_id`, `cwd`,
`hook_event_name`, `tool_name`, `tool_input`, `transcript_path` 같은 필드가 포함될 수 있다.

수집:

- SessionStart
- UserPromptSubmit
- PreToolUse
- PostToolUse
- SessionEnd
- cwd
- transcript path
- tool input summary

우선순위:

- MVP 1순위

이유:

- 사용자가 별도로 앱에 들어오지 않아도 작업 맥락이 남는다.
- DB/migration/env/삭제 명령 같은 위험 이벤트를 실행 전 감지할 수 있다.
- 원문 전체 저장 없이 summary 중심으로도 충분한 가치가 나온다.

### 2.3 Local Git Hook

수집:

- pre-commit changed files
- commit sha
- branch
- diff size
- risky path

역할:

- Claude/Codex/Cursor 어느 도구를 쓰든 공통으로 남는 안전망
- 세션 캡처가 실패해도 GitHub 이전의 로컬 증거를 확보

### 2.4 Codex CLI Adapter

Codex CLI는 터미널에서 사용하는 흐름이 있으므로 처음부터 별도 앱처럼 다루면 안 된다.
MVP에서는 깊은 이벤트 캡처보다 wrapper/skill 기반으로 시작한다.

수집:

- session summary
- cwd
- git diff summary
- linked commits
- unresolved questions
- handoff note

초기 접근:

```bash
npx awm capture wrap codex
```

또는 세션 종료 시:

```bash
awm session summarize --tool codex
```

### 2.5 Cursor CLI Adapter

Cursor CLI도 터미널 기반 agent workflow로 볼 수 있다. 초기에는 Codex와 같은 방식으로
wrapper 또는 세션 종료 요약을 지원한다.

수집:

- agent summary
- repo path
- changed files
- command summary
- git diff summary

## 3. Proposed CLI

패키지명은 임시로 `awm`으로 둔다.

```bash
# 팀 워크스페이스 연결
awm login

# 현재 레포 연결
awm repo link swk/ops-dashboard

# Claude Code hook 설치
awm capture install claude

# Git hook 설치
awm capture install git-hooks

# Codex CLI wrapper 실행
awm capture wrap codex

# Cursor CLI wrapper 실행
awm capture wrap cursor-agent

# 세션 종료 요약 수동 생성
awm session summarize --tool codex

# 오늘 로컬 증거 미리보기
awm today

# 로컬 세션 파일 탐지
awm discover
```

## 4. Event Payload Draft

```json
{
  "workspaceId": "swk",
  "source": "claude_hook",
  "sessionId": "abc123",
  "event": "PreToolUse",
  "cwd": "/Users/mina/swk/ops-dashboard",
  "toolName": "Bash",
  "summary": "pnpm db:migrate 실행 전 감지",
  "risk": {
    "category": "Database",
    "severity": "high",
    "reason": "migration command and db path matched"
  },
  "evidence": [
    {
      "type": "command",
      "label": "pnpm db:migrate"
    }
  ],
  "createdAt": "2026-05-07T10:08:00+09:00"
}
```

## 5. Privacy Defaults

- raw transcript는 기본 저장하지 않는다.
- hook payload는 로컬에서 masking 후 전송한다.
- command output 전체 저장은 opt-in이다.
- secret-like value는 client-side에서 마스킹한다.
- 개인 shell history 전체를 읽지 않는다.
- 에이전트 세션과 연결된 이벤트만 수집한다.

## 6. References

- [Claude Code Hooks](https://code.claude.com/docs/en/hooks)
- [OpenAI Codex CLI Getting Started](https://help.openai.com/en/articles/11096431-openai-codex-cli-getting-started)
- [Cursor CLI](https://cursor.com/cli/)

## 7. Prototype Implementation

현재 레포에는 첫 CLI prototype이 포함되어 있다.

웹 앱, 로컬 세션 ingest, 로컬 API를 함께 실행:

```bash
npm run mvp
```

URL:

```txt
http://127.0.0.1:5173/
```

실행:

```bash
npm run cli -- help
npm run cli -- ingest --limit 30
```

로컬 상태 저장 위치:

- `.awm/config.json`
- `.awm/events.jsonl`
- `.awm/discovery.json`
- `.awm/ingest.json`
- `.awm/links.json`
- `.awm/reviews.json`
- `.awm/sessions/*.json`
- `.awm/wiki/*.md`
- `.awm/hooks/claude-capture-hook.mjs`

검증 명령:

```bash
npm run cli -- login --workspace swk
npm run cli -- repo link swk/agent-work-memory
npm run cli -- discover
npm run cli -- ingest --limit 30
npm run cli -- capture sample
npm run cli -- today
```

실제 MVP ingest:

- Claude Code: `~/.claude/projects/**/*.jsonl`
- Codex CLI: `~/.codex/sessions/**/*.jsonl`
- Gemini CLI: `~/.gemini/tmp/**/*.json`

`ingest`는 최근 파일 일부를 읽어 세션 요약, 위험 신호, 레포 후보, 타임라인을 만든다.
원문 전체 transcript는 저장하지 않으며, command/token/secret-like value는 저장 전에
masking한다.

Today의 `Save Wiki`는 현재 ingest 결과를 Markdown daily note로 저장한다. 이 파일은
팀 서버 연동 전까지 로컬 작업 기억 결과물로 사용한다.

Claude Code hook prototype:

```bash
npm run cli -- capture install claude
```

이 명령은 `.awm/hooks/claude-capture-hook.mjs`와
`.awm/claude-settings-snippet.json`을 만든다. 아직 `.claude/settings.json`에 자동
병합하지 않는다. 사용자가 확인한 뒤 병합하는 것이 안전하다.

Git hook prototype:

```bash
npm run cli -- capture install git-hooks
```

이 명령은 git repository 내부에서만 동작한다.

수동 세션 요약:

```bash
npm run cli -- session summarize --tool codex --summary "GitHub activity 수집 방식을 확인했다."
```

주의:

- `.awm/`은 로컬 캡처 상태이므로 git에 올리지 않는다.
- 서버 전송은 아직 구현하지 않는다.
- GitHub App 연동은 다음 단계이며, 현재 MVP 화면의 실제 데이터는 로컬 세션 인덱스다.
- command, payload, summary는 저장 전 secret-like value를 마스킹한다.
