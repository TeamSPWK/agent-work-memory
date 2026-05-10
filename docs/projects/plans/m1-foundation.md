# M1 Foundation Plan

> Status: drafting · Owner: jay@spacewalk.tech · Date: 2026-05-10
>
> PRD v2 §10.1 M1 (Foundation) 단계. Exit criteria: *워크스페이스 1개에서 캡처→매칭→저장이 end-to-end 통과*.
> 본 Plan은 회원가입·팀 워크스페이스·서버 webhook·기존 CLI 연결까지를 한 단위로 잡는다.
> Audit Layer·Daily Memory는 M2, Incident Replay는 M3, 결제는 M4로 분리한다.

## 1. Context

PRD v2가 정의한 v2.0 MVP 10개 기능 중 *토대*에 해당하는 M1. 자산 재사용률이 가장 높은 기능들과 가장 신규 부담이 큰 기능들이 동시에 모인 단계 — 이 토대가 안 잡히면 M2 이후가 모두 막힌다.

- 1인 프로젝트 제약 (`.claude/rules/operations-sync.md`, `.claude/rules/prd-and-strategy-collaboration.md` §5)
- 기술 결정 5개 확정됨 (NOVA-STATE 2026-05-10): Clerk · Supabase Tokyo · Fly.io NRT · Row-level RLS · Workspace API Key
- 비용 가설: Stage 0 ~$3~5/mo (`docs/areas/operations/cost-stages.md`)

## 2. Problem

1인이 5개 영역을 *처음부터 동시에* 셋업해야 한다.

1. **인증**: 가입·로그인·워크스페이스·멤버·역할
2. **DB·테넌시**: Postgres + RLS + workspace_id 격리
3. **호스팅**: Node 서버 + 환경 분리(dev/prod)
4. **CLI ↔ 서버**: webhook 수신, Bearer 인증
5. **자산 이식**: 기존 매칭 P1 + 영속화 S1~S2.5 로직을 *로컬 `.awm/` 가정* → *서버 Postgres*로 이동

각 영역이 독립적으로 다른 영역에 의존성을 만든다. *순서를 잘못 잡으면 재작업이 폭발*한다.

## 3. Solution

### 3.1 Stack 확정 (5개 영역 병렬 Agent 조사 결과 — NOVA-STATE 2026-05-10)

| 영역 | 선택 | 핵심 이유 |
|------|------|---------|
| Auth | **Clerk Pro** | 공식 koKR 로케일, B2B Org/Member SDK 내장, 10k MAU 무료, $25/mo Pro |
| DB | **Supabase Tokyo (ap-northeast-1)** | append-heavy hash chain insert에 in-region RTT, Pro $25/mo + 컴퓨트 |
| Hosting | **Fly.io NRT (도쿄)** | 풀 Node 환경, Supabase Tokyo와 same-region pairing, $2.47/mo 시작 |
| Tenancy | **Row-level + workspace_id + RLS** | Notion·Linear 패턴, 1인 운영 부담 최저, 인공지능기본법 적합 가능 |
| CLI Auth | **Workspace API Key (v2.0)** | 단방향 webhook 흐름이라 OAuth 가치 낮음, GitHub PAT 패턴 |

### 3.2 Architecture (data flow)

```
[Claude Code SessionHook]
       ↓
bin/awm.mjs (CLI, 자산 100%)
       ↓ POST /api/webhook (Bearer wsk_*)
[Fly.io NRT — Hono server]
       ↓ Bearer 미들웨어 (workspace_id 추출)
[Supabase Tokyo — Postgres + RLS]
       ├─ workspaces / members / api_keys
       ├─ sessions / events / commits / risk_signals
       └─ (M2) audit_log_chain / hash chain

[User browser]
       ↓
Vite SPA (Fly.io static or Vercel) → Clerk Auth (koKR)
       ↓ JWT (workspace_id claim)
[Fly.io NRT — Hono API] → Supabase RLS
```

### 3.3 Sub-milestones (의존성 기반, 기간 표현 없음)

