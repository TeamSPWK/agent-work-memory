# [Plan] GitHub App Integration

> Nova Engineering — CPS Framework
> 작성일: 2026-05-08
> 작성자: Nova DeepPlan
> Mode: deep
> Iterations: 0
> Design: TBD

---

## Context (배경)

### 현재 상태

- 현재 제품은 로컬 `.awm/` ingest를 중심으로 동작한다. `bin/awm.mjs`는 실행 CWD 기준 `.awm`을 만들고, `awm repo link <owner/repo>`는 `.awm/config.json`에 `repo`와 `repoPath`를 저장한다.
- 세션-커밋 후보는 로컬 git에서 세션 전후 3시간의 `git log --name-only`를 읽어 생성한다. 후보 점수는 `bin/match.mjs`의 4축 점수(`fileScore`, `areaScore`, `subjectScore`, `distanceScore`)를 사용한다.
- PRD와 캡처 전략은 GitHub를 "결과 증거"로, Agent Session을 "의도와 과정 증거"로 분리한다.
- GitHub 공식 REST 문서는 2026-03-10 API version을 최신으로 표시한다. GitHub App은 JWT로 app 인증을 하고 installation access token을 만들어 설치 범위의 API를 호출한다. installation token은 1시간 만료다.
- GitHub webhook은 수신 전 `X-Hub-Signature-256` HMAC 검증이 필요하다. 로컬 우선 CLI에는 공개 webhook endpoint가 아직 없으므로, 첫 구현은 webhook-first가 아니라 REST sync-first가 맞다.

### 왜 필요한가

- 로컬 git만으로는 GitHub PR, remote branch, reviewer-visible diff, GitHub author를 알 수 없다.
- 다음 제품 가치인 PR Review Brief와 Daily Wiki는 "무엇이 실제로 올라갔는가"를 GitHub에서 가져와야 신뢰도가 올라간다.
- 직전 스프린트에서 세션-커밋 점수 모델을 도입했으므로, 이제 GitHub commits/PR files를 같은 후보 모델에 얹을 수 있다.

### 관련 자료

- `docs/PRD.md:631` — GitHub Integration 수집 대상.
- `docs/PRD.md:660` — GitHub는 결과 증거, Agent Session은 의도/과정 증거.
- `docs/TERMINAL_CAPTURE.md:21` — GitHub App capture surface.
- `docs/DATA_CONTRACT.md:193` — MVP Linking Rules.
- `bin/awm.mjs:69` — `awm repo link <owner/repo>`.
- `bin/awm.mjs:1666` — 로컬 git evidence 수집.
- `bin/match.mjs:193` — 세션-커밋 점수 계산.
- GitHub Docs: REST Apps, Commits, Pull Requests, Webhook validation.

---

## Problem (문제 정의)

### 핵심 문제

GitHub App 연동을 바로 붙이면 인증·repo identity·remote activity cache·로컬 ingest 병합이 한 번에 섞여, 세션-커밋 연결 정확도와 사용자 데이터 안전성을 동시에 깨뜨릴 수 있다.

### MECE 분해

| # | 문제 영역 | 설명 | 영향도 |
|---|----------|------|--------|
| 1 | App 인증 | JWT 생성, installation token 발급/만료, 최소 권한 설정이 필요하다. | 높음 |
| 2 | Repo identity | 현재 `repo`는 path 추론 또는 수동 config라 `owner/repo`, local root, remote URL이 분리되어 있다. | 높음 |
| 3 | Activity 수집 | commits, PRs, PR files, authors, timestamps를 가져와 정규화해야 한다. | 높음 |
| 4 | Persistence | `.awm/`에 GitHub 결과 증거를 저장하되 secret과 raw diff 과다 저장을 피해야 한다. | 높음 |
| 5 | Matching | 기존 점수 모델에 GitHub author/PR/file 신호를 넣되 자동 확정은 아직 하지 않아야 한다. | 중간 |
| 6 | UI/API | GitHub App 상태와 remote evidence를 사용자에게 보여줘야 한다. | 중간 |
| 7 | Webhook | 실시간 수신은 공개 endpoint, signature 검증, replay 방어가 필요하다. | 중간 |

### 제약 조건

- `.awm/`은 사용자 데이터이며 외부 전송/원문 저장을 피한다.
- `.env`, private key, webhook secret, installation token은 커밋·로그·`.awm/config.json`에 평문 저장하지 않는다.
- 현재 앱은 Node ESM 단일 CLI와 Vite SPA다. 서버는 `bin/awm.mjs serve`의 로컬 HTTP 서버뿐이다.
- 기존 `WorkSession.commitCandidates[]`와 `links.json`의 사용자는 마이그레이션 없이 읽혀야 한다.
- 자동 confirm/reject는 이번 Plan 범위가 아니다. GitHub 후보도 사용자가 확인한다.

