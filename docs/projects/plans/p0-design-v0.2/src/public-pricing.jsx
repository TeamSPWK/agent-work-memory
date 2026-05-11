/* Public · 가격 페이지 — 3 tiers + Active Operator 정의 + 비교표 + FAQ */

const { PublicShell } = AWMPublicShell;
const { PUBLIC_TIERS, PUBLIC_COMPARE, PUBLIC_FAQ_PRICING } = AWMData;

function PricingScreen({ gotoPublic }) {
  return (
    <PublicShell pageId="pricing" gotoPublic={gotoPublic}>
      <section className="sec" style={{ paddingBottom: 32 }}>
        <div style={{ textAlign: "center", maxWidth: 760, margin: "0 auto 28px" }}>
          <div className="eyebrow-pub">가격 · 결제 단위는 Active Operator</div>
          <h2>일하는 사람만 카운트합니다.</h2>
          <p className="lead" style={{ margin: "12px auto 0" }}>
            Reviewer·Admin은 활동 무관 무료. 인공지능기본법 §27 보고서는 모든 결제 티어에 포함됩니다.
          </p>
        </div>

        <div className="dp-chip-row">
          <Icon name="share" size={16} />
          디자인 파트너 5팀 한정 50% · 격주 인터뷰 1회 조건 · 기간 한정 없음 · 선착순 종료
        </div>

        <div className="tier-grid">
          {PUBLIC_TIERS.map(t => (
            <div key={t.id} className={"tier" + (t.id === "team" ? " feat" : "")}>
              {t.dp50 && <div className="dp50">디자인 파트너 5팀 한정 50%</div>}
              <div>
                <div className="tname">{t.name}</div>
                <div className="tdesc">{t.desc}</div>
              </div>
              <div className="tprice">
                {t.priceStrike && <span className="strike">{t.priceStrike}</span>}
                <span className="v">{t.priceLabel}</span>
                <span className="per">{t.per}</span>
              </div>
              <button className={"btn lg tcta " + (t.id === "team" ? "primary" : "")} onClick={() => gotoPublic?.(t.id === "free" || t.id === "team" ? "signup" : "company")}>
                {t.cta}
              </button>
              <ul>
                {t.items.map((it, i) => (
                  <li key={i} className={it.ok ? "" : "no"}>{it.t}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="aop-def">
          <div className="ico">A</div>
          <div className="tx">
            <b>Active Operator 정의</b> — 지난 30일 1회 이상 AI 작업이 기록된 사용자.
            Reviewer·Admin은 활동량과 무관하게 항상 무료입니다.
            카운트는 매일 자정 (KST) 갱신되며, 워크스페이스 → Members 화면에서 실시간 확인할 수 있습니다.
          </div>
        </div>
      </section>

      {/* 비교 표 */}
      <section className="sec alt">
        <div className="eyebrow-pub">전체 비교</div>
        <h2>티어 별 12 항목.</h2>
        <p className="lead">데이터 거주국·SLA·환불·세금계산서까지 한 표에. 미입력 슬롯은 사업자 등록 후 자동 채워집니다.</p>
        <div style={{ overflowX: "auto" }}>
          <table className="compare">
            <thead>
              <tr>
                <th style={{ width: "32%" }}>항목</th>
                <th>Free</th>
                <th>Team</th>
                <th>Business</th>
              </tr>
            </thead>
            <tbody>
              {PUBLIC_COMPARE.map((r, i) => (
                <tr key={i}>
                  <td>{r.row}</td>
                  <td className={r.free === "—" ? "no" : r.free === "✓" ? "ok" : ""}>{r.free}</td>
                  <td className={r.team === "—" ? "no" : r.team === "✓" ? "ok" : ""}>{r.team}</td>
                  <td className={r.biz === "—" ? "no" : r.biz === "✓" ? "ok" : ""}>{r.biz}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* FAQ */}
      <section className="sec">
        <div className="eyebrow-pub">FAQ</div>
        <h2>결제 전 자주 묻는 5 가지.</h2>
        <div className="faq" style={{ maxWidth: 820 }}>
          {PUBLIC_FAQ_PRICING.map((f, i) => (
            <details key={i} open={i === 0}>
              <summary>{f.q}</summary>
              <div className="a">{f.a}</div>
            </details>
          ))}
        </div>
        <div className="muted" style={{ font: "var(--t-caption1)", marginTop: 18 }}>
          본 페이지의 환불 관련 문구는 <a className="link" onClick={() => gotoPublic?.("refund")} style={{ cursor: "pointer" }}>환불 정책</a>이 우선합니다.
          1인 운영 sustainability는 <a className="link" onClick={() => gotoPublic?.("company")} style={{ cursor: "pointer" }}>회사 페이지</a>에서 솔직하게 적었습니다.
        </div>
      </section>

      {/* CTA */}
      <section className="sec dark">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
          <div>
            <h2 style={{ margin: 0 }}>가격을 보셨으면 다음은 5분.</h2>
            <p style={{ margin: "8px 0 0", color: "rgba(255,255,255,0.7)" }}>워크스페이스 생성 → AI 도구 connect → 첫 세션 import.</p>
          </div>
          <button className="btn primary lg" onClick={() => gotoPublic?.("signup")}>
            5분 안에 워크스페이스 만들기 <Icon name="arrow" size={14} />
          </button>
        </div>
      </section>
    </PublicShell>
  );
}

window.AWMPublicPricing = { PricingScreen };
