# Data Contract

> 현재 MVP의 기본 화면은 로컬 Claude/Codex 세션 ingest 결과만 보여준다. 정적 샘플은
> 개발 fallback으로만 남기며, 사용자 화면에서는 실제 ingest 상태를 명확히 구분한다.
> 필드는 이후 GitHub API, 에이전트 hook, Codex/Cursor 어댑터로 확장 가능해야 한다.

## 1. Source Types

1. GitHub Activity
   - repository
   - commit
   - pull request
   - changed file
   - author
   - timestamp

2. Agent Session
   - tool
   - actor
   - prompt or summary
   - agent response summary
   - command log
   - touched files
   - unresolved questions

3. Risk Signal
   - category
   - severity
   - evidence
   - status
   - reason

4. Wiki Memory
   - daily note
   - incident note
   - repo context
   - decision log

5. Terminal Capture
   - capture adapter
   - cwd
   - hook event
   - command summary
   - transcript path reference
   - local git state

## 2. Core Entities

### 2.1 WorkSession

```ts
interface WorkSession {
  id: string;
  title: string;
  tool: "Claude Code" | "Codex" | "Cursor" | "Other";
  actor: string;
  repo: string;
  startedAt: string;
  endedAt: string;
  intentSummary: string;
  agentSummary: string;
  status: "reviewed" | "needs_explanation" | "linked" | "unlinked";
  linkedCommits: string[];
  confirmedCommits?: string[];
  commitCandidates?: Array<{
    hash: string;
    shortHash: string;
    subject: string;
    files: string[];
    committedAt?: string;
    confirmed?: boolean;
  }>;
  evidence: EvidenceLink[];
  unresolved: string[];
  explainBack: ExplainBack;
}
```

### 2.2 RiskEvent

```ts
interface RiskEvent {
  id: string;
  category:
    | "Database"
    | "Migration"
    | "Auth"
    | "Secret"
    | "Infra"
    | "Destructive"
    | "Large Diff"
    | "Failed Verification";
  severity: "high" | "medium" | "low";
  title: string;
  repo: string;
  file: string;
  time: string;
  actor: string;
  reason: string;
  status: "unreviewed" | "acknowledged" | "resolved";
  evidence: EvidenceLink[];
}
```

### 2.3 TimelineEvent

```ts
interface TimelineEvent {
  id: string;
  time: string;
  actor: string;
  type: string;
  summary: string;
  repo: string;
  severity?: "high" | "medium" | "low";
  evidence: EvidenceLink[];
}
```

### 2.4 CaptureAdapter

```ts
interface CaptureAdapter {
  id: string;
  kind:
    | "github"
    | "claude_hook"
    | "codex_cli"
    | "cursor_cli"
    | "git_hook"
    | "manual";
  name: string;
  status: "connected" | "ready" | "planned" | "needs_setup";
  environment: "web" | "terminal" | "git" | "manual";
  priority: "mvp" | "next" | "later";
  captures: string[];
  setupCommand: string;
  notes: string;
}
```

### 2.5 TerminalEvent

```ts
interface TerminalEvent {
  id: string;
  time: string;
  tool: "Claude Code" | "Codex" | "Cursor" | "Other";
  cwd: string;
  event: string;
  summary: string;
  risk?: "high" | "medium" | "low";
  evidence: EvidenceLink[];
}
```

### 2.6 LocalIngestResult

```ts
interface LocalIngestResult {
  ingestedAt: string;
  limit: number;
  sources: Array<{
    id: "claude" | "codex" | "gemini";
    label: string;
    fileCount: number;
    ingestedFiles: number;
  }>;
  privacy: {
    rawTranscriptStored: false;
    summaryOnly: true;
    secretsMasked: true;
  };
  repositories: RepositoryActivity[];
  sessions: WorkSession[];
  riskEvents: RiskEvent[];
  timeline: TimelineEvent[];
}
```

MVP API:

- `GET /api/mvp`: 마지막 ingest 결과를 반환한다.
- `GET /api/mvp?refresh=1&limit=30`: 로컬 세션 파일을 다시 읽고 결과를 갱신한다.
- `GET /api/discovery`: 로컬 세션 파일 metadata만 반환한다.
- `GET /api/reviews`: 세션별 운영자 리뷰 판단을 반환한다.
- `POST /api/reviews`: 세션별 `reviewed` / `needs_explanation` 판단을 저장한다.
- `GET /api/links`: 세션-커밋 확정 연결을 반환한다.
- `POST /api/links`: 커밋 후보를 확정 연결로 저장한다.
- `POST /api/sessions`: 자동 탐지되지 않은 작업을 수동 세션 요약으로 저장하고 ingest에 포함한다.
- `POST /api/wiki`: 현재 daily summary를 Markdown 파일로 저장한다.

## 3. MVP Linking Rules

세션과 GitHub 변경 연결 후보는 다음 기준으로 만든다.

1. 같은 actor 또는 같은 GitHub author
2. 같은 repo
3. 세션 시간과 commit/PR 시간이 3시간 이내
4. 세션 요약 키워드와 changed file path가 부분 일치
5. risk category가 같은 파일 경로에서 발생
6. terminal cwd가 repository local path와 일치
7. hook event의 `transcript_path` 또는 wrapper session id가 WorkSession과 일치
8. 로컬 Git 로그에서 세션 시작/종료 시점 전후 3시간 안의 commit을 후보로 연결

MVP에서는 연결을 자동 확정하지 않고 사용자가 확인한다.

후보 신뢰도는 4축 가중 점수로 결정한다: `fileScore`(파일 경로 매칭, 가중치 0.45) / `areaScore`(디렉토리 prefix Jaccard, 0.20) / `subjectScore`(커밋 메시지↔세션 키워드 Jaccard, 0.20) / `distanceScore`(비선형 감쇠 1/(1+d/30), 0.15). 총점이 0.40 이상이면 `high`, 0.20 이상이면 `medium`, 미만이면 `low`. 상수는 `bin/match.mjs`의 `WEIGHTS`·`THRESHOLDS`에 고정.

## 4. Risk Path Defaults

초기 위험 경로:

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

## 5. Privacy Defaults

- raw transcript 저장은 선택 사항이다.
- 기본 저장 단위는 summary다.
- secret-like value는 저장 전에 masking한다.
- 모든 evidence link는 원본 시스템으로 이동할 수 있어야 한다.
