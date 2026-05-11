/* Public pages shared shell — flat top-bar + footer
   Used by landing / pricing / auth / legal / company / errors / status */

const { PUBLIC_BIZ, PUBLIC_HYPS } = AWMData;

function PublicTopBar({ active, gotoPublic }) {
  const links = [
    { id: "landing", label: "제품" },
    { id: "pricing", label: "가격" },
    { id: "company", label: "회사" },
    { id: "status",  label: "상태" },
  ];
  return (
    <div className="pub-topbar">
      <div className="left">
        <div className="brand" onClick={() => gotoPublic?.("landing")} style={{ cursor: "pointer" }}>
          <div className="mark">A</div>
          <div className="name">AWM <span className="muted" style={{ font: "var(--t-caption1)", marginLeft: 4 }}>· Agent Work Memory</span></div>
        </div>
        <nav className="menu">
          {links.map(l => (
            <a key={l.id}
               className={active === l.id ? "on" : ""}
               onClick={() => gotoPublic?.(l.id)}
               style={{ cursor: "pointer" }}>
              {l.label}
            </a>
          ))}
        </nav>
      </div>
      <div className="right">
        <button className="btn sm" onClick={() => gotoPublic?.("login")}>로그인</button>
        <button className="btn sm primary" onClick={() => gotoPublic?.("signup")}>5분 시작</button>
      </div>
    </div>
  );
}

function PublicFooter({ gotoPublic }) {
  return (
    <div className="pub-footer">
      <div className="top">
        <div className="brand-col">
          <div className="brand" style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <div className="mark" style={{ width: 24, height: 24, borderRadius: 6, background: "var(--text-strong)", color: "var(--bg-base)", display: "grid", placeItems: "center", font: "var(--t-caption1-strong)" }}>A</div>
            <b style={{ font: "var(--t-label1-strong)", color: "var(--text-strong)" }}>Agent Work Memory</b>
          </div>
          <div className="desc">
            AI가 만든 변경을 사람이 다시 설명할 수 있게.
            인공지능기본법 §27 자동 보고서 SaaS · 1인 창업자 운영.
          </div>
        </div>
        <div className="col">
          <h5>제품</h5>
          <ul>
            <li><a onClick={() => gotoPublic?.("landing")} style={{ cursor: "pointer" }}>제품 소개</a></li>
            <li><a onClick={() => gotoPublic?.("pricing")} style={{ cursor: "pointer" }}>가격</a></li>
            <li><a onClick={() => gotoPublic?.("status")} style={{ cursor: "pointer" }}>상태 페이지</a></li>
            <li><a onClick={() => gotoPublic?.("signup")} style={{ cursor: "pointer" }}>회원가입</a></li>
          </ul>
        </div>
        <div className="col">
          <h5>회사</h5>
          <ul>
            <li><a onClick={() => gotoPublic?.("company")} style={{ cursor: "pointer" }}>회사 · 1인 운영</a></li>
            <li><a onClick={() => gotoPublic?.("biz")} style={{ cursor: "pointer" }}>사업자 정보</a></li>
            <li><a href={`mailto:${PUBLIC_BIZ.email}`}>{PUBLIC_BIZ.email}</a></li>
            <li><a>채널톡 문의</a></li>
          </ul>
        </div>
        <div className="col">
          <h5>법무</h5>
          <ul>
            <li><a onClick={() => gotoPublic?.("terms")} style={{ cursor: "pointer" }}>이용약관</a></li>
            <li><a onClick={() => gotoPublic?.("privacy")} style={{ cursor: "pointer" }}>개인정보처리방침</a></li>
            <li><a onClick={() => gotoPublic?.("refund")} style={{ cursor: "pointer" }}>환불 정책</a></li>
            <li><a onClick={() => gotoPublic?.("biz")} style={{ cursor: "pointer" }}>사업자 정보</a></li>
          </ul>
        </div>
      </div>
      <div className="biz">
        <div className="lines">
          <b>{PUBLIC_BIZ.company}</b> · 대표 {PUBLIC_BIZ.ceo} · 사업자등록번호 <span className="empty" style={{ color: "var(--text-disable)" }}>{PUBLIC_BIZ.bizNo || "[사업자 등록 후 입력]"}</span><br />
          통신판매업 신고번호 <span className="empty" style={{ color: "var(--text-disable)" }}>{PUBLIC_BIZ.ecommNo || "[신고 후 입력]"}</span> · 데이터 거주국 Tokyo<br />
          고객문의 {PUBLIC_BIZ.email} · {PUBLIC_BIZ.channel}
        </div>
        <div className="sig">
          © 2026 {PUBLIC_BIZ.company}<br />
          마지막 개정 {PUBLIC_BIZ.updated}
        </div>
      </div>
    </div>
  );
}

/* Page-level metric band — landing / pricing / signup */
function PageBand({ pageId }) {
  const hyp = PUBLIC_HYPS[pageId];
  if (!hyp) {
    return (
      <div className="pub-banner none">
        <div>
          <div className="ttl">Public · 외부 페이지</div>
          <div className="stm" style={{ color: "var(--text-neutral)" }}>가설 검증 대상 아님 · 미가입자 도달용 페이지</div>
        </div>
        <div className="meta" style={{ justifyContent: "flex-end" }}>측정 지표 없음</div>
        <div className="muted tnum" style={{ font: "var(--t-caption1)" }}>flat top-bar + footer</div>
      </div>
    );
  }
  return (
    <div className="pub-banner">
      <div>
        <div className="ttl">{pageId === "landing" ? "랜딩 가설" : pageId === "pricing" ? "가격 가설" : "가입 가설"}</div>
        <div className="stm">{hyp.statement}</div>
      </div>
      <div className="meta">
        <span>검증 지표</span>
        <b>{hyp.metric}</b>
        <span className="muted tnum">{hyp.metricFrom}</span>
        <Icon name="arrow" size={14} />
        <b className="tnum" style={{ color: "var(--c-violet-45)" }}>{hyp.metricTo}</b>
      </div>
      <div className="muted tnum" style={{ font: "var(--t-caption1)", whiteSpace: "nowrap" }}>v0.2 · 외부</div>
    </div>
  );
}

function PublicShell({ pageId, children, gotoPublic }) {
  return (
    <>
      <PageBand pageId={pageId} />
      <div className="pub-shell">
        <PublicTopBar active={pageId} gotoPublic={gotoPublic} />
        <div>{children}</div>
        <PublicFooter gotoPublic={gotoPublic} />
      </div>
    </>
  );
}

window.AWMPublicShell = { PublicTopBar, PublicFooter, PageBand, PublicShell };
