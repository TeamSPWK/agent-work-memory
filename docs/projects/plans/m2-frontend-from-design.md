# M2 — 디자인 → 코드 이식 + Stack 결정

> v0.1 디자인 시안 23화면(`docs/projects/plans/p0-design-v0/`)을 production 코드로 옮기는 단계.
> CPS 구조. exit criteria 명시. 임의 기간 milestone 금지.

## Context

- **2026-05-10 ~ 05-11**: v1 archive(legacy-v1 브랜치) → claude.ai/design v0(H1·H2·H3 16화면) → v0.1(H4 + Workspace + Settings + Risk Radar fill = 23화면) lock.
- **결정 자문 (2026-05-11, `docs/verifications/2026-05-11-...md`)**: Claude/GPT/Gemini 합의 75% — **(B) Vite+React + Supabase Tokyo + Supabase Auth + Vercel + 토스페이먼츠** 채택. 2/3 AI 추천 + 1인 운영 sustainability 우선.
- v0.1 데이터: React 18 UMD + Babel standalone 프로토타입. 빌드 없음. *production stack 별개*.

## Problem

23화면 시각 시안을 production 코드로 옮기되, 다음을 동시에 만족해야 한다:

| 차원 | 요구 |
|---|---|
| **시각 정합성** | 픽셀 단위로 v0.1과 일치. 새 색·폰트 추가 금지 |
| **데이터 격리** | 워크스페이스간 RLS — Postgres row-level security |
| **변조 불가 audit** | SHA-256 hash chain (체인 무결성 검증 화면 — H2.3) |
| **한국 latency** | DB Tokyo(ap-northeast-1), Hosting Vercel Tokyo edge |
| **PDF export 한글** | Server-side 생성 (Supabase Edge Function + Pretendard inline) |
| **결제 + 세금계산서** | 토스페이먼츠 + PopBill (한국 B2B 필수) |
| **1인 운영** | managed services 우선, self-host 회피 |
| **결제 트리거 funnel** | H4 → H1 → H2 결제까지 단일 흐름 가설 검증 가능 |

## Solution

### Stack (확정)

```
Frontend
  Vite 8 + React 18 + TypeScript 5.x (strict)
  React Router v6 (file-based 아님 — 명시적 라우트)
  TanStack Query v5 (서버 상태)
  Zustand (클라이언트 상태 — 페르소나·다크모드·워크스페이스 컨텍스트)
  Vitest + Playwright (테스트)

Backend
  Supabase (Tokyo · ap-northeast-1)
    - Postgres (RLS · pg_audit · 트리거 기반 hash chain)
    - Edge Functions (Deno) — PDF 생성, GitHub webhook 수신, 토스 콜백
    - Storage — PDF export 파일, 임시 첨부
    - Auth — 이메일/Google OAuth, 한국어 이메일 템플릿
    - Realtime — 미사용 (m2에서)

Hosting
  Vercel (Hobby 또는 Pro)
  - 정적 SPA 빌드 only (SSR 미사용)
  - 도쿄 PoP

결제
  토스페이먼츠 — 결제 위젯
  PopBill — 자동 세금계산서 (e세금계산서 발행 API)

CI/CD
  GitHub Actions — typecheck + test + Vercel preview deploy
```

### 안 채택한 옵션 + 사유

| 옵션 | 사유 |
|---|---|
| Next.js 15 + Clerk | Clerk MAU 비용 폭증 (1.5k MAU 시 $30+/mo) + vendor lock-in. SSR 가치 작음(감사·SaaS 화면 → SEO 불필요) |
| SvelteKit | React 23화면 시안을 Svelte로 재작성 비용 + 생태계 협소 → 1인 운영 시 디버깅 비용 |
| Vercel Postgres + Auth.js | RLS / audit 트리거 직접 구현 부담. Supabase가 한 번에 해결 |
| Cloudflare D1+Workers+R2 | 별도 자문 단계 필요 — 본 결정엔 미포함. m2 운영 후 비용 발생 시 재검토 |

