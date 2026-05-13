# Phase·Sprint 싱크 룰

페이즈/스프린트/exit criteria/다음 행동(NEXT_ACTION)을 변경할 때 *세 곳을 항상 함께* 갱신한다. 한 곳만 바꾸면 /dev/status 화면이 NOVA-STATE.md와 어긋나고, 일주일 뒤 본인이 *어디까지 했는지* 추적 불가.

## 1. 동기화 대상 3곳 (SSOT)

| 파일 | 역할 | 갱신 단위 |
|------|------|---------|
| `NOVA-STATE.md` | 매 세션 자동 로드 — Goal·Phase·Blocker·Tasks·Recently Done·Refs | 세션 단위 |
| `web/src/lib/dev/projectStatus.ts` | /dev/status 화면이 읽음 — PHASES·SPRINTS·NEXT_ACTION·PROJECT_META | sprint 단위 |
| `docs/projects/plans/<현재 페이즈>.md` | 마스터 plan — CPS + sprint 분해 + 의존성 그래프 + exit criteria | phase 단위 |

선택 갱신:
- `docs/projects/STATUS.md` — 화면 매트릭스가 변동될 때만 (새 화면 추가·삭제·재배치)
- `web/src/App.test.tsx` — StatusBoard 테스트가 NEXT_ACTION sprint id·phase 라벨을 검증하면 동시 갱신

## 2. 트리거 (싱크 의무 발생 시점)

- **페이즈 전환**: 새 페이즈 진입(예: B→C) 또는 종료. 항상 3곳 모두 갱신.
- **스프린트 추가/삭제**: 새 sprint(예: C9) 신설, 기존 sprint 폐기. 3곳 갱신.
- **스프린트 상태 전환**: pending → next → done. 최소 NOVA-STATE Tasks + projectStatus.SPRINTS 둘.
- **NEXT_ACTION 변경**: 활성 sprint가 done되어 다음 sprint로 넘어갈 때. projectStatus.NEXT_ACTION + NOVA-STATE Last Activity.
- **Exit criteria 충족**: PASS·CONDITIONAL PASS·FAIL 결정. 3곳 모두 + `docs/verifications/<sprint>.md` 신규.
- **마스터 plan 분해 변경**: sprint 의존성·exit·범위 수정. plan + projectStatus + NOVA-STATE.

## 3. 체크리스트 (트리거 발생 시 따라가기)

```
[ ] NOVA-STATE.md
    [ ] Phase 라인에 현재 페이즈 + 다음 페이즈 흐름 갱신
    [ ] Tasks 표 — 활성 페이즈 sprint들이 상위에, 완료된 페이즈는 압축 행으로
    [ ] Blocker — 해소된 항목 ~~취소선~~ + 신규 항목 추가
    [ ] Last Activity — 한 줄 요약 + 검증 수치 + 산출물 ref + 날짜
    [ ] 50줄 권고 초과 시 압축 영역 트림

[ ] web/src/lib/dev/projectStatus.ts
    [ ] PHASES — 새 페이즈 status active/pending/done 일치
    [ ] SPRINTS — 활성 페이즈 sprint들로 교체. 완료 페이즈 sprint는 PHASES에 흡수
    [ ] NEXT_ACTION — 다음 한 가지 sprint id + 1 문장 detail + primaryRoute
    [ ] PROJECT_META — currentCommit·lastUpdated 갱신
    [ ] M25_SPRINTS·DEV_TRACK_SPRINTS는 closed면 압축 1행만

[ ] docs/projects/plans/<현재 페이즈>.md
    [ ] 새 페이즈 진입 시 신규 plan (CPS + sprint 표 + 의존성 그래프 + exit criteria + 1인 sustainability)
    [ ] sprint exit 충족 시 그 행에 PASS/FAIL 표시 + 검증 ref
    [ ] 의존성 변동 시 그래프 갱신

[ ] (선택) docs/projects/STATUS.md — 화면 매트릭스 변동 시
[ ] (선택) web/src/App.test.tsx — StatusBoard 테스트가 변경 라벨 검증 시
[ ] 빌드+테스트 PASS 확인 (`cd web && npm test -- --run`)
[ ] projectStatus.ts 변경 시: `npm run build && npm run serve:restart`
    (dist/는 정적 serve라 자동 reload 없음 — 빌드 안 하면 /dev/status 화면 stale)
```

## 4. 회피할 안티 패턴

- ❌ NOVA-STATE만 갱신하고 projectStatus.ts는 그대로 — /dev/status 화면이 옛날 페이즈 그대로 노출. 본인이 헷갈림.
- ❌ projectStatus.ts만 갱신하고 NOVA-STATE는 그대로 — 다음 세션 시작 시 자동 로드되는 NOVA-STATE가 stale. 새 세션 Claude가 *옛날 페이즈로 작업 시작*.
- ❌ plan 신설 없이 NOVA-STATE에 sprint 표만 추가 — 마스터 분해(의존성 그래프·CPS·exit 근거)가 사라져 *왜 이 sprint인가* 추적 불가.
- ❌ NEXT_ACTION을 갱신 안 함 — Linear inbox 패러다임 깨짐. /dev/status 진입자가 *지금 무엇 해야* 모름.
- ❌ Phase 전환 후 1인 sustainability 검토 누락 — sprint가 모두 *1주 안에* 끝나는지, 직렬·병렬 구성이 1인 운영에 맞는지 plan에서 명시.
- ❌ projectStatus.ts 갱신 후 build·serve:restart 빠뜨림 — TS·테스트는 통과해도 dist/가 옛날 스냅샷 그대로라 /dev/status가 stale. 사용자가 "왜 싱크 안 맞춰?"로 인지 (2026-05-13 C2 sprint에서 발견).

## 5. 정합성 검증 (수동, 자동화 backlog)

지금은 수동 — sprint 갱신 후 본인이 다음 명령으로 확인:

```bash
# 1. 빌드+테스트 통과
cd web && npm test -- --run

# 2. /dev/status 진입 — 새 페이즈/스프린트가 보이는지 육안
npm run serve   # (이미 실행 중이면 npm run serve:restart)
open http://127.0.0.1:5173/dev/status

# 3. NOVA-STATE Phase 라인과 PHASES 활성 항목이 같은지 grep으로 빠르게
grep -E "active'|status: 'active'" web/src/lib/dev/projectStatus.ts
grep "Phase:" NOVA-STATE.md
```

자동 정합성 스크립트는 `npm run check:docs` (operations-sync.md §5)에 포함될 예정 — 현재 미구현. 구현 시 본 룰의 3곳 동기화 검증을 그 안에 통합.

## 6. 적용 대상

- `web/src/lib/dev/projectStatus.ts` 변경
- `NOVA-STATE.md` Phase·Tasks·Blocker 변경
- `docs/projects/plans/*.md` 신규 또는 sprint 분해 변경
- 페이즈 전환·스프린트 신설·exit 충족·블로커 해소가 발생한 작업 직후 *항상*

## 7. 읽는 컴포넌트 하드코딩 라벨

`web/src/screens/dev/StatusBoard.tsx` 같은 *읽기* 컴포넌트에 페이즈/트랙 이름이 하드코딩되어 있으면 페이즈 전환 시 stale 노출. *동적으로 활성 페이즈에서 가져와야* 한다.

- `PHASES.find((p) => p.status === 'active')`로 활성 페이즈 1개 추출
- 헤더·뱃지·툴팁 모두 동적 라벨 사용
- 옛날 사례: `m2 Sprint` 하드코딩 → `Phase {id} — {label} — Sprint`로 정정 (2026-05-13)