---

## Solution (해결 방안)

### 선택한 방안

**REST sync-first GitHub App adapter**를 채택한다.

1. `awm repo link <owner/repo>`를 canonical repo identity의 기준으로 삼고 `repoFullName`/`repoRoot`를 명시한다.
2. GitHub App credential은 env 또는 local-only key path에서 읽는다. `.awm/config.json`에는 app id, installation id, repo full name 같은 비밀이 아닌 연결 상태만 저장한다.
3. `awm github sync`가 installation token을 즉시 발급해 commits/PRs/files를 읽고, 정규화한 결과만 `.awm/github-activity.json`에 저장한다.
4. ingest 단계에서 로컬 git evidence와 GitHub activity를 같은 후보 모델로 병합한다.
5. webhook receiver는 후속 Sprint로 둔다. 지금은 공개 endpoint 없이도 검증 가능한 pull-based MVP를 먼저 만든다.

### 대안 비교

| 방안 | 접근 | 장점 | 단점 | 권장도 |
|------|------|------|------|--------|
| A | REST sync-first GitHub App adapter | 로컬 CLI에 맞고 테스트 가능. 공개 webhook endpoint 없이 시작 가능. | 실시간성은 낮다. sync 명령/refresh 주기가 필요하다. | ⭐ |
| B | Webhook-first receiver | GitHub 이벤트가 자동 수집된다. PRD의 장기 방향과 가장 가깝다. | 로컬 개발에서 public URL, signature, retry, replay 처리까지 필요해 범위가 커진다. |  |
| C | OAuth/PAT 또는 `gh` CLI 기반 sync | 구현이 빠르고 app private key가 필요 없다. | PRD의 GitHub App 방향과 다르고 팀 설치/권한 모델 검증이 늦어진다. |  |

### 구현 범위

- [ ] `repoFullName`/`repoRoot`/`source`를 데이터 계약에 추가하고 기존 데이터 호환성을 유지한다.
- [ ] `awm repo link <owner/repo>`가 canonical repo identity를 저장하도록 정리한다.
- [ ] GitHub App env contract를 정의한다: `AWM_GITHUB_APP_ID`, `AWM_GITHUB_PRIVATE_KEY_PATH` 또는 `AWM_GITHUB_PRIVATE_KEY`, `AWM_GITHUB_INSTALLATION_ID`.
- [ ] GitHub adapter 순수 모듈을 추가한다: JWT 생성, installation token 요청, paginated REST 요청, commits/PR/files 정규화.
- [ ] `awm github status`와 `awm github sync --since <ISO>` CLI를 추가한다.
- [ ] `.awm/github-activity.json`에 secret 없는 normalized activity만 저장한다.
- [ ] ingest가 GitHub commits/PR files를 `commitCandidates`와 repository aggregate에 반영한다.
- [ ] UI capture adapter와 repository screen에서 GitHub 연결 상태, sync 시각, remote commits/PRs를 표시한다.
- [ ] fixture 기반 vitest로 auth-less normalization, pagination, match 병합, secret masking을 검증한다.

### 검증 기준

- secret-like 값이 config, ingest, activity JSON, stdout에 저장되지 않는다.
- GitHub fixture commits/PR files가 `CommitCandidate.files`, `RepositoryActivity.commits`, `RepositoryActivity.prs`로 반영된다.
- local-only ingest와 기존 links/reviews round-trip은 변경 없이 통과한다.
- GitHub credential이 없을 때 UI/API는 실패가 아니라 `needs_setup` 상태를 보여준다.

---

## Sprints (스프린트 분할)

### S0 — Repo Identity Migration

- `docs/DATA_CONTRACT.md`에 optional `repoFullName`, `repoRoot`, activity `source`를 추가한다.
- `src/types.ts`와 sample fallback에 optional 필드를 맞춘다.
- `awm repo link`가 `repo`, `repoFullName`, `repoRoot`, `linkedAt`을 명시적으로 저장한다.
- 기존 `.awm/config.json`의 `repo`/`repoPath`만 있어도 동작하는 read fallback을 둔다.

### S1 — GitHub REST Adapter

- `bin/github.mjs`를 추가해 GitHub App JWT, installation token, REST request, pagination, payload normalization을 분리한다.
- `awm github status`는 env/config 누락을 `needs_setup`으로 반환한다.
- `awm github sync`는 `contents:read`, `pull_requests:read`, `metadata:read` 권한에 맞춘 read-only 수집만 수행한다.
- installation token은 메모리에서만 사용하고 파일에 저장하지 않는다.

### S2 — Ingest Merge

