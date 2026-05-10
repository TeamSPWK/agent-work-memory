# Supabase 셋업 가이드 (M1.1)

agent-work-memory의 Postgres + RLS 토대. **Supabase Tokyo (ap-northeast-1)** region.
M1 Plan §3.1·§3.4 기준.

## 1. 사용자가 직접 해야 할 일 (외부 작업)

### 1.1 Supabase 계정·프로젝트 생성

1. [supabase.com](https://supabase.com)에 GitHub 또는 이메일로 가입
2. New Project →
   - Name: `agent-work-memory-prod` (또는 dev/prod 분리 시 두 개 생성)
   - Database password: 강력한 비밀번호 (1Password 등에 저장)
   - **Region: Northeast Asia (Tokyo) — `ap-northeast-1`** ⚠️ 다른 region 선택 시 latency 페널티
   - Plan: **Free** (Stage 0 동안. 첫 디자인 파트너 직전 Pro 업그레이드 — 운영 룰 §3 참조)
3. 프로젝트 생성 후 Settings → API에서:
   - `Project URL` → `.env.local`의 `SUPABASE_URL`
   - `anon public` key → `SUPABASE_ANON_KEY`
   - `service_role secret` key → `SUPABASE_SERVICE_ROLE_KEY` (**서버 전용, 절대 클라이언트 노출 X**)

### 1.2 Docker Desktop 설치 (로컬 dev DB용)

`supabase start`는 Docker 필요. macOS는 [Docker Desktop](https://www.docker.com/products/docker-desktop/) 설치.

## 2. CLI 셋업 (코드)

CLI는 `npm install -D supabase`로 이미 추가됨.

```bash
# 1. 로그인 (브라우저 열림)
npx supabase login

# 2. 원격 프로젝트와 link
#    <project-ref>는 Supabase Dashboard URL의 슬러그 (예: zxcvbnmasdfg)
npx supabase link --project-ref <project-ref>

# 3. 로컬 dev DB 시작 (Docker 필요)
npm run db:start
# → Postgres :54322, Studio :54323, API :54321 가동
```

## 3. Migration 적용

### 3.1 로컬 dev DB

```bash
# 마이그레이션 적용 + 타입 생성 자동 (config.toml 설정 시)
npm run db:reset
```

확인:
```bash
# Studio에서 테이블 8개 확인
open http://127.0.0.1:54323
```

### 3.2 원격 prod DB

```bash
# 원격 DB로 push (link된 프로젝트로 전송)
npm run db:push
```

⚠️ prod push 전에 반드시 로컬에서 `db:reset` + 검증.

## 4. 검증

### 4.1 RLS 격리 수기 검증

Supabase Studio SQL Editor에서:

```sql
-- 1) workspace 2개 + member 2명 + 서로 다른 session 생성
insert into workspaces(clerk_org_id, name) values ('org_A', 'WS A'), ('org_B', 'WS B');

-- 2) Studio는 superuser라 전체 보임 (정상). RLS 검증은 클라이언트 SDK 또는
--    JWT를 명시적으로 발급해서 수행 — tests/rls.test.ts (M1.4에서 작성).
```

### 4.2 자동 테스트

`tests/rls.test.ts` (M1.4 단계에서 작성). Clerk JWT mock + 두 워크스페이스로
cross-tenant 격리 확인.

## 5. 운영 주의

1. **Egress 청구서 함정** — Supabase egress $0.09/GB. AI 캡처 이벤트 외부 다운로드 시 폭증. **spend cap 기본 ON 확인** (Settings → Usage → Spend management).
2. **service_role 키 누설 위험** — git에 절대 commit X (`.gitignore` 확인). Fly.io secrets에만.
3. **백업** — Pro plan 7일 PITR. Free는 백업 없음. 결제 시작 직전 Pro 업그레이드.
4. **Dev/Prod 분리** — Clerk·Supabase 모두 dev/prod instance 2개 권장. 같은 키로 양쪽 다루지 않기.

## 6. 다음 단계 (M1.2)

Clerk 셋업. JWT template에서 `org_id` → `workspace_id` claim 매핑. 본 가이드와
Clerk 셋업 가이드(`docs/areas/operations/clerk-setup.md`, M1.2에서 작성)를
함께 따라야 함.

## 갱신 이력

| 날짜 | 변경 |
|------|------|
| 2026-05-10 | 초안 — M1.1 schema·RLS·로컬·원격 가이드 |