| # | 내용 | 자산 재사용 | Exit Criteria |
|---|------|------------|--------------|
| **M1.1** | Supabase Tokyo 프로젝트 생성. schema 초안 (`workspaces`, `members`, `api_keys`, `sessions`, `events`). RLS 기본 policy 작성 | 0% | 워크스페이스 1개 dummy insert/select가 RLS 적용 상태로 통과. service_role 키는 서버 한정 명시 |
| **M1.2** | Clerk 셋업 (koKR 로케일, B2B Organizations 활성화). JWT template — `org_id`를 `workspace_id` claim으로 주입. Supabase RLS policy가 Clerk JWT 인식 | 0% | Vite SPA에서 가입 → 조직 생성 → Supabase에 동일 `workspace_id`의 row 자동 생성 |
| **M1.3** | Fly.io NRT 배포. Hono 서버 (TypeScript). `POST /api/webhook` 엔드포인트 + Bearer 인증 미들웨어. `wsk_*` API key 발급·revoke API | 0% | dummy payload + 유효 Bearer → events 테이블 insert. revoked 키는 401 |
| **M1.4** | `bin/awm.mjs`에 `awm auth login --workspace <slug>` + webhook 송신 회로 추가. 키는 OS keychain (`keytar`) 우선, fallback `~/.awm/credentials` 0600 | 80% (CLI 자산) | 로컬 Claude Code hook → CLI → Fly.io → Supabase end-to-end. 본인(jay) 워크스페이스에서 실데이터 1세션 캡처 통과 |
| **M1.5** | 매칭 P1 (`bin/match.mjs`, 250줄)과 영속화 S1~S2.5 (`bin/persist.mjs`, 155줄)를 서버 모듈로 이식. 인터페이스: 로컬 파일 I/O → Postgres I/O 어댑터 | 80% (자산) | 세션 ↔ 커밋 자동 매칭이 서버에서 동작. 매칭 정확도 11/11 critical 유지 |

순서는 *기간*이 아니라 *의존성*. 막히면 그 단계에서 멈추고 PRD §11 Risks 검토.

### 3.4 schema 초안 (M1.1 — 본 Plan 단계에서는 *방향*만)

```sql
-- 핵심 테이블 (정확 컬럼·인덱스는 M1.1에서 확정)
workspaces (id, clerk_org_id, name, plan, created_at)
members    (id, workspace_id, clerk_user_id, role, joined_at)
api_keys   (id, workspace_id, member_id, hash, prefix, created_at, revoked_at, last_used_at)
sessions   (id, workspace_id, tool, started_at, ended_at, intent_summary, ...)
events     (id, workspace_id, session_id, type, payload_jsonb, created_at)
commits    (id, workspace_id, repo, sha, author, ts, ...)
risk_signals (id, workspace_id, event_id, type, severity, ...)

-- RLS 골격 (M1.1)
alter table workspaces enable row level security;
create policy ws_member_read on workspaces for select using (
  (select auth.jwt() ->> 'workspace_id')::uuid = id
);
-- 모든 다른 테이블은 workspace_id 컬럼 필수 + 동일 패턴 RLS
```

> 본 단계 schema는 *외형*만. M2 Audit Layer 시 hash chain 컬럼 추가, M4 결제 시 subscriptions/invoices 추가.

## 4. Exit Criteria (M1 종료 → M2 진입)

PRD §10.1 정의 그대로:
- 워크스페이스 1개에서 *캡처→매칭→저장*이 end-to-end 통과 (수동 dogfooding)
- 추가 검증:
  - Clerk 가입 흐름 한국어 정상 (Cypress 또는 수기 1회)
  - Bearer `wsk_*` 키 발급·revoke 동작 (서버 통합 테스트)
  - workspace_id RLS로 cross-tenant 격리 검증 — 테스트 워크스페이스 2개 만들어서 *조회 격리* 통과
  - vitest 신규 단위 테스트: RLS policy / webhook 미들웨어 / 매칭 서버 측 회귀

## 5. Verification Plan

- **로컬 dogfooding**: 사용자 본인(jay) 워크스페이스 1개로 1주 이상 사용
- **vitest 신규 테스트**:
  - `tests/rls.test.ts` — workspace 격리
  - `tests/webhook-auth.test.ts` — Bearer 미들웨어
  - `tests/match-server.test.ts` — 매칭 회귀 (기존 P1 11/11 critical 유지)