- `.awm/github-activity.json`을 읽어 sessions의 commit candidates와 repository aggregate에 병합한다.
- 기존 `scoreCommitCandidate`를 재사용하고, GitHub author 일치 축은 별도 상수로 작게 추가하거나 match reason에만 반영한다.
- PR은 commit 후보의 evidence link와 repository `prs` count에 먼저 반영하고, 자동 확정은 제외한다.

### S3 — UI/API Visibility

- `/api/health` 또는 `/api/mvp`에 GitHub sync 상태를 포함한다.
- Capture Adapter 화면의 "GitHub 앱"을 `planned`에서 `needs_setup`/`connected`로 실제 상태화한다.
- Repository screen에 GitHub commits/PRs, last sync, permission/setup error를 보여준다.

### S4 — Webhook Receiver (후속)

- `POST /api/github/webhook`은 공개 endpoint 배포 전략이 결정된 뒤 진행한다.
- raw body 기준 `X-Hub-Signature-256` 검증, delivery id dedupe, replay 방어, retry-safe persistence를 포함한다.

---

## Risk Map

| 리스크 | 가능성 | 영향 | 완화 |
|--------|--------|------|------|
| Private key 또는 installation token이 `.awm/`/로그에 남는다. | M | H | token은 메모리 전용, config에는 key path만 저장, snapshot/fixture에 secret scanner 테스트 추가. |
| repo path 추론과 GitHub `owner/repo`가 어긋나 다른 레포 activity를 세션에 붙인다. | M | H | S0에서 `repoFullName`과 `repoRoot`를 canonical identity로 먼저 도입. |
| GitHub REST pagination/rate limit 때문에 activity가 일부만 들어온다. | M | M | `Link` pagination 처리, `per_page=100`, sync window와 lastSync cursor 저장. |
| PR files와 commit files가 중복되어 후보 점수가 과대평가된다. | M | M | normalized activity id와 file set dedupe 후 scoring. |
| webhook-first로 범위를 키워 로컬 MVP가 검증 불가능해진다. | H | M | REST sync-first를 선택하고 webhook은 S4로 분리. |
| GitHub author와 로컬 actor 매칭이 불명확하다. | M | M | author score는 자동 확정에 쓰지 않고 match reason/후보 정렬 보조로만 시작. |

## Unknowns

- 실제 배포 형태가 완전 로컬 CLI인지, 팀용 hosted endpoint를 포함할지 아직 결정되지 않았다.
- GitHub App 등록/설치 UX를 이 레포가 직접 제공할지, 운영 문서로만 처리할지 결정이 필요하다.
- private repo diff/patch를 얼마나 저장할지 정책이 필요하다. 기본은 changed file path와 stats 중심이어야 한다.
- `repoRoot`를 `WorkSession`에 저장할 때 기존 `.awm/ingest.json`의 과거 세션을 마이그레이션할지 lazy fallback으로 둘지 결정해야 한다.
- GitHub Enterprise Server 지원 여부는 범위 밖으로 둘지 확인이 필요하다.

---

## Verification Hooks

> Sprint Contract 씨앗 — 이후 /nova:design 단계에서 구체화한다.

| # | 검증 항목 | 검증 방법 | 우선순위 |
|---|----------|----------|---------|
| 1 | credential 없는 환경에서 `awm github status`가 exit 0과 `needs_setup`을 반환한다. | `npm run cli -- github status --json` | Critical |
| 2 | fixture commit/PR payload가 normalized GitHub activity로 변환된다. | `npm test -- github.normalize` | Critical |
| 3 | installation token/private key가 `.awm/config.json`, `.awm/github-activity.json`, stdout에 저장되지 않는다. | fixture test + `rg -n "BEGIN .*PRIVATE|ghs_|token" .awm` | Critical |
| 4 | 기존 local ingest가 깨지지 않는다. | `npm run cli -- ingest --limit 30 && npm run cli -- today` | Critical |
| 5 | GitHub activity가 repository commits/PRs와 commit candidates에 병합된다. | `npm test -- github.ingest` | Critical |
| 6 | UI build/typecheck가 통과한다. | `npm run build` | Critical |
| 7 | webhook receiver는 이번 구현에 포함되지 않는다. | `rg -n "/api/github/webhook|X-Hub-Signature" bin src` 결과가 design 전까지 비어 있음 | Nice-to-have |

## External References

- GitHub REST Apps docs: https://docs.github.com/en/rest/apps/apps
- GitHub App auth docs: https://docs.github.com/en/enterprise-cloud@latest/apps/creating-github-apps/authenticating-with-a-github-app/authenticating-as-a-github-app
- GitHub Commits REST docs: https://docs.github.com/en/rest/commits/commits
- GitHub Pull Requests REST docs: https://docs.github.com/en/rest/reference/pulls
- GitHub webhook validation docs: https://docs.github.com/en/webhooks/using-webhooks/validating-webhook-deliveries
