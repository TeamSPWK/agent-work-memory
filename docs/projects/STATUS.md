# Agent Work Memory — 프로젝트 현황판

> **현재 위치**: Phase 1 · m2 · Sprint S2.8 완료 → **H4 5/5 사이클 닫힘**. S2.9 Workspace 진입 예정
> **최신 커밋**: `8b1d679` (2026-05-12, S2.7.c), S2.8 미커밋
> **갱신**: 2026-05-12

본 문서는 *프로젝트 전체 진행 상황*을 한 눈에 보기 위함이다. 세션 컨텍스트는
`NOVA-STATE.md`, 상세 Plan은 `docs/projects/plans/*.md`.

---

## Phase 구조

| # | Phase | 상태 | Exit Criteria | 비고 |
|---|-------|------|---------------|------|
| 0 | **Design** — Claude.ai 시안 lock | ✅ DONE | v0.1(inside-app 23) + v0.2(외부 14) lock | `p0-design-v0/`, `p0-design-v0.2/` |
| 1 | **m2 Build** — inside-app(Vite+Supabase+토스) | 🚧 진행 중 | Plan §8 exit criteria 8건 모두 PASS | `m2-frontend-from-design.md` |
| 2 | **m2.5 Build** — 외부 페이지(소개·로그인·결제·법무) | ⏸ 대기 | Plan §exit criteria 8건 PASS | `m2.5-public-pages-from-design.md`. m2 S2 완료 후 진입 |
| 3 | **Launch & Iterate** — 디자인 파트너 5팀 · 운영 | ⏸ 대기 | PRD §11 retention 70%+ | M2 Plan + dogfooding |

> **제품 소개·로그인은 후순위 맞습니다.** 다만 m2 S5(Supabase 연결) 시점엔
> *기능*으로서의 Auth는 들어가야 함. 외부 페이지로서의 *디자인*은 m2.5에서.

---

## Phase 1 · m2 Sprint 현황

| Sprint | 목표 | 상태 | 커밋 | Exit | 비고 |
|--------|------|------|------|------|------|
| S1 | 부트스트랩 (Vite+TS+CI) | ✅ DONE | `f6a6784` | localhost 토큰 적용 | — |
| S1.1 | 외부 서비스 (Supabase Tokyo · Vercel · 도메인) | ⏸ 대기 | — | — | 사용자 외부 계정 단계 |
| **S2** | **시안 → 정적 화면 28화면 + onboarding 5** | 🚧 진행 중 (20/28+1 · H1 6/6 · H2 4/5 · H3 5/5 · H4 5/5) | — | criteria #1 v0.1 정합 | 아래 매트릭스 |
| S3 | Supabase 스키마 + RLS | ⏸ 대기 | — | criteria #2 RLS 격리 | — |
| S4 | Audit hash chain 트리거 | ⏸ 대기 | — | criteria #3 hash chain | — |
| S5 | 화면↔Supabase 연결 (TanStack Query) | ⏸ 대기 | — | 28화면 실 데이터 | **Auth 들어옴** |
| S6 | PDF export (Edge Function + Pretendard) | ⏸ 대기 | — | criteria #4 PDF 한글 | — |
| S7 | GitHub App webhook + 세션 매칭 | ⏸ 대기 | — | criteria #6 webhook | legacy-v1 P1 포팅 |
| S8 | 토스페이먼츠 + PopBill | ⏸ 대기 | — | criteria #5 결제+세금계산서 | — |
| S9 | H4 온보딩 5분 측정 | ⏸ 대기 | — | criteria #7 5분 이하 | — |
| S10 | 1개월 운영비 측정 | ⏸ 대기 | — | criteria #8 월 70만원 이하 | — |
| S11 | /nova:check 전체 | ⏸ 대기 | — | 8 criteria 모두 PASS | m2 완료 |

---

## S2 화면 매트릭스 (inside-app 28화면 + onboarding 5)

