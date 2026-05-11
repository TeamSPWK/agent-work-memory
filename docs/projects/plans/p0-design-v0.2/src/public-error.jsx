/* Public · Error pages (404 / 500 / Maintenance) + Status page */

const { PublicShell } = AWMPublicShell;
const { PUBLIC_STATUS } = AWMData;

function ErrShell({ pageId, code, codeClass, title, desc, gotoPublic }) {
  return (
    <PublicShell pageId={pageId} gotoPublic={gotoPublic}>
      <div className="err-shell">
        <div className="err-card">
          <div className={"err-code " + codeClass}>{code}</div>
          <h3>{title}</h3>
          <p>{desc}</p>
          <div className="err-links">
            <button className="btn primary" onClick={() => gotoPublic?.("landing")}><Icon name="home" size={14} /> 랜딩으로</button>
            <button className="btn" onClick={() => gotoPublic?.("pricing")}>가격 페이지</button>
            <button className="btn" onClick={() => gotoPublic?.("status")}><Icon name="radar" size={14} /> 상태 페이지</button>
          </div>
          <div className="muted" style={{ font: "var(--t-caption1)", marginTop: 14, maxWidth: 380, lineHeight: 1.6 }}>
            계속 문제가 있다면 <b style={{ color: "var(--text-neutral)" }}>jay@spacewalk.tech</b>로 메일을 보내주세요.
            영업시간 1~2 영업일 내 회신합니다.
          </div>
        </div>
      </div>
    </PublicShell>
  );
}

function Err404Screen({ gotoPublic }) {
  return (
    <ErrShell
      pageId="err404"
      code="404"
      codeClass=""
      title="찾으시는 페이지를 찾을 수 없습니다."
      desc="주소가 변경되었거나 삭제되었을 수 있습니다. 어디로 가시겠어요?"
      gotoPublic={gotoPublic}
    />
  );
}

function Err500Screen({ gotoPublic }) {
  return (
    <ErrShell
      pageId="err500"
      code="500"
      codeClass="warn"
      title="일시적인 오류가 발생했습니다."
      desc="페이지를 새로고침해 보세요. 문제가 계속되면 상태 페이지에서 외부 의존성 (OpenAI · Anthropic · 토스페이먼츠) 상황을 확인해 주세요."
      gotoPublic={gotoPublic}
    />
  );
}

function MaintScreen({ gotoPublic }) {
  return (
    <ErrShell
      pageId="maint"
      code="🛠"
      codeClass="cau"
      title="잠시 점검 중입니다."
      desc="배포·DB 마이그레이션·외부 의존성 점검 중일 수 있습니다. 평균 10~20분 내 복구됩니다."
      gotoPublic={gotoPublic}
    />
  );
}

