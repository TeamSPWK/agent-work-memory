/* H2 — Compliance 결제 트리거
   Audit Trail → 7대 원칙 패널 → 체인 무결성 → PDF export → Plan & Billing */

const { AUDIT_EVENTS, COMPLIANCE, PLAN_USAGE } = AWMData;

function RiskChip2({ risk }) {
  if (!risk) return <span className="tag neutral">-</span>;
  const tone = risk.sev === "high" ? "red" : risk.sev === "med" ? "orange" : "neutral";
  const label = risk.sev === "high" ? "고위험" : risk.sev === "med" ? "주의" : "낮음";
  return <span className={"tag " + tone}><span className="dot"></span>{label} · {risk.cat}</span>;
}

/* H2 — Audit Trail */
function AuditTrailScreen({ gotoSession }) {
  const [range, setRange] = React.useState("30일");
  const reviewedRate = 85;
  const totalChanges = 234;
  const reviewed = 198;
  const unreviewed = totalChanges - reviewed;
  return (
    <>
      <div className="page-h">
        <div>
          <div className="eyebrow">진입 시점 · 분기 감사 · 인공지능기본법 점검</div>
          <h1>Audit Trail</h1>
          <p>모든 AI 변경의 변조 불가 시간순 로그. 회계감사·법무 검토 가능 양식으로 export.</p>
        </div>
        <div className="actions">
          <button className="btn"><Icon name="filter" size={14} />필터</button>
          <button className="btn" onClick={() => gotoSession("integrity")}>
            <Icon name="chain" size={14} />체인 검증
          </button>
          <button className="btn primary" onClick={() => gotoSession("pdf")}>
            <Icon name="download" size={14} />PDF export
          </button>
        </div>
      </div>

      <div className="grid-4" style={{ marginBottom: 16 }}>
        <div className="card tight">
          <div className="kpi">
            <div className="l">AI 변경 검증율 · 30일</div>
            <div className="v">{reviewedRate}<span style={{ font: "var(--t-heading3)" }}>%</span></div>
            <div className="muted tnum" style={{ font: "var(--t-caption1)" }}>{reviewed} / {totalChanges}건 Reviewer 승인</div>
          </div>
          <div className="bar" style={{ marginTop: 10 }}><i style={{ width: reviewedRate + "%" }} /></div>
        </div>
        <div className="card tight">
          <div className="kpi">
            <div className="l">미검토</div>
            <div className="v" style={{ color: "var(--accent-strong)" }}>{unreviewed}</div>
            <div className="delta neg">15% — 인공지능기본법 권고 ≤ 10%</div>
          </div>
          <button className="btn weak sm" style={{ marginTop: 10 }} onClick={() => alert("Reviewer Brief 미검토 큐로 jump (시연)") }>
            Reviewer Brief 큐로 →
          </button>
        </div>
        <div className="card tight">
          <div className="kpi">
            <div className="l">체인 무결성</div>
            <div className="v" style={{ color: "var(--status-positive)" }}>✓ 1,243건</div>
            <div className="delta neg">깨진 1건 — 5/10 13:05</div>
          </div>
          <button className="btn weak sm" style={{ marginTop: 10 }} onClick={() => gotoSession("integrity")}>
            <Icon name="chain" size={12} />검증 결과 →
          </button>
        </div>
        <div className="card tight">
          <div className="kpi">
            <div className="l">7대 원칙 적용</div>
            <div className="v">5 <span className="muted" style={{ font: "var(--t-heading3)" }}>/ 7</span></div>
            <div className="muted" style={{ font: "var(--t-caption1)" }}>2개 항목 보강 권고</div>
          </div>
          <button className="btn weak sm" style={{ marginTop: 10 }} onClick={() => gotoSession("compliance")}>
            <Icon name="check" size={12} />컴플라이언스 패널 →
          </button>
        </div>
      </div>

      <div className="card">
        <div className="row between" style={{ marginBottom: 12 }}>
          <div className="seg">
            {["오늘", "주", "월", "30일", "분기"].map(r => (
              <button key={r} className={range === r ? "active" : ""} onClick={() => setRange(r)}>{r}</button>
            ))}
          </div>
          <div className="row tight">
            <select className="focus-stub" style={{ height: 32, padding: "0 10px", border: "1px solid var(--line-soft)", borderRadius: 8, background: "var(--bg-base)" }}>
              <option>모든 사용자</option><option>운영 매니저 (4년차)</option><option>개발 리드 (8년차)</option>
            </select>
            <select className="focus-stub" style={{ height: 32, padding: "0 10px", border: "1px solid var(--line-soft)", borderRadius: 8, background: "var(--bg-base)" }}>
              <option>모든 위험 카테고리</option><option>DB</option><option>Secret/Env</option><option>Deploy/Infra</option>
            </select>
          </div>
        </div>

        <table className="tbl">
          <thead><tr>
            <th style={{ width: 130 }}>시각</th>
            <th>이벤트</th>
            <th>작업자</th>
            <th>위험</th>
            <th style={{ width: 220 }}>해시 체인</th>
          </tr></thead>
          <tbody>
            {AUDIT_EVENTS.map(e => (
              <tr key={e.id} className={e.broken ? "broken" : ""}>
                <td className="tnum muted" style={{ font: "var(--t-caption1)" }}>{e.at}</td>
                <td>
                  <div style={{ font: "var(--t-label1-strong)", color: "var(--text-strong)" }}>{e.summary}</div>
                  <div className="muted" style={{ font: "var(--t-caption1)" }}>
                    <span className="badge">{e.type}</span> · 세션 {e.session}
                  </div>
                </td>
                <td>{e.actor}</td>
                <td><RiskChip2 risk={e.risk} /></td>
                <td>
                  <span className={"chain-mark" + (e.broken ? " broken" : "")}>
                    <Icon name={e.broken ? "warn" : "chain"} size={12} />
                    <span className="mono">{e.hash}</span>
                    <span className="muted">←</span>
                    <span className="mono">{e.prev}</span>
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

/* H2 — Compliance 패널 (7대 원칙) */
function ComplianceScreen({ gotoSession }) {
  return (
    <>
      <div className="page-h">
        <div>
          <div className="eyebrow">인공지능기본법 · 2026-01-22 시행</div>
          <h1>7대 원칙 적용 상태</h1>
          <p>이 워크스페이스의 운영 정책이 7대 원칙별로 어떻게 충족되는지 한 화면에서 확인합니다.</p>
        </div>
        <div className="actions">
          <button className="btn" onClick={() => gotoSession("audit")}>← Audit Trail</button>
          <button className="btn primary" onClick={() => gotoSession("pdf")}>
            <Icon name="download" size={14} />감사 자료 PDF
          </button>
        </div>
      </div>

      <div className="grid-split">
        <div className="card">
          <div className="card-h">
            <h3>원칙별 체크리스트</h3>
            <span className="badge">5 / 7 충족 · 2 보강 권고</span>
          </div>
          <ul className="compliance" style={{ margin: 0, padding: 0 }}>
            {COMPLIANCE.map(p => (
              <li key={p.name}>
                <span className={"check " + (p.state === "ok" ? "" : p.state === "warn" ? "warn" : "todo")}>
                  {p.state === "ok" ? "✓" : p.state === "warn" ? "!" : ""}
                </span>
                <div>
                  <div className="pname">{p.name}</div>
                  <div className="pdesc">{p.desc} · {p.note}</div>
                </div>
                <div>
                  <span className={"tag " + (p.state === "ok" ? "green" : "orange")}>
                    {p.state === "ok" ? "충족" : "보강 권고"}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="col">
          <div className="card tight">
            <div className="eyebrow">시연 노트</div>
            <div style={{ font: "var(--t-label1-strong)", color: "var(--text-strong)", margin: "4px 0 8px" }}>
              왜 한 화면이 결제 트리거인가
            </div>
            <ul style={{ margin: 0, paddingLeft: 18, color: "var(--text-neutral)", display: "flex", flexDirection: "column", gap: 6 }}>
              <li>법무·CFO 외주 회의에서 *바로 보여줄 자료*</li>
              <li>"적용 안 됨" 항목 1개라도 있으면 미루기 어려움</li>
              <li>Pro 플랜에서 PDF + 자동 보강 알림 활성화</li>
            </ul>
          </div>

          <div className="card tight">
            <div className="eyebrow">미설명 세션 영향</div>
            <div className="row between" style={{ alignItems: "flex-end", marginTop: 8 }}>
              <div>
                <div className="muted" style={{ font: "var(--t-caption1)" }}>투명성 원칙 — 미설명 세션</div>
                <div className="strong tnum" style={{ font: "var(--t-title3)" }}>36 / 234</div>
              </div>
              <button className="btn weak sm" onClick={() => alert("Operator 미설명 세션 큐로 (시연)")}>
                <Icon name="pencil" size={12} />Explain Back 큐
              </button>
            </div>
            <div className="bar" style={{ marginTop: 12 }}><i style={{ width: "15%", background: "var(--accent-normal)" }} /></div>
            <div className="muted" style={{ font: "var(--t-caption1)", marginTop: 6 }}>
              15% — 권고 ≤ 10%까지 6세션 더 채우면 충족
            </div>
          </div>

          <div className="card tight" style={{ background: "var(--primary-light)", borderColor: "transparent" }}>
            <div className="row between">
              <div>
                <div style={{ font: "var(--t-label1-strong)", color: "var(--primary-strong)" }}>현재 플랜 · Starter</div>
                <div className="muted" style={{ font: "var(--t-caption1)", color: "var(--primary-strong)" }}>
                  PDF export · 자동 보강 알림은 Team / Pro에서 제공
                </div>
              </div>
              <button className="btn primary" onClick={() => gotoSession("billing")}>업그레이드 →</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/* H2 — 체인 무결성 */
function IntegrityScreen({ gotoSession }) {
  return (
    <>
      <div className="page-h">
        <div>
          <div className="eyebrow">변조 불가성 검증</div>
          <h1>체인 무결성 결과</h1>
          <p>각 row의 SHA-256 해시 + 직전 hash chain 연결. 깨진 구간을 시각으로 표시합니다.</p>
        </div>
        <div className="actions">
          <button className="btn" onClick={() => gotoSession("audit")}>← Audit Trail</button>
          <button className="btn primary"><Icon name="play" size={14} />다시 검증</button>
        </div>
      </div>

      <div className="grid-3" style={{ marginBottom: 16 }}>
        <div className="card tight"><div className="kpi"><div className="l">검증 대상</div><div className="v tnum">1,243</div><div className="muted" style={{ font: "var(--t-caption1)" }}>지난 30일 이벤트</div></div></div>
        <div className="card tight"><div className="kpi"><div className="l">무결성 통과</div><div className="v tnum" style={{ color: "var(--status-positive)" }}>1,242</div><div className="muted" style={{ font: "var(--t-caption1)" }}>SHA-256 chain 일치</div></div></div>
        <div className="card tight"><div className="kpi"><div className="l">깨진 row</div><div className="v tnum" style={{ color: "var(--status-negative)" }}>1</div><div className="muted" style={{ font: "var(--t-caption1)" }}>5/10 13:05 — 세션 시작 row</div></div></div>
      </div>

      <div className="card">
        <div className="card-h">
          <h3>깨진 구간 detail</h3>
          <span className="sub">M2 SHA-256 hash chain 적용 (실제 동작)</span>
        </div>

        <div style={{ background: "var(--bg-subtle)", borderRadius: 10, padding: 14, marginBottom: 14 }}>
          <div className="muted" style={{ font: "var(--t-caption1)", marginBottom: 6 }}>발견된 불일치</div>
          <div className="mono" style={{ color: "var(--status-negative)", fontSize: 13 }}>
            ev-2396 · expected_prev=ad9912f · stored_prev=BROKEN
          </div>
          <div className="mono muted" style={{ fontSize: 12, marginTop: 4 }}>
            SHA-256(prev=ad9912f, payload=&lt;session.start at 13:05&gt;) = 1bd55a4… · stored=BROKEN
          </div>
        </div>

        <div className="timeline">
          <div className="ev"><div className="t">5/10 11:18 · ev-2395</div><div className="h">정상 · ad9912f ← 70cc4b9</div><div className="b muted">file.change · 운영 매니저 7파일</div></div>
          <div className="ev risk"><div className="t">5/10 13:05 · ev-2396 (broken)</div><div className="h" style={{ color: "var(--status-negative)" }}>chain 불일치 — stored=BROKEN, expected=1bd55a4</div><div className="b">session.start · Notion 동기화 세션 — 백필 또는 외부 수정 가능성. 자동 재계산 후 보고됨.</div></div>
          <div className="ev"><div className="t">5/10 13:08 · ev-2397</div><div className="h">정상 · 1bd55a4 ← 3acb09d (재계산 후 일관)</div><div className="b muted">secret.access — 깨진 row 이후 chain은 재구축 가능</div></div>
        </div>

        <div className="hr" />
        <div className="row between">
          <div className="muted" style={{ font: "var(--t-caption1)" }}>
            *원인 단정하지 않음* — 후보: 백필 마이그레이션 / 외부 수정 / DB write 충돌. 사람이 분류.
          </div>
          <div className="row tight">
            <button className="btn sm">백필 후보로 분류</button>
            <button className="btn sm">외부 수정 의심</button>
            <button className="btn weak sm"><Icon name="pencil" size={12} />사유 메모</button>
          </div>
        </div>
      </div>
    </>
  );
}

/* H2 — PDF preview */
function PdfPreviewScreen({ gotoSession }) {
  return (
    <>
      <div className="page-h">
        <div>
          <div className="eyebrow">감사 자료 export · 1-pager</div>
          <h1>PDF export 미리보기</h1>
          <p>회계감사·법무 검토 가능 양식. 한국어 헤더, 회사 정보, 통계, 이벤트 표, 체인 검증 결과.</p>
        </div>
        <div className="actions">
          <button className="btn" onClick={() => gotoSession("compliance")}>← 컴플라이언스</button>
          <button className="btn">CSV로</button>
          <button className="btn primary"><Icon name="download" size={14} />PDF 다운로드</button>
        </div>
      </div>

      <div className="grid-split">
        <div className="card" style={{ background: "var(--bg-subtle)" }}>
          <div className="pdf-frame">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ font: "600 11px/1 'Pretendard'", letterSpacing: "0.08em", textTransform: "uppercase", color: "#777" }}>AGENT WORK MEMORY · AUDIT REPORT</div>
                <h2 style={{ marginTop: 8 }}>AI 변경 감사 자료 · 2026년 4월 ~ 5월 (30일)</h2>
                <div className="meta">발행일 2026-05-10 · 워크스페이스 B2B SaaS · 시리즈 A 28명</div>
              </div>
              <div style={{ textAlign: "right", font: "400 10px/1.5 'Pretendard'", color: "#666" }}>
                Spacewalk Inc. · 사업자등록 000-00-00000<br />
                대표 jay@spacewalk.tech<br />
                서울특별시 (placeholder)
              </div>
            </div>

            <div style={{ marginTop: 18, display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
              {[
                { l: "총 AI 변경", v: "234건" },
                { l: "Reviewer 승인", v: "198건 (85%)" },
                { l: "위험 신호", v: "21건" },
                { l: "체인 무결성", v: "1,242 / 1,243 ✓" },
              ].map(k => (
                <div key={k.l} style={{ border: "1px solid #ddd", borderRadius: 6, padding: "8px 10px" }}>
                  <div style={{ font: "400 10px/1 'Pretendard'", color: "#666", textTransform: "uppercase", letterSpacing: "0.06em" }}>{k.l}</div>
                  <div style={{ font: "700 18px/1.3 'Pretendard'", color: "#000", marginTop: 4, fontVariantNumeric: "tabular-nums" }}>{k.v}</div>
                </div>
              ))}
            </div>

            <h3 style={{ marginTop: 20, font: "700 14px/1 'Pretendard'", color: "#000" }}>인공지능기본법 7대 원칙 적용</h3>
            <table>
              <thead><tr><th>원칙</th><th>적용 상태</th><th>근거</th></tr></thead>
              <tbody>
                {COMPLIANCE.map(p => (
                  <tr key={p.name}>
                    <td>{p.name}</td>
                    <td>{p.state === "ok" ? "충족" : "보강 권고"}</td>
                    <td>{p.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <h3 style={{ marginTop: 20, font: "700 14px/1 'Pretendard'", color: "#000" }}>주요 이벤트 (요약)</h3>
            <table>
              <thead><tr><th>시각</th><th>이벤트</th><th>작업자</th><th>위험</th><th>해시</th></tr></thead>
              <tbody>
                {AUDIT_EVENTS.slice(0, 6).map(e => (
                  <tr key={e.id}>
                    <td style={{ fontVariantNumeric: "tabular-nums" }}>{e.at.slice(5)}</td>
                    <td>{e.summary}</td>
                    <td>{e.actor}</td>
                    <td>{e.risk ? `${e.risk.sev} · ${e.risk.cat}` : "-"}</td>
                    <td style={{ fontFamily: "ui-monospace, monospace", fontSize: 10 }}>{e.hash}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ marginTop: 18, display: "flex", justifyContent: "space-between", font: "400 10px/1.4 'Pretendard'", color: "#555" }}>
              <div>* 본 자료는 워크스페이스 자체 운영 지표이며 외부 감사 의견을 대체하지 않습니다.</div>
              <div>page 1 / 1</div>
            </div>
          </div>
        </div>

        <div className="col">
          <div className="card tight">
            <div className="eyebrow">포함 항목 (편집 가능)</div>
            <div className="col" style={{ gap: 6, marginTop: 10 }}>
              {["회사 정보 · 사업자등록", "기간 통계 4지표", "7대 원칙 체크리스트", "주요 이벤트 표 (최대 200건)", "체인 무결성 검증 결과", "미검토 세션 부록"]
                .map((x, i) => (
                  <label key={x} style={{ display: "flex", gap: 8, alignItems: "center", font: "var(--t-label1)" }}>
                    <input type="checkbox" defaultChecked={i < 5} />
                    {x}
                  </label>
                ))}
            </div>
          </div>

          <div className="card tight">
            <div className="eyebrow">파일 형식</div>
            <div className="seg" style={{ marginTop: 8 }}>
              <button className="active">PDF (한국어)</button>
              <button>CSV</button>
              <button>JSON</button>
            </div>
            <div className="muted" style={{ font: "var(--t-caption1)", marginTop: 10 }}>
              PDF는 *Pro 플랜* 이상 / CSV는 모든 플랜 / JSON은 API 통합용 (Team 이상)
            </div>
          </div>

          <div className="card tight" style={{ background: "var(--accent-light)", borderColor: "transparent" }}>
            <div style={{ font: "var(--t-label1-strong)", color: "var(--accent-strong)" }}>
              <Icon name="warn" size={14} /> 가설 H2 검증 포인트
            </div>
            <div className="muted" style={{ font: "var(--t-caption1)", color: "var(--accent-strong)", marginTop: 4 }}>
              "Audit → 7대 원칙 → PDF 미리보기 → 업그레이드" 4스텝 시연.
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/* H2 — Plan & Billing */
function BillingScreen({ gotoSession }) {
  const [yearly, setYearly] = React.useState(false);
  const plans = [
    { id: "free", name: "Free", price: 0, ops: 1, retention: "30일", export: false, sso: false },
    { id: "starter", name: "Starter", price: 100000, ops: 5, retention: "90일", export: "CSV", sso: false, current: true },
    { id: "team", name: "Team", price: 250000, ops: 15, retention: "1년", export: "CSV+PDF", sso: false, featured: true },
    { id: "pro", name: "Pro", price: 500000, ops: 30, retention: "3년", export: "CSV+PDF+JSON", sso: true },
    { id: "ent", name: "Enterprise", price: null, ops: "협의", retention: "협의", export: "전체", sso: "SCIM" },
  ];
  const fmt = (n) => n == null ? "협의" : (yearly ? Math.round(n * 0.75 * 12 / 1000) * 1000 : n).toLocaleString("ko-KR") + "원";

  return (
    <>
      <div className="page-h">
        <div>
          <div className="eyebrow">진입 시점 · 컴플라이언스 패널 → 업그레이드</div>
          <h1>Plan &amp; Billing</h1>
          <p>per-active-Operator 가격. VAT 10% 별도, 연결제 25% 할인. 한국 B2B 세금계산서 자동 발행.</p>
        </div>
        <div className="actions">
          <button className="btn" onClick={() => gotoSession("compliance")}>← 컴플라이언스</button>
        </div>
      </div>

      <div className="grid-3" style={{ marginBottom: 16 }}>
        <div className="card tight" style={{ gridColumn: "span 2" }}>
          <div className="row between">
            <div>
              <div className="eyebrow">현재 플랜</div>
              <div style={{ font: "var(--t-title3)", color: "var(--text-strong)", margin: "6px 0 4px" }}>Starter · 100,000원/월 (VAT 별도)</div>
              <div className="muted" style={{ font: "var(--t-caption1)" }}>다음 갱신 · {PLAN_USAGE.nextBillAt} · 토스페이먼츠 카드</div>
            </div>
            <button className="btn primary lg">Pro로 업그레이드</button>
          </div>
          <div className="hr" />
          <div className="row" style={{ alignItems: "center", gap: 16 }}>
            <div style={{ flex: 1 }}>
              <div className="row between" style={{ marginBottom: 6 }}>
                <div className="muted" style={{ font: "var(--t-caption1)" }}>Active Operator 사용량</div>
                <div className="strong tnum" style={{ font: "var(--t-label1-strong)" }}>{PLAN_USAGE.activeOps} / {PLAN_USAGE.limit}명</div>
              </div>
              <div className="bar"><i style={{ width: ((PLAN_USAGE.activeOps / PLAN_USAGE.limit) * 100) + "%", background: "var(--accent-normal)" }} /></div>
              <div className="muted" style={{ font: "var(--t-caption1)", marginTop: 6 }}>한도 도달 — 추가 작업자 1명 활성 시 자동으로 Team 제안</div>
            </div>
          </div>
        </div>

        <div className="card tight">
          <div className="eyebrow">디자인 파트너 (D1)</div>
          <div style={{ font: "var(--t-label1-strong)", color: "var(--text-strong)", margin: "6px 0 4px" }}>6개월 50% 할인 적용 중</div>
          <div className="muted" style={{ font: "var(--t-caption1)" }}>2026-04 ~ 2026-09 · 월 50,000원 (VAT 별도). 만료 60일 전 안내.</div>
        </div>
      </div>

      <div className="card">
        <div className="row between" style={{ marginBottom: 14 }}>
          <h3 style={{ margin: 0 }}>플랜 비교</h3>
          <label className="row tight" style={{ alignItems: "center", font: "var(--t-label1)" }}>
            <input type="checkbox" checked={yearly} onChange={e => setYearly(e.target.checked)} />
            연결제 25% 할인 (12개월 일시불)
          </label>
        </div>

        <div className="grid-4" style={{ gridTemplateColumns: "repeat(5, 1fr)", gap: 12 }}>
          {plans.map(p => (
            <div key={p.id} className={"plan" + (p.current ? " current" : p.featured ? " featured" : "")}>
              <div className="row between">
                <div className="name">{p.name}</div>
                {p.current && <span className="tag blue">현재</span>}
                {p.featured && <span className="tag strong">추천</span>}
              </div>
              <div className="price tnum">
                {fmt(p.price)}<span className="per">{yearly && p.price ? " /년" : p.price ? " /월" : ""}</span>
              </div>
              <div className="muted" style={{ font: "var(--t-caption1)" }}>
                {p.price ? "VAT 별도 · " : ""}{p.ops}명 Active OP
              </div>
              <ul>
                <li>보존 {p.retention}</li>
                <li>{p.export ? `Audit export ${p.export}` : "Audit export 없음"}</li>
                <li>{p.sso ? `SSO/SCIM · ${typeof p.sso === "string" ? p.sso : "OAuth"}` : "SSO 없음"}</li>
                <li>{p.id === "free" ? "1 워크스페이스" : "다중 워크스페이스"}</li>
              </ul>
              <button className={"btn " + (p.featured ? "primary" : p.current ? "weak" : "")}>
                {p.current ? "현재 플랜" : p.featured ? "이 플랜으로" : "선택"}
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="grid-2" style={{ marginTop: 16 }}>
        <div className="card">
          <div className="card-h"><h3>세금계산서 (한국 B2B 의무)</h3><span className="badge">자동 발행 ON</span></div>
          <div className="grid-2">
            <div className="fieldset"><label>사업자등록번호</label><input className="focus-stub" defaultValue="000-00-00000" /></div>
            <div className="fieldset"><label>상호</label><input className="focus-stub" defaultValue="(주) 워크스페이스 A" /></div>
            <div className="fieldset"><label>대표자명</label><input className="focus-stub" defaultValue="김대표" /></div>
            <div className="fieldset"><label>발행 이메일</label><input className="focus-stub" defaultValue="finance@workspace-a.com" /></div>
          </div>
          <div className="hr" />
          <table className="tbl">
            <thead><tr><th>월</th><th>금액</th><th>상태</th><th></th></tr></thead>
            <tbody>
              {[{m:"2026-04", a:"100,000", s:"발행 완료"},{m:"2026-03", a:"100,000", s:"발행 완료"},{m:"2026-02", a:"100,000", s:"발행 완료"}].map(r => (
                <tr key={r.m}>
                  <td className="tnum">{r.m}</td><td className="tnum">{r.a}원</td>
                  <td><span className="tag green">{r.s}</span></td>
                  <td><button className="link"><Icon name="download" size={12} />다운로드</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card">
          <div className="card-h"><h3>결제 수단 · 토스페이먼츠</h3></div>
          <div className="card tight" style={{ background: "var(--bg-subtle)", border: 0 }}>
            <div className="row between">
              <div>
                <div className="strong">신한카드 · ****-****-****-1234</div>
                <div className="muted" style={{ font: "var(--t-caption1)" }}>주 결제 수단 · 만료 03/29</div>
              </div>
              <button className="btn sm">변경</button>
            </div>
          </div>
          <div className="row tight" style={{ marginTop: 10 }}>
            <button className="btn"><Icon name="plus" size={14} />가상계좌 추가</button>
            <button className="btn"><Icon name="plus" size={14} />카드 추가</button>
          </div>

          <div className="hr" />

          <div className="eyebrow">사용량 알림</div>
          <div className="col" style={{ gap: 8, marginTop: 8 }}>
            {[
              { l: "Active OP 80% 도달", on: true },
              { l: "Active OP 100% 도달 (한도 초과)", on: true },
              { l: "월 청구액 ±20% 변동", on: false },
            ].map(a => (
              <label key={a.l} className="row between" style={{ font: "var(--t-label1)" }}>
                <span>{a.l}</span>
                <input type="checkbox" defaultChecked={a.on} />
              </label>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

window.AWMH2 = { AuditTrailScreen, ComplianceScreen, IntegrityScreen, PdfPreviewScreen, BillingScreen };
