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
  repoFullName?: string;
  repoRoot?: string;
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
    rejected?: boolean;
    confidence?: "high" | "medium" | "low";
    matchReason?: string;
    source?: "local_git" | "github";
    sources?: Array<"local_git" | "github" | "local">;
    authorLogin?: string;
    htmlUrl?: string;
    prNumbers?: number[];
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
    id: "claude" | "codex" | "gemini" | "manual" | "github";
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

### 2.7 GitHubActivity

```ts
interface GitHubActivity {
  schemaVersion: 1;
  source: "github";
  repoFullName: string;
  syncedAt: string;
  since?: string;
  until?: string;
  commits: Array<{
    source: "github";
    repoFullName: string;
    hash: string;
    shortHash: string;
    subject: string;
    files: string[];
    committedAt?: string;
    authorLogin?: string;
    authorName?: string;
    htmlUrl?: string;
  }>;
  pullRequests: Array<{
    source: "github";
    repoFullName: string;
    number: number;
    title: string;
    state?: string;
    authorLogin?: string;
    branch?: string;
    baseBranch?: string;
    updatedAt?: string;
    htmlUrl?: string;
    files: string[];
    commits: string[];
  }>;
}
```

GitHub App credential은 이 객체에 저장하지 않는다. `.awm/github-activity.json`에는 token, private key, webhook secret, raw patch를 저장하지 않고, commit/PR 식별자와 파일 경로 중심의 결과 증거만 저장한다.

### 2.8 GitHubWebhookStore

```ts
interface GitHubWebhookStore {
  schemaVersion: 1;
  source: "github_webhook";
  updatedAt?: string;
  deliveries: Array<{
    deliveryId: string;
    event: string;
    action?: string;
    repoFullName?: string;
    receivedAt: string;
    senderLogin?: string;
    commitCount: number;
    pullRequestCount: number;
    payloadSha256: string;
  }>;
}
```

`.awm/github-webhooks.json`은 raw webhook payload, signature, webhook secret을 저장하지 않는다. `deliveryId`와 `payloadSha256`만 보관해 GitHub retry는 idempotent duplicate로 처리하고, 같은 delivery id의 다른 payload는 replay mismatch로 거부한다.

### 2.9 GitHubVisibility

```ts
interface GitHubVisibility {
  kind: "github";
  status: "ready" | "needs_setup";
  repoFullName?: string;
  appId?: string;
  installationId?: string;
  privateKeySource?: "env" | "path";
  apiBaseUrl: string;
  missing: string[];
  permissions: string[];
  lastSyncAt?: string;
  activity?: {
    repoFullName: string;
    syncedAt: string;
    commits: number;
    pullRequests: number;
    changedFiles: number;
  };
  webhook: {
    status: "ready" | "needs_setup";
    path: "/api/github/webhook";
    deliveries: number;
    lastDeliveryAt?: string;
  };
}
```

`GET /api/health`와 `GET /api/mvp`는 이 객체를 `github` 필드로 반환한다. UI는 이 필드로 GitHub App 어댑터 상태와 repository remote evidence를 표시한다. Webhook receiver는 `AWM_GITHUB_WEBHOOK_SECRET`이 있을 때만 ready로 보고한다.

MVP API:

- `GET /api/mvp`: 마지막 ingest 결과를 반환한다.
- `GET /api/mvp?refresh=1&limit=30`: 로컬 세션 파일을 다시 읽고 결과를 갱신한다.
- `GET /api/discovery`: 로컬 세션 파일 metadata만 반환한다.
- `GET /api/reviews`: 세션별 운영자 리뷰 판단을 반환한다.
- `POST /api/reviews`: 세션별 `reviewed` / `needs_explanation` 판단을 저장한다.
- `GET /api/links`: 세션-커밋 확정 연결을 반환한다.
- `POST /api/links`: 커밋 후보를 확정 연결로 저장한다.
- `POST /api/sessions`: 자동 탐지되지 않은 작업을 수동 세션 요약으로 저장하고 ingest에 포함한다.
- `POST /api/github/webhook`: GitHub webhook raw body를 `X-Hub-Signature-256`로 검증하고 delivery dedupe 후 sanitized remote evidence로 저장한다.
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
