# Phase C7 — Incident·Reviewer 깊은 화면 jargon 평이화

> Sprint: `docs/projects/plans/local-dogfooding-ready.md` C7.
> 트리거: 평소 dogfooding에는 영향 적지만 *사고 발생 시 진입*하는 깊은 화면들의 영어 jargon이 평이성을 해침. C2 i18n 작업 때 navigation/사이드바는 처리됐으나 *본문*은 잔존.

## 일자
2026-05-13

## 환경
- 변경: `web/src/screens/Incident.tsx` + `web/src/screens/incident/{Replay,EventDetail,ReviewerBrief}.tsx` + `web/src/lib/i18n/messages.ko.ts` + `web/src/App.test.tsx`

## 변환 매핑

### Incident.tsx (HEADERS + button)
| 영어 jargon | 한국어 |
|---|---|
| Reviewer Brief — s-024 | 검토 요약 — s-024 |
| Incident Note (button + heading) | 사고 메모 |
| ← Replay | ← 재생 |
| ← Event detail | ← 이벤트 상세 |
| Postmortem 양식 | 사후 분석 양식 |
| 우측 detail | 우측 상세 |

### Replay.tsx
| | |
|---|---|
| 이벤트 detail (heading) | 이벤트 상세 |
| cross-reference (eyebrow) | 관련 자료 |
| Reviewer Brief — 의도 vs 결과 | 검토 요약 — 의도 vs 결과 |
| 매칭 commit | 매칭 커밋 |
| Audit Trail row aud-001 | 감사 기록 행 aud-001 |

### EventDetail.tsx
| | |
|---|---|
| 이벤트 핵심 fact | 이벤트 핵심 사실 |
| 변조 불가 audit row 기반 | 변조 불가 감사 기록 행 기반 |
| 매칭 commit | 매칭 커밋 |
| Audit Trail · ev-2401 | 감사 기록 · ev-2401 |
| commit f08c4b2 | 커밋 f08c4b2 |
| Reviewer Brief · 의도 vs 결과 | 검토 요약 · 의도 vs 결과 |
| lock wait spike | lock wait 급증 |
| cross-reference / cross-link (eyebrow) | 관련 자료 / 관련 링크 |
| audit log에 기록 | 감사 기록에 기록 |
| Reviewer Brief에서 의도(Operator Explain Back) | 검토 요약에서 의도(Operator 설명 메모) |
| Reviewer Brief 열기 | 검토 요약 열기 |
| Audit Trail row aud-001 | 감사 기록 행 aud-001 |

### ReviewerBrief.tsx
| | |
|---|---|
| 의도 — Operator Explain Back + AI 자동 추출 | 의도 — Operator 설명 메모 + AI 자동 추출 |
| Explain Back · 직접 작성 | 설명 메모 · 직접 작성 |
| 검토 액션은 audit log에 기록됩니다 | 검토 액션은 감사 기록에 남습니다 |

### 의도적 유지
- *Slack 공유*, *Datadog APM*, *Operator*, *CONCURRENTLY* — 고유명사·기술 용어
- *T0 16:31*, *prod*, *dev*, *commit hash*, *score 94%* — 기술 약어·고정 라벨

## i18n 카탈로그 (후속 t() 도입용)

`web/src/lib/i18n/messages.ko.ts`에 incident.* + common.* 12 키 추가:
```ts
'incident.tab.replay': '재생',
'incident.tab.event': '이벤트 상세',
'incident.tab.reviewer': '검토 요약',
'incident.tab.note': '사고 메모',
'incident.action.reviewerBrief': '검토 요약',
'incident.action.explainBack': 'Operator 설명 메모',
'incident.action.postmortem': '사후 분석 양식',
'common.audit.row': '감사 기록 행',
'common.audit.log': '감사 기록',
'common.cross.reference': '관련 자료',
'common.cross.link': '관련 링크',
'common.commit': '커밋',
```

지금은 *literal 한국어 직접 교체* (4 파일 surgical). 컴포넌트에서 `t()` 호출 도입은 후속 sprint — 키만 사전 정의해 *후속 import + t() 치환*만 하면 됨.

## 테스트 갱신

`web/src/App.test.tsx` 4건:
- `Reviewer Brief — s-024` → `검토 요약 — s-024`
- `Operator Explain Back` → `Operator 설명 메모`
- `이벤트 detail` → `이벤트 상세`
- `Incident Note` → `사고 메모`
- `이벤트 핵심 fact` → `이벤트 핵심 사실`

## 검증

```
$ npx vitest run
Test Files  10 passed (10)
     Tests  119 passed (119)
$ cd web && npm test -- --run                # 71 passed
$ cd web && npx tsc --noEmit                 # clean
$ npm run build                              # built in 149ms
$ npm run serve:restart                      # PID 38877
```

## 잔여 영어 (의도적 유지)
- 도메인 코드명 (`s-024`, `aud-001`, `ev-2401`, `f08c4b2`) — ID·해시
- 외부 시스템명 (`Slack`, `Datadog APM`)
- 기술 약어 (`prod`, `dev`, `CONCURRENTLY`, `T0`, `EXPLAIN ANALYZE`, `lock wait`)
- 사용자 역할 (`Operator` — PRD 정의된 도메인 용어)

## Refs

- master plan: `docs/projects/plans/local-dogfooding-ready.md` C7 행
- 이전 i18n 작업: C2 sprint 시점 i18n 카탈로그 도입 (사이드바 + Today 본문)
- 코드: `web/src/screens/Incident.tsx`, `web/src/screens/incident/*.tsx`, `web/src/lib/i18n/messages.ko.ts`, `web/src/App.test.tsx`
