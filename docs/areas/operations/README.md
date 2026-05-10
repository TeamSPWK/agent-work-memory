# Operations Area

agent-work-memory의 1인 창업자 운영 영역. Spacewalk 사업자 명의로 진행.

룰: [.claude/rules/operations-sync.md](../../../.claude/rules/operations-sync.md)

## 라우터

| 영역 | 파일 | 빈도 | 비고 |
|------|------|------|------|
| **비용 산정** | [cost-stages.md](cost-stages.md) | Stage 변경 시 | 가설 / 실측 |
| **MRR 추적** | mrr-tracker.md *(TBD)* | 매주 | 결제 시작 후 |
| **고객 상태** | customer-status.md *(TBD, git-crypt)* | 변화 시 | 디자인 파트너 5팀 |
| **가격 변경 이력** | pricing-history.md *(TBD)* | 변경 시 | PRD §7 변동 추적 |
| **Weekly Review** | [weekly-review-template.md](weekly-review-template.md) → weekly-review.md *(TBD)* | 매주 | 30분 |
| **결제·세무** | payment-and-tax.md *(TBD)* | v2.0 출시 시 | 토스페이먼츠 가맹·세금계산서 자동화 |
| **사고 이력** | incidents.md *(TBD)* | 발생 시 | 운영 사고 (제품 사고 ≠) |

## 운영 원칙

- 모든 운영 결정·실측은 git에 (민감 데이터는 git-crypt)
- 외부 SaaS(Notion 등) 운영 데이터 X
- 매주 30분 Weekly Review (1인 sustainability 한계)
- 정합성 스크립트로 PRD ↔ 실제 운영 자동 비교 (구현 예정)

## 다음 단계

- v2.0 dogfooding 시작 시 weekly-review.md 누적 시작
- 첫 디자인 파트너 결제 시 mrr-tracker.md·customer-status.md 신규
- 토스페이먼츠 가맹 시 payment-and-tax.md 신규
