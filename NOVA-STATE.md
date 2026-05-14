# Nova State

- **Goal**: **Local Dogfooding Ready (Phase C) → M0 측정 재개 → M1 Foundation**. 본인이 매일 도구로 켜놓고 *실제로 도움이 됐다*고 자기 보고할 수 있는 수준 도달이 측정·외부 노출의 전제. R1 PASS로 bin/awm 6 모듈 분리 완료. C8 dogfooding 진입 가능.
- **Phase**: 시안 → 코드 closed → M0/S1·S1.5·S1.6·S1.7·H2-b 부분 PASS → **🔄 Phase C "Local Dogfooding Ready" IN PROGRESS** (~~C1~~ ✅ / ~~C2~~ ✅ + polish / ~~C3~~ ✅ / ~~C4~~ ✅ / ~~C5~~ ✅ / ~~C6~~ ✅ / ~~C7 Incident jargon~~ ✅ / ~~C8a Critical 11건 가드~~ ✅ / ~~R1 bin/awm 5분할~~ ✅ / **C8 1주 dogfooding** ← next) → ⏸ Phase D M0/S2 측정 재개 → ⏸ E M0/S3 H1·H2-a·H3 → ⏸ F M0/S4 PRD §1.1 정정 + M1 결정 → ⏸ G M1 Foundation Stack 결정. **외부 D0 인터뷰는 Phase F 통과 후**.
- **Blocker**: (1) ~~PRD §5.5 hash chain CLI~~ **S1.5 PASS** / (2) ~~SessionDetail seed-id mismatch~~ **S1.7 PASS** / (3) S1.6 7 발견 — **Phase C로 이전, C2~C6 PASS · 1건 D 이연(매칭 가중치) + 1건 해소(Audit hash fake)** / (4) ~~AuditTrail fake hash fallback~~ **S1.5 자동 해소** / (5) ~~M0/S2 측정 환경~~ **C1 흡수** / (6) ~~Phase C8 진입 가드 FAIL — Critical 11건~~ **C8a 10건 PASS — A1·A2·A3·A4·B1·B2·C1·C2·C3·D1 + H6** / (7) ~~Side_Effect_Scatter — bin/awm.mjs 3263줄 단일 파일~~ **R1 PASS — 6 모듈 분리(util·repo-parser·view-verbs·intent·risk-fanout·http-routes), 3306→2781(-15.9%)** / (8) audit chain index 949 break (2026-05-13T11:14:34Z, R1 무관 pre-existing) — `audit rebuild` 또는 baseline 재기록 필요. 회상 신뢰도에 영향, 우선순위 보통.

## Tasks

### Phase C — Local Dogfooding Ready (현재)
| Sprint | Status | 무엇을 | Exit Criteria | Note |
|--------|--------|-------|--------------|------|
| **C1~C7** 시안→코드 + 데이터 어댑터 + jargon | done (압축) | C1 측정 환경 / C2 intent / C3 audit summary / C4 risk fan-out / C5 SessionDetail 어댑터 / C6 repo 파서 / C7 jargon | 모두 PASS. 검증 ref: `docs/verifications/phase-c{2,3,4,5,6,7}-*.md` |
| **C8a** Critical 11건 dogfooding 가드 fix | done | A1 Today KPI 실데이터(310/6/6/80%) + A2 Risk FP "잠재 신호 검토 필요" + A3 C5에서 충족 확인 + A4 Integrity 카피 정직화 + B1 level=summary 380KB→111KB + B2 race+retry AbortController/지수 백오프 + C1 Pricing 모순 해소+VAT 별도 + C2 eyebrow primary-strong + C3 AppLogo/Topbar isLocalEnv + D1 BOILERPLATE_PATTERNS + H6 Sessions deps | **PASS** — root 119/119 + web 71/71 + tsc clean + lint 0 errors 0 warnings + ingest payload 70% 감소. `docs/projects/plans/c8a-critical-fix.md` |
| **R1** bin/awm.mjs 5분할 | done | bin/lib/{util,repo-parser,view-verbs,intent,risk-fanout,http-routes}.mjs 6 모듈 분리 | **PASS (구조 분리 + tests + smoke 3/3)** — root 119/119 + web 71/71 + 빌드 278ms + curl /api/health·/api/ingest·/api/ingest?level=summary 3/3. bin/awm.mjs 3306→2781(-525, -15.9%) — 추정 <2300 미달. http-routes DI 방식, 핸들러 25개 deps 주입. `docs/projects/plans/r1-bin-awm-split.md` |
| **C8** 1주 dogfooding 검증 | in_progress (Day 1/5) | 코드 변경 0. 본인 실 작업 5 영업일 + 매일 1회 Today + 매일 1건 ExplainBack + 1주 후 자기 보고 | (a) 5/5 영업일 — Day 1 시작 (b) **7 baseline 재측정 6/7 해소** (2026-05-14, R1 PASS 후) (c) 자기 보고 *"하루 1회 이상 가치"* — 5일 누적 후 | `docs/verifications/phase-c8-dogfooding.md` |