### v0.1 → 코드 이식 매핑

| v0.1 자산 | m2 이식 |
|---|---|
| `src/h*-*.jsx` 23화면 컴포넌트 | `src/screens/*/index.tsx` — Functional Component + TS strict. 60~70% 재사용. JSX → TSX 변환 + props 타입 정의 |
| `src/v01-*.jsx` Workspace·Settings | `src/screens/workspace/*`, `src/screens/settings/*` |
| `src/shell.jsx` Sidebar·Topbar·HypothesisBanner | `src/layout/*` |
| `src/icons.jsx` 40+ SVG | `src/components/Icon.tsx` — 그대로 변환 |
| `src/data.jsx` mock 데이터 | `src/lib/seed/*.ts` — 초기 디자인 파트너 워크스페이스 시드 + dev mock fixture |
| `tokens.css` Wanted LaaS | `src/styles/tokens.css` — **변경 없이** 그대로 import |
| `styles.css` 596줄 | `src/styles/global.css` — 그대로 import. 향후 컴포넌트 모듈화는 m3+로 미룸 |
| `fonts/*.subset.woff2` | `public/fonts/*.subset.woff2` — 그대로 |

**3AI 합의 (GPT/Gemini)**: "스타일 이식 + 앱 구조 재작성". 컴포넌트 shape·토큰·SVG는 직접 변환하고, 라우팅·상태·데이터 fetch는 처음부터 작성.

### 데이터 모델 핵심 (Supabase)

```
workspaces
  id (uuid pk), name, segment, size_bucket, plan, created_at, owner_uid
  RLS: members of workspace can SELECT

memberships
  workspace_id (fk), user_id (fk), role enum('Operator','Reviewer','Admin'),
  active, last_active_at
  RLS: same workspace members can SELECT

sessions
  id, workspace_id, tool, actor_uid, repo, intent, started_at,
  files_count, cmds_count, risk_sev, risk_cat, state, explained
  RLS: workspace members SELECT/INSERT/UPDATE

audit_events
  id, workspace_id, session_id, type, summary, risk_sev, risk_cat,
  at, hash, prev_hash, broken
  RLS: 동일. 트리거: INSERT 시 hash = SHA-256(prev_hash || row_json)
  immutable: UPDATE/DELETE 차단 정책

incidents
  id, workspace_id, title, started_at, detected_at, resolved_at
  events[], buckets{likely[], verified[], unknown[]}, notes[]

compliance_state
  workspace_id, principle, state, note, updated_at  (7대 원칙)

exports (PDF)
  id, workspace_id, form, range_start, range_end, pages,
  storage_path, sha256, status, requested_by, requested_at

notification_rules
  workspace_id, event, channels jsonb, silent_window jsonb
```

### Edge Functions (Deno)

| 함수 | 역할 |
|---|---|
| `pdf-export` | Pretendard inline + 7대 원칙 양식 PDF 생성. SHA-256 첨부. Storage에 저장 |
| `github-webhook` | GitHub App push/PR 이벤트 → sessions 매칭 |
| `tosspay-callback` | 토스 결제 완료 webhook → memberships.plan 업데이트 + PopBill 세금계산서 발행 호출 |
| `hash-chain-verify` | 워크스페이스의 audit_events 전체 hash chain 재계산 → 깨진 행 반환 |

### 1년 운영비 (실측 기준 추정)

| 항목 | 가정 | KRW |
|---|---|---|
| Vercel | Hobby (5팀 시점) → Pro (50팀 시점) | 0 ~ 330k |
| Supabase | Pro $25/mo (Tokyo) | 414k |
| Storage | 50팀 × 100MB/mo × 12 = 60GB | 8k |
| Edge Functions | 500만 호출/년 | 0 (Pro 포함) |
| 토스페이먼츠 | 2.9% 결제 수수료 | 매출 연동 |
| PopBill | 건당 ₩200, 월 50건 → 600건/년 | 120k |
| Pretendard 폰트 | OFL 무료 | 0 |
| 도메인 | .com or .co.kr | 20k |
| 총 (수수료 제외) | | **약 562~892k** (1년) |

