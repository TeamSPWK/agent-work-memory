# X-Verification: agent-work-memory(AI Audit Trail SaaS, 한국 SMB 대상, jay@spacewalk.tech **1인 창업자** 

> 날짜: 2026-05-11
> 합의율: 75%
> 판정: human_review
> AI: claude, gpt, gemini

## 질문
agent-work-memory(AI Audit Trail SaaS, 한국 SMB 대상, jay@spacewalk.tech **1인 창업자** 운영) frontend·backend·auth 스택 선택 자문.

## 컨텍스트
- v1(Vite+React+Node CLI, 8개월 개발) 2026-05-10 archive(legacy-v1 브랜치). 디자인부터 다시 시작.
- v0.1 디자인 시안(claude.ai/design, React 18 UMD+Babel standalone 프로토타입, 23화면, Wanted LaaS Pretendard 토큰) 2026-05-11 lock.
- PRD 핵심 4가설: (H1) Operator 회상 cycle - 미설명 세션 62%→≤15%, (H2) Compliance 결제 트리거 - 인공지능기본법 시행(2026-01-22 시행됨), (H3) 10분 RCA - 62분→≤10분, (H4) 5분 first-value 온보딩.
- 백엔드 요구:
  * 변조 불가 SHA-256 hash chain (audit immutability)
  * 인공지능기본법 7대 원칙 자동 보고서 PDF export
  * 토스페이먼츠 + 자동 세금계산서 연동 (한국 B2B 결제)
  * Row-level security (workspace_id 격리)
  * GitHub App webhook receiver
  * 한국 latency (서울/도쿄 region 필요)
  * 1인 운영 sustainability (managed services 우선)
- 트래픽 예상 초기: 디자인 파트너 5팀 × 30명 = 150 활성 사용자. 6개월 후 50팀 × 30명 = 1,500 활성. 동시접속 50 미만.
- 1년 운영 예산 cap: 600만원/년(한 사람 인건비 0원 가정 — 본인). $4,000~5,000.

## 후보 stack (4안)
(A) Next.js 15 + Supabase Tokyo + Clerk + Vercel + 토스페이먼츠
(B) Vite+React SPA + Supabase Tokyo + Supabase Auth + Vercel + 토스페이먼츠
(C) SvelteKit + Supabase Tokyo + Supabase Auth + Vercel + 토스페이먼츠
(D) Next.js + Vercel Postgres + Auth.js + Vercel + 토스페이먼츠

## 질문
다음을 모두 답변:
1. 위 4안 중 1인 창업자 / 한국 SMB Audit / 인공지능기본법 emphasized 제약에서 가장 권고하는 것 1개와 그 근거.
2. 각 안의 1년 운영비 추정 (Vercel + DB + Auth + 결제수수료 분리). KRW 환산.
3. 가장 큰 위험 1개씩.
4. v0.1 디자인(React 18 UMD JSX 23화면 + Wanted LaaS Pretendard 토큰)에서 코드 이식 비용 예상(분량 vs. 재작성 vs. 그대로 변환).
5. 본 자문에서 빠진 중요한 옵션·차원이 있다면.

## claude
# 스택 자문: agent-work-memory v2

---

## 1. 권고안: **(A) Next.js 15 + Supabase Tokyo + Clerk + Vercel**

### 근거
| 요인 | 설명 |
|------|------|
| **1인 운영** | Clerk = 세션·MFA·조직 관리 완전 위임. Auth 버그 대응 0 |
| **Audit Immutability** | Supabase RLS + pg_audit + Edge Function으로 hash chain 구현 최적 |
| **한국 latency** | Supabase Tokyo(ap-northeast-1) + Vercel Tokyo PoP → p95 < 80ms |
| **인공지능기본법** | Next.js API Route에서 PDF 생성 파이프라인 집중 관리 용이 |
| **이식 비용** | React 18 컴포넌트 → Next.js App Router 변환이 4안 중 가장 직접적 |

