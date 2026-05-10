# 운영 동기화 룰

agent-work-memory는 1인 창업자(jay@spacewalk.tech, Spacewalk 사업자) 운영.
본 룰은 *문서 + 운영 데이터 + 실측*의 싱크를 유지해 6개월 뒤에도 제품 흐름과
운영 상태를 추적 가능하게 만든다.

## 1. 회피할 4가지 위험

| # | 위험 | 1인에서 어떻게 터지나 |
|---|------|---------------------|
| 1 | **싱크 누락** | PRD·NOVA-STATE에 적힌 가격/계획과 실제 결제·운영 분리 |
| 2 | **중복** | 같은 정보가 여러 문서에 들어가 한 곳만 갱신 시 나머지 stale |
| 3 | **발견성** | 6개월 뒤 *"그 결정 어디 있더라"* 추적 불가 |
| 4 | **실측 부재** | 계획만 있고 실제 청구서·MRR·해지율·인터뷰 응답이 어디에도 없음 |

## 2. PARA 구조 (Tiago Forte)

| 폴더 | 의미 | 예시 |
|------|------|------|
| `docs/projects/plans/` | 활성 작업 (시작·종료 있음) | M1 Plan, M2 Plan |
| `docs/areas/operations/` | 지속 운영 (비용·매출·고객·결제) | cost-stages.md, weekly-review.md |
| `docs/areas/regulatory/` | 규제 추적 (인공지능기본법 등) | ai-basic-law-tracker.md |
| `docs/areas/customer/` | 고객 인터뷰·상태 | interview-protocol.md |
| `docs/resources/` | 참조 자료 | PRD.md, DESIGN_SYSTEM.md |
| `docs/archive/` | 종료된 자료 | PRD-v1-tech-validation.md |

기존 루트 `docs/*.md`는 점진 이동 예정. **새 문서는 PARA에 따라 위치 결정**.

## 3. 운영 데이터 (data/) git-crypt

고객·결제·세무·인터뷰 노트 같은 민감 데이터:
- `data/` 디렉토리에 JSON/CSV
- **git-crypt로 특정 파일만 암호화**
- `.gitattributes` 패턴 — `data/customers.json filter=git-crypt diff=git-crypt`
- 1인이 GPG 키 관리. 분실 시 복구 불가 — 키 백업 필수.

## 4. Weekly Review (매주 30분)

매주 1회 `docs/areas/operations/weekly-review.md`에 누적:
- 결제·매출 (MRR ±)
- 고객·인터뷰 변화
- 비용·운영 (청구서 변동·사고)
- 제품 출시·다음 주 우선순위
- 깨진 싱크 (정합성 스크립트 결과)
- 핵심 결정 1문장

**매일 회고 안 함. 1인 sustainability 한계**.

## 5. 정합성 검증 (`npm run check:docs`, 추후 구현)

자동 비교 대상:
- `docs/resources/PRD.md` §7 가격 ↔ `data/pricing.json` ↔ `src/server/pricing.ts`
- PRD §3 페르소나 세그먼트 ↔ `data/customers.json` actual segments
- PRD §11 Open Questions ↔ `docs/areas/customer/interview-notes/` 답변 누적
- NOVA-STATE Tasks ↔ `docs/projects/plans/` 활성 plan 일치

깨졌으면 fail + 어디가 깨졌는지 명시.

## 6. 자체 제품 dogfooding (v2.0 출시 후)

agent-work-memory의 *Spacewalk-internal* 워크스페이스 1개를 운영용으로:
- 본인이 1차 사용자
- 비용 정산·고객 인터뷰·결제 처리 작업도 AI 캡처 → Audit Layer
- 제품 검증 + 실제 운영 데이터 통합 동시

## 7. 의식적 회피

- ❌ Notion·Airtable 외부 SaaS *운영 데이터* 보관 (외부 종속, *"그건 Notion 있는 거"* 함정)
- ❌ 매일 회고 (1인 부담 폭발)
- ❌ 자동 문서 생성 by AI (출처 추적 불가)
- ❌ docs 루트에 새 .md 무계획 추가 — PARA 분류 없이 쌓이면 발견성 0

## 8. 적용 대상

- 운영 결정 (가격·고객·비용·법무) 모든 변경
- 매주 Weekly Review
- 신규 .md 추가 시 PARA 위치 결정
- 민감 데이터 추가 시 git-crypt 검토
