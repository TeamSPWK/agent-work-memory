# Agent Work Memory

**AI Audit Trail SaaS for Korean SMB** — AI 에이전트가 자율적으로 만드는 변경(코드·DB·인프라)을 팀이 검토·감사·복원할 수 있게 하는 한국 B2B SaaS.

> **현재 단계: Design-First Restart (2026-05-10~)**.
> v1 구현은 `legacy-v1` 브랜치 + `legacy-v1-2026-05-10` 태그로 보존. main은 디자인·운영·문서만.
> 자세한 배경은 `README.md`.
>
> Cross-agent 진입점은 `AGENTS.md` (브리지). 본 문서가 운영 헌법.

## Start Here
- 현재 상태 / Phase / Blocker: `NOVA-STATE.md`
- 제품 정의 (v2): `docs/PRD.md`. v1 보존: `docs/archive/PRD-v1-tech-validation.md`
- 디자인 prompt (Claude Artifact): `docs/projects/plans/p0-claude-design-prompts.md`
- **UX·디자인 lock (모든 UI 작업 전 필독)**: `docs/DESIGN_SYSTEM.md` §1.0 일관성 / §3.4 두 트랙 분리 / §12 외부 페이지 토스 패턴. 라우팅은 `.claude/rules/ui-consistency-tracks.md`
- UX flows: `docs/UX_FLOWS.md`
- 시장·경쟁: `docs/COMPETITIVE_LANDSCAPE.md`, `docs/OPEN_SOURCE_LEVERAGE.md`
- 데이터·캡처 (참고): `docs/DATA_CONTRACT.md`, `docs/TERMINAL_CAPTURE.md`

## Stack — TBD (디자인 수렴 후 결정)

v1에서 *Vite 8 + React 18 + TS 5.7 SPA + Node ESM CLI + 로컬 `.awm/`*를 사용했고, M1 단계에서 Clerk·Supabase Tokyo·Fly.io NRT·Row-level RLS·Workspace API Key로 결정한 바 있음. 모두 v1 자산 / `legacy-v1` 브랜치에서 회수 가능.

본 단계에서는 **stack 결정 새로**. 디자인 시안 수렴 후 다음 우선순위로 결정:
1. *시각 시안의 데이터·인터랙션 패턴* 분석
2. *1인 운영 가능성* (managed services 우선)
3. *한국 latency·결제·세금계산서* 정합

## Build & Verify

M0 Tech Validation 진입(2026-05-13) 후 v1 자산이 main에 통합돼 *로컬 작동*. Stack 결정(M1)은 별개.

### 빌드·테스트

```bash
npm install                      # 첫 1회 (82 pkg, 0 vuln)
npm run build                    # vite8 — web/ → dist/  (~170ms)
cd web && npm test -- --run      # web 67 case (jsdom)
npx vitest run                   # root 40 case (hashchain 17 + match/persist/github)
cd web && npx tsc --noEmit       # TS strict
```

### 로컬 서버 운영 (백그라운드 PID 관리)

```bash
npm run serve            # build(없으면) + ingest --limit 30 + serve --port 5173 (백그라운드)
npm run serve:status     # PID + lsof 포트 LISTEN
npm run serve:logs       # 마지막 40줄 (bash scripts/awm-serve.sh logs -f 로 follow)
npm run serve:restart    # stop + start
npm run serve:stop       # SIGTERM 5회 폴링 → SIGKILL fallback

# override
AWM_PORT=5174 AWM_INGEST_LIMIT=50 npm run serve
```

PID/log: `.awm/serve.pid`·`.awm/serve.log` (gitignored). 진입점 http://127.0.0.1:5173/today.

### Audit Layer (PRD §5.5)

```bash
node bin/awm.mjs audit verify         # SHA-256 chain 무결성, exit 1로 변조 차단
node bin/awm.mjs audit rebuild        # 기존 events 재해시 + .pre-chain-<ISO> 백업
node bin/awm.mjs audit show --last 5  # 최근 N개의 prev/hash 디버그 출력
```

### 캡처 hook (S2 측정 시작 시 1회)