> ⚠️ Clerk 비용이 변수. 아래 비용표 참조.

---

## 2. 1년 운영비 추정

### 환율 기준: $1 = ₩1,380

| 항목 | (A) Next+Clerk | (B) Vite+SupaAuth | (C) SvelteKit | (D) Next+Vercel PG |
|------|---------------|-------------------|---------------|-------------------|
| **Vercel** | Pro $20/mo → **₩331k** | Pro $20/mo → **₩331k** | Pro $20/mo → **₩331k** | Pro $20/mo → **₩331k** |
| **DB** | Supabase Pro $25/mo → **₩414k** | Supabase Pro $25/mo → **₩414k** | Supabase Pro $25/mo → **₩414k** | Vercel Postgres $20/mo → **₩331k** |
| **Auth** | Clerk $25/mo(150 MAU Free→유료 1500시) → **₩0~1,035k** | Supabase 포함 → **₩0** | Supabase 포함 → **₩0** | Auth.js OSS → **₩0** |
| **소계/년** | **₩8.9M~10.4M** | **₩8.9M** | **₩8.9M** | **₩7.9M** |
| **결제수수료** | 토스 1.5~3.3% 별도 | 동일 | 동일 | 동일 |
| **예산 초과?** | ⚠️ 한계 | ✅ 적합 | ✅ 적합 | ✅ 가장 저렴 |

> **Clerk 주의**: MAU 1,000 초과 시 $0.02/MAU → 1,500명 = $30/mo 추가. 연 ₩500k 추가.  
> (A)는 예산 한계선. **Clerk → Supabase Auth 교체 시 (B)와 동일 비용**.

---

## 3. 안별 최대 위험 1개

| 안 | 최대 위험 |
|----|----------|
| **(A)** | Clerk 가격 인상·정책 변경 시 Auth 마이그레이션 비용 전액 부담 (vendor lock) |
| **(B)** | Supabase Auth는 Enterprise SSO·조직 관리 미흡 → 고객사 IT팀 요구 대응 한계 |
| **(C)** | SvelteKit 생태계가 React 대비 협소 → 외주·

## gpt
**권고: (B) Vite+React + Supabase Tokyo + Supabase Auth + Vercel**  
이유: **최저 복잡도/비용**, React 프로토타입 이식 용이, **RLS·Postgres·Storage·Edge Functions**로 감사로그/보고서/PDF 구현 적합. 1인 운영에 Clerk보다 단순하고, (D)는 **RLS/감사 불변성 약함**, (C)는 생산성 리스크.

**1년 운영비(대략)**  
- **A**: Vercel 30~60만 + Supabase 40~120만 + Clerk 0~60만 + 결제수수료 별도 → **70~240만+수수료**  
- **B**: Vercel 30~60만 + Supabase 40~120만 + Auth 포함 0원 → **70~180만+수수료**  
- **C**: **B와 유사 70~180만+수수료**  
- **D**: Vercel 60~180만 + Postgres 20~80만 + Auth.js 운영비 0~20만 → **80~280만+수수료**  
※ 토스: 대략 **매출의 2~3%대+VAT**, 세금계산서 SaaS 별도.

**각 안 최대 위험**  
- **A**: Clerk-Supabase 권한모델 이중화  
- **B**: Supabase Auth의 엔터프라이즈 SSO/세밀 정책 한계  
- **C**: 생태계/채용보다 **학습·디버깅 리스크**  
- **D**: 감사 SaaS 핵심인 **RLS/immutable audit 구현 부담**

**v0.1 이식 비용**  
- 화면/UI 23개 기준 **60~70% 재사용 가능**  
- UMD+Babel → Vite 모듈화/라우팅/상태 재구성 필요  
- **디자인 토큰은 거의 그대로**, 비즈니스 로직은 사실상 재작성  
- 체감: **“스타일 이식 + 앱 구조 재작성”**

