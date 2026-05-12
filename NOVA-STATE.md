# Nova State

- **Goal**: S2.7.b Incident hub + Replay + Note 완료 → S2.7.c Event Detail + Reviewer Brief 진입 대기
- **Phase**: frontend ingest — m2 S1+S2.1~S2.6+S2.7.a~.b + DT.1 done. H1 6/6 + H2 4/5(Billing 이연) + H3 3/5. 화면 13/28+1.
- **Blocker**: 없음. 후속 결정·프로토타입 흔적은 `docs/projects/STATUS.md` + `/dev/status` 대시보드 참조.

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
| **m2 S2.7.c Event Detail + Reviewer Brief (H3 5/5)** | ⏭ NEXT | — | event/reviewer 탭 채움, 4탭 모두 활성 |
| m2 S2.8+ Workspace/Settings/Onboarding | pending | — | S2.7 완료 후 |
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
- m2 S2.7.b Incident hub + Replay + Note (qa) → PASS — useSearchParams ?tab= 4탭(replay/event/reviewer/note), Incident 래퍼 + 인라인 PlaceholderScreen 2탭, Replay incident-canvas 2D timeline (xPct + sevSize map + ic-mark clickable + ic-axis T0), 3 bucket(likely/verified/unknown), KPI 4, 우측 detail (selected event), system 감지 mock 배지(role=status), Note timeline + 메모 composer(자동 timestamp + draft preview) + Postmortem 양식. mock incident(INC-99-999) fallback 배지. PROTOTYPE_MARKS 12 추가(D6 결정). test 28/28 | 2026-05-12
- m2 S2.7.a Risk Radar (qa) → PASS — 8 risk-tile(role=tablist), DB inline 4행 + RISK_SIGNALS 7 카테고리 전환, 사고 alert cta(role=alert) → /incidents/INC-26-014, test 22/22 | 2026-05-12
- m2 S2.6 Audit (qa + Evaluator) → PASS(조건부) — /audit 4탭(trail/principles/integrity/pdf), useSearchParams 라우팅, AUDIT_EVENTS 8건+broken 1건, COMPLIANCE 7원칙(ok5/warn2), Integrity mock 한계 배지(role=status), Billing은 S2.10 이연(/settings?tab=export Link), test 19/19, Evaluator surgical fix 2건 반영(KPI 3·4 weak 버튼 + PDF 시각 슬라이스) | 2026-05-12
- DT.1.2 Dashboard 토스 스타일 전면 재설계 → PASS — 큰 숫자 "6/28" + 우측 그룹 mini bars + Phase 가로 stepper(●─●─○─○) + Sprint 컴팩트 리스트(✓/→/◯) + 매트릭스·보류·흔적 details collapse. 한 화면 1 task 원칙 충족 | 2026-05-11
- DT.1.1 Dashboard 보강 (UX 트렌드 비판 후 surgical) → PASS — NextAction 카드 + 그룹별 진행률 바 | 2026-05-11
- DT.1 Dashboard (qa + Playwright) → PASS — `/dev/status` StatusBoard(Phase·Sprint·매트릭스·보류·흔적), SSOT projectStatus.ts, test 13/13 | 2026-05-11
- m2 S2.5.c SelfRecall (qa + Playwright) → PASS(조건부) — split + match-line + 핸드오프, /sessions/yesterday, **H1 6/6 완성**, test 12/12 | 2026-05-11
- m2 S2.5.b Share (qa + Playwright) → PASS — pre 요약 + 3채널 + H1 검증 카드 + clipboard toggle 테스트, test 11/11 | 2026-05-11
- m2 S2.5.a ExplainBack (qa + Playwright) → PASS — 5필드 composer + 3카드 + nested 형제 라우트 전환, test 8/8 | 2026-05-11
- m2 S2.4 SessionDetail (qa + Playwright) → PASS — 대화 7·명령 3·파일 2·매칭 commit 3+4축 bar, mock 한계 배지, test 6/6 | 2026-05-11

## Refs
- m2 S2.6 Plan: `docs/projects/plans/m2-s2.6-audit.md`
- m2 S2.7 Plan: `docs/projects/plans/m2-s2.7-h3.md` (3 sub-sprint 분할)
- **프로젝트 현황판: `docs/projects/STATUS.md`** (페이즈·sprint·화면 매트릭스·보류 결정·프로토타입 흔적)
- 디자인 lock: p0-design-v0/(inside-app 23화면) + p0-design-v0.2/(외부 14화면)
- Prompts: p0-...md(1차) / p0.1-...round2.md(2차) / p0.2-...round3.md(3차)
- Plans: m2-frontend-from-design.md(inside-app) / m2.5-public-pages-from-design.md(외부)
- PRD v2.1 / 협업 룰 .claude/rules/* / v1 archive: `git checkout legacy-v1`
