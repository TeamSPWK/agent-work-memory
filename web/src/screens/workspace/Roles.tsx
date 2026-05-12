import { Icon } from '../../components/Icon'
import { RISK_ROLE_MATRIX, type MatrixCell } from '../../lib/seed/workspace'

function CellChip({ v }: { v: MatrixCell }) {
  if (v === 'approve') {
    return (
      <span className="tag blue">
        <Icon name="check" size={10} />
        승인
      </span>
    )
  }
  if (v === 'review') {
    return (
      <span className="tag green">
        <Icon name="eye" size={10} />
        검토
      </span>
    )
  }
  if (v === 'view') return <span className="tag neutral">view</span>
  return <span className="muted">—</span>
}

export function Roles() {
  return (
    <>
      <div className="card">
        <div className="card-h">
          <h3>매트릭스 · 8 카테고리 × 3 역할 = 24 셀</h3>
          <span className="sub">기본값 — 워크스페이스별 커스텀 가능</span>
        </div>
        <table className="tbl">
          <thead>
            <tr>
              <th style={{ width: '30%' }}>위험 카테고리</th>
              <th>Operator</th>
              <th>Reviewer</th>
              <th>Admin</th>
            </tr>
          </thead>
          <tbody>
            {RISK_ROLE_MATRIX.map((r) => (
              <tr key={r.cat}>
                <td>
                  <div style={{ font: 'var(--t-label1-strong)', color: 'var(--text-strong)' }}>
                    {r.cat}
                  </div>
                </td>
                <td>
                  <CellChip v={r.Operator} />
                </td>
                <td>
                  <CellChip v={r.Reviewer} />
                </td>
                <td>
                  <CellChip v={r.Admin} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="hr" />
        <div className="row between">
          <div
            className="row tight"
            style={{ font: 'var(--t-caption1)', color: 'var(--text-assistive)', flexWrap: 'wrap' }}
          >
            <span>
              <span className="tag blue" style={{ marginRight: 4 }}>
                승인
              </span>
              실행 권한
            </span>
            <span>
              <span className="tag green" style={{ marginRight: 4 }}>
                검토
              </span>
              승인 전 의도-결과 비교
            </span>
            <span>
              <span className="tag neutral" style={{ marginRight: 4 }}>
                view
              </span>
              읽기 전용
            </span>
            <span>
              <span className="muted" style={{ marginRight: 4 }}>
                —
              </span>
              접근 불가
            </span>
          </div>
          <button className="btn primary" type="button">
            <Icon name="pencil" size={14} />
            매트릭스 편집
          </button>
        </div>
      </div>

      <div
        className="card tight"
        role="status"
        aria-label="역할 변경 안내"
        style={{ marginTop: 16, background: 'var(--accent-light)', borderColor: 'transparent' }}
      >
        <div className="row between">
          <div>
            <div style={{ font: 'var(--t-label1-strong)', color: 'var(--accent-strong)' }}>
              <Icon name="warn" size={14} /> 역할 변경 시
            </div>
            <div
              className="muted"
              style={{ font: 'var(--t-caption1)', color: 'var(--accent-strong)', marginTop: 4 }}
            >
              매트릭스 1셀이라도 변경하면 audit log에 자동 기록됩니다. 변경 사유 입력을 권장합니다.
            </div>
          </div>
          <button className="btn sm" type="button">
            최근 변경 이력 보기
          </button>
        </div>
      </div>
    </>
  )
}
