# Nova State

- **Goal**: m2.5/S2.b 가격 페이지 + 비교표 12행 + AOP 정의 + FAQ 5 완료. 다음은 m2.5/S2.c 가입/로그인/재설정 3 페이지.
- **Phase**: m2 inside-app 28/28+1 done · m2.5 S2.a·S2.b done — S2.c 가입/로그인/재설정 next. 화면 28(app) + 2(landing·pricing done) + 12(public stub).
- **Blocker**: 없음. /landing은 인사이드앱 / 충돌 회피용 임시(D7). 후속 결정·프로토타입 흔적은 `docs/projects/STATUS.md` + `/dev/status` 대시보드 참조.

## Tasks
| Task | Status | Verdict | Note |
|------|--------|---------|------|
| m2 S1 부트스트랩 | done | PASS — Vite+React19+TS6 strict, CI | web/ + tokens/global.css + fonts |
| m2 S2.1 제품 IA + 골격 | done | PASS(qa) — 평면 네비 6 + /onboarding wizard | navigation seed + Layout 5 |
| m2 S2.2 Today 화면 | done | PASS(qa) — KPI 4 + 타임라인 + 설명 부족 + TODO + 팀 공유 | screens/Today.tsx |
| m2 S2.3 Sessions 목록 | done | PASS(qa) — tool 필터 5 + 검색(intent/actor/repo) + 7행 | screens/Sessions.tsx |
| m2 S2.4 Session Detail | done | PASS(qa) — 대화 7+명령 3+파일 2+매칭 commit 3, s-024 외 mock 한계 배지 | screens/SessionDetail.tsx, seed/sessionDetail.ts |
| m2 S2.5.a ExplainBack | done | PASS(qa) — 5필드 composer + 우측 3카드 | screens/ExplainBack.tsx |
| m2 S2.5.b Share | done | PASS(qa) — pre 요약 + 3채널 + H1 검증 카드 | screens/Share.tsx |
| m2 S2.5.c SelfRecall | done | PASS(qa, 조건부) — split layout, match-line ok/extra, 핸드오프 textarea, 셀프 hardcode 주석 | screens/SelfRecall.tsx |
| m2 S2.6 Audit (H2 4/5) | done | PASS(qa, 조건부) — 4탭 ?tab= 라우팅 + KPI weak 버튼 + mock 한계 배지(role=status) + Billing은 /settings?tab=export 이연 | screens/Audit.tsx + audit/{AuditTrail,Principles,Integrity,PdfPreview}.tsx + seed/audit.ts |
| m2 S2.7.a Risk Radar (H3 1/5) | done | PASS(qa) — 8 risk-tile + DB inline 4행 + 7 카테고리 신호 리스트 + 사고 alert cta → /incidents/INC-26-014 | screens/Risk.tsx + seed/risk.ts |
| m2 S2.7.b Incident hub + Replay + Note (H3 3/5) | done | PASS(qa) — Incident 4탭 wrapper(replay/note 채움, event/reviewer는 S2.7.c placeholder) + incident-canvas 2D timeline + 3 bucket + Note composer + system 감지 mock 배지 | screens/Incident.tsx + incident/{Replay,Note}.tsx + seed/incident.ts |
| m2 S2.7.c Event Detail + Reviewer Brief (H3 5/5) | done | PASS(qa) — EventDetail 핵심 fact 표 + 3분리 + 근거 5건 + 분류 radiogroup 4 + 사유 textarea, ReviewerBrief split 의도/결과 + match-line ok/ok/extra 3 + 승인/차단 actions, Incident 4탭 모두 활성 | incident/{EventDetail,ReviewerBrief}.tsx |
| m2 S2.8 Onboarding 5화면 (H4 5/5) | done | PASS(qa) — Workspace 폼(radiogroup 2 + select 2) + Connect 4 tool + OAuth dialog + Import timeline 4 + Reviewer multi-select + Done KPI 시연 mock + Today 점프 | screens/onboarding/* + seed/onboarding.ts |
| m2 S2.9 Workspace 3탭 (ws 3/3) | done | PASS(qa + Evaluator) — useSearchParams 3탭(members/invite/roles), Members(KPI 4 + 6행 + persona tag/RBAC), Invite(이메일 chip + radiogroup 역할 + 메일 미리보기 동기화), Roles(8 카테고리 × 3 역할 + role=status 변경 안내) | screens/Workspace.tsx + workspace/{Members,Invite,Roles}.tsx + seed/workspace.ts |
| m2 S2.10.a Settings 4탭 (settings 4/5) | done | PASS(qa + Evaluator) — 5탭 wrapper(profile/integrations/notif/export/billing) + Profile(grid 4필드 + 알림 채널 3 + 보안 3 + 위험 액션 region) + Integrations(AI 4 + 외부 3 + 예정 2) + Notifications(5×4 매트릭스 + 무음 시간대 + Slack mock) + AuditExport(3 radiogroup + 5건 export) + Billing 인라인 placeholder | screens/Settings.tsx + settings/{Profile,Integrations,Notifications,AuditExport}.tsx + seed/settings.ts |
| m2 S2.10.b Plan & Billing (**H2 5/5 닫힘**) | done | PASS(qa + Evaluator) — 현재 플랜 카드 + 사용량 progressbar(5/5 100%) + 디자인 파트너 D1 카드 + 5플랜 비교 + 연결제 25% toggle + 세금계산서 4필드 + 청구서 3건 + 토스페이먼츠 결제수단 + 사용량 알림 | screens/settings/Billing.tsx + seed/billing.ts |
| m2.5/S1 Public route 14 스캐폴드 + PublicShell | done | PASS(qa + Evaluator) — PublicShell(banner/contentinfo/region·외부 메뉴 nav) + 14 PublicStub + PUBLIC_BIZ env-aware + 사업자 미등록 placeholder | layout/PublicShell.tsx + routes/public/PublicStub.tsx + seed/public.ts |
| m2.5/S2.a 랜딩 + .pub-* CSS | done | PASS(qa + Evaluator) — 9 섹션 + .pub-* / .hero / .sec / .val-grid / .news-grid / .flow-grid / .law-card / .solo-fold / .faq / .tier-grid CSS | routes/public/Landing.tsx + seed/publicLanding.ts + global.css PUBLIC 섹션 |
| m2.5/S2.b 가격 + 비교표 | done | PASS(qa + Evaluator) — 4 섹션(center h2 + dp-chip role=region + 3 tier full items + aop-def role=note / 비교표 12행 × 3 + .ok/.no 분류 / FAQ 5 + 환불정책 회사페이지 inline link / dark CTA) + .aop-def / .compare / .dp-chip-row / .s-th CSS 추가 + Landing tier-grid role=group 일관성 정렬 | routes/public/Pricing.tsx + seed/publicLanding.ts(PUBLIC_COMPARE 12 + PUBLIC_FAQ_PRICING 5) + global.css |
| **m2.5/S2.c 가입/로그인/재설정 3 페이지** | ⏭ NEXT | — | public-auth.jsx → Signup/Login/Reset 3 TSX + .auth-wrap·.auth-form·.solo-note·.h4-mini CSS |
| m2 S1.1 외부 서비스 (Supabase Tokyo · Vercel · 도메인) | pending | — | 사용자 외부 계정 단계 |
| 시안 → 코드 이식 (m2.5 외부 페이지) | pending | — | m2 S2 완료 후 |
| 법무 4종 실제 문구 자문 | pending | — | legal-pages.md 단계 1~5 |

## Recently Done
| Task | Completed | Verdict | Ref |
|------|-----------|---------|-----|
| 디자인 v0.2 외부 14화면 + chat-3.md 10 결정 | 2026-05-11 | PASS — line 359 fix 외 채택 | p0-design-v0.2/chats/chat-3.md |
| 디자인 v0+v0.1 inside-app 23화면 | 2026-05-10~11 | PASS — 자가 점검 9/9 | p0-design-v0/chats/chat-{1,2}.md |

## Known Risks (PRD §11 압축)
| 위험 | 심각도 | 상태 |
|------|--------|------|
| 시장 가설 (한국 SMB Audit 결제 의지) | 높음 | 디자인 lock 완료 → dogfooding 검증 단계 |
| 1인 운영 키맨 위험 | 높음 | 자동화 + 계약 투명 공개 |
| Audit Layer 외부 신뢰성 | 중간 | v2.x WORM으로 미룸 |
| 인공지능기본법 SMB 강제력 | 중간 | 법무 자문 + FSC 추적 |
| Stack 결정 후 이식 시간 폭주 | 신규 | m2 Plan exit criteria로 통제 |

## 규칙 우회 이력
| 날짜 | 사유 | 사후 조치 |
|------|------|----------|
| — | — | — |

## Last Activity
- m2.5/S2.b 가격 + 비교표 (qa + Evaluator) → PASS — 4 섹션: (1) 가운데 정렬 h2 '일하는 사람만 카운트합니다.' + dp-chip-row role=region aria-label='디자인 파트너 안내' + 3 tier full items(랜딩 slice 4 → 가격 전체 6) + business→/company, free/team→/signup + aop-def role=note 'Active Operator 정의' (2) 전체 비교표 role=table aria-label='플랜 비교표' 12행 × 4컬럼 + compareCellClass(— → no, ✓ → ok) (3) FAQ PUBLIC_FAQ_PRICING 5 details 첫 번째 open + 본문 환불정책/회사페이지 inline Link (4) dark CTA 5분 signup. global.css에 .aop-def / .compare / .dp-chip-row / .s-th 추가(시안 styles.css 885-893, 895-913, 1081-1089, 1091-1092 1:1). 시드 publicLanding.ts에 PUBLIC_COMPARE 12 + PUBLIC_FAQ_PRICING 5 추가. SCREENS pricing done sprint=m2.5/S2.b, NEXT_ACTION→m2.5/S2.c. Evaluator surgical fix 2건 반영(dp-chip-row role=status→region + Landing tier-grid role=list→group 일관성). test 52/52 | 2026-05-12
- m2.5/S2.a 랜딩 + .pub-* CSS (qa + Evaluator) → PASS — 9 섹션 시각 이식: Hero h1·law-chip + 3 value card + 4 news + 4 flow + law-card KPI 5/7·2/7 + solo-fold + 3 tier dp50 + 5 FAQ + dark CTA + .pub-*/.hero/.sec/.val-*/.news-*/.flow-*/.law-*/.solo-fold/.faq/.tier-* CSS 약 300 라인 추가. PUBLIC_VALUE 3·NEWS 4·FLOW 4·PRINCIPLES 7·TIERS 3·FAQ_LANDING 5·HERO_PREVIEW 3 시드. fix(.law-card .lbody UL 리셋). test 51/51 | 2026-05-12
- m2.5/S1 Public route 14 스캐폴드 + PublicShell (qa + Evaluator) → PASS — PublicShell(banner/contentinfo/region·외부 메뉴 nav + 14 PublicStub + PUBLIC_BIZ env-aware). fix #17·#18 + PHASES.p2 active + M25_SPRINTS. test 50/50 | 2026-05-12
- m2 S2.10.b Plan & Billing → PASS — H2 5/5 닫힘 · inside-app 28/28+1. test 47/47 | 2026-05-12
- m2 S2.10.b Plan & Billing (qa + Evaluator) → PASS — **H2 5/5 사이클 닫힘 · inside-app 28/28+1**. 현재 플랜 + Active Operator progressbar(5/5 100%) + 5플랜 + 연결제 25% toggle 산식(round(p*0.75*12/1000)*1000) + 세금계산서 4필드 + 청구서 3건 + 토스페이먼츠 + 사용량 알림 3. Evaluator fix 2건(PROTOTYPE_MARKS #15·#16 + .sr-only utility). test 47/47 | 2026-05-12
- m2 S2.10.a Settings 4탭 (qa + Evaluator) → PASS — 5탭 wrapper + Profile + Integrations + Notifications + AuditExport + Billing placeholder. fix #15·#16. test 46/46 | 2026-05-12
- m2 S2.9 Workspace 3탭 (qa + Evaluator) → PASS — 3탭 wrapper + Members + Invite + Roles 매트릭스. fix #14. test 39/39 | 2026-05-12
- m2 S2.8 Onboarding 5화면 (qa) → PASS — OnboardingProgress(role=progressbar) 공통 + Workspace(radiogroup 2 + select 2) + Connect(4 tool + OAuth dialog + Escape) + Import(timeline 4) + Reviewer(multi-toggle §1 동적) + Done(KPI 시연 mock + Today 점프). PROTOTYPE_MARKS #13 추가. **H4 5/5 사이클 닫힘**. test 33/33 | 2026-05-12
- m2 S2.7.c Event Detail + Reviewer Brief (qa) → PASS — EventDetail(핵심 fact 8행 + 3분리 grid-3 + 근거 자료 5건 + 분류 radiogroup 4 likely/verified/unknown/irrelevant + 사유 textarea + 의도/결과 미리보기 cta + cross-link), ReviewerBrief(split 좌우: explain back 5 + AI 추출 + 질문 후보 3 / SESSION_DETAIL 변경 파일·명령 재사용 + DB 영향 + match-line ok/ok/extra 3 + 승인/차단/추가 확인). Incident 래퍼 PendingTab 제거, 4탭 모두 활성. **H3 5/5 사이클 닫힘**. test 29/29 | 2026-05-12
- m2 S2.7.b Incident hub + Replay + Note (qa) → PASS — useSearchParams ?tab= 4탭(replay/event/reviewer/note), Incident 래퍼 + 인라인 PlaceholderScreen 2탭, Replay incident-canvas 2D timeline (xPct + sevSize map + ic-mark clickable + ic-axis T0), 3 bucket(likely/verified/unknown), KPI 4, 우측 detail (selected event), system 감지 mock 배지(role=status), Note timeline + 메모 composer(자동 timestamp + draft preview) + Postmortem 양식. mock incident(INC-99-999) fallback 배지. PROTOTYPE_MARKS 12 추가(D6 결정). test 28/28 | 2026-05-12
- m2 S2.7.a Risk Radar (qa) → PASS — 8 risk-tile(role=tablist), DB inline 4행 + RISK_SIGNALS 7 카테고리 전환, 사고 alert cta(role=alert) → /incidents/INC-26-014, test 22/22 | 2026-05-12
- m2 S2.6 Audit (qa + Evaluator) → PASS(조건부) — /audit 4탭(trail/principles/integrity/pdf), useSearchParams, AUDIT_EVENTS 8+broken 1, COMPLIANCE 7원칙, Integrity mock 한계 role=status, Billing 이연. Evaluator fix 2건. test 19/19 | 2026-05-12
- DT.1.2 Dashboard 토스 스타일 재설계 → PASS — 한 화면 1 task 원칙 (6/28 + Phase stepper + Sprint 컴팩트 + details collapse) | 2026-05-11
- DT.1 Dashboard (qa + Playwright) → PASS — `/dev/status` StatusBoard, SSOT projectStatus.ts, test 13/13 | 2026-05-11
- m2 S2.5.c SelfRecall (qa + Playwright) → PASS(조건부) — split + match-line + 핸드오프, /sessions/yesterday, **H1 6/6 완성**, test 12/12 | 2026-05-11

## Refs
- m2 S2.6 Plan: `docs/projects/plans/m2-s2.6-audit.md`
- m2 S2.7 Plan: `docs/projects/plans/m2-s2.7-h3.md` (3 sub-sprint 분할)
- m2 S2.8 Plan: `docs/projects/plans/m2-s2.8-onboarding.md`
- **프로젝트 현황판: `docs/projects/STATUS.md`** (페이즈·sprint·화면 매트릭스·보류 결정·프로토타입 흔적)
- 디자인 lock: p0-design-v0/(inside-app 23화면) + p0-design-v0.2/(외부 14화면)
- Prompts: p0-...md(1차) / p0.1-...round2.md(2차) / p0.2-...round3.md(3차)
- Plans: m2-frontend-from-design.md(inside-app) / m2.5-public-pages-from-design.md(외부)
- PRD v2.1 / 협업 룰 .claude/rules/* / v1 archive: `git checkout legacy-v1`
