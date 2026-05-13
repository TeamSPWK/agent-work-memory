# M0/S1 — v1 자산 회수 + 합성 테스트 결과

> 본 문서는 `docs/projects/plans/m0-tech-hypothesis-validation.md` S1 sprint 실측 결과.
> Branch: `tech-validation/m0` (main 보호)

## 일자
2026-05-12

## Exit Criteria (S1 기준)

| 항목 | 기준 | 결과 |
|------|------|------|
| v1 자산 회수 | `git checkout legacy-v1-2026-05-10 -- bin/ tests/ package.json vitest.config.mjs` | ✅ PASS — 9 파일 회수 (bin 4 + tests 3 + manifest 2) |
| npm install | exit 0 + 보안 취약점 0 | ✅ PASS — 82 packages, 0 vulnerabilities, deprecated 경고 1건(node-domexception, non-blocking) |
| 합성 테스트 재실행 | NOVA-STATE *"P1 매칭 11/11 critical"* 기준 | ✅ PASS — vitest 4.1.6, **23/23** Tests 3 Files (match·persist·github) Duration 384ms |
| `npm run cli help` 동작 | help 출력 | ✅ PASS — 13 명령 노출 (login·repo link·capture install/event/sample/wrap·discover·github·ingest·serve·session·today) |
| `awm discover` 실작업 | Claude Code / Codex 폴더 탐지 | ✅ PASS — Claude Code 2,691 files (948.74 MB) + Codex CLI 26 files (783.70 MB) + Gemini missing. `.awm/discovery.json` 생성 |
| `awm ingest --limit 5` | 세션 인덱싱 + `.awm/ingest.json` 생성 | ✅ PASS — Sessions 5 + Risks 0 + Repositories 2 |

## 발견 — S2~S3에 영향 주는 사실

### 1. 테스트 수 차이 (메타-검증)

NOVA-STATE에 *"P1 매칭 11/11 critical"* 로 기록되어 있었으나 실제는 **23/23** (3 파일 합산). 11/11은 *critical만 카운트*했을 가능성 — 이건 정확한 검증 분량이 *과소 기록*된 사례. PRD §1.1 line 40 *"기술 검증 완료"* 단정과 같은 패턴이다. NOVA-STATE 기재 시 *카운트 기준*을 함께 적는 룰 필요.

### 2. **Hash chain 검증 CLI 미구현** ⚠️

`awm help` 출력에 `verify` 또는 `audit` 또는 `integrity` 관련 명령 없음. PRD §5.5 *"SHA-256 해시 체인 최소 구현. 각 이벤트가 직전 이벤트 해시를 포함, 무결성 검증 명령 제공"* 은 **v1에 코드 없음**.

→ H2-b 측정 불가 (현 시점). 별도 task 신설 필요 (NOVA-STATE Tasks에 추가).

→ PRD §6.2 표 *"Audit Layer — 자산 재사용 80%"* 도 과대 평가. 실제는 영속화 골격(S1~S2.5)만 80%, hash chain은 0%.

### 3. 캡처 데이터 분량 충분

본인 작업 누적 — Claude Code 2,691 files 948 MB + Codex CLI 26 files 783 MB. S2 자기 캡처 1주에 *데이터 부족*은 위험 아님. 오히려 *누락 탐지 기준 명확화*가 핵심 — 본인이 한 작업 vs 캡처된 세션 차분을 어떻게 잴 것인가.

### 4. `awm github` 명령 존재

GitHub App webhook receiver 회수됨. M0에서는 *로컬 git*만 매칭 검증해도 충분 (M1 Foundation에서 GitHub App 연결 검증).

## 다음 (S2)

| Task | 기준 |
|------|------|
| S2-a 본인 캡처 1주 누적 | 영업일 ≥ 5일, 매일 마지막 본인 기억 vs `.awm/ingest.json` 차분 기록 |
| S2-b V0 측정 | 손실 0 + 누락률 ≤ 5% (m0 plan 측정 표 V0 행) |
| **신규 task — H2-b hash chain CLI 최소 구현** | PRD §5.5 정의 따라 events 해시 체인 + verify 명령. M0/S3 H2-b 측정 전제 |

## Refs
- Plan: `docs/projects/plans/m0-tech-hypothesis-validation.md`
- v1 자산 출처: tag `legacy-v1-2026-05-10`
- 회수 명령 로그: `git checkout legacy-v1-2026-05-10 -- bin/ tests/ package.json vitest.config.mjs`
- 회수된 파일: `bin/{awm,github,match,persist}.mjs` + `tests/{github,match,persist}.test.mjs` + `package.json` + `vitest.config.mjs`
