/* H4 — 5분 first-value 온보딩
   워크스페이스 생성 → AI 도구 connect → 첫 세션 import → Reviewer 지정 → 완료(Today 점프) */

const { ONBOARDING_TOOLS, ONBOARDING_IMPORT_STEPS, ONBOARDING_FIRST_SESSION, WS_MEMBERS, COMPLIANCE: H4_COMP } = AWMData;

function OnboardingProgress({ step }) {
  const labels = ["워크스페이스", "도구 연결", "세션 import", "Reviewer", "완료"];
  return (
    <div className="card tight" style={{ marginBottom: 16 }}>
      <div className="row between" style={{ marginBottom: 8 }}>
        <span className="eyebrow">온보딩 진행</span>
        <span className="muted tnum" style={{ font: "var(--t-caption1)" }}>{step} / 5</span>
      </div>
      <div className="row tight" style={{ gap: 8 }}>
        {labels.map((l, i) => {
          const n = i + 1;
          const state = n < step ? "done" : n === step ? "now" : "todo";
          return (
            <div key={l} style={{ flex: 1 }}>
              <div className="bar thin">
                <i style={{
                  width: state === "todo" ? "0%" : "100%",
                  background: state === "todo" ? "var(--bg-subtle)" : "var(--primary-normal)",
                }} />
              </div>
              <div className="row tight" style={{ marginTop: 6 }}>
                <span className="num" style={{
                  width: 18, height: 18, borderRadius: 5,
                  display: "grid", placeItems: "center",
                  font: "var(--t-caption2)",
                  background: state === "done" ? "var(--primary-normal)" : state === "now" ? "var(--primary-light)" : "var(--bg-subtle)",
                  color: state === "done" ? "#fff" : state === "now" ? "var(--primary-strong)" : "var(--text-assistive)",
                }}>{state === "done" ? "✓" : n}</span>
                <span style={{
                  font: state === "now" ? "var(--t-label2-strong)" : "var(--t-label2)",
                  color: state === "now" ? "var(--text-strong)" : "var(--text-assistive)",
                }}>{l}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* H4 / 1 — 워크스페이스 생성 */
function OB_WorkspaceScreen({ gotoSession }) {
  return (
    <>
      <OnboardingProgress step={1} />
      <div className="page-h">
        <div>
          <div className="eyebrow">1 / 5 · 시작</div>
          <h1>워크스페이스를 만듭니다</h1>
          <p>이름과 운영 형태를 알려주세요. 외부에 공유되지 않습니다.</p>
        </div>
      </div>

      <div className="grid-split">
        <div className="card">
          <div className="card-h"><h3>워크스페이스 정보</h3><span className="sub">모두 나중에 변경 가능</span></div>

          <div className="fieldset">
            <label>워크스페이스 이름</label>
            <input className="focus-stub" defaultValue="새 워크스페이스" />
            <div className="hint">팀원에게 보이는 이름. 회사명·서비스명 어느 쪽이든.</div>
          </div>

          <div className="hr" />

          <div className="fieldset">
            <label>세그먼트</label>
            <div className="row tight" style={{ flexWrap: "wrap" }}>
              {["B2B SaaS", "D2C 이커머스", "서비스업", "솔로 인디", "기타"].map((s, i) => (
                <label key={s} className="row tight" style={{
                  padding: "8px 12px", border: "1px solid var(--line-soft)", borderRadius: 8,
                  background: i === 0 ? "var(--primary-light)" : "var(--bg-base)",
                  color: i === 0 ? "var(--primary-strong)" : "var(--text-normal)",
                  font: i === 0 ? "var(--t-label1-strong)" : "var(--t-label1)",
                }}>
                  <input type="radio" name="seg" defaultChecked={i === 0} />
                  {s}
                </label>
              ))}
            </div>
          </div>

          <div className="hr" />

          <div className="fieldset">
            <label>팀 규모</label>
            <div className="row tight" style={{ flexWrap: "wrap" }}>
              {["1", "2~10", "11~30", "31~50", "51+"].map((s, i) => (
                <label key={s} className="row tight" style={{
                  padding: "8px 12px", border: "1px solid var(--line-soft)", borderRadius: 8,
                  background: i === 2 ? "var(--primary-light)" : "var(--bg-base)",
                  color: i === 2 ? "var(--primary-strong)" : "var(--text-normal)",
                  font: i === 2 ? "var(--t-label1-strong)" : "var(--t-label1)",
                }}>
                  <input type="radio" name="size" defaultChecked={i === 2} />
                  {s}
                </label>
              ))}
            </div>
          </div>

          <div className="hr" />

          <div className="grid-2">
            <div className="fieldset">
              <label>언어</label>
              <select className="focus-stub" defaultValue="ko">
                <option value="ko">한국어</option>
                <option value="en">English (선공개)</option>
              </select>
            </div>
            <div className="fieldset">
              <label>요금 통화</label>
              <select className="focus-stub" defaultValue="KRW">
                <option value="KRW">KRW · 원</option>
                <option value="USD">USD · 달러</option>
              </select>
            </div>
          </div>

          <div className="hr" />
          <div className="row between">
            <span className="muted" style={{ font: "var(--t-caption1)" }}>
              <Icon name="lock" size={12} /> 이메일·이름 외 개인정보 수집 안 함
            </span>
            <button className="btn primary lg" onClick={() => gotoSession("connect")}>
              다음 — 도구 연결 <Icon name="arrow" size={14} />
            </button>
          </div>
        </div>

        <div className="col">
          <div className="card tight" style={{ background: "var(--primary-light)", borderColor: "transparent" }}>
            <div style={{ font: "var(--t-label1-strong)", color: "var(--primary-strong)" }}>
              왜 묻는가
            </div>
            <ul style={{ margin: "8px 0 0", paddingLeft: 18, font: "var(--t-label2)", color: "var(--primary-strong)", display: "flex", flexDirection: "column", gap: 6 }}>
              <li>세그먼트·규모는 디자인 파트너 추적과 자동 제안에만 사용</li>
              <li>외부 노출·제3자 공유 없음 (PRD §9 anonymization)</li>
              <li>요금 통화는 결제 시점에만 사용, 표시 단위 결정용</li>
            </ul>
          </div>

          <div className="card tight">
            <div className="eyebrow">다음에 일어날 일</div>
            <ol style={{ margin: "8px 0 0", paddingLeft: 18, font: "var(--t-label2)", color: "var(--text-neutral)", display: "flex", flexDirection: "column", gap: 6 }}>
              <li>AI 도구 1개 이상 연결</li>
              <li>최근 세션 1건 자동 import (백그라운드 30초~2분)</li>
              <li>Reviewer 1명 지정 → 7대 원칙 §1 활성</li>
              <li>Today에 첫 세션 행 표시 → 완료</li>
            </ol>
            <div className="muted" style={{ font: "var(--t-caption1)", marginTop: 8 }}>
              예상 소요 시간 · 4~6분
            </div>
          </div>

          <div className="card tight" style={{ background: "var(--bg-subtle)", borderColor: "transparent" }}>
            <div className="eyebrow" style={{ color: "var(--text-assistive)" }}>운영 원칙</div>
            <div className="muted" style={{ font: "var(--t-caption1)", marginTop: 4 }}>
              1인 운영 self-serve. 24/7 지원은 없습니다. 대신 워크스페이스 데이터는
              본인이 언제든 JSON으로 export 가능 (Settings · Profile).
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/* H4 / 2 — AI 도구 connect */
function OB_ConnectScreen({ gotoSession }) {
  const [tools, setTools] = React.useState(ONBOARDING_TOOLS);
  const [showAuth, setShowAuth] = React.useState(null);
  const connectedCount = tools.filter(t => t.state === "connected").length;

  const onConnect = (k) => setShowAuth(k);
  const confirmAuth = () => {
    setTools(t => t.map(x => x.key === showAuth ? { ...x, state: "connected" } : x));
    setShowAuth(null);
  };

  const stateChip = (s) => {
    if (s === "connected") return <span className="tag green"><span className="dot" />연결됨</span>;
    if (s === "error")     return <span className="tag red"><span className="dot" />오류</span>;
    return <span className="tag neutral">미연결</span>;
  };

  return (
    <>
      <OnboardingProgress step={2} />
      <div className="page-h">
        <div>
          <div className="eyebrow">2 / 5 · AI 도구 연결</div>
          <h1>최소 1개를 연결하면 다음으로</h1>
          <p>연결은 OAuth로 진행됩니다. 원문 transcript는 저장하지 않습니다.</p>
        </div>
        <div className="actions">
          <span className="muted tnum" style={{ font: "var(--t-caption1)" }}>{connectedCount} / 4 연결됨</span>
        </div>
      </div>

      <div className="grid-split">
        <div className="card">
          <div className="card-h"><h3>도구</h3><span className="sub">연결 즉시 import 시작</span></div>
          <div className="grid-2" style={{ gap: 12 }}>
            {tools.map(t => (
              <div key={t.key} className="card tight" style={{
                borderColor: t.state === "connected" ? "var(--primary-normal)" : "var(--line-soft)",
                background: t.state === "connected" ? "var(--primary-light)" : "var(--bg-base)",
              }}>
                <div className="row between">
                  <div className="row tight" style={{ alignItems: "center" }}>
                    <div className="avatar" style={{
                      background: "var(--text-strong)", borderRadius: 8, width: 32, height: 32,
                    }}>{t.name[0]}</div>
                    <div>
                      <div style={{ font: "var(--t-label1-strong)", color: "var(--text-strong)" }}>{t.name}</div>
                      <div className="muted" style={{ font: "var(--t-caption1)" }}>{t.desc}</div>
                    </div>
                  </div>
                  {stateChip(t.state)}
                </div>
                <div className="hr" />
                <div className="muted" style={{ font: "var(--t-caption1)", marginBottom: 8 }}>
                  권한 스코프 · {t.scope}
                </div>
                {t.state === "connected" ? (
                  <button className="btn sm" onClick={() => setTools(ts => ts.map(x => x.key === t.key ? { ...x, state: "idle" } : x))}>
                    연결 해제
                  </button>
                ) : t.state === "error" ? (
                  <button className="btn sm" onClick={() => onConnect(t.key)}>
                    <Icon name="link" size={12} />재연결
                  </button>
                ) : (
                  <button className="btn primary sm" onClick={() => onConnect(t.key)}>
                    <Icon name="link" size={12} />연결
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="hr" />
          <div className="row between">
            <button className="btn" onClick={() => gotoSession("ws")}>← 이전</button>
            <button
              className="btn primary lg"
              disabled={connectedCount === 0}
              style={{ opacity: connectedCount === 0 ? 0.5 : 1 }}
              onClick={() => gotoSession("import")}
            >
              다음 — 첫 세션 import <Icon name="arrow" size={14} />
            </button>
          </div>
        </div>

        <div className="col">
          <div className="card tight" style={{ background: "var(--primary-light)", borderColor: "transparent" }}>
            <div style={{ font: "var(--t-label1-strong)", color: "var(--primary-strong)" }}>
              <Icon name="lock" size={14} /> 저장하지 않는 것
            </div>
            <ul style={{ margin: "8px 0 0", paddingLeft: 18, font: "var(--t-label2)", color: "var(--primary-strong)", display: "flex", flexDirection: "column", gap: 6 }}>
              <li>원문 transcript (사용자·AI 발화 그대로)</li>
              <li>코드 파일 원본 (변경된 부분 요약만)</li>
              <li>고객·민감 정보 (감지 시 자동 마스킹)</li>
            </ul>
          </div>

          <div className="card tight">
            <div className="eyebrow">저장하는 것</div>
            <ul style={{ margin: "8px 0 0", paddingLeft: 18, font: "var(--t-label2)", color: "var(--text-neutral)", display: "flex", flexDirection: "column", gap: 6 }}>
              <li>세션 메타 (시각·도구·작업자·intent 1줄)</li>
              <li>변경 파일 경로 + 추가/삭제 라인 수</li>
              <li>실행된 명령의 위험 분류 결과</li>
              <li>commit 매칭 score</li>
            </ul>
          </div>

          <div className="card tight" style={{ background: "var(--bg-subtle)", borderColor: "transparent" }}>
            <div className="eyebrow" style={{ color: "var(--text-assistive)" }}>OAuth만 사용</div>
            <div className="muted" style={{ font: "var(--t-caption1)", marginTop: 4 }}>
              모든 도구는 OAuth 2.0 / 도구별 token 방식. 비밀번호를 저장하지 않습니다.
              연결을 해제하면 30일 후 메타 데이터도 자동 삭제됩니다.
            </div>
          </div>
        </div>
      </div>

      {showAuth && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)",
          display: "grid", placeItems: "center", zIndex: 100,
        }} onClick={() => setShowAuth(null)}>
          <div className="card" style={{ width: 520, maxWidth: "92vw" }} onClick={e => e.stopPropagation()}>
            <div className="card-h">
              <h3>{tools.find(t => t.key === showAuth)?.name} OAuth 권한 확인</h3>
              <button className="icon-btn" onClick={() => setShowAuth(null)}><Icon name="x" size={14} /></button>
            </div>
            <div className="muted" style={{ font: "var(--t-label2)", marginBottom: 12 }}>
              Agent Work Memory가 {tools.find(t => t.key === showAuth)?.name}에 다음 권한을 요청합니다.
            </div>
            <ul style={{ margin: 0, paddingLeft: 18, font: "var(--t-label2)", color: "var(--text-neutral)", display: "flex", flexDirection: "column", gap: 8 }}>
              <li>세션 목록 + 메타 읽기</li>
              <li>코드 변경 파일 경로·라인 수 읽기 (원본 제외)</li>
              <li>명령 로그 읽기</li>
            </ul>
            <div className="hr" />
            <div className="row between">
              <span className="muted" style={{ font: "var(--t-caption1)" }}>
                <Icon name="lock" size={12} /> 쓰기 권한 없음
              </span>
              <div className="row tight">
                <button className="btn" onClick={() => setShowAuth(null)}>취소</button>
                <button className="btn primary" onClick={confirmAuth}>
                  <Icon name="check" size={14} />허용
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* H4 / 3 — 첫 세션 import 진행 */
function OB_ImportScreen({ gotoSession }) {
  const steps = ONBOARDING_IMPORT_STEPS;
  return (
    <>
      <OnboardingProgress step={3} />
      <div className="page-h">
        <div>
          <div className="eyebrow">3 / 5 · 첫 세션 가져오기</div>
          <h1>Cursor에서 가장 최근 세션을 import 중…</h1>
          <p>4단계로 진행됩니다. 마지막 단계는 백그라운드에서 완료되므로 다음으로 진행 가능합니다.</p>
        </div>
      </div>

      <div className="grid-split">
        <div className="card">
          <div className="card-h"><h3>진행 단계</h3><span className="sub">평균 30초~2분</span></div>
          <div className="timeline">
            {steps.map(s => (
              <div key={s.key} className={"ev " + (s.state === "done" ? "ok" : s.state === "running" ? "risk" : "")}>
                <div className="t">{s.state === "done" ? "완료" : s.state === "running" ? "진행 중…" : "대기"}</div>
                <div className="h">{s.label}</div>
                <div className="b muted" style={{ font: "var(--t-caption1)" }}>
                  {s.key === "auth"  && "OAuth scope 확인 — 세션·메타·코드 변경 요약 읽기만."}
                  {s.key === "meta"  && "최근 30일 세션 14건 메타 fetch."}
                  {s.key === "match" && "변경 파일 ↔ git commit 매칭 — 평균 score 0.87."}
                  {s.key === "risk"  && "DB · Secret · Deploy 등 8 카테고리 위험 분석. 백그라운드 완료."}
                </div>
              </div>
            ))}
          </div>
          <div className="hr" />
          <div className="row between">
            <button className="btn" onClick={() => gotoSession("connect")}>← 이전</button>
            <button className="btn primary lg" onClick={() => gotoSession("reviewer")}>
              Reviewer 지정 <Icon name="arrow" size={14} />
              <span className="muted" style={{ font: "var(--t-caption2)", marginLeft: 6, color: "rgba(255,255,255,0.8)" }}>
                · 위험 분석은 백그라운드 진행
              </span>
            </button>
          </div>
        </div>

        <div className="col">
          <div className="card tight">
            <div className="eyebrow">방금 도착한 첫 세션</div>
            <div style={{ font: "var(--t-label1-strong)", color: "var(--text-strong)", margin: "8px 0 4px" }}>
              {ONBOARDING_FIRST_SESSION.intent}
            </div>
            <div className="muted" style={{ font: "var(--t-caption1)", marginBottom: 10 }}>
              {ONBOARDING_FIRST_SESSION.tool} · {ONBOARDING_FIRST_SESSION.startedAt}
            </div>
            <div className="row tight" style={{ flexWrap: "wrap" }}>
              <span className="tag neutral">파일 {ONBOARDING_FIRST_SESSION.files}</span>
              <span className="tag green">위험 없음</span>
              <span className="tag blue">{ONBOARDING_FIRST_SESSION.id}</span>
            </div>
            <div className="hr" />
            <div className="muted" style={{ font: "var(--t-caption1)" }}>
              이 세션은 Reviewer 지정 후 Today 화면에 표시됩니다.
            </div>
          </div>

          <div className="card tight" style={{ background: "var(--accent-light)", borderColor: "transparent" }}>
            <div style={{ font: "var(--t-label1-strong)", color: "var(--accent-strong)" }}>
              <Icon name="warn" size={14} /> 가설 H4 검증 포인트
            </div>
            <div className="muted" style={{ font: "var(--t-caption1)", color: "var(--accent-strong)", marginTop: 4 }}>
              "워크스페이스 생성 시작 → Today 첫 행 표시"까지 시간을 측정 — 목표 5분 이하.
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/* H4 / 4 — Reviewer 지정 */
function OB_ReviewerScreen({ gotoSession }) {
  const [picked, setPicked] = React.useState(["u5"]);
  const toggle = (id) => setPicked(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
  return (
    <>
      <OnboardingProgress step={4} />
      <div className="page-h">
        <div>
          <div className="eyebrow">4 / 5 · 거버넌스 활성</div>
          <h1>AI 변경 검토자(Reviewer)를 지정하세요</h1>
          <p>7대 원칙 §1 거버넌스가 활성화됩니다. 본인이 단독 Reviewer여도 됩니다.</p>
        </div>
      </div>

      <div className="grid-split">
        <div className="card">
          <div className="card-h">
            <h3>워크스페이스 멤버</h3>
            <span className="sub">최소 1명 · 멀티 가능</span>
          </div>
          <div className="col" style={{ gap: 8 }}>
            {WS_MEMBERS.slice(0, 5).map(m => (
              <label key={m.id} className="row between" style={{
                padding: 12, border: "1px solid var(--line-soft)", borderRadius: 10,
                background: picked.includes(m.id) ? "var(--primary-light)" : "var(--bg-base)",
                cursor: "pointer",
              }}>
                <span className="row tight" style={{ alignItems: "center" }}>
                  <div className={"avatar " + m.color}>{m.initials}</div>
                  <div>
                    <div style={{ font: "var(--t-label1-strong)", color: "var(--text-strong)" }}>{m.role}</div>
                    <div className="muted" style={{ font: "var(--t-caption1)" }}>{m.email} · 마지막 활동 {m.lastActive}</div>
                  </div>
                </span>
                <span className="row tight" style={{ alignItems: "center" }}>
                  <span className={"tag " + (m.persona === "Admin" ? "blue" : m.persona === "Reviewer" ? "green" : "neutral")}>
                    {m.persona}
                  </span>
                  <input type="checkbox" checked={picked.includes(m.id)} onChange={() => toggle(m.id)} />
                </span>
              </label>
            ))}
          </div>

          <div className="hr" />
          <div className="fieldset">
            <label>새 멤버 초대 (선택)</label>
            <input className="focus-stub" placeholder="이메일을 쉼표로 구분 · 예) ops@…, dev@…" />
            <div className="hint">
              초대 후 역할은 Workspace → Members에서 변경 가능. 초대 메일에는 워크스페이스명·본인 이름만 노출.
            </div>
          </div>

          <div className="hr" />
          <div className="row between">
            <button className="btn" onClick={() => gotoSession("import")}>← 이전</button>
            <button className="btn primary lg" disabled={picked.length === 0} onClick={() => gotoSession("done")}>
              완료 <Icon name="arrow" size={14} />
            </button>
          </div>
        </div>

        <div className="col">
          <div className="card tight">
            <div className="eyebrow">7대 원칙 · 거버넌스 (§1) 미리보기</div>
            <ul className="compliance" style={{ marginTop: 8, padding: 0 }}>
              {H4_COMP.slice(0, 4).map((c, i) => {
                const isFirst = i === 0;
                const pending = isFirst && picked.length === 0;
                return (
                  <li key={c.name}>
                    <span className={"check " + (pending ? "todo" : c.state === "warn" ? "warn" : "")}>
                      {pending ? "…" : c.state === "warn" ? "!" : "✓"}
                    </span>
                    <div>
                      <div className="pname">{c.name}</div>
                      <div className="pdesc">
                        {isFirst
                          ? (pending
                              ? "Reviewer 미지정 — 지금 지정하면 즉시 활성"
                              : `Reviewer ${picked.length}명 지정 완료 — 활성`)
                          : c.note}
                      </div>
                    </div>
                    <span className={"tag " + (pending ? "neutral" : "green")}>
                      {pending ? "pending" : "ok"}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="card tight" style={{ background: "var(--primary-light)", borderColor: "transparent" }}>
            <div style={{ font: "var(--t-label1-strong)", color: "var(--primary-strong)" }}>
              역할 의미
            </div>
            <ul style={{ margin: "8px 0 0", paddingLeft: 18, font: "var(--t-label2)", color: "var(--primary-strong)", display: "flex", flexDirection: "column", gap: 6 }}>
              <li><b>Operator</b> · AI에 작업 시키고 결과 회상</li>
              <li><b>Reviewer</b> · AI 변경의 의도-결과 비교, 승인</li>
              <li><b>Admin</b> · 워크스페이스·결제·역할·감사 양식 관리</li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}

/* H4 / 5 — 완료 → Today */
function OB_DoneScreen({ gotoSession }) {
  return (
    <>
      <OnboardingProgress step={5} />
      <div className="card" style={{
        background: "linear-gradient(180deg, var(--primary-light) 0%, var(--surface-card) 80%)",
        borderColor: "transparent", padding: 36, textAlign: "center",
      }}>
        <div style={{
          width: 72, height: 72, borderRadius: 999, background: "var(--primary-normal)",
          margin: "0 auto 16px", display: "grid", placeItems: "center", color: "#fff",
        }}>
          <Icon name="check" size={36} />
        </div>
        <div style={{ font: "var(--t-title2)", letterSpacing: "var(--ls-title)", color: "var(--text-strong)" }}>
          온보딩 완료 — 첫 세션이 Today에 도착했습니다
        </div>
        <div className="muted" style={{ font: "var(--t-body2)", marginTop: 6 }}>
          이제부터 새 AI 세션은 자동으로 Today에 누적됩니다.
        </div>
      </div>

      <div className="grid-2" style={{ marginTop: 16 }}>
        <div className="card">
          <div className="card-h"><h3>실측 시간</h3><span className="sub">시연용 mock</span></div>
          <div className="row" style={{ alignItems: "flex-end", gap: 24 }}>
            <div className="kpi">
              <div className="l">온보딩 시작 → 첫 세션 표시</div>
              <div className="v tnum" style={{ color: "var(--primary-normal)" }}>4분 38초</div>
              <div className="delta pos">목표 5분 이하 — 통과</div>
            </div>
            <div className="kpi">
              <div className="l">단계별 평균</div>
              <div className="v tnum">52초</div>
              <div className="muted" style={{ font: "var(--t-caption1)" }}>WS 생성 18s · 도구 연결 1m 12s · import 1m 04s · Reviewer 1m 24s · 완료 40s</div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-h"><h3>막 도착한 첫 세션</h3><span className="sub">강조 표시</span></div>
          <div style={{
            border: "2px solid var(--primary-normal)", borderRadius: 10, padding: 14,
            background: "var(--primary-light)",
          }}>
            <div className="row between">
              <div style={{ font: "var(--t-label1-strong)", color: "var(--primary-strong)" }}>
                {ONBOARDING_FIRST_SESSION.intent}
              </div>
              <span className="tag blue">{ONBOARDING_FIRST_SESSION.id}</span>
            </div>
            <div className="row tight" style={{ marginTop: 8, font: "var(--t-caption1)", color: "var(--primary-strong)" }}>
              <span>{ONBOARDING_FIRST_SESSION.tool}</span>
              <span>·</span>
              <span>파일 {ONBOARDING_FIRST_SESSION.files}</span>
              <span>·</span>
              <span>위험 없음</span>
            </div>
          </div>
          <div className="hr" />
          <div className="row tight">
            <button
              className="btn primary lg"
              onClick={() => {
                // jump to H1/today
                window.dispatchEvent(new CustomEvent("__awm_goto", { detail: { h: "h1", s: "today" } }));
              }}
            >
              Today 열기 <Icon name="arrow" size={14} />
            </button>
            <button className="btn" onClick={() => gotoSession("reviewer")}>← Reviewer로 돌아가기</button>
          </div>
        </div>
      </div>

      <div className="card tight" style={{ marginTop: 16, background: "var(--accent-light)", borderColor: "transparent" }}>
        <div className="row between">
          <div>
            <div style={{ font: "var(--t-label1-strong)", color: "var(--accent-strong)" }}>
              가설 H4 검증 — first value time
            </div>
            <div className="muted" style={{ font: "var(--t-caption1)", color: "var(--accent-strong)", marginTop: 4 }}>
              디자인 파트너 5명 평균이 5분 이하면 결제 트리거 funnel(트라이얼 → Pro) 다음 단계로.
            </div>
          </div>
          <div className="row tight">
            <span className="tag green">통과</span>
            <span className="tag neutral">N=1 (시연)</span>
          </div>
        </div>
      </div>
    </>
  );
}

window.AWMH4 = {
  OB_WorkspaceScreen, OB_ConnectScreen, OB_ImportScreen, OB_ReviewerScreen, OB_DoneScreen,
};
