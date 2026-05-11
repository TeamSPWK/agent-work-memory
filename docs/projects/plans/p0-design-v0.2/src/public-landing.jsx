/* Public · 랜딩 페이지 — 9 섹션 단일 스크롤 */

const { PublicShell } = AWMPublicShell;
const { PUBLIC_VALUE, PUBLIC_NEWS, PUBLIC_FLOW, PUBLIC_PRINCIPLES,
        PUBLIC_TIERS, PUBLIC_FAQ_LANDING, PUBLIC_BIZ } = AWMData;

function LandingScreen({ gotoPublic }) {
  return (
    <PublicShell pageId="landing" gotoPublic={gotoPublic}>
      {/* 1. Hero */}
      <section className="hero">
        <div>
          <div className="eyebrow-row">
            <span className="law-chip">
              <Icon name="audit" size={14} /> 인공지능기본법 §27 · 2026-01-22 시행됨
            </span>
          </div>
          <h1>AI가 만든 변경을<br />사람이 <em>다시 설명할 수 있게.</em></h1>
          <p className="sub">
            AWM은 AI 도구가 남긴 결과를 사람의 회상·감사·1차 원인 도출 사이클로 다시 연결합니다.
            인공지능기본법 §27 권고 양식의 PDF 보고서를 자동 생성합니다.
          </p>
          <div className="ctas">
            <button className="btn primary lg" onClick={() => gotoPublic?.("signup")}>
              5분 안에 워크스페이스 만들기 <Icon name="arrow" size={14} />
            </button>
            <button className="btn lg">
              디자인 파트너 신청 <Icon name="share" size={14} />
            </button>
          </div>
          <div className="muted" style={{ font: "var(--t-caption1)", marginTop: 14 }}>
            선착순 5팀 · 격주 인터뷰 1회 조건 · 50% 할인
          </div>
        </div>

        <div className="right">
          <div style={{ font: "var(--t-caption1-strong)", color: "var(--text-assistive)", letterSpacing: "0.06em", textTransform: "uppercase", padding: "4px 4px 6px" }}>
            오늘의 미설명 세션 · v0.1 미리보기
          </div>
          {[
            { kind: "v", t: "s-019 · 운영 매니저 (4년차)", s: "Claude Code · 직원 온보딩 자동 메일 한국어 톤 조정" },
            { kind: "o", t: "s-024 · 프론트엔드 (3년차)",  s: "Cursor · 결제 webhook 재시도 로직 보정 · 미설명" },
            { kind: "g", t: "s-021 · 마케터 (2년차)",       s: "Claude · 이벤트 페이지 카피 한국어 다듬기 · 회상 완료" },
          ].map((p, i) => (
            <div key={i} className="pp">
              <div className={"icn " + p.kind}>
                <Icon name={p.kind === "v" ? "file" : p.kind === "o" ? "warn" : "check"} size={16} />
              </div>
              <div>
                <div className="ttl">{p.t}</div>
                <p className="sub">{p.s}</p>
              </div>
              <Icon name="chev" size={14} />
            </div>
          ))}
          <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 4px 0", font: "var(--t-caption1)", color: "var(--text-assistive)" }}>
            <span>미설명 세션 비율</span>
            <span><b style={{ color: "var(--text-strong)" }}>62% <Icon name="arrow" size={10} /> 14%</b> · 4주 운영 mock</span>
          </div>
        </div>
      </section>

      {/* 2. 가치 3블록 */}
      <section className="sec">
        <div className="eyebrow-pub">3 가지 가설 · v0.1에서 검증 시작</div>
        <h2>회상 · 감사 · 1차 원인 — 사이클 한 바퀴.</h2>
        <p className="lead">
          AI는 빠르게 만들고, 사람은 더 빠르게 잊는다. 그래서 AWM은 만든 결과를 사람이 다시 설명할 수 있게 돌려놓습니다.
        </p>
        <div className="val-grid">
          {PUBLIC_VALUE.map(v => (
            <div key={v.h} className="val-card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span className={"tag " + v.color}>{v.h}</span>
                <span className="muted" style={{ font: "var(--t-caption1)" }}>{v.metric}</span>
              </div>
              <div className="vmetric">
                <span className="from">{v.from}</span>
                <Icon name="arrow" size={14} />
                <b>{v.to}</b>
              </div>
              <h3>{v.title}</h3>
              <p>{v.desc}</p>
              <div className="mini-screen">
                {v.mini.map((m, i) => (
                  <div key={i} className="row1">
                    <div className={"bar1 " + (i === 0 ? "acc" : i === 1 ? "red" : "gn")} style={{ flex: "0 0 32px" }}></div>
                    <span>{m}</span>
                  </div>
                ))}
              </div>
              <button className="link">
                v0.1 화면 보기 <Icon name="chev" size={12} />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* 3. 사회적 증거 */}
      <section className="sec alt">
        <div className="eyebrow-pub">왜 지금인가 · 외부 보도 사례</div>
        <h2>AI가 만든 결과, 사람이 더 이상 설명할 수 없다.</h2>
        <p className="lead">아래는 PRD §1.4에 인용된 외부 보도·연구 사례입니다. AWM은 가상 인물·회사명을 만들지 않습니다.</p>
        <div className="news-grid">
          {PUBLIC_NEWS.map((n, i) => (
            <div key={i} className="news-card">
              <div className="src">{n.src}</div>
              <div className="quote">"{n.quote}"</div>
              <div className="qmeta">
                <span className="tag neutral">{n.chip}</span>
                <a className="link">{n.link} <Icon name="chev" size={12} /></a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. 어떻게 작동하는가 */}
      <section className="sec">
        <div className="eyebrow-pub">어떻게 작동하는가</div>
        <h2>한 사이클에 4 단계.</h2>
        <p className="lead">5분 안에 첫 세션이 Today에 뜨고, 다음날부터 회상 → 감사 → 1차 원인까지 이어집니다.</p>
        <div className="flow-grid">
          {PUBLIC_FLOW.map(f => (
            <div key={f.step} className="flow-step">
              <div className="stp">{f.step}</div>
              <div className="nm">{f.name}</div>
              <div className="desc">{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. 인공지능기본법 카드 */}
      <section className="sec alt">
        <div className="eyebrow-pub">인공지능기본법 §27 · 7대 원칙 자동 보고서</div>
        <h2>5개 항목 ok · 2개 보강 권고 — PDF로 한 번에.</h2>
        <p className="lead">Settings → Audit Export에서 기간을 고르면 §27 권고 양식의 PDF가 생성됩니다.</p>
        <div className="law-card">
          <div className="lhead">
            <h3>워크스페이스 자동 점검</h3>
            <p>최근 30일 활동 기준 · 매일 자동 갱신 · 결과는 PDF 첫 페이지에 포함됩니다.</p>
            <div style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: 8 }}>
              <div className="kpi">
                <span className="v">5 / 7</span>
                <span className="l">충족 항목</span>
              </div>
              <div className="kpi">
                <span className="v" style={{ color: "var(--status-cautionary)" }}>2 / 7</span>
                <span className="l">보강 권고</span>
              </div>
            </div>
          </div>
          <div className="lbody">
            {PUBLIC_PRINCIPLES.map((p, i) => (
              <div key={i} className="law-row">
                <span className={"ic " + (p.state === "ok" ? "ok" : "warn")}>
                  {p.state === "ok" ? "✓" : "!"}
                </span>
                <div>
                  <div className="lt">{p.name}</div>
                  <div className="lst">{p.note}</div>
                </div>
                <span className="ls" style={{ color: p.state === "ok" ? "var(--status-positive)" : "var(--status-cautionary)" }}>
                  {p.state === "ok" ? "ok" : "권고"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. 1인 운영 fold-below */}
      <section className="sec tight">
        <div className="solo-fold">
          <div className="who">
            <div className="pic">J</div>
            <div>
              <b style={{ font: "var(--t-body1-strong)", color: "var(--text-strong)" }}>Spacewalk · jay</b>
              <div className="muted" style={{ font: "var(--t-caption1)" }}>1인 창업자 · {PUBLIC_BIZ.email}</div>
            </div>
          </div>
          <p>
            AWM은 1인 창업자가 만들고 있습니다. 24/7 SLA·엔터프라이즈 영업은 하지 않습니다.
            <b> 왜 1인인지, 어떻게 보완하는지</b>는 회사 페이지에 솔직하게 적었습니다.
          </p>
          <button className="link" onClick={() => gotoPublic?.("company")}>
            회사 페이지 <Icon name="chev" size={12} />
          </button>
        </div>
      </section>

      {/* 7. 가격 미리보기 */}
      <section className="sec alt">
        <div className="eyebrow-pub">가격 미리보기</div>
        <h2>3 티어 · 디자인 파트너 5팀 한정 50%.</h2>
        <p className="lead">결제 단위는 Active Operator (지난 30일 1회 이상 AI 작업이 기록된 사용자). Reviewer·Admin은 활동 무관 무료.</p>
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
              <button className="btn primary tcta" onClick={() => gotoPublic?.(t.id === "business" ? "pricing" : "signup")}>{t.cta}</button>
              <ul>
                {t.items.slice(0, 4).map((it, i) => (
                  <li key={i} className={it.ok ? "" : "no"}>{it.t}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div style={{ textAlign: "center", marginTop: 18 }}>
          <button className="link" onClick={() => gotoPublic?.("pricing")}>
            전체 비교 표 · FAQ 5개 보기 <Icon name="chev" size={12} />
          </button>
        </div>
      </section>

      {/* 8. FAQ */}
      <section className="sec">
        <div className="eyebrow-pub">FAQ</div>
        <h2>자주 묻는 5 가지.</h2>
        <div className="faq" style={{ maxWidth: 820 }}>
          {PUBLIC_FAQ_LANDING.map((f, i) => (
            <details key={i} open={i === 0}>
              <summary>{f.q}</summary>
              <div className="a">{f.a}</div>
            </details>
          ))}
        </div>
      </section>

      {/* 9. Footer CTA strip */}
      <section className="sec dark">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
          <div>
            <div style={{ font: "var(--t-caption1-strong)", letterSpacing: "0.06em", textTransform: "uppercase", color: "rgba(255,255,255,0.6)", marginBottom: 6 }}>지금 시작</div>
            <h2 style={{ margin: 0 }}>5분이면 첫 세션이 Today에 뜹니다.</h2>
            <p style={{ margin: "8px 0 0", color: "rgba(255,255,255,0.7)", font: "var(--t-body1)" }}>가입 → AI 도구 connect → 첫 세션 import → Reviewer 지정 → 완료.</p>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button className="btn lg" style={{ background: "#fff", color: "var(--text-strong)" }} onClick={() => gotoPublic?.("signup")}>
              5분 안에 워크스페이스 만들기
            </button>
            <button className="btn lg" style={{ background: "transparent", color: "#fff", borderColor: "rgba(255,255,255,0.3)" }} onClick={() => gotoPublic?.("pricing")}>
              가격 보기
            </button>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}

window.AWMPublicLanding = { LandingScreen };
