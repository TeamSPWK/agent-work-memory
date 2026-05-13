# Phase C8a — Critical 11건 dogfooding 가드 fix

> **상태**: **PASS** (2026-05-13 완료)
> **선행**: Phase C7 PASS (시안→코드 + jargon 평이화)
> **차단**: C8 1주 dogfooding 검증 (코드 변경 0 sprint)
> **이후**: R1 bin/awm 5분할 → C8 dogfooding → Phase D M0/S2 측정 재개

## 1. Context

Phase C7 PASS 후 `/nova:ux-audit + /nova:review` 종합 검증 결과:
- 31장 캡쳐 중 실데이터 7장 / mock 24장 — *측정 신뢰도*는 7장에 집중
- Critical 11건 — *본인이 매일 신뢰하며 켤 화면이 Audit Trail + /dev/status 2장뿐*
- C8 dogfooding은 코드 변경 0 sprint이나, 측정 환경 자체에 결함이 있으면 *결함 측정* 발생

→ C8 진입 전 *측정 신뢰* 확보 sprint 필요. 1인 sustainability 위해 *2일* 단위로 좁힘.

## 2. Problem (MECE 11건 — C8a 10 + R1 1)

### A. 데이터 신뢰 (4건) — *본인 매일 신뢰 깨지는 결함*
| ID | 화면 | 결함 | 위치 |
|----|------|------|------|
| A1 | Today | KPI 4 `TODAY_COUNT={22,4,3,76%}` hardcoded mock vs timeline 실데이터 불일치. 매일 보면 *숫자 안 움직임* 3일 안에 인지 → 신뢰 즉시 붕괴 | `Today.tsx:9-15` |
| A2 | Risk | sessions.risks 5/30 false positive — *고위험·DB* 라벨로 노출, FP 메타 없음. 일주일 dogfooding이면 *항상 위험=무시* 학습 | `Risk.tsx` + `state/ingest.ts:108-110` |
| A3 | SessionDetail | commandCount=0 14/30 세션에서 빈 패널 vs mock fallback mix → 사용자가 *내 데이터 누락 vs 도구 결함* 구분 불가 | `SessionDetail.tsx` |
| A4 | Audit Integrity | "실데이터 7장" 분류로 잡혔으나 화면 자체 *데모 mock 한계* 자백 → 실 hash chain CLI 결과 노출 or 분류 정정 | `screens/audit/Integrity.tsx` |

### B. 데이터 인프라 (2건 — B3는 R1 분리)
| ID | 결함 | 위치 |
|----|------|------|
| B1 | `/api/ingest` 콜드 7.45s + raw 394KB, 4 화면 동시 의존. 세션당 13KB(flowSteps+commandSamples+evidence+commitCandidates 함께 적재) → `/api/ingest?level=summary` vs `/api/sessions/:id` 분리 | `bin/awm.mjs` parseSessionFile + serveLocalApp 라우터 |
| B2 | `state/ingest.ts:192` error 1회 후 영구 빈 + line 193 force=true race condition (이전 inflight Promise가 새 inflight reference 무효화) | `state/ingest.ts:186-225` |
| ~~B3~~ | `bin/awm.mjs` 3263줄에 5+ 책임 누적 → **R1 sprint로 분리** (1~2일 별도) | `bin/awm.mjs` 전체 |

### C. UX 일관성·법적 리스크 (3건)
| ID | 결함 | 위치 |
|----|------|------|
| C1 | DSA Art.25 — Pricing "선착순 5팀 한정 + 한정 없음" 자기모순 + VAT 별도 미표시. 한국 표시광고법 + EU DSA 동시 위반 | `lib/seed/publicLanding.ts:31,133,197` + `routes/public/Pricing.tsx:29-65` |
| C2 | WCAG 1.4.3 — `.eyebrow caption1-strong` `#0066ff` on `#fff` = 4.07:1 (AA 4.5:1 미달). `/audit?tab=principles`는 인공지능기본법 *법적 산출물* (2026-01-22 시행) | `styles/global.css:244-247` |
| C3 | dev 메타가 inside-app 영구 노출 — AppLogo "m2 prototype" + Topbar "시연용 페르소나" 토글이 모든 사용자에게. Sidebar devOnly와 비대칭, DESIGN_SYSTEM §12.5 위반 | `layout/AppLogo.tsx:6` + `Topbar.tsx:46-48` |

