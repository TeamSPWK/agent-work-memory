import { Icon } from '../../components/Icon'
import { WS_MEMBERS, WS_MEMBERS_KPI } from '../../lib/seed/workspace'

type Persona = 'Operator' | 'Reviewer' | 'Admin'

const personaTag: Record<Persona, string> = {
  Admin: 'blue',
  Reviewer: 'green',
  Operator: 'neutral',
}

const personaRbac: Record<Persona, string> = {
  Admin: 'all',
  Reviewer: 'review+approve',
  Operator: 'view',
}

export function Members() {
  return (
    <>
      <div className="grid-4" style={{ marginBottom: 16 }}>
        <div className="card tight">
          <div className="kpi">
            <div className="l">활성 멤버</div>
            <div className="v tnum">{WS_MEMBERS_KPI.active}</div>
          </div>
        </div>
        <div className="card tight">
          <div className="kpi">
            <div className="l">Reviewer</div>
            <div className="v tnum">{WS_MEMBERS_KPI.reviewers}</div>
          </div>
        </div>
        <div className="card tight">
          <div className="kpi">
            <div className="l">Admin</div>
            <div className="v tnum">{WS_MEMBERS_KPI.admins}</div>
          </div>
        </div>
        <div className="card tight">
          <div className="kpi">
            <div className="l">평균 검토 응답</div>
            <div className="v tnum">{WS_MEMBERS_KPI.avgReviewMin}분</div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-h">
          <h3>멤버 {WS_MEMBERS.length}명</h3>
          <span className="sub">역할 · 활성 · 마지막 활동 · Reviewer 위임</span>
        </div>
        <table className="tbl">
          <thead>
            <tr>
              <th>멤버</th>
              <th>역할 (페르소나)</th>
              <th>활성</th>
              <th>마지막 활동</th>
              <th>권한</th>
              <th>Reviewer 위임</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {WS_MEMBERS.map((m) => (
              <tr key={m.id}>
                <td>
                  <div className="row tight" style={{ alignItems: 'center' }}>
                    <div className={'avatar ' + m.color} aria-hidden="true">
                      {m.initials}
                    </div>
                    <div>
                      <div style={{ font: 'var(--t-label1-strong)', color: 'var(--text-strong)' }}>
                        {m.role}
                      </div>
                      <div className="muted" style={{ font: 'var(--t-caption1)' }}>
                        {m.email}
                      </div>
                    </div>
                  </div>
                </td>
                <td>
                  <span className={'tag ' + personaTag[m.persona]}>{m.persona}</span>
                </td>
                <td>
                  {m.active ? (
                    <span className="tag green">
                      <span className="dot" />
                      활성
                    </span>
                  ) : (
                    <span className="tag neutral">비활성</span>
                  )}
                </td>
                <td className="muted tnum">{m.lastActive}</td>
                <td>
                  <span className="tag neutral">RBAC · {personaRbac[m.persona]}</span>
                </td>
                <td>
                  {m.review ? (
                    <span className="tag blue">
                      <Icon name="check" size={10} />
                      가능
                    </span>
                  ) : (
                    <span className="muted" style={{ font: 'var(--t-caption1)' }}>
                      —
                    </span>
                  )}
                </td>
                <td>
                  <button className="link" type="button">
                    관리 →
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div
        className="card tight"
        style={{ marginTop: 16, background: 'var(--bg-subtle)', borderColor: 'transparent' }}
      >
        <div className="muted" style={{ font: 'var(--t-caption1)' }}>
          역할 변경 · 초대 · 삭제는 모두 Audit Trail에 자동 기록됩니다 (변경 사유 입력 권장).
        </div>
      </div>
    </>
  )
}
