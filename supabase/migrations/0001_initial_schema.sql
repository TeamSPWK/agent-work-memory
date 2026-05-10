-- M1.1 — Initial schema (PRD §10.1, Plan §3.4)
-- 7 core tables for v2.0 MVP. Audit hash chain (M2), subscriptions (M4) 추가는 별도 migration.
-- 모든 도메인 테이블에 workspace_id 컬럼 + cascade delete + 복합 인덱스.

create extension if not exists "pgcrypto";

-- ──────────────────────────────────────────────────────────────────
-- Workspaces (= Clerk Organization)
-- ──────────────────────────────────────────────────────────────────
create table workspaces (
  id uuid primary key default gen_random_uuid(),
  clerk_org_id text unique not null,
  name text not null,
  plan text not null default 'free' check (plan in ('free','starter','team','pro','enterprise')),
  created_at timestamptz not null default now()
);
create index workspaces_clerk_org_idx on workspaces(clerk_org_id);

-- ──────────────────────────────────────────────────────────────────
-- Members (= Clerk User × Organization)
-- ──────────────────────────────────────────────────────────────────
create table members (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  clerk_user_id text not null,
  role text not null default 'member' check (role in ('admin','member')),
  joined_at timestamptz not null default now(),
  unique (workspace_id, clerk_user_id)
);
create index members_workspace_idx on members(workspace_id);
create index members_clerk_user_idx on members(clerk_user_id);

-- ──────────────────────────────────────────────────────────────────
-- API Keys (CLI ↔ 서버 인증, Plan §3.1 Workspace API Key)
-- 평문 키 = `wsk_<workspaceId-prefix>_<random>`. 서버는 hash만 저장.
-- ──────────────────────────────────────────────────────────────────
create table api_keys (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  member_id uuid references members(id) on delete set null,
  prefix text not null,
  hash text not null unique,
  label text,
  created_at timestamptz not null default now(),
  revoked_at timestamptz,
  last_used_at timestamptz
);
create index api_keys_workspace_idx on api_keys(workspace_id);
create index api_keys_active_hash_idx on api_keys(hash) where revoked_at is null;

-- ──────────────────────────────────────────────────────────────────
-- Sessions (AI agent 세션 단위, PRD §5.1 Evidence Graph)
-- ──────────────────────────────────────────────────────────────────
create table sessions (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  member_id uuid references members(id) on delete set null,
  tool text not null check (tool in ('claude_code','codex','cursor','gemini','other')),
  started_at timestamptz not null,
  ended_at timestamptz,
  intent_summary text,
  agent_summary text,
  confidence numeric(3,2) check (confidence between 0 and 1),
  created_at timestamptz not null default now()
);
create index sessions_workspace_started_idx on sessions(workspace_id, started_at desc);
create index sessions_workspace_member_idx on sessions(workspace_id, member_id);

-- ──────────────────────────────────────────────────────────────────
-- Events (Evidence Graph, PRD §5.1)
-- 11개 타입. payload는 jsonb로 자유 — schema는 type별 docs/DATA_CONTRACT.md.
-- ──────────────────────────────────────────────────────────────────
create table events (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  session_id uuid references sessions(id) on delete cascade,
  type text not null check (type in (
    'user.prompt','agent.response','command.run','file.changed',
    'commit.created','branch.changed','pr.opened',
    'db.event','deploy.event','risk.signal','human.note'
  )),
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index events_workspace_session_idx on events(workspace_id, session_id, created_at);
create index events_workspace_type_idx on events(workspace_id, type, created_at desc);
create index events_payload_gin on events using gin(payload);

-- ──────────────────────────────────────────────────────────────────
-- Commits (GitHub evidence)
-- ──────────────────────────────────────────────────────────────────
create table commits (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  repo text not null,
  sha text not null,
  branch text,
  author text,
  ts timestamptz not null,
  message text,
  files_changed jsonb default '[]'::jsonb,
  diff_summary text,
  created_at timestamptz not null default now(),
  unique (workspace_id, repo, sha)
);
create index commits_workspace_ts_idx on commits(workspace_id, ts desc);
create index commits_workspace_repo_idx on commits(workspace_id, repo, ts desc);

-- ──────────────────────────────────────────────────────────────────
-- Risk Signals (PRD §5.5 Audit Layer 토대)
-- ──────────────────────────────────────────────────────────────────
create table risk_signals (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  source_event_id uuid references events(id) on delete cascade,
  source_session_id uuid references sessions(id) on delete cascade,
  type text not null,
  severity text not null check (severity in ('low','medium','high')),
  evidence jsonb default '{}'::jsonb,
  explanation text,
  status text not null default 'open' check (status in ('open','acknowledged','resolved')),
  created_at timestamptz not null default now()
);
create index risk_workspace_severity_idx on risk_signals(workspace_id, severity, created_at desc);

-- ──────────────────────────────────────────────────────────────────
-- Session ↔ Commit Links (P1 매칭 결과, 자산 재사용 §6.2 #2)
-- ──────────────────────────────────────────────────────────────────
create table session_commit_links (
  session_id uuid not null references sessions(id) on delete cascade,
  commit_id uuid not null references commits(id) on delete cascade,
  workspace_id uuid not null references workspaces(id) on delete cascade,
  score numeric(4,3) not null check (score between 0 and 1),
  axes jsonb not null default '{}'::jsonb,
  confirmed boolean not null default false,
  created_at timestamptz not null default now(),
  primary key (session_id, commit_id)
);
create index links_workspace_idx on session_commit_links(workspace_id);
create index links_score_idx on session_commit_links(workspace_id, score desc);

-- ──────────────────────────────────────────────────────────────────
-- Schema 버전 추적 (정합성 검증 스크립트가 참조)
-- ──────────────────────────────────────────────────────────────────
create table schema_versions (
  version text primary key,
  applied_at timestamptz not null default now(),
  description text
);
insert into schema_versions(version, description)
values ('0001_initial', 'M1.1 — 7 core tables + RLS foundation');
