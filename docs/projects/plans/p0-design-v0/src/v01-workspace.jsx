/* Workspace · 지원 화면 (Members / Invite / Roles & Risk 매트릭스) */

const { WS_MEMBERS, WS_MEMBERS_KPI, RISK_ROLE_MATRIX } = AWMData;

function MembersScreen({ gotoSession }) {
  return (
    <>
      <div className="page-h">
        <div>
          <div className="eyebrow">Workspace · 상시 화면</div>
          <h1>Members</h1>
          <p>현재 워크스페이스의 멤버·역할·검토 응답 시간을 본다. 가설 검증 대상이 아닌 운영 화면.</p>
        </div>
        <div className="actions">
          <button className="btn" onClick={() => gotoSession("roles")}>
            <Icon name="lock" size={14} />역할 매트릭스
          </button>
          <button className="btn primary" onClick={() => gotoSession("invite")}>
            <Icon name="plus" size={14} />멤버 초대
          </button>
        </div>
      </div>

      <div className="grid-4" style={{ marginBottom: 16 }}>
        <div className="card tight">
          <div className="kpi"><div className="l">활성 멤버</div><div className="v tnum">{WS_MEMBERS_KPI.active}</div></div>
        </div>
        <div className="card tight">
          <div className="kpi"><div className="l">Reviewer</div><div className="v tnum">{WS_MEMBERS_KPI.reviewers}</div></div>
        </div>
        <div className="card tight">
          <div className="kpi"><div className="l">Admin</div><div className="v tnum">{WS_MEMBERS_KPI.admins}</div></div>
        </div>
        <div className="card tight">
          <div className="kpi"><div className="l">평균 검토 응답</div><div className="v tnum">{WS_MEMBERS_KPI.avgReviewMin}분</div></div>
        </div>
      </div>

      <div className="card">
        <div className="card-h">
          <h3>멤버 {WS_MEMBERS.length}명</h3>
          <span className="sub">역할·활성·마지막 활동·Reviewer 위임</span>
        </div>
        <table className="tbl">
          <thead>
            <tr>
              <th>멤버</th><th>역할 (페르소나)</th><th>활성</th>
              <th>마지막 활동</th><th>권한</th><th>Reviewer 위임</th><th></th>
            </tr>
          </thead>
          <tbody>
            {WS_MEMBERS.map(m => (
              <tr key={m.id}>
                <td>
                  <div className="row tight" style={{ alignItems: "center" }}>
                    <div className={"avatar " + m.color}>{m.initials}</div>
                    <div>
                      <div style={{ font: "var(--t-label1-strong)", color: "var(--text-strong)" }}>{m.role}</div>
                      <div className="muted" style={{ font: "var(--t-caption1)" }}>{m.email}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <span className={"tag " + (m.persona === "Admin" ? "blue" : m.persona === "Reviewer" ? "green" : "neutral")}>
                    {m.persona}
                  </span>
                </td>
                <td>
                  {m.active
                    ? <span className="tag green"><span className="dot" />활성</span>
                    : <span className="tag neutral">비활성</span>}
                </td>
                <td className="muted tnum">{m.lastActive}</td>
                <td>
                  <span className="tag neutral">RBAC · {m.persona === "Admin" ? "all" : m.persona === "Reviewer" ? "review+approve" : "view"}</span>
                </td>
                <td>
                  {m.review
                    ? <span className="tag blue"><Icon name="check" size={10} />가능</span>
                    : <span className="muted" style={{ font: "var(--t-caption1)" }}>—</span>}
                </td>
                <td><button className="link">관리 →</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card tight" style={{ marginTop: 16, background: "var(--bg-subtle)", borderColor: "transparent" }}>
        <div className="muted" style={{ font: "var(--t-caption1)" }}>
          역할 변경·초대·삭제는 모두 Audit Trail에 자동 기록됩니다 (변경 사유 입력 권장).
        </div>
      </div>
    </>
  );
}

function InviteScreen({ gotoSession }) {
  const [emails, setEmails] = React.useState(["ops@…", "design@…"]);
  const [draft, setDraft] = React.useState("");
  const [role, setRole] = React.useState("Operator");
  const addEmail = () => { if (draft.trim()) { setEmails([...emails, draft.trim()]); setDraft(""); } };

  return (
    <>
      <div className="page-h">
        <div>
          <div className="eyebrow">Workspace · Member 초대</div>
          <h1>Member 초대</h1>
          <p>이메일 다중 입력 + 역할 지정 + 메일 카피 미리보기.</p>
        </div>
        <div className="actions">
          <button className="btn" onClick={() => gotoSession("members")}>← Members</button>
        </div>
      </div>

      <div className="grid-split">
        <div className="card">
          <div className="card-h"><h3>초대 정보</h3><span className="sub">한 번에 여러 명 가능</span></div>

          <div className="fieldset">
            <label>이메일</label>
            <div className="row tight" style={{ flexWrap: "wrap", padding: 8, border: "1px solid var(--line-soft)", borderRadius: 8, background: "var(--bg-base)" }}>
              {emails.map((e, i) => (
                <span key={i} className="tag blue" style={{ height: 26, paddingRight: 4 }}>
                  {e}
                  <button onClick={() => setEmails(emails.filter((_, j) => j !== i))} style={{
                    border: 0, background: "transparent", color: "inherit", cursor: "pointer",
                  }}><Icon name="x" size={10} /></button>
                </span>
              ))}
              <input
                value={draft}
                onChange={e => setDraft(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addEmail(); } }}
                placeholder="이메일 입력 후 Enter / 쉼표"
                style={{ border: 0, outline: 0, background: "transparent", flex: 1, minWidth: 180, color: "var(--text-normal)", font: "var(--t-label1)" }}
              />
            </div>
            <div className="hint">{emails.length}명 추가됨 · 초대 메일은 한국어로 발송됩니다.</div>
          </div>

          <div className="hr" />

          <div className="fieldset">
            <label>사전 지정 역할</label>
            <div className="row tight">
              {["Operator", "Reviewer", "Admin"].map(r => (
                <label key={r} className="row tight" style={{
                  padding: "10px 14px", border: "1px solid var(--line-soft)", borderRadius: 8,
                  background: role === r ? "var(--primary-light)" : "var(--bg-base)",
                  color: role === r ? "var(--primary-strong)" : "var(--text-normal)",
                  font: role === r ? "var(--t-label1-strong)" : "var(--t-label1)",
                  cursor: "pointer", flex: 1,
                }}>
                  <input type="radio" name="role" checked={role === r} onChange={() => setRole(r)} />
                  <span style={{ display: "flex", flexDirection: "column" }}>
                    {r}
                    <span className="muted" style={{ font: "var(--t-caption1)" }}>
                      {r === "Operator" ? "AI에 작업 시키고 회상" : r === "Reviewer" ? "변경 검토·승인" : "워크스페이스 관리"}
                    </span>
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="hr" />
          <div className="muted" style={{ font: "var(--t-caption1)", marginBottom: 12 }}>
            <Icon name="lock" size={12} /> 안내 — Agent Work Memory는 *원문 transcript를 저장하지 않습니다*. 세션 메타·코드 변경 요약만 보관.
          </div>

          <div className="row between">
            <button className="btn" onClick={() => gotoSession("members")}>취소</button>
            <button className="btn primary lg" disabled={emails.length === 0}>
              <Icon name="mail" size={14} />{emails.length}명에게 초대 메일 발송
            </button>
          </div>
        </div>

        <div className="col">
          <div className="card tight">
            <div className="eyebrow">초대 메일 미리보기</div>
            <div style={{
              marginTop: 8, padding: 14, border: "1px solid var(--line-soft)", borderRadius: 10,
              background: "var(--bg-subtle)", font: "var(--t-label2)", color: "var(--text-neutral)",
            }}>
              <div style={{ font: "var(--t-label1-strong)", color: "var(--text-strong)", marginBottom: 6 }}>
                새 워크스페이스 · Agent Work Memory에 초대되셨습니다
              </div>
              <p style={{ margin: "0 0 8px" }}>안녕하세요,</p>
              <p style={{ margin: "0 0 8px" }}>
                Agent Work Memory를 시범 운영 중인 워크스페이스에 <b>{role}</b> 권한으로 초대드립니다.
                AI 도구(Claude Code·Cursor·Codex·ChatGPT)로 한 작업을 자동 기록하고, 7대 원칙 기준 감사 로그를 보존합니다.
              </p>
              <p style={{ margin: "0 0 8px" }}>
                현재 이 워크스페이스는 <b>1인 운영자</b>가 디자인 파트너로 직접 운영합니다.
                답변은 영업일 기준 1~2일 안에 드립니다 (24/7 지원은 없습니다).
              </p>
              <p style={{ margin: "0 0 8px" }}>
                원문 transcript는 저장하지 않으며, 세션 메타·코드 변경 요약·명령 로그만 보관합니다.
              </p>
              <div className="row tight" style={{ marginTop: 10 }}>
                <button className="btn primary sm">초대 수락</button>
                <button className="btn sm">개인정보처리방침</button>
              </div>
            </div>
          </div>

          <div className="card tight" style={{ background: "var(--primary-light)", borderColor: "transparent" }}>
            <div style={{ font: "var(--t-label1-strong)", color: "var(--primary-strong)" }}>
              자동 메시지 편집 가능
            </div>
            <div className="muted" style={{ font: "var(--t-caption1)", color: "var(--primary-strong)", marginTop: 4 }}>
              우측 미리보기는 발송 직전 한 번 더 편집 가능합니다. 발신자는 워크스페이스 Admin 이름으로 표시.
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function RolesMatrixScreen({ gotoSession }) {
  const cellChip = (v) => {
    if (v === "approve") return <span className="tag blue"><Icon name="check" size={10} />승인</span>;
    if (v === "review")  return <span className="tag green"><Icon name="eye" size={10} />검토</span>;
    if (v === "view")    return <span className="tag neutral">view</span>;
    return <span className="muted">—</span>;
  };
  return (
    <>
      <div className="page-h">
        <div>
          <div className="eyebrow">Workspace · 역할 매트릭스</div>
          <h1>Roles & Risk 룰</h1>
          <p>위험 카테고리 × 역할별 권한. 변경 시 audit log 기록.</p>
        </div>
        <div className="actions">
          <button className="btn" onClick={() => gotoSession("members")}>← Members</button>
        </div>
      </div>

      <div className="card">
        <div className="card-h">
          <h3>매트릭스 · 8 카테고리 × 3 역할 = 24 셀</h3>
          <span className="sub">기본값 — 워크스페이스별 커스텀 가능</span>
        </div>
        <table className="tbl">
          <thead>
            <tr>
              <th style={{ width: "30%" }}>위험 카테고리</th>
              <th>Operator</th><th>Reviewer</th><th>Admin</th>
            </tr>
          </thead>
          <tbody>
            {RISK_ROLE_MATRIX.map(r => (
              <tr key={r.cat}>
                <td><div style={{ font: "var(--t-label1-strong)", color: "var(--text-strong)" }}>{r.cat}</div></td>
                <td>{cellChip(r.Operator)}</td>
                <td>{cellChip(r.Reviewer)}</td>
                <td>{cellChip(r.Admin)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="hr" />
        <div className="row between">
          <div className="row tight" style={{ font: "var(--t-caption1)", color: "var(--text-assistive)" }}>
            <span><span className="tag blue" style={{ marginRight: 4 }}>승인</span>실행 권한</span>
            <span><span className="tag green" style={{ marginRight: 4 }}>검토</span>승인 전 의도-결과 비교</span>
            <span><span className="tag neutral" style={{ marginRight: 4 }}>view</span>읽기 전용</span>
            <span><span className="muted" style={{ marginRight: 4 }}>—</span>접근 불가</span>
          </div>
          <button className="btn primary"><Icon name="pencil" size={14} />매트릭스 편집</button>
        </div>
      </div>

      <div className="card tight" style={{ marginTop: 16, background: "var(--accent-light)", borderColor: "transparent" }}>
        <div className="row between">
          <div>
            <div style={{ font: "var(--t-label1-strong)", color: "var(--accent-strong)" }}>
              <Icon name="warn" size={14} /> 역할 변경 시
            </div>
            <div className="muted" style={{ font: "var(--t-caption1)", color: "var(--accent-strong)", marginTop: 4 }}>
              매트릭스 1셀이라도 변경하면 audit log에 자동 기록됩니다. 변경 사유 입력을 권장합니다.
            </div>
          </div>
          <button className="btn sm">최근 변경 이력 보기</button>
        </div>
      </div>
    </>
  );
}

window.AWMWorkspace = { MembersScreen, InviteScreen, RolesMatrixScreen };
