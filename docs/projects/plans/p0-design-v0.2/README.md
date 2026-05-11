# AWM 디자인 v0.2 시안 (lock)

claude.ai/design 누적 세션의 3번째 라운드. v0(2026-05-10 H1·H2·H3 16화면) → v0.1(2026-05-11 H4·Workspace·Settings 7화면) → **v0.2(2026-05-11 외부 페이지 14화면)**.

## 무엇이 추가됐는가 (v0.1 → v0.2)

PRD v2.1 §12 외부 페이지 영역(랜딩·가격·가입·법무·회사·에러·상태)이 추가됐다. 미가입자가 만나는 *public-facing* 화면. 가입 후 inside-app(v0.1)과는 *flat top-bar + footer* 레이아웃으로 분리.

| 카테고리 | 화면 수 | 가설 띠 | 페이지 ID |
|---|---|---|---|
| 랜딩 | 1 | landing 가설 (Hero scroll·CTA 전환) | `public.landing` |
| 가격 | 1 | pricing 가설 (Active Operator 정의 → 트라이얼 ≥15%) | `public.pricing` |
| 가입·로그인·비밀번호 | 3 | signup 가설 (가입→H4 화면1 ≤90초) | `public.signup` / `.login` / `.reset` |
| 법무 | 4 | 가설 없음 | `public.terms` / `.privacy` / `.refund` / `.biz` |
| 회사 | 1 | 가설 없음 (1인 운영 4 블록 솔직 톤) | `public.company` |
| 에러 | 3 | 가설 없음 | `public.err404` / `.err500` / `.maint` |
| 상태 페이지 | 1 | 가설 없음 (1인 운영 가시성 정책) | `public.status` |

## 어떻게 열어보는가

```bash
open docs/projects/plans/p0-design-v0.2/index.html   # macOS
python3 -m http.server -d docs/projects/plans/p0-design-v0.2 4000  # → http://localhost:4000
```

사이드바 그룹 "Public Pages" 선택 후 14화면 순회 + 라이트/다크 토글 점검 권장.

## 디자이너 의사결정 (chats/chat-3.md 10개 결정)

1. **사이드바·페르소나 토글 끔** — 외부 페이지는 `public-shell.jsx` 별도 layout. sidebar group의 `external: true` 플래그로 분기.
2. **가설 띠는 page 단위**(landing/pricing/signup만). 나머지 10개는 "Public · 가설 검증 대상 아님" 회색.
3. **가상 인물·회사명 금지 강화** — `PUBLIC_NEWS` 4건은 PRD §1.4 외부 보도(Newsweek·X thread·BBC·METR)만, *출처 chip*과 함께.
4. **결제 단위 Active Operator 고정 (4지점 반복)** — 가격·랜딩·약관 §2·환불 정책. Reviewer/Admin은 항상 무료.
5. **법무 4종 = placeholder + 핵심 callout만** — TOC + AWM 고유 정책 callout(1인 운영·transcript 미저장·§27 보존) + 표 형식 핵심 데이터(Active Operator 정의·보존 기간·환불 3-column) + "법무 자문 후 작성 예정" 회색 박스.
6. **회사 페이지 4 블록 솔직 톤** — 왜 1인 / 어떻게 보완 / 무엇을 안 함 / 무엇이 무너질 수 있나. PRD §11.3과 동일 카피.
7. **상태 페이지 무음 시간대도 즉시 갱신**. 사고 히스토리는 *외부 의존성*(PopBill·OpenAI·GitHub Webhook)만. v0.1 사건과 cross-link 안 함.
8. **가입 후 자동 점프 H4 화면 1** — 가입 폼 우측에 *5분 first-value* 미리보기. 가입 = 진행 게이지 0/5.
9. **사업자 정보 슬롯 = 회색 placeholder** — `PUBLIC_BIZ.bizNo / ecommNo = ""` single source. 실제 번호 입력 시 footer·사업자 정보 페이지 동시 동기화.
10. **chats/chat-{1,2,3}.md 분리** — 결정 추적 단위 lock. chat-4는 D2(디자인 파트너 모집)에 진행.

## v0.2 → v0.1 → v0 누적 화면 인벤토리 (총 37화면 + Risk Radar 8 카테고리)

