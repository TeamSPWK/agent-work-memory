/* Settings · 지원 화면 (Profile / Integrations / Notifications / Audit Export) */

const { ONBOARDING_TOOLS: SET_TOOLS, NOTIF_RULES, RECENT_EXPORTS } = AWMData;

function ProfileScreen() {
  return (
    <>
      <div className="page-h">
        <div>
          <div className="eyebrow">Settings · Profile</div>
          <h1>Profile & Account</h1>
          <p>본인 계정·알림·데이터 다운로드·계정 삭제.</p>
        </div>
      </div>

      <div className="grid-split">
        <div className="col">
          <div className="card">
            <div className="card-h"><h3>기본 정보</h3><span className="sub">표시 이름·이메일·역할</span></div>
            <div className="grid-2">
              <div className="fieldset">
                <label>표시 이름</label>
                <input className="focus-stub" defaultValue="CTO 겸직 대표" />
              </div>
              <div className="fieldset">
                <label>이메일</label>
                <input className="focus-stub" defaultValue="cto@…" />
              </div>
              <div className="fieldset">
                <label>역할 (워크스페이스 기준)</label>
                <input className="focus-stub" defaultValue="Admin" disabled />
              </div>
              <div className="fieldset">
                <label>가입일</label>
                <input className="focus-stub" defaultValue="2026-03-12" disabled />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-h"><h3>알림 채널</h3><span className="sub">개별 룰은 Settings · Notifications</span></div>
            <div className="col" style={{ gap: 8 }}>
              {[
                { name: "이메일",  value: "cto@…",     on: true },
                { name: "Slack",  value: "@cto",      on: true },
                { name: "채널톡",  value: "미연결",     on: false },
              ].map(c => (
                <label key={c.name} className="row between" style={{ padding: 12, border: "1px solid var(--line-soft)", borderRadius: 8 }}>
                  <span className="row tight" style={{ alignItems: "center" }}>
                    <div style={{ font: "var(--t-label1-strong)", color: "var(--text-strong)" }}>{c.name}</div>
                    <span className="muted" style={{ font: "var(--t-caption1)" }}>· {c.value}</span>
                  </span>
                  <input type="checkbox" defaultChecked={c.on} />
                </label>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="card-h"><h3>보안</h3></div>
            <div className="col" style={{ gap: 8 }}>
              <div className="row between" style={{ padding: 12, border: "1px solid var(--line-soft)", borderRadius: 8 }}>
                <div>
                  <div style={{ font: "var(--t-label1-strong)", color: "var(--text-strong)" }}>비밀번호</div>
                  <div className="muted" style={{ font: "var(--t-caption1)" }}>마지막 변경 · 47일 전</div>
                </div>
                <button className="btn sm">변경</button>
              </div>
              <div className="row between" style={{ padding: 12, border: "1px solid var(--line-soft)", borderRadius: 8 }}>
                <div>
                  <div style={{ font: "var(--t-label1-strong)", color: "var(--text-strong)" }}>SSO 연결</div>
                  <div className="muted" style={{ font: "var(--t-caption1)" }}>Google · 연결됨</div>
                </div>
                <button className="btn sm">관리</button>
              </div>
              <div className="row between" style={{ padding: 12, border: "1px solid var(--line-soft)", borderRadius: 8 }}>
                <div>
                  <div style={{ font: "var(--t-label1-strong)", color: "var(--text-strong)" }}>API Key (워크스페이스)</div>
                  <code className="mono muted">awm_*****_q2xK</code>
                </div>
                <div className="row tight">
                  <button className="btn sm"><Icon name="copy" size={12} /></button>
                  <button className="btn sm">재발급</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col">
          <div className="card tight">
            <div className="eyebrow">데이터 다운로드</div>
            <div style={{ font: "var(--t-label1)", color: "var(--text-neutral)", margin: "8px 0 10px" }}>
              본인 워크스페이스 데이터를 JSON으로 export. GDPR · K-PIPA 준용.
            </div>
            <ul style={{ margin: 0, paddingLeft: 18, font: "var(--t-caption1)", color: "var(--text-assistive)", display: "flex", flexDirection: "column", gap: 4 }}>
              <li>세션 메타 234건</li>
              <li>Audit row 1,408건 + chain hash</li>
              <li>멤버·역할·룰 정의</li>
            </ul>
            <button className="btn primary" style={{ marginTop: 10 }}>
              <Icon name="download" size={14} />JSON 다운로드 요청
            </button>
          </div>

          <div className="card tight" style={{ borderColor: "var(--status-negative)" }}>
            <div style={{ font: "var(--t-label1-strong)", color: "var(--status-negative)" }}>
              <Icon name="warn" size={14} /> 위험 액션
            </div>
            <div className="muted" style={{ font: "var(--t-caption1)", marginTop: 4, marginBottom: 10 }}>
              계정 삭제 · 30일 grace period 후 워크스페이스 데이터도 영구 삭제. audit row는 법정 보존 기간 동안 별도 cold storage로 이동.
            </div>
            <div style={{ padding: 10, background: "rgba(255,66,66,0.08)", borderRadius: 8, font: "var(--t-caption1)", color: "var(--status-negative)" }}>
              확인 입력: <code className="mono">DELETE ACCOUNT</code> 텍스트를 정확히 입력해야 활성됩니다.
            </div>
            <button className="btn danger" style={{ marginTop: 10 }}>계정 삭제 진행</button>
          </div>
        </div>
      </div>
    </>
  );
}

function IntegrationsScreen() {
  return (
    <>
      <div className="page-h">
        <div>
          <div className="eyebrow">Settings · Integrations</div>
          <h1>Integrations</h1>
          <p>AI 도구 4종 + GitHub · Slack · 채널톡 + 예정 통합.</p>
        </div>
      </div>

      <div className="card">
        <div className="card-h"><h3>AI 도구</h3><span className="sub">H4 온보딩과 동일 4종</span></div>
        <div className="grid-2" style={{ gap: 12 }}>
          {SET_TOOLS.map(t => (
            <div key={t.key} className="card tight">
              <div className="row between">
                <div className="row tight" style={{ alignItems: "center" }}>
                  <div className="avatar" style={{ background: "var(--text-strong)", borderRadius: 8, width: 32, height: 32 }}>{t.name[0]}</div>
                  <div>
                    <div style={{ font: "var(--t-label1-strong)", color: "var(--text-strong)" }}>{t.name}</div>
                    <div className="muted" style={{ font: "var(--t-caption1)" }}>{t.desc}</div>
                  </div>
                </div>
                {t.state === "connected"
                  ? <span className="tag green"><span className="dot" />연결됨</span>
                  : t.state === "error"
                    ? <span className="tag red"><span className="dot" />오류</span>
                    : <span className="tag neutral">미연결</span>}
              </div>
              <div className="hr" />
              <div className="row between" style={{ font: "var(--t-caption1)", color: "var(--text-assistive)" }}>
                <span>마지막 동기 · {t.state === "connected" ? "방금 전" : t.state === "error" ? "재시도 필요" : "—"}</span>
                <div className="row tight">
                  <button className="btn sm">{t.state === "connected" ? "끊기" : "재연결"}</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <div className="card-h"><h3>외부 서비스</h3><span className="sub">GitHub · Slack · 채널톡</span></div>
        <div className="col" style={{ gap: 10 }}>
          <div className="row between" style={{ padding: 14, border: "1px solid var(--line-soft)", borderRadius: 10 }}>
            <div className="row tight" style={{ alignItems: "center" }}>
              <div className="avatar" style={{ background: "#0d1117", borderRadius: 8, width: 32, height: 32 }}>G</div>
              <div>
                <div style={{ font: "var(--t-label1-strong)", color: "var(--text-strong)" }}>GitHub</div>
                <div className="muted" style={{ font: "var(--t-caption1)" }}>repo 4개 매핑 · web-app · ops-handbook · marketing-site · infra</div>
              </div>
            </div>
            <div className="row tight">
              <span className="tag green"><span className="dot" />연결됨</span>
              <button className="btn sm">repo 선택</button>
            </div>
          </div>

          <div className="row between" style={{ padding: 14, border: "1px solid var(--line-soft)", borderRadius: 10 }}>
            <div className="row tight" style={{ alignItems: "center" }}>
              <div className="avatar" style={{ background: "#611f69", borderRadius: 8, width: 32, height: 32 }}>S</div>
              <div>
                <div style={{ font: "var(--t-label1-strong)", color: "var(--text-strong)" }}>Slack</div>
                <div className="muted" style={{ font: "var(--t-caption1)" }}>워크스페이스 1개 · #eng-ai #ops-daily 매핑</div>
              </div>
            </div>
            <div className="row tight">
              <span className="tag green"><span className="dot" />연결됨</span>
              <button className="btn sm">채널 매핑</button>
            </div>
          </div>

          <div className="row between" style={{ padding: 14, border: "1px solid var(--line-soft)", borderRadius: 10 }}>
            <div className="row tight" style={{ alignItems: "center" }}>
              <div className="avatar" style={{ background: "var(--accent-normal)", borderRadius: 8, width: 32, height: 32 }}>C</div>
              <div>
                <div style={{ font: "var(--t-label1-strong)", color: "var(--text-strong)" }}>채널톡</div>
                <div className="muted" style={{ font: "var(--t-caption1)" }}>고객 문의 채널 알림용</div>
              </div>
            </div>
            <div className="row tight">
              <span className="tag neutral">미연결</span>
              <button className="btn sm primary"><Icon name="link" size={12} />연결</button>
            </div>
          </div>
        </div>
      </div>

      <div className="card tight" style={{ marginTop: 16, background: "var(--bg-subtle)", borderColor: "transparent" }}>
        <div className="row between">
          <div>
            <div style={{ font: "var(--t-label1-strong)", color: "var(--text-neutral)" }}>예정 통합</div>
            <div className="muted" style={{ font: "var(--t-caption1)", marginTop: 4 }}>
              필요 의견이 누적되면 우선순위에 따라 진행합니다.
            </div>
          </div>
          <div className="row tight">
            <span className="tag neutral">Jira · 지원 예정</span>
            <span className="tag neutral">Notion · 지원 예정</span>
          </div>
        </div>
      </div>
    </>
  );
}

function NotificationsScreen() {
  const channelLabels = { email: "이메일", slack: "Slack", channeltalk: "채널톡", inapp: "인앱" };
  return (
    <>
      <div className="page-h">
        <div>
          <div className="eyebrow">Settings · Notifications</div>
          <h1>Notifications</h1>
          <p>이벤트 × 채널 룰. 무음 시간대로 1인 운영 sustainability 확보.</p>
        </div>
      </div>

      <div className="card">
        <div className="card-h"><h3>알림 룰</h3><span className="sub">{NOTIF_RULES.length}개 이벤트 × 4 채널</span></div>
        <table className="tbl">
          <thead>
            <tr>
              <th style={{ width: "40%" }}>이벤트</th>
              {Object.values(channelLabels).map(l => <th key={l} style={{ textAlign: "center" }}>{l}</th>)}
            </tr>
          </thead>
          <tbody>
            {NOTIF_RULES.map((r, i) => (
              <tr key={i}>
                <td><div style={{ font: "var(--t-label1-strong)", color: "var(--text-strong)" }}>{r.event}</div></td>
                {["email", "slack", "channeltalk", "inapp"].map(c => (
                  <td key={c} style={{ textAlign: "center" }}>
                    <input type="checkbox" defaultChecked={r[c]} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid-2" style={{ marginTop: 16 }}>
        <div className="card">
          <div className="card-h"><h3>무음 시간대</h3><span className="sub">고위험 신호도 무음 · 다음 영업일에 일괄 통지</span></div>
          <div className="grid-2">
            <div className="fieldset">
              <label>시작</label>
              <input className="focus-stub" defaultValue="22:00" />
            </div>
            <div className="fieldset">
              <label>종료</label>
              <input className="focus-stub" defaultValue="08:00" />
            </div>
          </div>
          <div className="row tight" style={{ marginTop: 10, flexWrap: "wrap" }}>
            {["월", "화", "수", "목", "금", "토", "일"].map((d, i) => (
              <label key={d} className="row tight" style={{
                padding: "6px 12px", border: "1px solid var(--line-soft)", borderRadius: 8,
                background: i >= 5 ? "var(--primary-light)" : "var(--bg-base)",
                color: i >= 5 ? "var(--primary-strong)" : "var(--text-normal)",
              }}>
                <input type="checkbox" defaultChecked={i >= 5} />
                {d}
              </label>
            ))}
          </div>
          <div className="hr" />
          <div className="muted" style={{ font: "var(--t-caption1)" }}>
            <Icon name="warn" size={12} /> 1인 운영 sustainability — 무음 시간대 동안은 신규 신호가 누적된 뒤 09:00에 묶음으로 통지됩니다.
          </div>
        </div>

        <div className="card">
          <div className="card-h"><h3>고위험 신호 알림 미리보기</h3><span className="sub">Slack 메시지 mock</span></div>
          <div style={{ padding: 14, background: "var(--bg-subtle)", borderRadius: 10, fontFamily: "ui-monospace, monospace", fontSize: 12, color: "var(--text-neutral)" }}>
            <div style={{ color: "var(--status-negative)", fontWeight: 600 }}>🚨 고위험 신호 — DB · prod</div>
            <div style={{ marginTop: 6 }}>세션 s-024 · 개발 리드 (8년차)</div>
            <div>변경 · applicants 테이블 prod 인덱스 마이그레이션</div>
            <div>경과 · 2분 · Reviewer 응답 대기</div>
            <div style={{ marginTop: 8, color: "var(--primary-normal)" }}>
              ↳ Reviewer Brief 열기 (audit-row ev-2401)
            </div>
          </div>
          <div className="muted" style={{ font: "var(--t-caption1)", marginTop: 10 }}>
            메시지에는 변조 불가 hash + 검토 deep-link가 포함됩니다.
          </div>
        </div>
      </div>
    </>
  );
}

function AuditExportSettingsScreen() {
  return (
    <>
      <div className="page-h">
        <div>
          <div className="eyebrow">Settings · Audit Export</div>
          <h1>Audit Export 설정</h1>
          <p>양식·보존 기간·해시·자동 export 일정.</p>
        </div>
      </div>

      <div className="grid-split">
        <div className="col">
          <div className="card">
            <div className="card-h"><h3>PDF 양식</h3><span className="sub">기본은 인공지능기본법 7대 원칙</span></div>
            <div className="col" style={{ gap: 8 }}>
              {[
                { name: "인공지능기본법 7대 원칙 양식", desc: "거버넌스·보조수단성·보안성·책임성·투명성·공정성·안전성. 시행 시점 기본값.", on: true },
                { name: "분기 감사 양식",                 desc: "변경·승인 비율·Reviewer 응답 시간 통계 중심. 외부 감사 제출용.",          on: false },
                { name: "커스텀",                          desc: "섹션을 직접 골라 조합. 회사 내부 규정용.",                                on: false },
              ].map(f => (
                <label key={f.name} className="row between" style={{
                  padding: 14, border: "1px solid var(--line-soft)", borderRadius: 10,
                  background: f.on ? "var(--primary-light)" : "var(--bg-base)",
                }}>
                  <span style={{ display: "flex", flexDirection: "column" }}>
                    <span style={{
                      font: f.on ? "var(--t-label1-strong)" : "var(--t-label1)",
                      color: f.on ? "var(--primary-strong)" : "var(--text-strong)",
                    }}>{f.name}</span>
                    <span className="muted" style={{ font: "var(--t-caption1)", marginTop: 2 }}>{f.desc}</span>
                  </span>
                  <input type="radio" name="form" defaultChecked={f.on} />
                </label>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="card-h"><h3>보존 기간</h3><span className="sub">변경 시 비용 영향</span></div>
            <div className="row tight" style={{ flexWrap: "wrap" }}>
              {[
                { l: "5년 · 법정 권고", v: true, cost: "포함" },
                { l: "7년",            v: false, cost: "+₩40,000 / mo" },
                { l: "10년",           v: false, cost: "+₩80,000 / mo" },
                { l: "영구",            v: false, cost: "+₩140,000 / mo" },
              ].map(o => (
                <label key={o.l} style={{
                  padding: "10px 14px", border: "1px solid var(--line-soft)", borderRadius: 8,
                  background: o.v ? "var(--primary-light)" : "var(--bg-base)",
                  color: o.v ? "var(--primary-strong)" : "var(--text-normal)",
                  display: "flex", flexDirection: "column", gap: 2, cursor: "pointer",
                }}>
                  <span className="row tight">
                    <input type="radio" name="retain" defaultChecked={o.v} />
                    <span style={{ font: o.v ? "var(--t-label1-strong)" : "var(--t-label1)" }}>{o.l}</span>
                  </span>
                  <span className="muted" style={{ font: "var(--t-caption1)", color: o.v ? "var(--primary-strong)" : "var(--text-assistive)" }}>{o.cost}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="grid-2">
            <div className="card">
              <div className="card-h"><h3>해시 알고리즘</h3></div>
              <div className="row between" style={{ padding: 12, border: "1px solid var(--line-soft)", borderRadius: 10, background: "var(--bg-subtle)" }}>
                <div>
                  <div style={{ font: "var(--t-label1-strong)", color: "var(--text-strong)" }}>SHA-256</div>
                  <div className="muted" style={{ font: "var(--t-caption1)" }}>
                    변경 불가 · 변조 불가성 설계의 핵심. 알고리즘 변경 시 chain 재계산 필요.
                  </div>
                </div>
                <span className="tag neutral"><Icon name="lock" size={10} />변경 불가</span>
              </div>
            </div>

            <div className="card">
              <div className="card-h"><h3>자동 export 일정</h3></div>
              <div className="row tight">
                {[
                  { l: "분기", v: true },
                  { l: "월",   v: false },
                  { l: "off",  v: false },
                ].map(o => (
                  <label key={o.l} style={{
                    flex: 1, padding: 12, borderRadius: 8, textAlign: "center",
                    border: "1px solid var(--line-soft)",
                    background: o.v ? "var(--primary-light)" : "var(--bg-base)",
                    color: o.v ? "var(--primary-strong)" : "var(--text-normal)",
                    font: o.v ? "var(--t-label1-strong)" : "var(--t-label1)",
                    cursor: "pointer",
                  }}>
                    <input type="radio" name="sched" defaultChecked={o.v} style={{ marginRight: 6 }} />
                    {o.l}
                  </label>
                ))}
              </div>
              <div className="muted" style={{ font: "var(--t-caption1)", marginTop: 10 }}>
                다음 자동 export · 2026-07-01 (KST)
              </div>
            </div>
          </div>
        </div>

        <div className="col">
          <div className="card tight">
            <div className="eyebrow">최근 export 5건</div>
            <div className="col" style={{ gap: 6, marginTop: 8 }}>
              {RECENT_EXPORTS.map(e => (
                <div key={e.id} className="row between" style={{ padding: 10, border: "1px solid var(--line-soft)", borderRadius: 8 }}>
                  <div>
                    <div style={{ font: "var(--t-label1-strong)", color: "var(--text-strong)" }}>{e.form}</div>
                    <div className="muted" style={{ font: "var(--t-caption1)" }}>{e.at} · {e.pages}p · {e.id}</div>
                  </div>
                  {e.state === "ok"
                    ? <span className="tag green"><span className="dot" />검증 OK</span>
                    : <span className="tag orange"><span className="dot" />부분 누락</span>}
                </div>
              ))}
            </div>
            <button className="btn primary" style={{ marginTop: 10, width: "100%" }}>
              <Icon name="download" size={14} />지금 export
            </button>
          </div>

          <div className="card tight" style={{ background: "var(--bg-subtle)", borderColor: "transparent" }}>
            <div className="eyebrow" style={{ color: "var(--text-assistive)" }}>운영 원칙</div>
            <div className="muted" style={{ font: "var(--t-caption1)", marginTop: 4 }}>
              자동 export는 KST 09:00에 실행되며, 결과 PDF는 Settings · Profile 이메일로 발송됩니다.
              실패 시 즉시 재시도하지 않고 무음 시간대 후 1회 재시도.
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

window.AWMSettings = { ProfileScreen, IntegrationsScreen, NotificationsScreen, AuditExportSettingsScreen };