```bash
# 1) Claude Code hook 생성
node bin/awm.mjs capture install claude
# → .awm/hooks/claude-capture-hook.mjs (실행권한 자동)
# → .awm/claude-settings-snippet.json (SessionStart/UserPromptSubmit/PreToolUse(Bash|Edit|Write)/PostToolUse/SessionEnd 5종)

# 2) snippet을 settings.local.json 에 복사 (settings.json X — hook 절대경로가 내 머신 한정이라 공유 시 다른 사용자 매 prompt 에러)
cp .awm/claude-settings-snippet.json .claude/settings.local.json
# .gitignore에 .claude/settings.local.json 등재됨

# 3) Claude Code 재시작 — 현재 세션에는 적용 안 됨, 다음 세션부터 events.jsonl 누적

# 4) git pre-commit hook (선택)
node bin/awm.mjs capture install git-hooks   # .git/hooks/pre-commit, git-tracked X
```

설치 확인: 다음 세션 시작 후 `node bin/awm.mjs audit show --last 3` — SessionStart 이벤트가 prev/hash와 함께 보이면 OK.

## Non-Negotiables (advisory — 강제 미설치)
- `.env`, `.secret/`, `*.pem`, `*.key`, 액세스 토큰을 커밋·로그·이슈에 노출하지 않는다.
- v2 시작점에는 `.awm/`·`.nova/` 사용자 데이터 디렉토리 없음. v2 구현 시 `docs/areas/regulatory/` 정책 따라 결정.
- 3개 이상 파일 수정 → 계획 먼저, 승인 후 구현 (사용자 글로벌 규칙).
- git commit/push는 사용자 명시적 요청 시에만.

> Enforcement gap: 위 규칙은 현재 settings/hooks/CI로 막히지 않은 advisory다.
> 강제가 필요해지면 `.claude/settings.json` deny + pre-commit hook 추가를 별도 결정으로 처리.

## Non-Negotiables (advisory — 강제 미설치)
- `.env`, `.secret/`, `*.pem`, `*.key`, 액세스 토큰을 커밋·로그·이슈에 노출하지 않는다.
- `.awm/`(사용자 작업 기억)와 `.nova/`(세션 이벤트)는 사용자 데이터다. 디버깅 목적 외 외부 전송·요약 출력 금지.
- 원문 transcript는 기본 저장하지 않는다. 저장 형식이 바뀌면 `docs/DATA_CONTRACT.md`도 같이 갱신.
- 3개 이상 파일 수정 → 계획 먼저, 승인 후 구현 (사용자 글로벌 규칙).
- git commit/push는 사용자 명시적 요청 시에만.

> Enforcement gap: 위 규칙은 현재 settings/hooks/CI로 막히지 않은 advisory다.
> 강제가 필요해지면 `.claude/settings.json` deny + pre-commit hook 추가를 별도 스프린트로 처리.

## Agent Routing
- 경로별 규칙 → `.claude/rules/`
- 다단계 절차(배포/릴리스/마이그레이션) → `.claude/skills/` 또는 `.claude/commands/` (현재 없음)
- 하드 가드 → `.claude/settings.json`, hooks, CI (현재 없음)
- 현재 phase / TODO / blocker → `NOVA-STATE.md`
- 개인 경로·로컬 토큰 → `CLAUDE.local.md` 또는 `.claude/settings.local.json`

## PRD·전략 문서 작업
PRD/페르소나/GTM/Roadmap 작성·수정 시 반드시 `.claude/rules/prd-and-strategy-collaboration.md` 5개 원칙을 적용한다.
요약: (1) 시장 신호 직접 조사, (2) 가상 회사·인물명 금지, (3) 사용자 직군 편견 금지, (4) 임의 기간 milestone 금지, (5) 1인 프로젝트 제약 반영.

## UI/UX 작업 (web/src/** 모든 변경)
UI/UX 코드(`web/src/**` · CSS · 화면·컴포넌트·라우트) 변경 시 반드시 다음을 적용한다.
- **일관성 우선** (`docs/DESIGN_SYSTEM.md` §1.0 Consistency first): 같은 트랙 안에서 동일 패턴 유지, 트랙이 다르면 의도적 분리, 시안과 production 어긋날 때 *원칙*을 우선.
- **두 트랙 분리** (§3.4 Inside-app vs Public): Inside-app은 데이터 밀도 풀폭 콘솔, Public은 토스 패턴 마케팅(`.pub-inner` max-width 1120 + 1컬럼 hero + vertical spacing 96 + 큰 typo).
- **외부 노출 금지 6항** (§12.3): 내부 가설 라벨(H1~H4)·mock vmetric 숫자·내부 버전(v0.1·v0.2)·PRD 섹션 번호·자기 워크스페이스 데이터 가정·dev 메타(PageBand)는 외부 페이지에 *0*.
- **audience 원칙** (§12.4): 외부 페이지 카피는 PRD §4.2 한 줄 정의를 일관되게 변형. 모든 audience(AI 경험자·전문가·초심자·학생)가 30초 안에 이해 가능.
- **dev 메타 분리** (§12.5): 가설 추적·SCREENS 매트릭스·sprint 진행률은 `/dev/status`에만. 외부 페이지 노출 X.
상세 룰: `.claude/rules/ui-consistency-tracks.md`