| 그룹 | 화면 | 페르소나 / 가설 띠 |
|---|---|---|
| H1 · 회상 사이클 | 6 | Operator · 미설명 62→≤15% |
| H2 · 결제 트리거 | 5 | Admin · 결제 전환 →≥30% |
| H3 · 10분 RCA | 5 | Reviewer · 62분→≤10분 |
| H4 · 5분 first-value 온보딩 | 5 | Admin · 온보딩 →≤5분 |
| Workspace (supporting) | 3 | Admin · 가설 없음 |
| Settings (supporting) | 4 | Admin · 가설 없음 |
| **Public Pages (v0.2 신규)** | 14 | landing/pricing/signup만 가설 |
| **추가**: Risk Radar 8 카테고리 신호 (H3 내) | (화면 1) | — |

## 토큰 / 폰트

- v0.1과 **완전 동일**한 Wanted LaaS 토큰 + Pretendard. 새 색·폰트 추가 0건.
- `fonts/*.subset.woff2` 9개(2.3MB) 동봉. `tokens.css`는 fallback URL 제거 패치본.
- `styles.css`는 596줄(v0.1) → 1,092줄(v0.2). public 레이아웃(`pub-topbar`, `pub-footer`, `pub-hero`, `pub-pricing`, `pub-legal-toc`, `pub-status-row` 등) 추가.

## 본 저장소 적용한 수정 (v0.2 시안 원본 → repo)

1. **`data.jsx` line 359** — H3 가치 블록 `mini` 라벨에서 raw ID `"s-024 · INC-26-014 연결"`을 `"사건 ↔ 세션 ↔ commit 자동 cross-link"`로 교체. Decision 3(*내부 식별자는 가입 후 화면에서만*)과 정합. 본 변경은 우리가 시안 입수 후 적용한 minor edit이며, 디자이너 의도와 일치하는 카피 수정.
2. **`tokens.css`** — 9 `@font-face` 블록의 woff/otf fallback URL 제거, `Pretendard Variable` 블록 제거. subset.woff2 only.
3. **`fonts/`** — `*.subset.woff2` 9개만 보존. 원본 .otf/.woff/.ttf/full woff2/Variable 제외(43MB→2.3MB).

## v2.x로 미루는 항목 (v0.2에서도 미정의)

| 항목 | 사유 |
|------|------|
| 블로그 / 콘텐츠 마케팅 | §8.4 채널 결정 후. CMS 선택(MDX·Notion·Sanity) 별도 자문 |
| 공개 API 문서 / GitHub App 가이드 | API 안정화 후 |
| PR kit · 데모 영상 | D2 결제 검증 후 |
| 다국어 (en·ja) | D3 글로벌 진입 후 |
| 본인 인증 / 휴대폰 인증 | 결제 트리거 검증 후 |
| 법무 4종 실제 문구 | `docs/areas/regulatory/legal-pages.md` 자문 트래커 |

## 다음 단계

- 코드 이식 Plan: `docs/projects/plans/m2.5-public-pages-from-design.md` (작성 예정)
- 법무 4종 문구: `docs/areas/regulatory/legal-pages.md` 단계 1~5
- 결제 단위 Active Operator 정의는 PRD §7.1 / §11.2 / v0.2 4지점 카피 동기화 유지 (변경 시 4곳 모두)
- PRD v2.1 §12 → v2.2에 v0.2 결과 보강 사항 누적 (사용자 결정)

## 참고

- 1차 라운드 프롬프트: [`../p0-claude-design-prompts.md`](../p0-claude-design-prompts.md)
- 2차 라운드 프롬프트: [`../p0.1-claude-design-prompts-round2.md`](../p0.1-claude-design-prompts-round2.md)
- 3차 라운드 프롬프트: [`../p0.2-claude-design-prompts-round3.md`](../p0.2-claude-design-prompts-round3.md)
- v0+v0.1 시안 (inside-app): [`../p0-design-v0/`](../p0-design-v0/)
- Claude Design 원본 README: [`HANDOFF.md`](./HANDOFF.md)
- PRD §12 외부 페이지 영역: [`../../PRD.md#12-public-pages`](../../PRD.md#12-public-pages)
- 법무 트래커: [`../../areas/regulatory/legal-pages.md`](../../areas/regulatory/legal-pages.md)