### Phase D~G — 측정·정정·M1 (대기)
| Phase | Status | Exit Criteria |
|-------|--------|--------------|
| **D** M0/S2 자기 캡처 1주 측정 (재개) | blocked by C8 | V0 — 손실 0 + 누락률 ≤ 5% |
| **E** M0/S3 H1·H2-a·H3 측정 | blocked by D | PRD §5.3 합격선 |
| **F** M0/S4 PRD §1.1 line 40 정정 + M1 결정 | blocked by E | PRD PR + 결정 문서 |
| **G** M1 Foundation Stack 결정 | blocked by F | Supabase·Clerk·Vercel·토스 4안 결정 |

### 시안→코드 + M0 부분 PASS (압축)
| 묶음 | Status | Note |
|-----|--------|------|
| m2 inside-app 28 화면 (S1·S2.1~S2.10.b) | done | 평면 네비 6 + onboarding 5 + 대시보드 + 세션 + 감사 + 위험 + 사고 4탭 + 팀 + 설정 5탭. 최근 git log 또는 `docs/projects/STATUS.md` 참조 |
| m2.5 외부 14 화면 (S1·S2.a~S2.f) | done | PublicShell + Landing + Pricing + Auth 3 + Company + Status + Legal 4 + Errors 3 |
| UX Audit S1·S2·S3 | done | Critical 6/8 + High 11/13 + Medium 10/12 surgical fix. WCAG AA 색상·forced-colors·tabpanel ARIA·router lazy·5-tier→3-tier 정합 |
| M0/S1 v1 자산 회수 | done | bin/4 + tests/3 회수, vitest 23/23, awm CLI 동작 |
| M0/S1.5 Hash chain CLI | done | SHA-256 chain + verify/rebuild/show + 변조 5/5 unit, S1.6 발견 #4 해소 |
| M0/S1.6 v1 UI MVP 로컬 회수 | done | dist 경로 + useIngest fetch + Today/Sessions/Audit 실 데이터. Conditional PASS |
| M0/S1.6 데이터 baseline 기록 | done | 7 발견 — Phase C 분해 (#1→C2, #2/#7→C3, #3→C5, #4→S1.5 해소, #5→C4, #6→C6, #7→D 이연) |
| M0/S1.7 SessionDetail seed-id mismatch | done | ingest lookup 우선 + seed fallback + loading 분기 |
| M0/S3 H2-b 변조 5/5 명령 | done | events.jsonl 5 시나리오 직렬 brokenAt 정확 + exit 1 |

### Backlog (실데이터·측정 후 결정)
| Item | Trigger |
|------|---------|
| Icon SVG sprite + 100+ 행 가상화 | Phase E 측정 데이터 후 |
| 매칭 P1 4축 가중치 재조정 (S1.6 발견 #7) | Phase D V0 측정 후 |
| useIngest 108줄 분리 | Phase C5 어댑터 확장 시 |

## Recently Done
| Task | Completed | Verdict | Ref |
|------|-----------|---------|-----|
| 디자인 v0.2 외부 14화면 + chat-3.md 10 결정 | 2026-05-11 | PASS — line 359 fix 외 채택 | p0-design-v0.2/chats/chat-3.md |
| 디자인 v0+v0.1 inside-app 23화면 | 2026-05-10~11 | PASS — 자가 점검 9/9 | p0-design-v0/chats/chat-{1,2}.md |

## Known Risks (PRD §11 압축)
| 위험 | 심각도 | 상태 |
|------|--------|------|
| 시장 가설 (한국 SMB Audit 결제 의지) | 높음 | 디자인 lock 완료 → M0 자기 dogfooding → D0 인터뷰 5건 |
| 제품 핵심 가설(H1 1분 회상·H2 매칭/hash chain·H3 10분 RCA) 미측정 | 높음 | M0 Tech Validation sprint S1~S4. FAIL 시 PRD §11 가설 재검토 트리거 |
| v1 자산 회수 ↔ web/ 트랙 의존성 충돌 | 신규 | 별도 branch `tech-validation/m0`에서 진행, main 시각 자산 보호 |
| 1인 운영 키맨 위험 | 높음 | 자동화 + 계약 투명 공개 |
| Audit Layer 외부 신뢰성 | 중간 | v2.x WORM으로 미룸 |
| 인공지능기본법 SMB 강제력 | 중간 | 법무 자문 + FSC 추적 |
| Stack 결정 후 이식 시간 폭주 | 신규 | m2 Plan exit criteria로 통제 |
| a11y WCAG AA 미달 (tabpanel 누락 + 색상 대비 4쌍 + outline:0) | 신규 | /nova:ux-audit Critical — S3 후속 sprint |
| Dark Pattern 외부/내부 플랜 가격 불일치 (EU DSA Art.25 기만 가능) | 신규 | /nova:ux-audit Critical — 단일 시드 통합 또는 명시 |

## 규칙 우회 이력
| 날짜 | 사유 | 사후 조치 |
|------|------|----------|
| — | — | — |

## Last Activity
- **Phase R1 PASS — bin/awm.mjs 6 모듈 분리** | 2026-05-14. nova:review C2 Side_Effect_Scatter Critical(3306줄 단일 파일 6+ 책임) 처리. bin/lib/ 신설 후 의존성 순서대로 5 분할: (1) repo-parser.mjs(23줄) — isValidCwdValue·inferRepoLabel (2) view-verbs.mjs(79줄) — humanizeAuditSummary·computeAuditVerb·verbForTool·bashGoldVerb (3) intent.mjs(124줄) — pickIntentSummary·isFragmentIntent·isVagueIntentText·isStrongIntentText·isAssistantBoilerplate·summarizeMissingIntent + BOILERPLATE_PATTERNS top-level(분리 모듈이라 TDZ 안전) (4) risk-fanout.mjs(57줄) — detectRisk·narrowRiskSearchable·buildSessionRisks (5) http-routes.mjs(264줄) — serveLocalApp + sendJson·serveStatic·safeStaticPath·mimeType·readRequestJson, deps DI 25개 핸들러 주입 + 공통 util.mjs(41줄) — truncate·maskSecrets·sanitize·isSecretKey·hashString. 미사용 import 6개 제거(createServer·extname·normalize·isSecretKey·verbForTool·bashGoldVerb). 검증: root 119/119 + web 71/71 + tsc clean + 빌드 278ms + curl smoke 3/3(/api/health·/api/ingest 333KB·/api/ingest?level=summary 110KB 67% 감소). bin/awm.mjs 3306→2781(-525, -15.9%) — plan 추정 <2300 대비 +481 gap(잔여는 plan §2 의도 코어). tests import 경로 갱신 5건(intent-summary·audit-summary·session-risks·repo-parser·repo-parser.test). **다음 sprint: C8 1주 dogfooding** — 코드 변경 0, 5 영업일 자기 사용 + 매일 ExplainBack + 1주 후 자기 보고 "하루 1회 이상 가치". audit chain index 949 break(2026-05-13T11:14:34Z, R1 무관 pre-existing)는 별도 사후 처리.

- **Phase C8a PASS — Critical 11건 dogfooding 가드 fix 완료** | 2026-05-13. A1 Today KPI 4 mock 제거 → 실데이터(변경 파일 310 / 위험 6 / 미설명 6 / 검토율 80%) + 오늘 날짜 동적 + delta 표시 제거. A2 Risk 배너 "잠재 위험 신호 N건 — 검토 필요" + neutral 톤 + Phase D detectRisk 재튜닝 예고. A3는 C5에서 이미 충족(SessionDetail 빈 패널 명시 메시지 line 104-107·143-146·168-171) — false positive close. A4 Integrity mock 한계 배너 카피 정직화 (m2 S4 옛 plan 제거, S1.5 CLI verify 명시). B1 `/api/ingest?level=summary` 추가 — payload 380KB→111KB(70% 감소), 캐시 hit 0.11s. B2 force=true AbortController + 지수 백오프 1s→2s→4s 자동 재시도 (최대 3회) + last-wins requestId. C1 Pricing 모순 해소+VAT. C2 eyebrow 4.07:1→5.5:1 AA. C3 dev 메타 isLocalEnv. D1 BOILERPLATE 14 패턴. H6 lint clean.
- **/nova:ux-audit + /nova:review CONDITIONAL FAIL — Critical 11건 진단, C8a sprint 신설** | 2026-05-13. Phase C7 PASS 후 31장 캡쳐(1440×900 fullpage, 실데이터 7장/mock 24장 — 사용자 지적으로 분류 정직화) + 5인 적대적 평가 + 코드 적대적 리뷰. **UX C8/H11/M9/L4 + Code C3/H7/M5/L1**. **본인이 매일 신뢰하며 켤 화면은 현재 Audit Trail + /dev/status 2장뿐**(Newcomer 결론). 묶음 11건: A 데이터 신뢰 4 (Today KPI mock·Risk FP 5/5·SessionDetail 빈 패널 mix·Integrity 분류 오류) / B 인프라 3 (ingest 7.45s+394KB·error retry bail + force race·bin/awm 3263줄 — B3는 R1 분리) / C UX/법적 3 (DSA Pricing "선착순+한정없음" 모순+VAT 미표시·eyebrow 4.07:1·dev 메타 inside-app 노출) / D 코드 1 (isAssistantBoilerplate inline regex). 잘된 점: prefers-reduced-motion 전역·forced-colors 2회·Tabs ARIA 일관·humanizeAuditSummary view-layer 분리·narrowRiskSearchable 좁히기·63 unit test 누적. 산출물: `docs/verifications/2026-05-13-ux-audit-review-summary.md` + 캡쳐 31장 + plan `docs/projects/plans/c8a-critical-fix.md`. **C8a active** — A 4 + B 2 + C 3 + D 1 = 10건 (R1 bin/awm 5분할 별도 sprint). C8 dogfooding은 C8a+R1 PASS 후 진입.
- **Phase C6 PASS — Repo 파서 정합 30/30, 잘못 추출 0** | 2026-05-13. baseline #6 (`05/12`·`2026-05-12/new-chat` 같은 날짜 파편이 repo로 잘못 노출되는 사례)의 원인 함수 `inferRepoLabel` (line ~2374)이 `cwdValue`를 단순 `/` split으로 가공하는 점 진단. baseline 시점 이후 본 세션이 limit 30 밖으로 밀려나 현재 데이터에서는 재현 X지만 *원인 함수는 그대로 위험*. 회귀 차단 fix: (a) `isValidCwdValue(value)` 신규 — 빈 입력·3자 미만·MM/DD·YYYY-MM-DD 날짜 파편·1-segment relative 모두 invalid 판정 (b) `inferRepoLabel` invalid cwdValue 시 `dirname(file.path)` 기반 폴백 — file.path는 항상 absolute라 안전. 검증: root 119/119 (기존 108 + 신규 11) / web 71/71 / tsc clean / build 142ms / serve:restart PID 4537 / /api/ingest 30/30 repo 정상 (swk/agent-work-memory 9, swk/swk-ground-control 7, swk/md-template-compiler 5, swk/nova 5, givepro91/stockAssist 4 — 잘못 추출 0건). 산출물: `docs/verifications/phase-c6-repo-parser.md`. 다음 세션: **C7 Incident·Reviewer jargon 평이화** — Incident.tsx·Replay.tsx·EventDetail.tsx·ReviewerBrief.tsx 카피 + i18n key + 테스트 라벨 (독립 병렬, 1일 추정).
- **Phase C5 PASS — SessionDetail 4 패널 + C2 polish (단편 9/30 → 1/30)** | 2026-05-13. 사용자 라이브 검증(today 화면)에서 추가 결함 2건 발견 + sprint 본체와 묶음 처리. **C2 polish**: `isVagueIntentText` length 임계 8→4 + `isFragmentIntent` MIN_LEN=20 폐기. 사유: 8자 임계가 *"S5 시작"·"동적화 진행"·"C4 진행"·"리팩토링 마무리"* 같은 짧지만 명료한 한국어 의도까지 폄훼. 한국어 4자 이하만 단편(인사·단답)으로 좁힘. **C5 본체**: (a) `bin/awm.mjs` session 객체에 `commandCount`(total)·`commandSamples`(상위 10) 추가 (b) `web/src/lib/seed/sessions.ts` `SessionSeed` 타입에 9 optional fields 추가(flowSteps·evidence·unresolved·commandSamples·commitCandidates·confirmedCommits·linkedCommits·agentSummary·workBriefObjective·fullIntent) — mock SESSIONS 영향 없음 (c) `web/src/state/ingest.ts` IngestSession 타입 확장 + `cmds: 0` hardcode 제거 → `cmds: s.commandCount ?? 0` + 9 fields propagate (d) `web/src/screens/SessionDetail.tsx` 이전 *"실 캡처 세션 데이터 미연결"* 오렌지 배너 제거하고 4 패널 추가 — 대화 흐름(flowSteps map, kind 뱃지·time·title·summary)·실행된 명령(commandSamples 상위 10 mono, "전체 N건" sub)·변경 파일+커밋 후보(commitCandidates 상위 5, shortHash 뱃지·subject·신뢰도·files)·미해결 항목(unresolved 조건부 오렌지 카드). 각 패널 데이터 없으면 *비어있음* 명시. App.test.tsx test 갱신 — *role=status* 배너 검증 → "대화 흐름"·"실행된 명령" heading 검증. 검증: root 108/108(기존 + polish) / web 71/71 / tsc clean / build 177ms / serve:restart PID 52945 / 라이브 30 세션 commandCount > 0: 16, flowSteps 채워짐: 30(평균 4.5), (요약 부족) prefix: 1/30(이전 9). 산출물: `docs/verifications/phase-c5-sessiondetail-adapter.md`. 다음 세션: **C6 Repo 파서 정합 100%** — `bin/awm.mjs` cwd 추출 regex 보강 (날짜 파편 `05/12`·`YYYY-MM-DD/new-chat` 사례). 독립 병렬 가능.
- **Phase C7 PASS — Incident·Reviewer jargon 평이화 30+건** | 2026-05-13. Reviewer Brief→검토 요약·Audit row→감사 행·Explain Back→설명 메모·Postmortem→사후 분석 등. i18n incident.* 7 + common.audit/cross 5 키 추가. 검증: root 119/119 + web 71/71 + tsc clean + build 149ms. ref: `docs/verifications/phase-c7-jargon.md`.
- **Phase C2~C6 PASS (압축)** | 2026-05-13. C2 intent 가공 (단편 7/30→0/30) · C3 humanizeAuditSummary + bashGoldVerb 13패턴 (audit raw 0/30) · C4 buildSessionRisks fan-out (Risk 실 데이터 8건, 5건 false positive 한계는 Phase D 이연) · C5 SessionDetail 4 패널 + commandCount/flowSteps 30/30 · C6 inferRepoLabel valid-cwd 폴백 (repo 잘못 추출 0/30). 누적 신규 unit 63건. refs: `docs/verifications/phase-c{2,3,4,5,6}-*.md`.
- **Phase C1 fully done + UX Polish 누적 → PASS** | 2026-05-13. C1 capture hook 본 worktree 검증 + SWR 60s+Skeleton+1440 기준+i18n 카탈로그+한국어 사이드바+jargon 평이화 25 파일. 5분할 커밋. ingest 44s→4.3s incremental cache. Critical 2/High 10 surgical fix 8건(useIngest revalidating·error retry bail·AuditTrail/Share/Settings/Sidebar/SessionDetail/ExplainBack 카피). | 2026-05-13
- **Phase 재구조화 — Phase C "Local Dogfooding Ready" 신설** | 2026-05-13. M0/S2 측정 직진 보류 + S1.6 7 발견 5건을 C2~C6으로 분해 + jargon C7 + dogfooding C8. dev/status 메뉴 hostname 분기 노출. ref: `docs/projects/plans/local-dogfooding-ready.md`.
- Tester Onboarding + M0/S1·S1.5·S1.6·S1.7·H2-b — Tasks 표 압축 참조. | 2026-05-12~13

## Refs
- **다음 세션 진입점: `docs/verifications/phase-c8-dogfooding.md`** (C8 1주 dogfooding 검증 — 코드 변경 0, 5 영업일 자기 사용)
- R1 PASS evidence: `docs/projects/plans/r1-bin-awm-split.md` + bin/lib/{util,repo-parser,view-verbs,intent,risk-fanout,http-routes}.mjs
- C8a PASS evidence: `docs/projects/plans/c8a-critical-fix.md` + `docs/verifications/2026-05-13-ux-audit-review-summary.md`
- **현재 페이즈 마스터: `docs/projects/plans/local-dogfooding-ready.md`** (Phase C 9 sprint + 의존성 그래프, C1~C7+C8a+R1 PASS, C8 next)
- C2 검증: `docs/verifications/phase-c2-intent-summary.md`
- C3 검증: `docs/verifications/phase-c3-audit-workpacket-summary.md`
- C4 검증: `docs/verifications/phase-c4-risk-fanout.md`
- C5 검증 + C2 polish: `docs/verifications/phase-c5-sessiondetail-adapter.md`
- C6 검증: `docs/verifications/phase-c6-repo-parser.md`
- C7 검증: `docs/verifications/phase-c7-jargon.md`
- M0 측정 plan (Phase D 대기): `docs/projects/plans/m0-tech-hypothesis-validation.md`
- S1.6 baseline 7 발견 (Phase C 분해 근거): `docs/verifications/m0-s1.6-data-quality-baseline.md`
- 시안→코드 plans: `docs/projects/plans/m2-{frontend-from-design,s2.6,s2.7,s2.8}.md` + `m2.5-public-pages-from-design.md`
- 인프라 plans (Phase C1 받침): `tester-onboarding.md` + `ingest-incremental-cache.md` + `m0-s1.5-hash-chain.md`
- 프로젝트 현황판: `docs/projects/STATUS.md` (페이즈·화면 매트릭스 — Phase C 진행 시 갱신 필요)
- 디자인 lock: p0-design-v0/ + p0-design-v0.2/ (Prompts: p0/p0.1/p0.2)
- PRD v2.1 / 협업 룰 .claude/rules/* / v1 archive: `git checkout legacy-v1`