- **npm run build PASS** — tsc + vite build
- **end-to-end 시나리오 1개 수기**: 가입 → 조직 생성 → CLI 연결 → 캡처 → 서버 저장 → SPA에서 조회

## 6. Open Questions

1. **Clerk JWT의 workspace_id claim 주입** — Clerk Organizations metadata + JWT template 사용 가능성. 1인이 셋업하기 쉬운지 검증.
2. **Supabase service_role 사용 범위** — 서버에서만 사용. 클라이언트(SPA)는 anon key + Clerk JWT만. 누설 차단 코드 패턴.
3. **Fly.io cold start** — `min_machines_running = 1` (always-on, 비용 ↑) vs scale-to-zero (cold start latency). dogfooding 단계는 always-on, 결제 시작 전 스케일링 결정.
4. **dev/prod 환경 분리** — Supabase 프로젝트 2개 vs schema 1개에 prefix? Clerk dev/prod instance 2개 필수.
5. **staging 단계 필요?** — 1인 + dogfooding이라 dev → prod 직접 가는 게 합리적일 수도. M4 결제 들어갈 때 재검토.
6. **자산 이식 인터페이스** — 현재 CLI는 `.awm/` 로컬 파일 가정. 서버 측 Postgres로 옮길 때 *동일 추상화 인터페이스*로 두 가지 백엔드 지원 vs *서버 전용 새 모듈*. 후자가 1인에 단순.
7. **Clerk B2B 무제한 멤버 한도 (20명)** — Stage 1·2 (5~30팀, 평균 15명)에서는 한도 안. 50명 팀 들어오는 시점 +$100/mo 트리거.

## 7. Risks (M1 한정, PRD §11과 별도)

| 위험 | 영향 | 완화 |
|------|------|------|
| Clerk JWT ↔ Supabase RLS 통합 학습 곡선 | M1.2 지연 | Clerk·Supabase 공식 가이드 참조, 막히면 1일 timebox 후 fallback (Supabase Auth로 전환) |
| Fly.io NRT cold start | 사용자 첫 체감 부정적 | always-on 1머신 ($5/mo) 우선, 트래픽 측정 후 스케일링 |
| Supabase Tokyo egress 비용 | 청구서 폭증 | spend cap ON, egress 모니터링 |
| 자산 이식이 매끄럽지 않음 | M1.5 지연 | M1.5 시작 전 인터페이스 1차 설계 review (외부 Reviewer 또는 자체 Evaluator) |
| Clerk koKR UI 부분 미번역 | UX 흠집 | 미번역 문자열은 Clerk localization override로 자체 번역 |

## 8. M1 외 (다음 마일스톤 미리보기)

- **M2 — Audit Core**: SHA-256 해시 체인 + PDF/CSV export + Daily Work Memory 첫 화면
- **M3 — Incident Trail**: Incident Replay 실데이터 회로 + Risk Radar 표면
- **M4 — Commercialize**: Explain Back Note + 토스페이먼츠 + 자동 세금계산서 + self-serve onboarding

각 milestone exit criteria는 PRD §10.1 표 참조.

## 9. 작업 순서 (의존성 그래프)

```
M1.1 (DB schema + RLS)
   ↓
M1.2 (Clerk + JWT → workspace_id claim)
   ↓
M1.3 (Fly.io webhook + Bearer)  ←─── 병렬 가능 (M1.2와 독립)
   ↓
M1.4 (CLI 어댑터)               ←─── M1.3 완료 후
   ↓
M1.5 (자산 서버 이식)
   ↓
[M1 Exit Criteria 검증]
   ↓
M2 진입
```

M1.2와 M1.3은 *기술적으로 병렬 가능*하지만 1인 운영이라 *직렬* 권장. 한 번에 한 영역만.

## 10. 변경 이력

| 날짜 | 변경 | 근거 |
|------|------|------|
| 2026-05-10 | 초안 — Stack 5개 결정 + Sub-milestone 5개 + Exit Criteria | PRD v2 §10.1, M1 기술 결정 5개, `.claude/rules/operations-sync.md` |