**빠진 중요 옵션**  
- **Cloudflare Pages/Workers+D1/R2** 비용절감 검토  
- PDF는 브라우저보다 **서버 생성** 권장  
- 해시체인은 DB 트리거+주기적 외부 앵커링(S3/Git tag 등) 검토  
- **국내 개인정보/로그 보존정책** 명시 필요

## gemini
**1. 권고: (B) Vite+React SPA + Supabase**
1인 운영 효율 극대화에 최적입니다. SEO가 중요치 않은 Audit SaaS 특성상 Next.js의 SSR 복잡도보다 SPA의 단순함이 유리하며, Supabase의 RLS(Row Level Security)는 SMB 간 데이터 격리를 코드 레벨이 아닌 인프라 레벨에서 완벽히 보장합니다.

**2. 1년 운영비 추정 (약 120~150만 원)**
*   **Vercel:** Pro 플랜 $240 (~34만 원)
*   **DB/Auth:** Supabase Pro + Compute Add-on 약 $300 (~42만 원)
*   **결제:** 토스페이먼츠 연동(가입비 22만 원, 수수료 별도)
*   예산(600만) 대비 매우 안정적입니다.

**3. 각 안의 최대 위험**
*   (A) **Clerk:** SMB 확장 시 MAU 기반 비용 급증 및 벤더 락인.
*   (B) **로직 파편화:** DB RLS와 클라이언트 로직 간의 동기화 관리 부담.
*   (C) **생태계:** 1인 개발 시 라이브러리/레퍼런스 부족으로 인한 속도 저하.
*   (D) **비용:** Vercel Postgres의 트래픽 대비 높은 과금 위험.

**4. 코드 이식 비용**
*   **예상:** 2주 내외(1인 기준). 23개 화면의 JSX를 Functional Component로 분할하고 Pretendard 토큰을 Tailwind/CSS 변수로 매핑하는 '재작성형 변환'이 유지보수 측면에서 유리합니다.

**5. 누락된 차원**
*   **Audit Immutability:** SHA-256 체인의 신뢰성 증명을 위해 외부 타임스탬프(TSA) 서버 연동이나 AWS QLDB 같은 원장 DB 고려가 필요합니다.
*   **PDF Export:** 클라이언트 사이드 PDF 생성은 한글 폰트 깨짐이 잦으므로, Lambda(도쿄) 기반의 서버리스 PDF 렌더러 구축이 필수적입니다.

## 합의 분석
- **합의율**: 75%
- **판정**: human_review
- **요약**: 인프라(Supabase)와 위험 요소에는 합의가 이루어졌으나, 프레임워크(Next.js vs Vite)와 인증 솔루션 선택에 따른 비용/복잡도 트레이드오프가 존재하므로 창업자의 숙련도에 따른 최종 판단이 필요함.

### 공통점
- Supabase(Tokyo Region)를 핵심 백엔드/DB 인프라로 사용하는 것에 전원 합의
- 1인 운영의 지속가능성을 위해 Vercel, Supabase 등 Managed Service 활용 권장
- Clerk 사용 시 향후 MAU 증가에 따른 비용 상승 및 벤더 락인 위험성 공통 지적
- PDF 리포트 생성은 한글 폰트 및 안정성을 위해 서버사이드(Edge Functions/Lambda) 처리 권장
- v0.1 디자인 시안의 JSX/토큰은 재사용 가능하나 앱 구조는 재작성(Refactoring)이 필요하다는 점

### 차이점
- 최종 권고안: Claude는 Next.js 15 + Clerk(A안)을, GPT와 Gemini는 Vite + Supabase Auth(B안)를 추천
- 운영비 추정: Claude는 연간 800~1,000만 원대의 높은 비용을 산출(계산 오류 의심)한 반면, GPT/Gemini는 예산 범위 내(100~200만 원대)로 판단
- 프레임워크 선택 논리: Claude는 API Route 활용성을 강조했으나, Gemini는 Audit SaaS 특성상 SEO가 불필요하므로 SPA(Vite)의 단순함을 강조
