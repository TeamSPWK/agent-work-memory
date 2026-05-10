# Agent Work Memory

AI 에이전트(Claude Code, Codex, Cursor)와 팀이 같이 일할 때 대화·커밋·변경 파일·실행 명령·위험 이벤트를
하루 단위 작업 기억으로 묶어 사람이 다시 설명 가능한 단위로 검증하는 로컬 우선 도구.

> Cross-agent 진입점은 `AGENTS.md` (브리지). 본 문서가 운영 헌법.

## Start Here
- 현재 상태 / 스프린트 Goal / Blocker: `NOVA-STATE.md`
- 제품 요구·UX·데이터 계약: `docs/PRD.md`, `docs/UX_FLOWS.md`, `docs/DATA_CONTRACT.md`
- 캡처 전략 / 디자인 시스템: `docs/TERMINAL_CAPTURE.md`, `docs/DESIGN_SYSTEM.md`
- 경쟁/오픈소스 맥락: `docs/COMPETITIVE_LANDSCAPE.md`, `docs/OPEN_SOURCE_LEVERAGE.md`

## Stack
- Frontend: Vite 8 + React 18 + TypeScript 5.7 (단일 SPA, `src/App.tsx`)
- CLI: Node ESM (`bin/awm.mjs`, 명령 `awm`)
- 데이터: 로컬 `.awm/` (요약·링크·리뷰·문서 상태만 저장. 원문 transcript 저장 X)

## Build & Verify
```bash
npm install
npm run build       # tsc + vite build
npm run cli -- help # CLI 진입점 확인
npm run mvp         # build → ingest --limit 30 → serve :5173 (수동 점검용)
npm run dev         # vite dev server (UI 작업 시)
```

검증 명령:
- 타입/빌드: `npm run build`
- CLI 동작: `npm run cli -- ingest --limit 30 && npm run cli -- today`
- UI 회귀: `http://127.0.0.1:5173/` 에서 골든 패스(오늘/작업 패킷/문서함) 수기 점검
- 린트/테스트 스크립트는 아직 없음 — TODO(owner): 추가 시점에 본 섹션 갱신

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
