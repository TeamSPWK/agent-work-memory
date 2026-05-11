/* Public · 회사 페이지 — 1인 운영 솔직 톤 */

const { PublicShell } = AWMPublicShell;
const { PUBLIC_BIZ } = AWMData;

function CompanyScreen({ gotoPublic }) {
  return (
    <PublicShell pageId="company" gotoPublic={gotoPublic}>
      {/* Hero */}
      <section className="cmp-hero">
        <div className="who">
          <div className="pic">J</div>
          <div>
            <div className="eyebrow-pub" style={{ color: "var(--accent-strong)" }}>Spacewalk · 1인 창업자</div>
            <div style={{ font: "var(--t-label1-strong)", color: "var(--text-strong)" }}>{PUBLIC_BIZ.ceo} · {PUBLIC_BIZ.email}</div>
          </div>
        </div>
        <h2>1인 창업자가 만드는<br />AI Audit Trail SaaS.</h2>
        <p className="lead">
          AWM은 AI가 만든 변경을 사람이 다시 설명할 수 있게 돕는 도구입니다.
          숨길 마음이 없어서, "왜 1인인지 · 어떻게 보완하는지 · 무엇을 안 하는지 · 무엇이 무너질 수 있는지"를 이 페이지에 솔직히 적었습니다.
        </p>
      </section>

      {/* 2 · 3 · 4 — 왜 · 어떻게 · 안 하나 */}
      <section className="sec">
        <div className="cmp-twocol" style={{ gridTemplateColumns: "1fr 1fr" }}>
          <div className="cmp-block">
            <div className="eyebrow-pub">왜 1인인가</div>
            <h4>2026년에 1인이 가능해졌기 때문입니다.</h4>
            <p>
              AI 도구를 매일 쓰면서, 1인이 SaaS 전체를 코드 · 디자인 · 운영까지 끌고 갈 수 있는 시점이 왔다고 판단했습니다.
              그래서 회사를 키우기 전에 <b>먼저 자신의 도구로 검증</b>해 보기로 했습니다.
              AWM은 그 검증 자체이기도 합니다 — AI가 만든 변경을 1인 운영자가 다시 설명할 수 있는가.
            </p>
            <p>
              마케팅 카피로 쓰지 않습니다. "lean", "founder-led", "scrappy" 같은 단어 대신 1인이라는 사실 그대로 노출합니다.
            </p>
          </div>

          <div className="cmp-block">
            <div className="eyebrow-pub">어떻게 보완하는가</div>
            <h4>5 가지 보완 장치.</h4>
            <ul className="dodo">
              <li><b style={{ color: "var(--text-strong)" }}>Self-serve 온보딩 (H4)</b> — 영업 없이 5분 안에 첫 세션 import.</li>
              <li><b style={{ color: "var(--text-strong)" }}>영업시간 채널톡</b> — 1~2 영업일 내 응답.</li>
              <li><b style={{ color: "var(--text-strong)" }}>자동 응답</b> — 무음 시간대 안내 + 다음 영업시간 예약.</li>
              <li><b style={{ color: "var(--text-strong)" }}>상태 페이지</b> — 무음 시간 사고도 즉시 갱신.</li>
              <li><b style={{ color: "var(--text-strong)" }}>Notifications 무음 시간대</b> — Pretendard 운영 sustainability.</li>
            </ul>
          </div>
        </div>

        <div className="cmp-twocol" style={{ marginTop: 24, gridTemplateColumns: "1fr 1fr" }}>
          <div className="cmp-block">
            <div className="eyebrow-pub" style={{ color: "var(--status-negative)" }}>무엇을 안 하나</div>
            <h4>1인 상태에서 거짓이 될 약속.</h4>
            <ul className="dontdo">
              <li>24/7 SLA</li>
              <li>엔터프라이즈 영업·온사이트 미팅</li>
              <li>전화·실시간 채팅 응답</li>
              <li>다국어 · 글로벌 진입 (D3 글로벌 단계 전)</li>
              <li>PR 키트 · 공식 데모 영상</li>
              <li>커스터마이즈 컨설팅</li>
            </ul>
          </div>

          <div className="cmp-block risk-block">
            <div className="eyebrow-pub" style={{ color: "var(--status-cautionary)" }}>무너질 수 있는 자리</div>
            <h4>키맨 위험 · 번아웃 · 이탈.</h4>
            <p>
              1인 운영의 가장 큰 위험은 <b>창업자 본인의 번아웃·건강·이탈</b>입니다.
              PRD §11.3에 동일 카피로 명시했고, 디자인 파트너 계약에도 같은 문장이 들어갑니다.
            </p>
            <ul className="dodo">
              <li><b style={{ color: "var(--text-strong)" }}>데이터 export</b> — Settings → Audit Export에서 언제든 PDF · JSON으로 빼낼 수 있습니다.</li>
              <li><b style={{ color: "var(--text-strong)" }}>Source escrow</b> — 6개월 미응답 시 코드·데이터를 디자인 파트너에게 인수인계하는 절차를 계약서에 명시 (자문 진행 중).</li>
              <li><b style={{ color: "var(--text-strong)" }}>월 운영 보고</b> — uptime · 응답 시간 · 결제 잔액을 매월 1일 상태 페이지에 공개.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* 6 · 누가 만드나 */}
      <section className="sec alt">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28, alignItems: "stretch" }}>
          <div className="cmp-block">
            <div className="eyebrow-pub">누가 만들고 있나</div>
            <div className="who" style={{ display: "flex", gap: 14, alignItems: "center", marginBottom: 10 }}>
              <div className="pic" style={{ width: 56, height: 56, borderRadius: 999, background: "linear-gradient(135deg, var(--accent-normal), var(--c-pink-50))", color: "#fff", display: "grid", placeItems: "center", font: "var(--t-heading3)" }}>J</div>
              <div>
                <div style={{ font: "var(--t-heading3)", color: "var(--text-strong)" }}>{PUBLIC_BIZ.ceo}</div>
                <div className="muted" style={{ font: "var(--t-caption1)" }}>{PUBLIC_BIZ.email}</div>
              </div>
            </div>
            <p>
              제품 · 디자인 · 코드 · 운영 · 고객 응답 · 회계까지 한 사람이 합니다.
              영업·온사이트는 하지 않습니다. 채널톡과 메일이 1차 채널입니다.
            </p>
            <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
              <a className="btn" href={`mailto:${PUBLIC_BIZ.email}`}>
                <Icon name="share" size={14} /> 메일 보내기
              </a>
              <button className="btn">
                <Icon name="bell" size={14} /> 채널톡 열기
              </button>
            </div>
          </div>

          <div className="cmp-block" style={{ background: "var(--text-strong)", color: "#fff", borderColor: "transparent" }}>
            <div className="eyebrow-pub" style={{ color: "rgba(255,255,255,0.55)" }}>디자인 파트너 모집</div>
            <h4 style={{ color: "#fff" }}>선착순 5팀 · 50% 할인 · 격주 인터뷰 1회.</h4>
            <p style={{ color: "rgba(255,255,255,0.75)" }}>
              제품 가설 검증에 함께해 주실 5팀을 모집합니다. 기간 한정이 아니라 <b style={{ color: "#fff" }}>인원이 채워지면</b> 종료됩니다.
              계약서에는 키맨 위험·source escrow 조항이 동일하게 들어갑니다.
            </p>
            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <button className="btn primary lg" style={{ background: "#fff", color: "var(--text-strong)" }}>
                디자인 파트너 신청
              </button>
              <button className="btn lg" style={{ background: "transparent", borderColor: "rgba(255,255,255,0.3)", color: "#fff" }} onClick={() => gotoPublic?.("pricing")}>
                가격 보기
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 마지막 CTA */}
      <section className="sec" style={{ paddingTop: 40 }}>
        <div style={{ textAlign: "center", maxWidth: 640, margin: "0 auto" }}>
          <div className="eyebrow-pub">제품으로 돌아가기</div>
          <h2 style={{ marginTop: 6 }}>지금이 1인 SaaS가 가능한지 검증할 시간입니다.</h2>
          <p className="lead" style={{ margin: "10px auto 18px" }}>
            먼저 자신의 도구로 검증해 본 결과는 매월 상태 페이지에 공개합니다.
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: 10 }}>
            <button className="btn primary lg" onClick={() => gotoPublic?.("signup")}>
              5분 안에 워크스페이스 만들기
            </button>
            <button className="btn lg" onClick={() => gotoPublic?.("status")}>
              상태 페이지 보기
            </button>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}

window.AWMPublicCompany = { CompanyScreen };