3AI 합의 (GPT·Gemini): 70~180만원 추정과 일치. 예산 cap 600만원 대비 충분 여유.

### v2.x로 이연한 항목 (m2 미포함)

| 항목 | 사유 |
|---|---|
| **TSA / 외부 anchoring** (audit immutability 강화) | PRD §11 위험표에 *v2.x WORM으로 미룸* 이미 명시. m2는 단일 SHA-256 chain만 |
| **Enterprise SSO** (SAML·SCIM) | SMB 타겟 외. 1차 디자인 파트너 5팀이 요구 시 별도 자문 |
| **Cloudflare 대안 stack** | 운영 비용 600만/년 초과 시 재검토 |
| **개인정보·감사 보존 정책 문서** | `docs/areas/regulatory/data-retention.md` 별도 작업 (m2 외) |
| **자가 dogfooding 화면** (PRD §6.6) | Spacewalk 내부 워크스페이스 데이터 누적 후 별도 라운드 |
| **§7.5 50% 할인 / §7.6 Active Op 분쟁** (PRD v2.1 Warnings) | v0.2 디자인 라운드로 결정 후 m2.x로 합류 |

## Exit Criteria

m2 완료 = 다음 모두 PASS:

| # | 기준 | 측정 |
|---|---|---|
| 1 | v0.1 23화면 모두 production 코드로 이식 | 사용자가 시각적으로 v0.1과 차이 없음을 직접 확인 (페이지마다 1회) |
| 2 | 워크스페이스 격리 (RLS) | 2개 워크스페이스 만들어 한 쪽 데이터가 다른 쪽에서 안 보임을 확인 |
| 3 | Audit hash chain | 1만 건 이벤트 삽입 후 `hash-chain-verify` 호출 → "PASS, 깨진 행 0" |
| 4 | PDF export | H2.4에서 "지금 export" 클릭 → Edge Function에서 한글 깨짐 없는 PDF 생성 + Storage 저장 + SHA-256 첨부 |
| 5 | 토스 결제 완료 → 자동 세금계산서 | 실 결제 ₩100 테스트 → PopBill 세금계산서 발행 완료 + 이메일 수신 |
| 6 | GitHub App webhook | repo push 시 sessions 자동 생성 (v1 P1 매칭 알고리즘 재구현) |
| 7 | H4 온보딩 5분 가설 | "처음 사용자가 워크스페이스 생성 → 첫 세션 import → Today 표시까지" 시간 측정 → 5분 이하 |
| 8 | 1인 운영 cost | 1개월 운영 비용 측정 → 월 평균 70만원 이하 (1년 환산 < 850만원, 예산 cap 미만) |

## 작업 순서 (의존성 기반, exit criteria 충족까지)

각 단계는 *exit criteria* 일부를 충족하는 단위. 임의 기간 milestone 없음.