## 운영 동기화 (1인 창업자 sustainability)
운영 결정·고객 데이터·비용·규제 변경 시 반드시 `.claude/rules/operations-sync.md`를 따른다.
- 문서: PARA 구조 (`docs/projects/`·`docs/areas/`·`docs/resources/`·`docs/archive/`). 새 .md는 PARA 위치 결정 후 작성.
- 운영 데이터: `data/` + git-crypt (민감 파일만 암호화).
- 매주 30분 Weekly Review (`docs/areas/operations/weekly-review.md`).
- 정합성 스크립트 `npm run check:docs` (구현 예정).
- 회피: Notion·Airtable 외부 SaaS 운영 데이터 X / 매일 회고 X / docs 루트에 무계획 .md 추가 X.

## 프로젝트 정체성
- agent-work-memory는 jay@spacewalk.tech **1인 프로젝트** (Spacewalk 사업자 명의).
- 모든 결정(PRD·architecture·GTM·운영)에 1인 운영 가능성이 제약 조건으로 들어간다.
- 협업 원칙은 *git에 들어가는 프로젝트 내부 파일*에만 둔다. 개인 글로벌 메모리는 작업 환경/사용자/AI 도구가 달라지면 무의미하므로 사용 안 함.

## Claude Code 특화
- Nova 자동 적용 규칙은 SessionStart 훅으로 주입됨. 상세는 `docs/nova-rules.md`(플러그인) on-demand 로드.
- 자주 쓰는 진입점: `/nova:next`, `/nova:plan`, `/nova:check`, `/nova:review`, `/nova:claude-md`.
- 지침이 누락된 것 같으면 `/memory`로 로드된 파일 확인.
- 본 파일은 Claude 운영 헌법 + 라우터로 유지한다. 다른 에이전트 공통 계약은 `AGENTS.md` 브리지가 본 파일을 가리킨다.

## v1 자산 회수 (필요 시)

v1 코드는 `legacy-v1` 브랜치 + `legacy-v1-2026-05-10` tag에 전체 보존. 회수 명령:
```bash
git show legacy-v1-2026-05-10:bin/match.mjs > /tmp/match-v1.mjs   # 단일 파일
git checkout legacy-v1 -- bin/match.mjs                            # cherry-pick
git checkout legacy-v1                                              # 전체 v1 보기
```

v1에서 검증된 자산 (참고만 — 본 단계 시작점은 *시각 디자인*):
- 매칭 P1 — 4축 가중 점수, 11/11 critical
- 영속화 S1~S2.5 — 원자적 쓰기, corruption isolation
- GitHub App webhook — duplicate/retry-safety 검증
- Calm Operations 디자인 토큰 277개 (시각 자산은 디자인 수렴 후 인용 가능)

## Known Mistakes
(아직 기록된 항목 없음. 사고 발생 시 여기 누적.)

## Instruction Placement Contract
지침을 추가/수정할 때 어디에 둘지 먼저 분류한다. 본 파일을 두껍게 만들지 않는다.

| 종류 | 위치 |
|------|------|
| 매 세션 필요한 불변 사실, 빌드/검증, 비협상 위험 경계 | `CLAUDE.md` |
| 경로/파일 타입에만 적용되는 규칙 | `.claude/rules/*.md` (path-scoped) |
| 다단계 절차 (배포·릴리스·마이그레이션) | `.claude/skills/*/SKILL.md` 또는 `.claude/commands/*.md` |
| 반드시 차단/검사할 하드 룰 | `.claude/settings.json`, hooks, CI, scripts |
| 긴 설명·인프라 inventory·runbook | `docs/**` |
| 현재 phase / TODO / blocker | `NOVA-STATE.md` |
| 개인 경로·로컬 토큰 | `CLAUDE.local.md`, `.claude/settings.local.json` |

중요해 보인다고 본 파일에 넣지 않는다. 항상 지켜야 한다면 강제 owner를 같이 적는다.