### D. 코드 본질 (1건)
| ID | 결함 | 위치 |
|----|------|------|
| D1 | `isAssistantBoilerplate` 14 한국어 패턴 inline regex 리터럴 → `BOILERPLATE_PATTERNS` 데이터 분리 (Missing_Lookup) | `bin/awm.mjs:1770-1772` |

## 3. Solution — sprint 분해 (1인 sustainability)

### 3.1 의존성 그래프

```
A1 ─┐
A2 ─┼─ (data trust 묶음 1 PR · 반나절)
A3 ─┘
A4 ─── (Integrity 단독 분류 정정 또는 hash chain 실 결과 노출 · 반나절)

B1 ── (ingest 응답 분리 — bin/awm.mjs · 반나절)
B2 ── (state/ingest.ts race+retry · 1시간)

C1 ── (Pricing seed + VAT · 30분)
C2 ── (eyebrow 색상 토큰 1줄 · 5분)
C3 ── (AppLogo + Topbar isLocalEnv 분기 · 20분)

D1 ── (BOILERPLATE_PATTERNS 데이터 분리 · 30분)
```

총 추정: **1.5~2일 1인 작업**.

### 3.2 Exit Criteria — 검증 결과

- [x] **A1 PASS** — Today.tsx TODAY_COUNT 제거, `base.reduce/filter`로 4 KPI 도출. 실측: 변경 파일 310 / 위험 6 / 미설명 6 / 검토율 80%. delta 표시 4건 제거(baseline 비교 데이터 없음). `formatTodayLabel()` 동적 날짜.
- [x] **A2 PASS** — Risk.tsx 배너 카피 *"잠재 위험 신호 N건 — 검토 필요"* + neutral 톤(bg-subtle) + false positive 가능성 명시 + Phase D detectRisk 재튜닝 예고. CTA *"최근 신호 세션 검토"*로 톤 다운.
- [x] **A3 PASS (이미 충족 — close)** — SessionDetail.tsx C5 sprint에서 이미 빈 패널 명시 메시지 추가 완료(line 104-107·143-146·168-171). UX-audit 평가자 false positive로 close. fix 불필요.
- [x] **A4 PASS** — Integrity.tsx 카피 정직화: m2 S4 옛 plan 제거, *"실제 SHA-256 chain 검증·재빌드는 터미널에서 `node bin/awm.mjs audit verify`로 즉시 확인 가능합니다 (M0/S1.5 완료)"*. 시각 시안 mock 표시.
- [x] **B1 PASS** — bin/awm.mjs `/api/ingest?level=summary` 옵션 추가. 실측: 380KB → 111KB **70% 감소**, 캐시 hit 0.11s (이전 2s+). UI 적용은 R1 후 별도 (SessionDetail 분리 필요해서).
- [x] **B2 PASS** — state/ingest.ts AbortController + 지수 백오프 1s→2s→4s (최대 3회) + last-wins requestId. force=true가 이전 inflight abort. AbortError는 error 상태 X.
- [x] **C1 PASS** — publicLanding.ts FAQ + Team/Business desc + Pricing.tsx dp-chip-row 카피 일관 정정: *"처음 5팀까지 50% — 6번째부터 정가"* + Team/Business에 `(VAT 별도)` 병기.
- [x] **C2 PASS** — global.css `.eyebrow` color `--primary-normal` (#0066ff, 4.07:1) → `--primary-strong` (#005eeb, ~5.5:1) WCAG AA 통과. 인공지능기본법 페이지 법적 산출물 안전.
- [x] **C3 PASS** — AppLogo.tsx + Topbar.tsx `isLocalEnv()` 분기 추가. *"m2 prototype"* sub + Topbar 페르소나 토글 *"시연용 페르소나"* 라벨이 로컬에서만 노출. 운영 도메인 자동 숨김. Topbar workspace select에 `aria-label="워크스페이스 전환"` 추가 (WCAG H 발견 같이 fix).
- [x] **D1 PASS** — bin/awm.mjs `isAssistantBoilerplate` 14 inline regex → `BOILERPLATE_PATTERNS` 배열 + `since` 메타. TDZ 회피로 함수 *내부*에 배치 (C2와 동일 패턴 — module 평가 line 67에서 main() 호출).
- [x] **추가 H6** — Sessions.tsx `base` 조건부를 useMemo로 안정화. exhaustive-deps warning 해소.
- [x] **추가 i18n lint** — i18n/index.ts unused eslint-disable directives 2건 제거.
- [x] **전체**: root 119/119 + web 71/71 PASS / tsc clean / **lint 0 errors 0 warnings** / build 145ms / serve restart PID 68881 / phase-sync §3 3곳 갱신 (NOVA-STATE + projectStatus.ts + 본 plan)

### 3.3 미해결 (R1·후속 sprint 이연)

- **B1 UI 적용**: `/api/ingest?level=summary` backend는 도입했으나 UI(state/ingest.ts)는 여전히 full 응답 호출. SessionDetail 분리(`/api/sessions/:id`)가 필요한데 R1 5분할 후 처리가 surgical.
- **A2 in-band signaling**: Risk.tsx `cat.includes('(연관)')` substring magic은 ingest.ts pickSessionRisk에서도 같은 양방향 in-band. `SessionRisk.origin` enum 필드 정합은 R1 backend 모듈 분리 시 같이 처리.
- **B3 bin/awm.mjs 5분할**: 본 sprint scope 외(R1 별도 sprint).
- **Risk false positive 실제 감지율 정정**: detectRisk regex 패턴 좁히기 — Phase D V0 측정 후.
- **dev 메타 isLocalEnv 후속 검토**: 운영 빌드에서 *m2 prototype*·*시연용 페르소나* 외에 *PageBand*·*가설 라벨* 등 추가 dev 메타 잔존 여부 — C8 dogfooding 중 발견 가능성.

## 4. 검증 후 다음

1. **R1 sprint** (별도 1~2일) — `bin/awm.mjs` 5분할
2. **C8 dogfooding** — 코드 변경 0, 5 영업일 + 매일 ExplainBack + 7 baseline 재측정 + 자기 보고
3. **Phase D M0/S2 측정 재개**

## 5. 1인 sustainability 검토

- ✅ 10건 fix가 모두 *기존 코드 surgical 수정* (신규 모듈·추상화 없음)
- ✅ B1 (ingest 분리)와 A1·A3는 *bin/awm.mjs 한 함수만* 건드림 → R1 5분할과 충돌 X
- ✅ 모든 fix가 *측정 가능한 exit criteria* — 자기 보고 의존 0
- ⚠️ B3 (bin/awm 5분할)을 본 sprint에 포함하면 1.5~2일 → 4~5일로 폭증. **분리 결정 옳음.**
- ⚠️ mock 24장 결함은 본 sprint에서 *외부 페이지 트랙 (Landing/Pricing)*만 다룸. 내부 mock(Onboarding/Workspace/Settings)는 실 가입·결제·팀 없으면 본질 mock — 별도 sprint 이연.

## 6. Refs

- 가드 evidence: `docs/verifications/2026-05-13-ux-audit-review-summary.md`
- 캡쳐: `docs/verifications/screenshots/2026-05-13-phase-c-review/` 31장
- 마스터 Phase C plan: `docs/projects/plans/local-dogfooding-ready.md`