```
S1. 프로젝트 부트스트랩
    Vite + React + TS 스캐폴드, Supabase 프로젝트(Tokyo), 도메인,
    Vercel 연결, GitHub Actions(typecheck+test), 토큰·스타일·폰트 import.
    → Exit: localhost에서 빈 페이지 + Wanted LaaS 토큰 적용 확인

S2. 디자인 시안 → 정적 화면 이식 (모든 23화면, mock 데이터)
    v0.1 src/data.jsx → src/lib/seed/*.ts. 라우터·페르소나·다크 토글 동작.
    백엔드 미연결 — 모두 mock.
    → Exit: criteria #1 충족 (시각 검증)

S3. Supabase 스키마 + RLS
    workspaces / memberships / sessions / audit_events / incidents /
    compliance_state / exports / notification_rules. 마이그레이션 파일로.
    → Exit: criteria #2 충족 (RLS 격리)

S4. Audit hash chain 트리거
    audit_events INSERT 트리거에서 SHA-256(prev_hash || row_json) 계산.
    UPDATE/DELETE 차단 정책. hash-chain-verify Edge Function.
    → Exit: criteria #3 충족

S5. 화면 ↔ Supabase 연결
    TanStack Query로 mock → 실제 데이터. workspace 컨텍스트 RLS 통과.
    → Exit: 모든 23화면이 실제 데이터로 동작

S6. PDF export (Edge Function)
    Pretendard inline 임베드. 7대 원칙 양식. SHA-256 첨부.
    Storage 저장. H2.4 화면 연결.
    → Exit: criteria #4 충족

S7. GitHub App webhook + 세션 매칭
    v1 legacy-v1:bin/match.mjs P1 알고리즘(4축 가중) Deno 포팅.
    → Exit: criteria #6 충족

S8. 토스페이먼츠 결제 + PopBill 세금계산서
    H2.5 Plan & Billing 결제 위젯. 결제 콜백 → 플랜 변경 + PopBill 발행.
    → Exit: criteria #5 충족

S9. H4 온보딩 자동화 측정
    실 사용자 1명 워크스페이스 생성 → AI 도구 connect → 첫 세션 import →
    Today 행 표시까지 시간 측정.
    → Exit: criteria #7 충족

S10. 1개월 운영 비용 측정
    Vercel·Supabase·토스·PopBill 청구서 누적.
    → Exit: criteria #8 충족

S11. /nova:check 전체 — 8 criteria PASS 확인 후 m2 완료
```

## 위험 + 대응

| 위험 | 가능성 | 영향 | 대응 |
|---|---|---|---|
| Supabase Edge Function 한글 PDF 깨짐 | 중 | 높음 (H2 결제 트리거 직격) | S6 초반에 Pretendard inline 임베드 검증. 실패 시 별도 region Lambda(도쿄) 옵션 검토 |
| Toss + PopBill 통합이 m2 범위 초과 | 중 | 높음 (criteria #5 차단) | S8을 m2.1로 분리할 수 있게 인터페이스만 m2에서 정의 |
| v1 P1 매칭 알고리즘 Deno 포팅 정확도 저하 | 낮 | 중 | legacy-v1 bin/match.mjs 11/11 critical 테스트를 Deno로 그대로 옮김 |
| Clerk 안 써서 SSO 약함 — 디자인 파트너 요구 시 | 중 | 중 | 1차 5팀 인터뷰 결과 보고 v2.x로 결정. m2 미포함 |
| RLS 정책 오류로 워크스페이스간 누출 | 낮 | **치명** | criteria #2 + 별도 RLS 단위 테스트 강제 |
| Pretendard 폰트 라이선스 변경 | 매우 낮 | 중 | OFL 영구. 변경되어도 m2 시점 commit 안전 |

## 참고

- v0.1 디자인: [`p0-design-v0/`](./p0-design-v0/)
- 자문 결과: [`../../verifications/2026-05-11-...md`](../../verifications/2026-05-11-agent-work-memory-AI-Audit-Trail-SaaS-한.md)
- PRD: [`../../PRD.md`](../../PRD.md)
- v1 자산 (회수용): `legacy-v1` 브랜치, `legacy-v1-2026-05-10` tag
- 운영 룰: [`.claude/rules/prd-and-strategy-collaboration.md`](../../../.claude/rules/prd-and-strategy-collaboration.md), [`operations-sync.md`](../../../.claude/rules/operations-sync.md)

## 결정 기록

- 2026-05-11 — (B) Vite+Supabase 채택 (사용자, 3AI 자문 후). Clerk 회피.
- 2026-05-11 — Server-side PDF (Supabase Edge Function + Pretendard inline) m2 범위 내 결정.
- 2026-05-11 — PopBill 세금계산서 m2 범위 내 결정. 토스 콜백 → PopBill 발행 자동화 (S8).
- 2026-05-11 — TSA / 외부 anchoring v2.x로 이연. PRD §11 위험표와 정합.
- 2026-05-11 — 보존 정책 문서화 m2 외 별도 작업으로 분리.
- 2026-05-11 — Cloudflare 옵션은 운영 비용 초과 시 재검토. m2에서 결정 안 함.
