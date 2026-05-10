-- M1.1 — Row Level Security policies (Plan §3.1, §3.4)
-- 모든 도메인 테이블에 workspace_id 기반 격리.
-- service_role 키는 RLS 우회 — 서버 측 webhook·매칭에서만 사용. 클라이언트(SPA)는 anon + Clerk JWT.

-- ──────────────────────────────────────────────────────────────────
-- JWT 헬퍼 — Clerk JWT의 workspace_id claim 추출
-- Clerk JWT template에서 `org_id` → `workspace_id` claim 매핑
-- (M1.2에서 Clerk 셋업 시 JWT template 작성)
-- ──────────────────────────────────────────────────────────────────
create or replace function auth.workspace_id() returns uuid
language sql stable
as $$
  select nullif(((select auth.jwt()) ->> 'workspace_id'), '')::uuid
$$;

create or replace function auth.clerk_user_id() returns text
language sql stable
as $$
  select (select auth.jwt()) ->> 'sub'
$$;

-- ──────────────────────────────────────────────────────────────────
-- Enable RLS on all domain tables
-- ──────────────────────────────────────────────────────────────────
alter table workspaces enable row level security;
alter table members enable row level security;
alter table api_keys enable row level security;
alter table sessions enable row level security;
alter table events enable row level security;
alter table commits enable row level security;
alter table risk_signals enable row level security;
alter table session_commit_links enable row level security;

-- ──────────────────────────────────────────────────────────────────
-- Workspaces: 멤버는 자기 워크스페이스만 SELECT. INSERT/UPDATE/DELETE는
-- service_role(서버)이 Clerk webhook 처리 시.
-- ──────────────────────────────────────────────────────────────────
create policy ws_member_read on workspaces for select
  using (id = (select auth.workspace_id()));

-- ──────────────────────────────────────────────────────────────────
-- Members: 같은 워크스페이스 멤버끼리 서로 SELECT.
-- INSERT/UPDATE/DELETE는 service_role.
-- ──────────────────────────────────────────────────────────────────
create policy member_read on members for select
  using (workspace_id = (select auth.workspace_id()));

-- ──────────────────────────────────────────────────────────────────
-- API Keys: 워크스페이스 멤버는 SELECT. INSERT/REVOKE는 admin만.
-- 단 hash 컬럼은 어차피 평문 X (서버에서만 비교).
-- ──────────────────────────────────────────────────────────────────
create policy apikey_read on api_keys for select
  using (workspace_id = (select auth.workspace_id()));

create policy apikey_admin_write on api_keys for all
  using (
    workspace_id = (select auth.workspace_id())
    and exists (
      select 1 from members m
      where m.workspace_id = api_keys.workspace_id
        and m.clerk_user_id = (select auth.clerk_user_id())
        and m.role = 'admin'
    )
  )
  with check (
    workspace_id = (select auth.workspace_id())
    and exists (
      select 1 from members m
      where m.workspace_id = api_keys.workspace_id
        and m.clerk_user_id = (select auth.clerk_user_id())
        and m.role = 'admin'
    )
  );

-- ──────────────────────────────────────────────────────────────────
-- Sessions / Events / Commits / Risk Signals / Links: workspace 격리 (all ops)
-- ──────────────────────────────────────────────────────────────────
create policy sessions_isolation on sessions for all
  using (workspace_id = (select auth.workspace_id()))
  with check (workspace_id = (select auth.workspace_id()));

create policy events_isolation on events for all
  using (workspace_id = (select auth.workspace_id()))
  with check (workspace_id = (select auth.workspace_id()));

create policy commits_isolation on commits for all
  using (workspace_id = (select auth.workspace_id()))
  with check (workspace_id = (select auth.workspace_id()));

create policy risk_isolation on risk_signals for all
  using (workspace_id = (select auth.workspace_id()))
  with check (workspace_id = (select auth.workspace_id()));

create policy links_isolation on session_commit_links for all
  using (workspace_id = (select auth.workspace_id()))
  with check (workspace_id = (select auth.workspace_id()));

-- ──────────────────────────────────────────────────────────────────
-- 주의 (운영 룰)
-- 1. service_role 키는 절대 클라이언트(브라우저·CLI)에 노출 X. 서버 환경변수만.
-- 2. RLS policy 변경 시 반드시 cross-tenant 격리 테스트 (tests/rls.test.ts).
-- 3. SQL Editor에서 정책 테스트하면 superuser로 통과해 보이는 함정 — 반드시 클라이언트 SDK + 다른 JWT로 검증.
-- 4. 정책에서 auth.* 함수 호출은 (select ...)로 감싸 init plan 캐싱 활용 (Supabase 공식 권장).
-- ──────────────────────────────────────────────────────────────────

insert into schema_versions(version, description)
values ('0002_rls_policies', 'M1.1 — RLS policies for all 8 domain tables + Clerk JWT helpers');
