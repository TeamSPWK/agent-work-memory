# Customer Area

고객 발굴·인터뷰·관리 영역. 1인 영업 한계 (PRD §8.6) 안에서.

룰: [.claude/rules/operations-sync.md](../../../.claude/rules/operations-sync.md)

## 라우터

| 영역 | 파일 | 빈도 |
|------|------|------|
| **인터뷰 protocol** | interview-protocol.md *(TBD)* | 변경 시. 일단 PRD §8.3 사용 |
| **인터뷰 노트 (익명화)** | interview-notes/ *(TBD)* | 인터뷰 시 |
| **디자인 파트너 상태** | design-partners.md *(TBD, git-crypt)* | 상태 변경 시 |
| **이탈 이력** | churn-log.md *(TBD)* | 이탈 발생 시 |
| **결제 결정자 매핑** | decision-makers.md *(TBD, git-crypt)* | 협의 진행 시 |

## 운영 원칙

- 실명 인용은 *동의 받은 사례*만 (룰 [`prd-and-strategy-collaboration.md` §2](../../../.claude/rules/prd-and-strategy-collaboration.md))
- 인터뷰 노트는 익명화 후 git, 미동의 정보·신원 정보는 git-crypt
- 모든 인터뷰는 PRD §8.3 5개 질문 기준
- 이탈 시 24시간 내 churn-log.md에 *왜 떠났는지* 기록 (1인 학습의 핵심)

## 1인 영업 한계 (PRD §8.6 인용)

- 월 4~8건 1:1 인터뷰
- 디자인 파트너 5팀 동시
- 한 번에 1~2팀 직렬 진입
- 24/7 지원 X — 영업시간 채널톡 + AI 1차 응답
- enterprise sales cycle (1년+) X — D3까지 미룸

## 고객 → 결제 funnel (가설)

```
인터뷰 후보 → 인터뷰 → 디자인 파트너 의향 → 50% 할인 결제 → 정가 전환 → 유지
```

각 단계 비율은 *데이터 누적 후* mrr-tracker.md와 함께 갱신.
