/* H3 — 10분 1차 원인 도출
   Risk Radar → Incident Replay (timeline) → Event Detail · 3분리 → Reviewer Brief 연결 → Incident Note */

const { RISK_CATEGORIES, INCIDENT, SESSION_DETAIL: SD3, RISK_SIGNALS } = AWMData;

const SEV_CHIP = {
  high: <span className="tag red"><span className="dot" />고위험</span>,
  med:  <span className="tag orange">주의</span>,
  low:  <span className="tag neutral">낮음</span>,
};

/* H3 — Risk Radar */
function RiskRadarScreen({ gotoSession }) {
  const [selected, setSelected] = React.useState("DB");
  return (
    <>
      <div className="page-h">
        <div>
          <div className="eyebrow">진입 시점 · Today 위험 카드 클릭, 또는 일상 점검</div>
          <h1>Risk Radar</h1>
          <p>위험 카테고리별로 신호를 모아 본다. 클릭 시 해당 신호 리스트와 cross-link.</p>
        </div>
        <div className="actions">
          <button className="btn"><Icon name="filter" size={14} />심각도</button>
          <button className="btn"><Icon name="cal" size={14} />최근 7일</button>
        </div>
      </div>

      <div className="grid-4" style={{ gap: 12 }}>
        {RISK_CATEGORIES.map(c => {
          const total = c.count;
          const high = c.sev.high, med = c.sev.med, low = c.sev.low;
          const w = (n) => total ? (n / total) * 100 : 0;
          return (
            <button
              key={c.key}
              onClick={() => setSelected(c.key)}
              className="risk-tile"
              style={{
                cursor: "pointer", textAlign: "left",
                outline: selected === c.key ? "2px solid var(--primary-normal)" : "0",
                outlineOffset: -1,
              }}
            >
              <div className="head">
                <div className="row tight" style={{ alignItems: "center" }}>
                  <Icon name={c.icon} size={16} />
                  <div className="name">{c.name}</div>
                </div>
                <div className="count tnum">{total}</div>
              </div>
              <div className="sev">
                <span><span className="dot r" /> {high}</span>
                <div style={{ position: "relative", height: 6, borderRadius: 999, background: "var(--bg-subtle)", overflow: "hidden", display: "flex" }}>
                  <span style={{ width: w(high) + "%", background: "var(--status-negative)" }} />
                  <span style={{ width: w(med) + "%", background: "var(--status-cautionary)" }} />
                  <span style={{ width: w(low) + "%", background: "var(--text-disable)" }} />
                </div>
                <span className="muted" style={{ font: "var(--t-caption1)" }}>최근 N건</span>
              </div>
              <div className="muted" style={{ font: "var(--t-caption1)" }}>
                {high}고위험 · {med}주의 · {low}낮음
              </div>
            </button>
          );
        })}
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <div className="card-h">
          <h3><Icon name={(RISK_CATEGORIES.find(r => r.key === selected) || {}).icon} size={16} /> {(RISK_CATEGORIES.find(r => r.key === selected) || {}).name} · 신호 리스트</h3>
          <span className="sub">시간 ↔ 세션 ↔ commit cross-link</span>
        </div>

        {selected === "DB" ? (
          <table className="tbl">
            <thead><tr><th style={{ width: 130 }}>시각</th><th>이벤트</th><th>세션</th><th>심각도</th><th></th></tr></thead>
            <tbody>
              <tr style={{ background: "rgba(255,66,66,0.06)" }}>
                <td className="tnum muted">5/10 16:25:11</td>
                <td>
                  <div className="strong">prod 환경 인덱스 마이그레이션 실행</div>
                  <div className="muted mono" style={{ fontSize: 12 }}>psql $PROD_URL -f 20260510_add_applicants_idx.sql</div>
                </td>
                <td><a className="link">s-024</a></td>
                <td><span className="tag red"><span className="dot" />고위험 · DB</span></td>
                <td><button className="link" onClick={() => gotoSession("replay")}>Incident Replay →</button></td>
              </tr>
              <tr>
                <td className="tnum muted">5/10 16:23:30</td>
                <td><div className="strong">dev 환경 인덱스 마이그레이션 실행</div></td>
                <td><a className="link">s-024</a></td>
                <td><span className="tag orange">주의 · DB</span></td>
                <td><button className="link" onClick={() => gotoSession("event")}>detail →</button></td>
              </tr>
              <tr>
                <td className="tnum muted">5/9 11:02:14</td>
                <td><div className="strong">applicants_status enum 추가 마이그레이션</div></td>
                <td><a className="link">s-019</a></td>
                <td><span className="tag orange">주의 · Migration</span></td>
                <td><button className="link">detail →</button></td>
              </tr>
              <tr>
                <td className="tnum muted">5/8 17:48:55</td>
                <td><div className="strong">DELETE FROM job_views WHERE created_at &lt; NOW() - 90d</div></td>
                <td><a className="link">s-014</a></td>
                <td><span className="tag neutral">낮음 · DB</span></td>
                <td><button className="link">detail →</button></td>
              </tr>
            </tbody>
          </table>
        ) : (
          <table className="tbl">
            <thead>
              <tr>
                <th style={{ width: 130 }}>시각</th>
                <th>이벤트</th>
                <th>세션</th>
                <th>repo</th>
                <th>심각도</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {(RISK_SIGNALS[selected] || []).map((s, i) => (
                <tr key={i} style={s.sev === "high" ? { background: "rgba(255,66,66,0.06)" } : undefined}>
                  <td className="tnum muted">{s.at}</td>
                  <td>
                    <div className="strong">{s.title}</div>
                    <div className="muted mono" style={{ fontSize: 12 }}>{s.cmd}</div>
                    <div className="muted" style={{ font: "var(--t-caption1)", marginTop: 2 }}>{s.note}</div>
                  </td>
                  <td>{s.session !== "—" ? <a className="link">{s.session}</a> : <span className="muted">—</span>}</td>
                  <td>
                    {s.repo !== "—"
                      ? <span className="tag neutral" style={{ fontFamily: "ui-monospace, monospace", fontSize: 11 }}>{s.repo}</span>
                      : <span className="muted">—</span>}
                  </td>
                  <td>{SEV_CHIP[s.sev]}</td>
                  <td>
                    {s.session !== "—"
                      ? <button className="link" onClick={() => gotoSession("event")}>detail →</button>
                      : <span className="muted">—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="card tight" style={{ marginTop: 16, background: "var(--accent-light)", borderColor: "transparent" }}>
        <div className="row between">
          <div>
            <div style={{ font: "var(--t-label1-strong)", color: "var(--accent-strong)" }}>
              <Icon name="bolt" size={14} /> prod 사고 발생 — 14:31에서 8분 경과
            </div>
            <div className="muted" style={{ font: "var(--t-caption1)", color: "var(--accent-strong)", marginTop: 4 }}>
              지원자 목록 페이지가 504. 16:25 DB 위험 이벤트와 연관 가능성. Incident Replay로 점프하세요.
            </div>
          </div>
          <button className="btn primary lg" onClick={() => gotoSession("replay")}>
            <Icon name="incident" size={16} />Incident Replay
          </button>
        </div>
      </div>
    </>
  );
}

/* H3 — Incident Replay (timeline) */
function IncidentReplayScreen({ gotoSession }) {
  const inc = INCIDENT;
  const xMin = -10, xMax = 10;
  const xPct = (x) => ((x - xMin) / (xMax - xMin)) * 100;
  const sevSize = { high: 18, med: 14, low: 10 };
  const [selected, setSelected] = React.useState("e3");
  const ev = inc.events.find(e => e.id === selected);

  return (
    <>
      <div className="page-h">
        <div>
          <div className="eyebrow">진입 시점 · prod 사고 직후 · {inc.id}</div>
          <h1>{inc.title}</h1>
          <p>가로축 시간(분), 세로축 카테고리. 클릭 시 우측 detail. 원인 단정 X — 후보·확실·불명 분리.</p>
        </div>
        <div className="actions">
          <span className="timer-chip">
            <span className="pulse" /> {inc.elapsedMin}:00 경과
          </span>
          <button className="btn" onClick={() => gotoSession("note")}>
            <Icon name="pencil" size={14} />Incident Note
          </button>
        </div>
      </div>

      <div className="grid-4" style={{ marginBottom: 16 }}>
        <div className="card tight">
          <div className="kpi">
            <div className="l">사고 시작 후</div>
            <div className="v tnum">{inc.elapsedMin}분</div>
            <div className="muted" style={{ font: "var(--t-caption1)" }}>16:31 detected · 16:34 acknowledged</div>
          </div>
        </div>
        <div className="card tight">
          <div className="kpi">
            <div className="l">1차 원인 도출 평균</div>
            <div className="v tnum" style={{ color: "var(--primary-normal)" }}>{inc.avgRootCauseMin}분</div>
            <div className="delta pos">▼ 51분 (도구 도입 전 62분 대비)</div>
          </div>
        </div>
        <div className="card tight">
          <div className="kpi">
            <div className="l">관련 이벤트</div>
            <div className="v tnum">{inc.events.length}</div>
            <div className="muted" style={{ font: "var(--t-caption1)" }}>위험 ↑ {inc.events.filter(e => e.sev === "high").length}건</div>
          </div>
        </div>
        <div className="card tight">
          <div className="kpi">
            <div className="l">3분리 진행</div>
            <div className="v tnum">{inc.buckets.likely.length + inc.buckets.verified.length + inc.buckets.unknown.length}건</div>
            <div className="muted" style={{ font: "var(--t-caption1)" }}>후보 {inc.buckets.likely.length} · 확실 {inc.buckets.verified.length} · 불명 {inc.buckets.unknown.length}</div>
          </div>
        </div>
      </div>

      <div className="grid-split">
        <div className="col">
          <div className="card">
            <div className="card-h">
              <h3>시간순 이벤트 타임라인</h3>
              <div className="row tight" style={{ alignItems: "center", font: "var(--t-caption1)", color: "var(--text-assistive)" }}>
                <span><span className="dot r" /> 고위험</span>
                <span><span className="dot y" /> 주의</span>
                <span><span className="dot gr" /> 낮음</span>
              </div>
            </div>
            <div className="incident-canvas">
              {inc.rows.map((r, ri) => (
                <div key={r.key} className="ic-row">
                  <div className="lab">{r.label}</div>
                  {inc.events.filter(e => e.row === ri).map(e => (
                    <button
                      key={e.id}
                      className={"ic-mark " + e.sev + (selected === e.id ? " now" : "")}
                      style={{
                        left: `calc(${xPct(e.x)}% - ${sevSize[e.sev] / 2}px)`,
                        width: sevSize[e.sev], height: sevSize[e.sev],
                      }}
                      onClick={() => setSelected(e.id)}
                      title={e.title}
                    >
                      {e.sev === "high" ? "!" : ""}
                    </button>
                  ))}
                </div>
              ))}
              <div className="ic-axis">
                {[-10, -8, -6, -4, -2, 0, 2, 4, 6, 8, 10].map(x => (
                  <span key={x}>
                    {x === 0 ? <b style={{ color: "var(--status-negative)" }}>T0 16:31</b> : (x > 0 ? `+${x}m` : `${x}m`)}
                  </span>
                ))}
              </div>
            </div>
            <div className="row" style={{ marginTop: 14 }}>
              <span className="muted" style={{ font: "var(--t-caption1)" }}>
                <Icon name="filter" size={12} /> 필터 · 카테고리 8개 / 작업자 / 위험 심각도 / 키워드
              </span>
            </div>
          </div>

          <div className="grid-3">
            <div className="bucket">
              <div className="hh">
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span className="dot y" />원인 후보
                </span>
                <span className="tag orange">{inc.buckets.likely.length}</span>
              </div>
              {inc.buckets.likely.map(it => (
                <div key={it.id} className="item">
                  <div style={{ font: "var(--t-label1-strong)", color: "var(--text-strong)" }}>{it.title}</div>
                  <div className="why">{it.why}</div>
                  <div className="row between" style={{ marginTop: 4 }}>
                    <span className="badge">근거 {it.evidenceCount}</span>
                    <select className="focus-stub" style={{ height: 24, padding: "0 6px", border: "1px solid var(--line-soft)", borderRadius: 6, background: "var(--bg-base)", font: "var(--t-caption1)" }}>
                      <option>후보</option><option>확실</option><option>불명</option><option>제외</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
            <div className="bucket">
              <div className="hh">
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span className="dot g" />확실한 증거
                </span>
                <span className="tag green">{inc.buckets.verified.length}</span>
              </div>
              {inc.buckets.verified.map(it => (
                <div key={it.id} className="item">
                  <div style={{ font: "var(--t-label1-strong)", color: "var(--text-strong)" }}>{it.title}</div>
                  <div className="why">{it.why}</div>
                  <div className="row between" style={{ marginTop: 4 }}>
                    <span className="badge">근거 {it.evidenceCount}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="bucket">
              <div className="hh">
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span className="dot m" />불명확
                </span>
                <span className="tag violet">{inc.buckets.unknown.length}</span>
              </div>
              {inc.buckets.unknown.map(it => (
                <div key={it.id} className="item">
                  <div style={{ font: "var(--t-label1-strong)", color: "var(--text-strong)" }}>{it.title}</div>
                  <div className="why">{it.why}</div>
                  <div className="row tight" style={{ marginTop: 4 }}>
                    <button className="btn sm">조사 시작</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="col">
          <div className="card tight">
            <div className="card-h">
              <h3>이벤트 detail</h3>
              <span className="sub">{ev?.at}</span>
            </div>
            {ev && (
              <>
                <div style={{ font: "var(--t-heading3)", color: "var(--text-strong)" }}>{ev.title}</div>
                <div className="row tight" style={{ margin: "6px 0 12px" }}>
                  <span className={"tag " + (ev.sev === "high" ? "red" : ev.sev === "med" ? "orange" : "neutral")}>
                    <span className="dot" />{ev.sev}
                  </span>
                  <span className="tag neutral">{ev.lab}</span>
                  {ev.system && <span className="tag blue">시스템 감지</span>}
                </div>

                <div className="hr" />
                <div className="eyebrow">cross-reference</div>
                <div className="col" style={{ gap: 6, marginTop: 8 }}>
                  {ev.session && (
                    <button className="btn sm" style={{ justifyContent: "flex-start" }} onClick={() => gotoSession("event")}>
                      <Icon name="file" size={14} />세션 {ev.session} 열기
                    </button>
                  )}
                  <button className="btn sm" style={{ justifyContent: "flex-start" }} onClick={() => gotoSession("reviewer")}>
                    <Icon name="review" size={14} />Reviewer Brief — 의도 vs 결과
                  </button>
                  <button className="btn sm" style={{ justifyContent: "flex-start" }}>
                    <Icon name="git" size={14} />매칭 commit f08c4b2
                  </button>
                  <button className="btn sm" style={{ justifyContent: "flex-start" }}>
                    <Icon name="audit" size={14} />Audit Trail row ev-2401
                  </button>
                </div>

                <div className="hr" />
                <div className="eyebrow">이 분류 사유</div>
                <div className="muted" style={{ font: "var(--t-caption1)", marginTop: 6 }}>
                  prod 환경 변경 명령 패턴 + 사람 미승인 단계 + lock 경합 메트릭과 시간 일치.
                </div>
                <div className="row tight" style={{ marginTop: 8 }}>
                  <button className="btn primary sm" onClick={() => gotoSession("event")}>
                    <Icon name="warn" size={12} />이 후보를 상세 분석
                  </button>
                </div>
              </>
            )}
          </div>

          <div className="card tight" style={{ background: "var(--accent-light)", borderColor: "transparent" }}>
            <div style={{ font: "var(--t-label1-strong)", color: "var(--accent-strong)" }}>
              <Icon name="warn" size={14} /> 가설 H3 검증 포인트
            </div>
            <div className="muted" style={{ font: "var(--t-caption1)", color: "var(--accent-strong)", marginTop: 4 }}>
              "Risk Radar → Replay → 후보 클릭 → Reviewer Brief 의도/결과 → 1차 원인 메모" 사이클이 10분 안에 끝나는지 시연.
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/* H3 — Event Detail · 3분리 깊게 */
function EventDetailScreen({ gotoSession }) {
  return (
    <>
      <div className="page-h">
        <div>
          <div className="eyebrow">사건 마커 · prod 인덱스 마이그레이션 (16:25)</div>
          <h1>이 이벤트가 사고 원인일 가능성</h1>
          <p>3분리(후보·확실·불명) + 근거 자료 + 사람이 분류 변경하는 화면.</p>
        </div>
        <div className="actions">
          <button className="btn" onClick={() => gotoSession("replay")}>← Replay</button>
          <button className="btn primary" onClick={() => gotoSession("reviewer")}>의도/결과 비교 →</button>
        </div>
      </div>

      <div className="grid-split">
        <div className="col">
          <div className="card">
            <div className="card-h"><h3>이벤트 핵심 fact</h3><span className="sub">변조 불가 audit row 기반</span></div>
            <table className="tbl">
              <tbody>
                <tr><td className="muted" style={{ width: 140 }}>시각</td><td className="tnum">2026-05-10 16:25:11 (T0 -6분)</td></tr>
                <tr><td className="muted">작업자</td><td>개발 리드 (8년차)</td></tr>
                <tr><td className="muted">세션 / 도구</td><td>s-024 · Cursor</td></tr>
                <tr><td className="muted">repo · 브랜치</td><td>web-app · feat/idx-applicants</td></tr>
                <tr><td className="muted">명령</td><td><code className="mono">psql $PROD_URL -f 20260510_add_applicants_idx.sql</code></td></tr>
                <tr><td className="muted">위험</td><td><span className="tag red"><span className="dot" />고위험 · DB</span></td></tr>
                <tr><td className="muted">사람 승인</td><td><span className="tag green"><span className="dot" />turn 7에서 사용자 승인 (16:24:56)</span></td></tr>
                <tr><td className="muted">매칭 commit</td><td><a className="link mono">f08c4b2</a> · score 94%</td></tr>
              </tbody>
            </table>
          </div>

          <div className="card">
            <div className="card-h"><h3>3분리 — 이 이벤트의 인과적 위치</h3></div>
            <div className="grid-3">
              <div className="bucket">
                <div className="hh"><span><span className="dot y" /> 후보</span></div>
                <div className="item">
                  <div className="strong">prod lock 경합 유발 가능</div>
                  <div className="why">CONCURRENTLY 옵션 적용했지만 통계 갱신 시점에 일시적 lock 가능. 시간 일치(6분 전 → lock wait 다발).</div>
                  <span className="badge">근거 3</span>
                </div>
              </div>
              <div className="bucket">
                <div className="hh"><span><span className="dot g" /> 확실</span></div>
                <div className="item">
                  <div className="strong">prod 환경에서 실행됨</div>
                  <div className="why">audit row ev-2401 / DB 로그 / 사용자 승인 turn — 3중 일치.</div>
                  <span className="badge">근거 3</span>
                </div>
              </div>
              <div className="bucket">
                <div className="hh"><span><span className="dot m" /> 불명</span></div>
                <div className="item">
                  <div className="strong">테이블 통계 변경 폭</div>
                  <div className="why">applicants 테이블 통계가 인덱스 추가 직후 어떻게 변했는지 미수집 — DB 메트릭 별도 확인 필요.</div>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-h"><h3>근거 자료</h3><span className="sub">cross-reference</span></div>
            <ul style={{ margin: 0, paddingLeft: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                { i: "audit", l: "Audit Trail · ev-2401 (해시 9c4f7a1)" },
                { i: "git", l: "commit f08c4b2 · feat(applicants): add created_at DESC index" },
                { i: "review", l: "Reviewer Brief · 의도 vs 결과 — 부수 변경 0" },
                { i: "db", l: "Datadog APM · 16:32 lock wait spike" },
                { i: "file", l: "db/migrations/20260510_add_applicants_idx.sql · CREATE INDEX CONCURRENTLY" },
              ].map(r => (
                <li key={r.l} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: 10, border: "1px solid var(--line-soft)", borderRadius: 8,
                }}>
                  <span className="row tight" style={{ alignItems: "center" }}>
                    <Icon name={r.i} size={14} />
                    <span>{r.l}</span>
                  </span>
                  <button className="link">열기 →</button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="col">
          <div className="card tight">
            <div className="eyebrow">분류 변경</div>
            <div className="col" style={{ gap: 8, marginTop: 8 }}>
              {[
                { l: "원인 후보 (likely)", c: "y", on: true },
                { l: "확실한 증거 (verified)", c: "g", on: false },
                { l: "불명확 (unknown)", c: "m", on: false },
                { l: "제외 (irrelevant)", c: "gr", on: false },
              ].map(o => (
                <label key={o.l} className="row between" style={{ padding: 10, borderRadius: 8, border: "1px solid var(--line-soft)", background: o.on ? "var(--primary-light)" : "var(--bg-base)" }}>
                  <span className="row tight"><span className={"dot " + o.c} /> {o.l}</span>
                  <input type="radio" name="bucket" defaultChecked={o.on} />
                </label>
              ))}
            </div>
            <div className="hr" />
            <div className="fieldset">
              <label>분류 사유 (audit log에 기록)</label>
              <textarea className="focus-stub" rows={3} defaultValue="시간 일치 + DB 카테고리 + 사람 승인된 prod 변경. 인덱스 통계 갱신과 lock 경합 가능성. 단정 X." />
            </div>
            <button className="btn primary" style={{ marginTop: 10 }}>저장 · 3분리 갱신</button>
          </div>

          <div className="card tight">
            <div className="eyebrow">의도 ↔ 결과 미리보기</div>
            <div style={{ font: "var(--t-label1)", marginTop: 6 }}>
              Reviewer Brief에서 의도(Operator Explain Back)와 실제 변경을 좌우 비교합니다.
            </div>
            <button className="btn weak sm" style={{ marginTop: 10 }} onClick={() => gotoSession("reviewer")}>
              <Icon name="review" size={12} />Reviewer Brief 열기
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

/* H3 — Reviewer Brief 연결 (intent vs result split) */
function ReviewerBriefScreen({ gotoSession }) {
  return (
    <>
      <div className="page-h">
        <div>
          <div className="eyebrow">진입 시점 · Incident Replay → 의도/결과 비교</div>
          <h1>Reviewer Brief — s-024</h1>
          <p>Operator의 *의도* vs 실제 *결과*를 좌우로 본다. 부수 변경이 있는지 즉시 확인.</p>
        </div>
        <div className="actions">
          <button className="btn" onClick={() => gotoSession("event")}>← Event detail</button>
          <button className="btn danger">차단</button>
          <button className="btn">추가 확인</button>
          <button className="btn primary"><Icon name="check" size={14} />승인</button>
        </div>
      </div>

      <div className="split" style={{ marginBottom: 16 }}>
        <div>
          <div className="lh">의도 — Operator Explain Back + AI 자동 추출</div>

          <div className="eyebrow" style={{ marginBottom: 6 }}>Explain Back · 직접 작성</div>
          <div className="card tight" style={{ background: "var(--bg-subtle)", border: 0, marginBottom: 12 }}>
            <div className="strong" style={{ font: "var(--t-label1-strong)", marginBottom: 6 }}>의도 / 결과 / 검증 / 미해결 / 핸드오프</div>
            <ul style={{ margin: 0, paddingLeft: 18, color: "var(--text-neutral)", display: "flex", flexDirection: "column", gap: 4, font: "var(--t-label1)" }}>
              <li><b>의도</b>: 지원자 목록 페이지 느림 → created_at DESC 인덱스 추가</li>
              <li><b>결과</b>: dev → prod 마이그레이션 실행, 1.4s → 84ms 확인</li>
              <li><b>검증</b>: dev에서 EXPLAIN ANALYZE 확인, prod 메트릭 미확인</li>
              <li><b>미해결</b>: prod 적용 시점 직후 lock 영향 미확인</li>
              <li><b>핸드오프</b>: 30분 모니터링 결과 공유 요청</li>
            </ul>
          </div>

          <div className="eyebrow" style={{ marginBottom: 6 }}>AI 자동 추출 · prompt 요약</div>
          <div className="card tight" style={{ background: "var(--primary-light)", border: 0 }}>
            <div className="muted" style={{ font: "var(--t-caption1)", marginBottom: 6 }}>turn 1 / 4 / 6 핵심</div>
            <div style={{ font: "var(--t-label1)" }}>
              "applicants 테이블 created_at 정렬 인덱스 없는 듯. dev에서 한 번 돌리고 prod로." — 인덱스 *단일 컬럼*, *prod까지 적용* 의도.
            </div>
          </div>

          <div className="hr" />
          <div className="eyebrow">질문 후보 (AI · 3개)</div>
          <div className="col" style={{ gap: 6, marginTop: 6 }}>
            {[
              "prod 적용 직후 응답시간을 어디서 모니터링하기로 했나요?",
              "CONCURRENTLY 옵션 외에 lock 회피 전략이 있었나요?",
              "applicants 외 join 테이블의 plan 영향을 검토했나요?",
            ].map(q => (
              <div key={q} className="row between" style={{ padding: 10, borderRadius: 8, border: "1px solid var(--line-soft)", background: "var(--bg-base)" }}>
                <span style={{ font: "var(--t-label1)" }}>{q}</span>
                <button className="btn sm"><Icon name="share" size={12} />슬랙으로</button>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="lh">결과 — 실제 변경 · 명령 · DB 영향</div>

          <div className="eyebrow" style={{ marginBottom: 6 }}>변경 파일 (2)</div>
          <div className="col" style={{ gap: 6, marginBottom: 12 }}>
            {SD3.files.map(f => (
              <div key={f.path} className="row between" style={{ padding: 10, border: "1px solid var(--line-soft)", borderRadius: 8 }}>
                <code className="mono">{f.path}</code>
                <span className="mono muted">{f.lines}</span>
              </div>
            ))}
          </div>

          <div className="eyebrow" style={{ marginBottom: 6 }}>실행된 명령 (3)</div>
          <ul style={{ margin: 0, paddingLeft: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 6 }}>
            {SD3.commands.map((c, i) => (
              <li key={i} style={{ padding: 8, border: "1px solid var(--line-soft)", borderRadius: 8 }}>
                <div className="row between">
                  <span className="muted tnum" style={{ font: "var(--t-caption1)" }}>{c.t}</span>
                  {c.risk
                    ? <span className={"tag " + (c.risk.sev === "high" ? "red" : "orange")}><span className="dot" />{c.risk.sev}</span>
                    : <span className="tag neutral">정보</span>}
                </div>
                <code className="mono" style={{ display: "block", marginTop: 4 }}>{c.cmd}</code>
              </li>
            ))}
          </ul>

          <div className="hr" />
          <div className="eyebrow">DB 영향 추정</div>
          <ul style={{ margin: 0, paddingLeft: 18, color: "var(--text-neutral)", display: "flex", flexDirection: "column", gap: 4, font: "var(--t-label1)" }}>
            <li>applicants 테이블 · 인덱스 idx_applicants_created_at 추가</li>
            <li>인덱스 빌드 동안 짧은 통계 갱신 (CONCURRENTLY 옵션)</li>
            <li>관련 테이블 join 쿼리 plan 변경 가능성</li>
          </ul>
        </div>
      </div>

      <div className="card">
        <div className="card-h">
          <h3>의도 ↔ 결과 매칭</h3>
          <span className="sub">일치 부분 / 의도 외 부수 변경</span>
        </div>
        <div className="match-line ok"><Icon name="check" size={14} />일치 — created_at DESC 단일 컬럼 인덱스 추가 (의도 = 결과)</div>
        <div className="match-line ok"><Icon name="check" size={14} />일치 — dev → prod 적용 순서 (의도 = 결과)</div>
        <div className="match-line extra"><Icon name="warn" size={14} />부수 변경 — scripts/run-prod-migration.sh 1줄 수정 (의도에 없음 · 저위험)</div>

        <div className="hr" />
        <div className="row between">
          <div className="muted" style={{ font: "var(--t-caption1)" }}>
            검토 액션은 audit log에 기록됩니다 (검토자·시각·메모).
          </div>
          <div className="row tight">
            <input className="focus-stub" placeholder="짧은 메모 (선택)" style={{ width: 280, height: 32, padding: "0 10px", border: "1px solid var(--line-soft)", borderRadius: 8, background: "var(--bg-base)" }} />
            <button className="btn primary"><Icon name="check" size={14} />승인 + 기록</button>
          </div>
        </div>
      </div>
    </>
  );
}

/* H3 — Incident Note */
function IncidentNoteScreen({ gotoSession }) {
  const [notes, setNotes] = React.useState([
    { at: "16:35", who: "개발 리드 (8년차)", text: "prod 마이그레이션 직후 시간 일치. CONCURRENTLY 옵션은 들어갔지만 dev/prod 통계 차이 가능성." },
    { at: "16:38", who: "CTO 겸직 대표",     text: "Reviewer Brief으로 의도-결과 비교 띄움. 의도는 단순 인덱스 추가. 부수 변경 없는지 확인 필요." },
  ]);
  const [draft, setDraft] = React.useState("");
  return (
    <>
      <div className="page-h">
        <div>
          <div className="eyebrow">사고 누적 메모 · {INCIDENT.id}</div>
          <h1>Incident Note</h1>
          <p>조사 진행을 누적 작성. 각 메모는 자동 timestamp + 변조 불가 audit row가 됩니다.</p>
        </div>
        <div className="actions">
          <button className="btn" onClick={() => gotoSession("replay")}>← Replay</button>
          <button className="btn"><Icon name="share" size={14} />Slack 공유</button>
          <button className="btn primary"><Icon name="download" size={14} />Postmortem 양식</button>
        </div>
      </div>

      <div className="grid-split">
        <div className="card">
          <div className="card-h"><h3>조사 누적 메모</h3><span className="sub">{notes.length}건 · 가장 오래된 것부터</span></div>
          <div className="timeline">
            {notes.map((n, i) => (
              <div key={i} className="ev">
                <div className="t tnum">{n.at} · {n.who}</div>
                <div className="b" style={{ marginTop: 4 }}>{n.text}</div>
              </div>
            ))}
            {draft && (
              <div className="ev ok">
                <div className="t tnum">지금 · 작성 중</div>
                <div className="b" style={{ marginTop: 4 }}>{draft}</div>
              </div>
            )}
          </div>

          <div className="hr" />
          <div className="fieldset">
            <label>새 메모</label>
            <textarea
              className="focus-stub"
              rows={4}
              value={draft}
              onChange={e => setDraft(e.target.value)}
              placeholder="예) 16:42 — applicants 테이블 lock 해소 확인. 응답시간 회복 (840ms → 92ms)."
            />
            <div className="row between" style={{ marginTop: 4 }}>
              <span className="muted" style={{ font: "var(--t-caption1)" }}>
                저장 시 audit row 생성 · 이전 hash와 chain 연결
              </span>
              <button
                className="btn primary"
                disabled={!draft}
                onClick={() => {
                  const now = new Date();
                  const hh = String(now.getHours()).padStart(2, "0");
                  const mm = String(now.getMinutes()).padStart(2, "0");
                  setNotes([...notes, { at: `${hh}:${mm}`, who: "개발 리드 (8년차)", text: draft }]);
                  setDraft("");
                }}
              >
                <Icon name="plus" size={14} />메모 저장
              </button>
            </div>
          </div>
        </div>

        <div className="col">
          <div className="card tight">
            <div className="eyebrow">사고 요약 (자동)</div>
            <div style={{ font: "var(--t-label1-strong)", color: "var(--text-strong)", margin: "6px 0 8px" }}>
              {INCIDENT.title}
            </div>
            <ul style={{ margin: 0, paddingLeft: 18, color: "var(--text-neutral)", display: "flex", flexDirection: "column", gap: 4, font: "var(--t-label1)" }}>
              <li>시작 16:31 · 감지 16:34 · 경과 8분</li>
              <li>관련 AI 변경 · 1건 (s-024 · prod 인덱스)</li>
              <li>위험 카테고리 · DB · 고위험</li>
              <li>Reviewer Brief · 의도-결과 일치 / 부수 변경 1건</li>
            </ul>
          </div>

          <div className="card tight">
            <div className="eyebrow">Postmortem 자동 양식</div>
            <ul style={{ margin: 0, paddingLeft: 18, color: "var(--text-neutral)", display: "flex", flexDirection: "column", gap: 4, font: "var(--t-label1)" }}>
              <li>요약 / 영향 / Timeline</li>
              <li>3분리 (후보 · 확실 · 불명)</li>
              <li>관련 세션 · commit · 명령</li>
              <li>재발 방지 액션 (사람 작성)</li>
              <li>Audit row chain 검증 결과</li>
            </ul>
            <button className="btn primary" style={{ marginTop: 10 }}>
              <Icon name="download" size={14} />Postmortem 다운로드
            </button>
          </div>

          <div className="card tight" style={{ background: "var(--accent-light)", borderColor: "transparent" }}>
            <div style={{ font: "var(--t-label1-strong)", color: "var(--accent-strong)" }}>
              <Icon name="warn" size={14} /> 가설 H3 검증
            </div>
            <div className="muted" style={{ font: "var(--t-caption1)", color: "var(--accent-strong)", marginTop: 4 }}>
              16:31 사고 시작 → 16:38 1차 원인 메모 = 7분. 시연 시 8~10분 안에 끝나는지 확인.
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

window.AWMH3 = { RiskRadarScreen, IncidentReplayScreen, EventDetailScreen, ReviewerBriefScreen, IncidentNoteScreen };