| 그룹 | 화면 | 라우트 | 상태 | Sprint |
|------|------|--------|------|--------|
| H1 회상 사이클 | Today | `/today` | ✅ | S2.2 (`a2dd03f`) |
| H1 | Sessions 목록 | `/sessions` | ✅ | S2.3 (`c142f6a`) |
| H1 | Session Detail | `/sessions/:id` | ✅ | S2.4 (`6fd1e01`) |
| H1 | Explain Back | `/sessions/:id/explain` | ✅ | S2.5.a (`3e97141`) |
| H1 | 팀 공유 요약 | `/sessions/:id/share` | ✅ | S2.5.b (`74905a1`) |
| H1 | 셀프 회상 (어제) | `/sessions/yesterday` | ✅ | S2.5.c (`2e6d594`) |
| H2 결제 트리거 | Audit Trail | `/audit` (탭) | ✅ | S2.6 (`261d2c9`) |
| H2 | 7대 원칙 패널 | `/audit?tab=principles` | ✅ | S2.6 (`261d2c9`) |
| H2 | 체인 무결성 | `/audit?tab=integrity` | ✅ | S2.6 (`261d2c9`) |
| H2 | PDF export 미리보기 | `/audit?tab=pdf` | ✅ | S2.6 (`261d2c9`) |
| H2 | Plan & Billing | `/settings?tab=billing` | ⏸ | S2.10 (settings 그룹 이연) |
| H3 10분 원인 도출 | Risk Radar | `/risk` | ✅ | S2.7.a (`b4d93fb`) |
| H3 | Incident Replay | `/incidents/:id?tab=replay` | ✅ | S2.7.b (`7203869`) |
| H3 | Event Detail · 3분리 | `/incidents/:id?tab=event` | ✅ | S2.7.c (`8b1d679`) |
| H3 | Reviewer Brief 연결 | `/incidents/:id?tab=reviewer` | ✅ | S2.7.c (`8b1d679`) |
| H3 | Incident Note | `/incidents/:id?tab=note` | ✅ | S2.7.b (`7203869`) |
| H4 온보딩 | 워크스페이스 생성 | `/onboarding/ws` | ✅ | S2.8 (미커밋) |
| H4 | AI 도구 connect | `/onboarding/connect` | ✅ | S2.8 (미커밋) |
| H4 | 첫 세션 import | `/onboarding/import` | ✅ | S2.8 (미커밋) |
| H4 | Reviewer 지정 | `/onboarding/reviewer` | ✅ | S2.8 (미커밋) |
| H4 | 완료 → Today | `/onboarding/done` | ✅ | S2.8 (미커밋) |
| ws | Members | `/workspace?tab=members` | ⏸ | S2.9 |
| ws | Member 초대 | `/workspace?tab=invite` | ⏸ | S2.9 |
| ws | Roles & Risk 룰 | `/workspace?tab=roles` | ⏸ | S2.9 |
| settings | Profile & Account | `/settings?tab=profile` | ⏸ | S2.10 |
| settings | Integrations | `/settings?tab=integrations` | ⏸ | S2.10 |
| settings | Notifications | `/settings?tab=notif` | ⏸ | S2.10 |
| settings | Audit Export | `/settings?tab=export` | ⏸ | S2.10 |

**완료 20/28 + 어제 회상 라우트** (H1 6/6 · H2 4/5 · H3 5/5 · H4 5/5).
**남은 8화면 (ws 3 + settings 4 + Billing)**.

---

## Phase 2 · m2.5 외부 페이지 (대기)

PRD §12에 명시. 14화면 영역. 디자인은 v0.2(lock). 코드 이식은 m2 S2 완료 후 진입.

- 제품 소개 (랜딩) · 로그인/회원가입 · 결제 · 법무(개인정보·이용약관 외 4종) ·
  404 · 메일 템플릿 등.
- 별도 Plan: `m2.5-public-pages-from-design.md` S1~S9.
- 법무 4종 실제 문구 자문은 별도 Track(법무 트래커).

---

## 프로토타입 흔적 — 카탈로그 + 처리 시점

현재 코드에 남은 *시연용/mock* 요소들. 별도 Sprint 만들지 않고 *자연 통합*으로 처리.

| # | 흔적 | 처리 시점 | 비고 |
|---|------|----------|------|
| 1 | 로고 sub-text "m2 prototype" | S11 직전 | "Beta" 또는 제거 |
| 2 | page-h eyebrow ("진입 시점 · …") | S2 화면 채움 마무리 | 시연 안내 — 제거 OR 더 짧게 |
| 3 | Topbar "시연용 페르소나" 라벨 + 토글 | S5 Auth 연결 시 | 제품에선 *현재 사용자 역할* 자동 표시. 토글 dev-only. |
| 4 | Today 날짜 하드코딩 "5월 10일" | S2.2 추가 갱신 또는 S5 | `new Date()`로 |
| 5 | Today 팀 공유 카드 동적 수치 vs v0.1 정적 차이 | S5 실 데이터 연결 시 자동 해소 | 데이터 정확 |
| 6 | "필터"·"오늘" dead-button (Sessions actions) | S2.3 보강 또는 S5 | 클릭 동작 추가 또는 제거 |
| 7 | "초안 다시 생성" dead-button (ExplainBack) | S2.5.a 보강 또는 S5 | AI 보조 연결 시 |
| 8 | "이 commit 확정" dead-button (SessionDetail) | S5 GitHub webhook 연결 후 | 실 동작 연결 |
| 9 | SESSION_DETAIL/ExplainBack 초기값 s-024 고정 | S5 실 데이터 연결 시 자동 해소 | 현재는 mock 한계 배지로 정직성 처리 |
| 10 | Workspace 셀렉터 mock 이름 ("B2B SaaS · 28명") | S5 실 워크스페이스 연결 시 | seed 단계 |
| 11 | 페르소나·다크 토글의 Zustand 상태 | S5+ 영구 저장 필요 시 localStorage | 현재 메모리 only |

**원칙**: *흔적 자체*는 디자인 시연을 위한 안내. *제품 출시* 시점에 의미가 자연 사라짐. 화면 채움 → 데이터 연결 → 톤 전환 순서로 자연 해소.

---

