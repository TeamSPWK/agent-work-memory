/* H1 — Operator 회상 사이클
   Today → Sessions → Detail → Explain Back → 팀 공유 → 셀프 회상(어제) */

const { SESSIONS, SESSION_DETAIL } = AWMData;

/* Small helper — risk chip */
function RiskChip({ risk, size }) {
  if (!risk) return <span className="tag neutral">위험 없음</span>;
  const tone = risk.sev === "high" ? "red" : risk.sev === "med" ? "orange" : "neutral";
  const label = risk.sev === "high" ? "고위험" : risk.sev === "med" ? "주의" : "낮음";
  return <span className={"tag " + tone}><span className="dot"></span>{label} · {risk.cat}</span>;
}

/* H1 — Today */
function TodayScreen({ persona, gotoSession }) {
  const todayCount = { changed: 22, risk: 4, unexplained: 3 };
  const recent = SESSIONS.filter(s => s.when.startsWith("오늘"));
  const unexplained = SESSIONS.filter(s => !s.explained);

  return (
    <>
      <div className="page-h">
        <div>
          <div className="eyebrow">진입 시점 · 매일 첫 화면</div>
          <h1>오늘의 작업 메모리</h1>
          <p>오늘 무엇을 시켰고, 어떤 위험이 있었고, 무엇이 아직 설명 안 됐는지 한 화면에서 확인하세요.</p>
        </div>
        <div className="actions">
          <button className="btn"><Icon name="cal" size={14} />오늘 · 5월 10일</button>
          <button className="btn primary" onClick={() => gotoSession("explain")}>
            <Icon name="pencil" size={14} />Explain Back 채우기 ({unexplained.length})
          </button>
        </div>
      </div>

      <div className="grid-4" style={{ marginBottom: 16 }}>
        <div className="card tight">
          <div className="kpi"><div className="l">변경 파일</div><div className="v">{todayCount.changed}</div><div className="delta pos">+8 어제 대비</div></div>
        </div>
        <div className="card tight">
          <div className="kpi"><div className="l">위험 신호</div><div className="v" style={{ color: "var(--status-negative)" }}>{todayCount.risk}</div><div className="delta neg">+2 어제 대비</div></div>
        </div>
        <div className="card tight">
          <div className="kpi"><div className="l">설명 부족 세션</div><div className="v" style={{ color: "var(--accent-strong)" }}>{todayCount.unexplained}</div><div className="delta">-1 어제 대비</div></div>
        </div>
        <div className="card tight">
          <div className="kpi"><div className="l">팀 평균 검토 완료율</div><div className="v">76<span style={{ font: "var(--t-heading3)" }}>%</span></div><div className="delta pos">▲ 4%p</div></div>
        </div>
      </div>

      <div className="grid-split">
        <div className="card">
          <div className="card-h">
            <h3>오늘의 Work Session 타임라인</h3>
            <span className="sub">아침 → 저녁 순</span>
          </div>
          <div className="timeline">
            {recent.map(s => (
              <div key={s.id} className={"ev" + (s.risk ? " risk" : s.explained ? " ok" : "")}>
                <div className="t">{s.when} · {s.tool}</div>
                <div className="h">{s.intent}</div>
                <div className="b">{s.actor} · {s.repo} · {s.files}개 파일 / {s.cmds}개 명령</div>
                <div style={{ display: "flex", gap: 6, marginTop: 6, alignItems: "center" }}>
                  <RiskChip risk={s.risk} />
                  {!s.explained ? <span className="tag orange">설명 부족</span> : <span className="tag green">설명 완료</span>}
                  <button className="link" onClick={() => gotoSession("detail")}>세부 →</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="col">
          <div className="card tight">
            <div className="card-h">
              <h3>설명 부족 세션</h3>
              <span className="badge">팀 공유 전 채움</span>
            </div>
            <div className="col" style={{ gap: 8 }}>
              {unexplained.map(s => (
                <button
                  key={s.id}
                  onClick={() => gotoSession("detail")}
                  style={{
                    textAlign: "left", border: "1px solid var(--line-soft)",
                    borderRadius: 10, padding: 10, background: "var(--bg-base)",
                    display: "flex", flexDirection: "column", gap: 4,
                  }}
                >
                  <div style={{ font: "var(--t-label1-strong)", color: "var(--text-strong)" }}>{s.intent}</div>
                  <div className="muted" style={{ font: "var(--t-caption1)" }}>
                    {s.when} · {s.actor} · {s.repo}
                  </div>
                  <div><RiskChip risk={s.risk} /></div>
                </button>
              ))}
            </div>
          </div>

          <div className="card tight">
            <div className="card-h"><h3>내일 이어서 봐야 할 TODO</h3></div>
            <ul style={{ margin: 0, paddingLeft: 18, color: "var(--text-neutral)", display: "flex", flexDirection: "column", gap: 6 }}>
              <li>prod 인덱스 적용 후 응답시간 모니터링 (개발 리드)</li>
              <li>Notion 동기화 키 노출 확인 (운영 매니저)</li>
              <li>결제 재시도 UI Reviewer Brief 검토 (개발 리드)</li>
            </ul>
          </div>

          <div className="card tight" style={{ background: "var(--primary-light)", borderColor: "transparent" }}>
            <div className="row between">
              <div>
                <div style={{ font: "var(--t-label1-strong)", color: "var(--primary-strong)" }}>
                  팀 공유 요약 한 번에 복사
                </div>
                <div className="muted" style={{ font: "var(--t-caption1)", color: "var(--primary-strong)" }}>
                  오늘 작업 7개 · 위험 1건 · 설명 부족 3건
                </div>
              </div>
              <button className="btn weak" onClick={() => gotoSession("share")}>
                <Icon name="copy" size={14} />복사 화면으로
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/* H1 — Sessions list */
function SessionsScreen({ gotoSession }) {
  const [tool, setTool] = React.useState("All");
  const [q, setQ] = React.useState("");
  const tools = ["All", "Claude Code", "Cursor", "Codex", "Gemini"];
  const list = SESSIONS.filter(s =>
    (tool === "All" || s.tool === tool) &&
    (q === "" || s.intent.includes(q) || s.actor.includes(q))
  );

  return (
    <>
      <div className="page-h">
        <div>
          <div className="eyebrow">진입 시점 · Today에서 jump 또는 직접</div>
          <h1>Sessions</h1>
          <p>도구별로 세션을 훑고, 검토 상태와 위험 신호로 필터링합니다.</p>
        </div>
        <div className="actions">
          <button className="btn"><Icon name="filter" size={14} />필터</button>
          <button className="btn"><Icon name="cal" size={14} />오늘</button>
        </div>
      </div>

      <div className="card">
        <div className="row between" style={{ marginBottom: 14 }}>
          <div className="seg">
            {tools.map(t => (
              <button key={t} className={tool === t ? "active" : ""} onClick={() => setTool(t)}>{t}</button>
            ))}
          </div>
          <div className="row tight" style={{ alignItems: "center" }}>
            <input
              className="focus-stub"
              placeholder="의도·작업자·repo 검색"
              value={q} onChange={e => setQ(e.target.value)}
              style={{
                width: 280, height: 32, padding: "0 12px",
                border: "1px solid var(--line-soft)", borderRadius: 8, background: "var(--bg-base)",
              }}
            />
          </div>
        </div>

        <table className="tbl">
          <thead><tr>
            <th>도구</th><th>시각</th><th>의도 요약</th><th>작업자</th><th>위험</th><th>변경/명령</th><th>상태</th><th></th>
          </tr></thead>
          <tbody>
            {list.map(s => (
              <tr key={s.id} className={s.id === "s-024" ? "selected" : ""}>
                <td><span className="tag neutral">{s.tool}</span></td>
                <td className="tnum muted">{s.when}</td>
                <td><div className="strong" style={{ font: "var(--t-label1-strong)" }}>{s.intent}</div><div className="muted" style={{ font: "var(--t-caption1)" }}>{s.repo}</div></td>
                <td>{s.actor}</td>
                <td><RiskChip risk={s.risk} /></td>
                <td className="tnum">{s.files} / {s.cmds}</td>
                <td>{s.explained
                  ? <span className="tag green">검토 완료</span>
                  : <span className="tag orange">추가 확인 필요</span>}
                </td>
                <td><button className="link" onClick={() => gotoSession("detail")}>열기 →</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

/* H1 — Session Detail (intent/result/explain back layout) */
function SessionDetailScreen({ gotoSession }) {
  const d = SESSION_DETAIL;
  return (
    <>
      <div className="page-h">
        <div>
          <div className="eyebrow">세션 · {d.id}</div>
          <h1>{SESSIONS.find(s => s.id === d.id)?.intent}</h1>
          <p>{d.tool} · {d.actor} · {d.repo}@{d.branch} · 시작 {d.startedAt}</p>
        </div>
        <div className="actions">
          <button className="btn" onClick={() => gotoSession("sessions")}>← 리스트</button>
          <button className="btn primary" onClick={() => gotoSession("explain")}>
            <Icon name="pencil" size={14} />Explain Back 채우기
          </button>
        </div>
      </div>

      <div className="grid-split">
        <div className="col">
          <div className="card">
            <div className="card-h"><h3>대화 맥락 (turn별 요약)</h3><span className="sub">raw transcript는 노출되지 않음 · privacy</span></div>
            <div className="col" style={{ gap: 10 }}>
              {d.prompts.map(p => (
                <div key={p.turn}
                  style={{
                    display: "grid", gridTemplateColumns: "60px 1fr",
                    gap: 12, padding: "8px 12px",
                    borderRadius: 8,
                    background: p.role === "user" ? "var(--bg-subtle)" : "transparent",
                    borderLeft: p.text.includes("[risk:DB]") ? "3px solid var(--status-negative)" : "3px solid transparent",
                  }}
                >
                  <div className="muted tnum" style={{ font: "var(--t-caption1)" }}>turn {p.turn}<br />{p.t}</div>
                  <div>
                    <div className="badge" style={{ marginBottom: 4 }}>{p.role}</div>
                    <div style={{ font: "var(--t-label1)" }}>{p.text}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="card-h"><h3>실행된 명령</h3><span className="sub">위험 분류는 명령 패턴 기반</span></div>
            <table className="tbl">
              <thead><tr><th>시각</th><th>명령</th><th>위험</th></tr></thead>
              <tbody>
                {d.commands.map((c, i) => (
                  <tr key={i}>
                    <td className="tnum muted">{c.t}</td>
                    <td><code className="mono">{c.cmd}</code></td>
                    <td><RiskChip risk={c.risk} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="col">
          <div className="card tight">
            <div className="card-h"><h3>변경 파일</h3><span className="sub">+13 / -0</span></div>
            {d.files.map((f, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderTop: i ? "1px solid var(--line-soft)" : "0" }}>
                <div>
                  <div className="mono">{f.path}</div>
                  <div className="muted" style={{ font: "var(--t-caption1)" }}>{f.kind}</div>
                </div>
                <div className="mono muted" style={{ alignSelf: "center" }}>{f.lines}</div>
              </div>
            ))}
          </div>

          <div className="card tight">
            <div className="card-h"><h3>매칭 commit 후보</h3><span className="sub">시간·경로·브랜치·파일 4축</span></div>
            <div className="col" style={{ gap: 8 }}>
              {d.matches.map((m, i) => (
                <div key={m.sha}
                  style={{
                    border: "1px solid " + (i === 0 ? "var(--primary-normal)" : "var(--line-soft)"),
                    background: i === 0 ? "var(--primary-light)" : "var(--bg-base)",
                    borderRadius: 10, padding: 10,
                  }}
                >
                  <div className="row between" style={{ alignItems: "center" }}>
                    <div>
                      <div className="mono strong">{m.sha}</div>
                      <div style={{ font: "var(--t-label1)" }}>{m.msg}</div>
                    </div>
                    <div className="tnum strong" style={{ font: "var(--t-heading3)", color: i === 0 ? "var(--primary-strong)" : "var(--text-neutral)" }}>{Math.round(m.score * 100)}%</div>
                  </div>
                  <div className="row" style={{ gap: 6, marginTop: 8, fontSize: 11 }}>
                    {Object.entries(m.breakdown).map(([k, v]) => (
                      <div key={k} style={{ flex: 1 }}>
                        <div className="muted" style={{ textTransform: "uppercase", letterSpacing: "0.04em", font: "var(--t-caption2)" }}>{k}</div>
                        <div className="bar thin"><i style={{ width: (v * 100) + "%" }} /></div>
                      </div>
                    ))}
                  </div>
                  {i === 0 && (
                    <button className="btn primary sm" style={{ marginTop: 10 }}>
                      <Icon name="check" size={12} />이 commit 확정
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/* H1 — Explain Back composer */
function ExplainBackScreen({ gotoSession }) {
  const [v, setV] = React.useState({
    intent: "지원자 목록 페이지가 느려서, created_at 기준 최신순 정렬 인덱스를 추가하라고 했음.",
    result: "applicants 테이블에 created_at DESC 단일 컬럼 인덱스 생성. dev → prod 마이그레이션 실행.",
    verify: "dev에서 EXPLAIN ANALYZE로 1.4s → 84ms 확인. prod 적용 후 메트릭 미확인.",
    open: "prod 실행 시점 16:25 직후 lock wait 다발 발생 — 인덱스 영향인지 별개 이슈인지 모름.",
    handoff: "(개발 리드) prod 적용 후 30분간 응답시간 모니터링 결과 알려줘.",
  });
  const len = (s) => s.length;
  const fields = [
    { key: "intent",  label: "의도",     hint: "내가 요청한 것",        ph: "...", min: 30 },
    { key: "result",  label: "결과",     hint: "에이전트가 바꾼 것",    ph: "...", min: 30 },
    { key: "verify",  label: "검증",     hint: "내가 직접 확인한 것",   ph: "...", min: 20 },
    { key: "open",    label: "미해결",   hint: "아직 모르는 것",        ph: "...", min: 10 },
    { key: "handoff", label: "핸드오프", hint: "팀에게 물어볼 것",     ph: "...", min: 10 },
  ];
  const completion = fields.reduce((acc, f) => acc + Math.min(1, len(v[f.key]) / f.min), 0) / fields.length;

  return (
    <>
      <div className="page-h">
        <div>
          <div className="eyebrow">진입 시점 · Today에서 "설명 부족" 클릭</div>
          <h1>Explain Back 노트</h1>
          <p>점수·평가가 아닌 *협업 가능한 작업 요약*입니다. 팀 회상과 핸드오프에만 쓰입니다.</p>
        </div>
        <div className="actions">
          <button className="btn" onClick={() => gotoSession("detail")}>← 세션</button>
          <button className="btn primary" onClick={() => gotoSession("share")}>
            <Icon name="check" size={14} />저장 후 공유
          </button>
        </div>
      </div>

      <div className="grid-split">
        <div className="card">
          <div className="card-h">
            <h3>5필드 · {Math.round(completion * 100)}% 채워짐</h3>
            <div style={{ width: 180 }}><div className="bar"><i style={{ width: (completion * 100) + "%" }} /></div></div>
          </div>
          <div className="col" style={{ gap: 16 }}>
            {fields.map(f => (
              <div className="fieldset" key={f.key}>
                <label>
                  {f.label}
                  <span className="muted" style={{ marginLeft: 8, font: "var(--t-caption1)" }}>{f.hint}</span>
                </label>
                <textarea
                  className="focus-stub"
                  rows={f.key === "intent" || f.key === "result" ? 3 : 2}
                  value={v[f.key]}
                  onChange={e => setV({ ...v, [f.key]: e.target.value })}
                />
                <div className="hint tnum">{len(v[f.key])}자</div>
              </div>
            ))}
          </div>
        </div>

        <div className="col">
          <div className="card tight">
            <div className="eyebrow">참고</div>
            <div style={{ font: "var(--t-label1-strong)", color: "var(--text-strong)", margin: "4px 0 8px" }}>이 노트가 들어가는 곳</div>
            <ul style={{ margin: 0, paddingLeft: 16, color: "var(--text-neutral)", display: "flex", flexDirection: "column", gap: 6 }}>
              <li>팀 공유 요약 (오늘 페이지 카드)</li>
              <li>Reviewer Brief — *의도* 좌측 패널</li>
              <li>Audit Trail — 작업자 의도 기록 (감사 자료)</li>
              <li>사고 발생 시 Incident Replay 사이드바</li>
            </ul>
          </div>

          <div className="card tight">
            <div className="eyebrow">AI 보조</div>
            <div style={{ font: "var(--t-label1-strong)", color: "var(--text-strong)", margin: "4px 0 8px" }}>
              <Icon name="sparkle" size={14} /> 자동 추출 초안
            </div>
            <div className="muted" style={{ font: "var(--t-label2)", marginBottom: 10 }}>
              세션의 turn 1·2·6·7과 명령 로그에서 의도·결과·검증을 추출했습니다. 직접 손보세요.
            </div>
            <button className="btn weak sm">
              <Icon name="sparkle" size={12} />초안 다시 생성
            </button>
          </div>

          <div className="card tight">
            <div className="eyebrow">알림 정책</div>
            <div className="muted" style={{ font: "var(--t-label2)", marginTop: 6 }}>
              매시간 알림은 보내지 않습니다. *오늘 첫 화면*에 누적되어 자율적으로 처리합니다 (PRD §9 운영 룰).
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/* H1 — 팀 공유 요약 */
function ShareScreen({ gotoSession }) {
  const [copied, setCopied] = React.useState(false);
  const summary = `[5/10 (월) · B2B SaaS 워크스페이스 · AI 작업 요약]
• Claude Code / Cursor / Codex 7세션, 변경 파일 22개, 명령 13개
• 위험 신호 4건 (DB 2 · Secret 1 · Deploy 1)
• 검토 완료 4 / 추가 확인 필요 3

[추가 확인 필요]
1) [DB·고위험] applicants 테이블 created_at DESC 인덱스 prod 적용 (16:25)
   → 직후 lock wait 다발. 응답시간 모니터링 필요.
   담당: 개발 리드
2) [Secret·주의] Notion API 키 .env 추가 (13:08)
   → .gitignore 확인 완료. push 이력은 미확인.
   담당: 운영 매니저
3) [-] 결제 실패 재시도 UI 5파일 (15:48)
   → Reviewer Brief 검토 대기.
   담당: 프론트엔드`;

  return (
    <>
      <div className="page-h">
        <div>
          <div className="eyebrow">진입 시점 · Today 또는 Explain Back 저장 후</div>
          <h1>팀 공유 요약</h1>
          <p>슬랙·노션·이메일에 그대로 붙여 넣을 수 있는 한국어 요약입니다.</p>
        </div>
        <div className="actions">
          <button className="btn" onClick={() => gotoSession("explain")}>← Explain Back</button>
          <button className="btn primary" onClick={() => { navigator.clipboard?.writeText(summary); setCopied(true); setTimeout(() => setCopied(false), 1500); }}>
            <Icon name="copy" size={14} />{copied ? "복사 완료" : "전체 복사"}
          </button>
        </div>
      </div>

      <div className="grid-split">
        <div className="card">
          <div className="card-h"><h3>요약 미리보기</h3><span className="sub">한국어 / 마크다운 없는 평문</span></div>
          <pre style={{
            margin: 0,
            font: "var(--t-label1)", lineHeight: 1.7,
            color: "var(--text-normal)",
            whiteSpace: "pre-wrap",
            padding: 16, borderRadius: 10,
            background: "var(--bg-subtle)",
            border: "1px solid var(--line-soft)",
          }}>{summary}</pre>
        </div>

        <div className="col">
          <div className="card tight">
            <div className="eyebrow">전송 채널 (시연용 placeholder)</div>
            <div className="col" style={{ gap: 10, marginTop: 10 }}>
              {[
                { name: "Slack #ai-work", icon: "share" },
                { name: "Notion · 일일 메모리", icon: "book" },
                { name: "이메일 (팀 메일링)", icon: "mail" },
              ].map(c => (
                <button key={c.name} className="btn" style={{ justifyContent: "flex-start", height: 40 }}>
                  <Icon name={c.icon} size={16} />{c.name}
                </button>
              ))}
            </div>
          </div>

          <div className="card tight">
            <div className="eyebrow">포함 항목</div>
            <ul style={{ margin: 0, paddingLeft: 16, color: "var(--text-neutral)", display: "flex", flexDirection: "column", gap: 6 }}>
              <li>오늘 통계 (변경/위험/미설명)</li>
              <li>추가 확인 필요 세션 + 담당자</li>
              <li>Explain Back에서 채운 *핸드오프*</li>
              <li>raw transcript 또는 secret 값은 절대 미포함</li>
            </ul>
          </div>

          <div className="card tight" style={{ background: "var(--accent-light)", borderColor: "transparent" }}>
            <div style={{ font: "var(--t-label1-strong)", color: "var(--accent-strong)" }}>
              <Icon name="warn" size={14} /> 가설 H1 검증 포인트
            </div>
            <div className="muted" style={{ font: "var(--t-caption1)", color: "var(--accent-strong)", marginTop: 4 }}>
              "오늘 첫 화면 → 미설명 → Explain Back → 한 번 복사" 사이클이 5분 안에 끝나는지 시연.
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/* H1 — 셀프 회상 (어제) */
function SelfRecallScreen({ gotoSession }) {
  const yesterday = SESSIONS.filter(s => s.when.startsWith("어제"));
  return (
    <>
      <div className="page-h">
        <div>
          <div className="eyebrow">진입 시점 · 어제·지난주 작업 회상이 필요할 때</div>
          <h1>셀프 회상 — 어제 한 일</h1>
          <p>며칠 전 자기가 시킨 작업도 같은 의도/결과 분리로 다시 본다 (Reviewer Brief 셀프 모드).</p>
        </div>
        <div className="actions">
          <button className="btn"><Icon name="cal" size={14} />어제 · 5월 9일</button>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div className="row between">
          <div className="row tight" style={{ alignItems: "center" }}>
            <Icon name="book" size={16} />
            <div>
              <div className="strong" style={{ font: "var(--t-label1-strong)" }}>나만 보는 회상 모드</div>
              <div className="muted" style={{ font: "var(--t-caption1)" }}>어제 작업 1건 · 검토 완료. 셀프 핸드오프 노트만 작성 가능.</div>
            </div>
          </div>
          <div><span className="persona-mark op">Operator · 셀프</span></div>
        </div>
      </div>

      {yesterday.map(s => (
        <div key={s.id} className="split">
          <div>
            <div className="lh">의도 · 어제 내가 시킨 것 (Explain Back)</div>
            <div style={{ font: "var(--t-heading3)", color: "var(--text-strong)", marginBottom: 8 }}>{s.intent}</div>
            <div className="muted" style={{ font: "var(--t-label2)", marginBottom: 12 }}>
              {s.when} · {s.tool} · {s.repo}
            </div>
            <div className="fieldset">
              <label>의도</label>
              <div className="card tight" style={{ background: "var(--bg-subtle)", border: 0 }}>
                매주 월요일 9시에 지난 주 지원자/면접/오퍼 통계를 자동 생성해 운영 채널에 보내달라.
              </div>
              <label>결과</label>
              <div className="card tight" style={{ background: "var(--bg-subtle)", border: 0 }}>
                Vercel cron으로 weekly-report 함수 등록. 슬랙 webhook URL은 .env로 분리.
              </div>
            </div>
          </div>
          <div>
            <div className="lh">결과 · 어제 적용된 것</div>
            <div style={{ font: "var(--t-label1)", marginBottom: 8 }}>변경 파일 3 / 명령 2</div>
            <ul style={{ margin: 0, paddingLeft: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
              <li className="mono">api/cron/weekly-report.ts (added · +84 / -0)</li>
              <li className="mono">vercel.json (modified · +6 / -0)</li>
              <li className="mono">.env.example (modified · +2 / -0)</li>
            </ul>
            <div className="hr" />
            <div className="match-line ok"><Icon name="check" size={14} />의도 ↔ 결과 일치 — cron 등록 + 통계 함수</div>
            <div className="match-line extra"><Icon name="warn" size={14} />의도 외 부수 변경 — .env.example 갱신 (저위험)</div>

            <div className="hr" />
            <div className="fieldset">
              <label>오늘의 셀프 핸드오프</label>
              <textarea className="focus-stub" rows={3} placeholder="(나에게) 다음 주 월요일 9:05에 첫 발송 결과 확인. 통계 누락 항목 있으면 SQL 검토." />
            </div>
            <button className="btn primary" style={{ marginTop: 10 }} onClick={() => gotoSession("today")}>
              <Icon name="check" size={14} />저장 후 Today로
            </button>
          </div>
        </div>
      ))}
    </>
  );
}

window.AWMH1 = { TodayScreen, SessionsScreen, SessionDetailScreen, ExplainBackScreen, ShareScreen, SelfRecallScreen };
