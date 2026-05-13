# /nova:ux-audit + /nova:review 종합 결과 — Phase C7 PASS 시점

**날짜**: 2026-05-13
**산출 단계**: Phase C7 PASS → C8 dogfooding 진입 가드
**판정**: **CONDITIONAL FAIL** — Critical 11건. C8 진입 전 선결 권고.

## 1. 캡쳐

- 위치: `docs/verifications/screenshots/2026-05-13-phase-c-review/` 31장
- viewport: 1440×900 fullpage
- 분류:
  - **실데이터 (ingest API 기반) — 7장**: 01 Today(부분), 02 Sessions, 03 SessionDetail, 07 Audit Trail, 09 Audit Integrity, 12 Risk(배너만), 31 /dev/status
  - **Mock seed — 24장**: ExplainBack/Share/SelfRecall/Audit Principles/Audit PDF/Billing/Incident 4탭/Onboarding 5/Workspace 3/Settings 4/Landing/Pricing

## 2. /nova:ux-audit — 5인 적대적 평가

| 관점 | Critical | High | 핵심 |
|------|---------|------|------|
| Newcomer (1차+2차) | 5 | 4 | KPI mock·Risk FP·온보딩 진입점·dev 메타 |
| Accessibility | 1 | 3 | eyebrow 4.07:1·Topbar select aria-label·Principles 색만 |
| Cognitive Load (1차+2차) | 4 | 5 | Today 신호 충돌·SessionDetail 4 패널·dev 메타 |
| Performance (1차+2차) | 2 | 3 | ingest 7.45s/394KB·error retry bail·LCP 후행 |
| Dark Pattern (DSA Art.25) | 2 | 3 | 선착순 한정 자기모순·VAT 미표시·해지 비대칭 |

총 Critical 8 / High 11 / Medium 9 / Low 4.

## 3. /nova:review — 코드 적대적 리뷰

| 등급 | 건수 | 대표 |
|------|------|------|
| Critical | 3 | C1 ingest race / C2 bin/awm 3263줄 / C3 isAssistantBoilerplate inline regex |
| High | 7 | normalizeSeverity·i18n 매직스트링·truncate magic·serveLocalApp·tests 격차·Sessions lint·phase-sync SSOT |
| Medium | 5 | buildSessionRisks O(P×S)·reset 호출자·worktree hook·rebuildChain 메모리·pickSessionRisk[0]만 |
| Low | 1 | lint warnings 3건 |

판정: FAIL.

## 4. Critical 11건 묶음 (C8a sprint 대상)

### A. 데이터 신뢰 (4)
- **A1**: Today KPI 4 `TODAY_COUNT={22,4,3,76%}` hardcoded vs timeline 실데이터 불일치 — `web/src/screens/Today.tsx:9`
- **A2**: Risk false positive 5건이 "고위험" 톤으로 노출, FP 라벨 없음 — `web/src/screens/Risk.tsx` + `web/src/state/ingest.ts:108`
- **A3**: SessionDetail commandCount=0 14/30 빈 패널 vs mock fallback mix — `web/src/screens/SessionDetail.tsx`
- **A4**: Audit Integrity가 "실데이터 7장" 분류였으나 화면 자체 "데모 mock 한계" 자백 → 분류 정정 + 실 hash chain 결과 노출

### B. 데이터 인프라 (2 — B3는 R1 sprint로 분리)
- **B1**: `/api/ingest` 콜드 7.45s + raw 394KB, 4 화면 동시 의존 — `bin/awm.mjs` sessions에 flowSteps·commandSamples·evidence·commitCandidates 함께 적재 → level=summary 분리
- **B2**: `state/ingest.ts:192-193` error 1회 후 영구 빈 + force=true race condition → AbortController + 지수 백오프 (1s→2s→4s)
- ~~B3~~: `bin/awm.mjs` 3263줄 단일 파일 5+ 함수 누적 → **R1 별도 sprint (Phase D 진입 전, 1~2일)**

### C. UX 일관성·법적 리스크 (3)
- **C1**: DSA Art.25 — Pricing "선착순 5팀 한정 + 한정 없음" 자기모순 + VAT 별도 미표시 — `web/src/lib/seed/publicLanding.ts:31,133,197` + `web/src/routes/public/Pricing.tsx:29-65`
- **C2**: WCAG 1.4.3 — `.eyebrow` `#0066ff` on `#fff` = 4.07:1 (AA 미달, /audit?tab=principles 법적 산출물) — `web/src/styles/global.css:244-247`
- **C3**: dev 메타(AppLogo "m2 prototype" + Topbar 페르소나 토글) inside-app 영구 노출 — `web/src/layout/AppLogo.tsx:6` + `Topbar.tsx:46-48` → `isLocalEnv()` 분기

### D. 코드 본질 (1)
- **D1**: `bin/awm.mjs:1771` `isAssistantBoilerplate` 14 한국어 패턴 inline regex → `BOILERPLATE_PATTERNS` 데이터 분리

## 5. 잘 되어 있는 점 (보존)

1. **prefers-reduced-motion 전역 + forced-colors 2회 분기** — `global.css:649-657, 360-364, 1521-1538`
2. **Tabs ARIA 일관 패턴** — `Audit/Sessions/Risk` 모두 `role=tablist/tab/aria-selected` + 화살표 키
3. **i18n 카탈로그 102 키 + 한국어 평이체** (C7 효과) + **토큰 시스템 171개** + **Skeleton + SWR 60s + Route lazy split**
4. **Sidebar devOnly + isLocalEnv() 격리** — 메뉴에서는 적용. AppLogo·Topbar로 확장만 하면 §12.5 완전 해소.
5. **`humanizeAuditSummary` view-layer 분리 패턴** — `rawSummary` 보존 + 화면 노출용으로만 verb 변환 (C3 설계 결정 모범).
6. **`narrowRiskSearchable`** — false positive 원인 좁히기 + 사유 주석 보존 (C4).
7. **C2~C6 unit test 63건 누적** — sprint별 발견/fix/검증 트리플렛 명확.

## 6. 분류상 한계

평가 자료의 24/31장이 mock seed라 *실 사용 결함* 발견 신뢰도는 7장에 집중. mock 화면 결함은 *시각·일관성·DSA·접근성* 영역으로만 유효 (코드 자체 진단). Onboarding/Workspace/Settings/Pricing은 실 가입·결제·팀이 없으므로 본질적으로 mock 잔존. Incident는 실 사고 발생 시 ingest 응답에 incidents 키가 생기면 실데이터화 가능 — 후속.

## 7. 다음 단계

- **C8a sprint** (현재 fix 대상): A 4 + B 2 + C 3 + D 1 = **10건**. `docs/projects/plans/c8a-critical-fix.md` 참조.
- **R1 sprint** (Phase D 진입 전): bin/awm.mjs 5분할 — `bin/lib/{view-verbs,intent,risk-fanout,repo-parser,http-routes}.mjs`
- C8 dogfooding: C8a + R1 PASS 후 진입.

## 8. Refs

- 캡쳐 31장: `docs/verifications/screenshots/2026-05-13-phase-c-review/`
- Phase C 분해: `docs/projects/plans/local-dogfooding-ready.md`
- Phase C7 PASS: `docs/verifications/phase-c7-jargon.md`
- 룰: `.claude/rules/{phase-sync,ui-consistency-tracks,operations-sync}.md`