## 보류 결정 (다음 sprint 진입 전 확정 권고)

| # | 결정 사항 | 권고 | 결정 시점 |
|---|----------|------|----------|
| 1 | ~~`/sessions/:id/share` 라우트 패턴~~ | ✅ 적용됨: nested 형제 (S2.5.b) | done |
| 2 | ~~SelfRecall 라우트~~ | ✅ 적용됨: `/sessions/yesterday` (S2.5.c) | done |
| 2b | SelfRecall 진입 경로(발견성) — 사이드바·Today·Sessions 어디서 link? | Today 또는 Sessions에 "어제 회상" link 1개 추가 | S2.6 또는 별도 (미해결) |
| 3 | ~~`/incidents/:id` breadcrumb이 Risk 하위 vs Audit 하위~~ | ✅ 적용됨: Risk Radar 사고 alert cta + DB inline detail link 둘 다 `/incidents/INC-26-014` (Risk 하위) | done (S2.7.a) |
| 4 | 외부 페이지 진입 — m2 S5 (Auth 들어올 때) | m2 S5에서 *최소 Auth UI*만, *외부 디자인*은 m2.5 | S5 진입 |
| 5 | 디자인 파트너 시연 시점 — m2 S2 완료 후 vs S5 완료 후 | S5 완료 후 (실 데이터 + Auth) | S2 완료 시 사용자 결정 |
| 6 | ~~Risk Radar 시그널 표의 9 session id cross-link 정합~~ | ✅ 결정: 현 fallback 그대로 유지, PROTOTYPE_MARKS #12로 등록 → S5 실 데이터 자동 해소 | done (S2.7.b 진입 시) |
| 7 | Risk Radar `?cat=` 쿼리 동기화 (딥링크) | Audit `?tab=`과 동일 패턴 적용 가능 | S2.7.c 또는 별도 |

---

## Dev-Track — 개발용 대시보드 (m2 본 트랙과 분리)

| Sprint | 목표 | 상태 | 비고 |
|--------|------|------|------|
| DT.1 | `/dev/status` 라우트 + StatusBoard 컴포넌트 | ✅ DONE (`953987a`) | H1 S2.5 완료 직후 진입·완성. `/dev/status` 북마크 전용(사이드바 NavLink 없음) |
| DT.1.1 | NextAction 카드 + 그룹별 진행률 바 | ✅ DONE (`cb84e08`) | UX 트렌드 비판 후 surgical 보강 |
| DT.1.2 | 토스 스타일 전면 재설계 | ✅ DONE (`84132ba`) | 큰 숫자 + 그룹 mini bars + Phase 가로 stepper + 매트릭스 details collapse. 한 화면 1 task 원칙 |

**결정 사항**
- SSOT: TS 데이터 파일 (`src/lib/dev/projectStatus.ts`). 본 STATUS.md는 사람 친화적 표현(수동 동기화).
- **Sprint 마무리 체크리스트** (운영 룰 §1 sync 보강):
  1. NOVA-STATE.md 갱신
  2. `projectStatus.ts` 갱신 (sprint·screen·decision 상태)
  3. `STATUS.md` 갱신 (위 1·2와 일치)
  4. 커밋 메시지에 위 3개 모두 포함되었는지 확인
- 라우트: `/dev/status` — production 사이드바 외부 (dev-only).
- 디자인: Pretendard·tokens 재사용. Phase 진행 바 + Sprint 카드 그리드 + 화면 매트릭스 + 보류 결정 + 프로토타입 흔적 카탈로그.
- 외부 도구 회피 (운영 룰 §7 정합).

## 다음 진입

**S2.9 — Workspace 3탭** — 운영 관리.
- `/workspace?tab={members,invite,roles}` 3 탭 (Audit `?tab=` 패턴 답습)
- 풀 시드: WS_MEMBERS 6명 + KPI(active·reviewers·admins·avgReviewMin) + RISK_ROLE_MATRIX 8 카테고리
- Onboarding S2.8에서 도입한 MEMBERS_SHORT 5와 cross-id 정합 검증

**그 다음**: S2.10 Settings + Billing 합류 → m2 S2 완료 → S3+ backend.

---

## 참조

- 헌법: `CLAUDE.md`
- 세션 컨텍스트: `NOVA-STATE.md`
- 운영 룰: `.claude/rules/operations-sync.md`, `prd-and-strategy-collaboration.md`
- m2 Plan: `docs/projects/plans/m2-frontend-from-design.md`
- m2 S2.6 Plan: `docs/projects/plans/m2-s2.6-audit.md`
- m2 S2.7 Plan: `docs/projects/plans/m2-s2.7-h3.md` (3 sub-sprint)
- m2 S2.8 Plan: `docs/projects/plans/m2-s2.8-onboarding.md`
- m2.5 Plan: `docs/projects/plans/m2.5-public-pages-from-design.md`
- 디자인: `docs/projects/plans/p0-design-v0/` · `p0-design-v0.2/`
- PRD v2.1: `docs/PRD.md`
- v1 아카이브: `git checkout legacy-v1`