/* ============ 상태 페이지 ============ */
function StatusScreen({ gotoPublic }) {
  const overall = PUBLIC_STATUS.overall;
  const overallClass = overall.state === "ok" ? "" : overall.state === "warn" ? "warn" : "neg";
  const overallIcon = overall.state === "ok" ? "check" : overall.state === "warn" ? "warn" : "warn";

  /* 30 day uptime bars — mostly green, a few warn/neg matching incident dates */
  const days = Array.from({ length: 30 }, (_, i) => {
    if (i === 1 || i === 18) return "warn";
    if (i === 7) return "neg";
    return "ok";
  });

  return (
    <PublicShell pageId="status" gotoPublic={gotoPublic}>
      <section className="sec" style={{ paddingTop: 36, paddingBottom: 20 }}>
        <div className="eyebrow-pub">상태 페이지 · 외부 의존성 포함</div>
        <h2>1인 운영 가시성 정책 · 무음 시간대에도 즉시 갱신.</h2>
        <p className="lead">상태 페이지는 무음 시간대 (밤 9시 ~ 오전 8시)에도 사고가 발생하면 자동으로 갱신됩니다. 자체 서비스와 외부 의존성을 분리해 표기합니다.</p>

        <div className="status-head">
          <div className={"big " + overallClass}>
            <Icon name={overallIcon} size={28} />
          </div>
          <div>
            <h3>{overall.label}</h3>
            <div className="lead" style={{ margin: 0 }}>{overall.note}</div>
          </div>
          <div className="right">
            <div className="upl">최근 30일 uptime</div>
            <div className="uptime">{PUBLIC_STATUS.uptime30}</div>
            <div className="muted" style={{ font: "var(--t-caption2)", marginTop: 4 }}>외부 의존성 제외 시 99.89%</div>
          </div>
        </div>

        <div className="card" style={{ marginTop: 18 }}>
          <div className="card-h">
            <h3>최근 30일</h3>
            <div className="sub">자체 + 외부 의존성 합산 · 매 5분 폴링</div>
          </div>
          <div className="svc-table">
            <span style={{ display: "block", padding: "0 0 12px" }}>
              <div className="bars" style={{ display: "flex", gap: 2 }}>
                {days.map((d, i) => (
                  <span key={i} className={d === "ok" ? "" : d === "warn" ? "warn" : "neg"}
                        style={{ width: 14, height: 28, borderRadius: 2,
                                  background: d === "ok" ? "var(--status-positive)"
                                            : d === "warn" ? "var(--status-cautionary)"
                                            : "var(--status-negative)" }}>
                  </span>
                ))}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", font: "var(--t-caption2)", color: "var(--text-assistive)", marginTop: 6 }}>
                <span>30일 전</span><span>오늘</span>
              </div>
            </span>
          </div>
        </div>
      </section>

      {/* 서비스 별 상태 */}
      <section className="sec alt">
        <div className="eyebrow-pub">서비스 별 상태</div>
        <h2>7 개 서비스 · 외부 의존성 포함.</h2>
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <table className="svc-table" style={{ width: "100%" }}>
            <thead>
              <tr>
                <th>서비스</th>
                <th style={{ width: 120 }}>상태</th>
                <th>비고</th>
              </tr>
            </thead>
            <tbody>
              {PUBLIC_STATUS.services.map((s, i) => (
                <tr key={i}>
                  <td><b style={{ color: "var(--text-strong)", font: "var(--t-label1-strong)" }}>{s.name}</b></td>
                  <td>
                    <span className={"tag " + (s.state === "ok" ? "green" : s.state === "warn" ? "orange" : "red")}>
                      <span className="dot"></span>
                      {s.state === "ok" ? "정상" : s.state === "warn" ? "점검 중" : "사고"}
                    </span>
                  </td>
                  <td className="muted">{s.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 사고 히스토리 */}
      <section className="sec">
        <div className="eyebrow-pub">사고 히스토리</div>
        <h2>최근 사고 3 건 · 외부 의존성 위주.</h2>
        <p className="lead">v0.1 사건 식별자 (s-021 / s-022 / s-024 / INC-26-014)와는 cross-link 하지 않습니다. 상태 페이지는 *외부 서비스 사고* 만 다룹니다.</p>
        <div className="inc-list">
          {PUBLIC_STATUS.history.map((h, i) => (
            <div key={i} className="inc-row">
              <div className="dt">{h.dt}</div>
              <div>
                <div className="ttl">{h.ttl}</div>
                <div className="meta">{h.meta}</div>
              </div>
              <button className="btn sm">자세히 <Icon name="chev" size={12} /></button>
            </div>
          ))}
        </div>

        <div className="aop-def" style={{ marginTop: 24 }}>
          <div className="ico">!</div>
          <div className="tx">
            <b>1인 운영 가시성 정책</b> — 상태 페이지는 자동 모니터링 (5분 폴링) + 무음 시간대 사고도 즉시 갱신됩니다.
            매월 1일 uptime · 응답 시간 · 결제 잔액을 같은 페이지에 공개합니다 (회사 페이지 §월 운영 보고 참조).
            본 시안의 사고 히스토리는 mock입니다.
          </div>
        </div>
      </section>
    </PublicShell>
  );
}

window.AWMPublicError = { Err404Screen, Err500Screen, MaintScreen, StatusScreen };
