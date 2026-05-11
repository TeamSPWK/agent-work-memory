import { useState } from 'react'
import { AUDIT_EVENTS, AUDIT_STATS, COMPLIANCE, PDF_SECTIONS } from '../../lib/seed/audit'
import { Icon } from '../../components/Icon'

const FILE_FORMATS = [
  { id: 'pdf', label: 'PDF (한국어)' },
  { id: 'csv', label: 'CSV' },
  { id: 'json', label: 'JSON' },
] as const

type FormatId = (typeof FILE_FORMATS)[number]['id']

export function PdfPreview() {
  const [format, setFormat] = useState<FormatId>('pdf')
  const [sections, setSections] = useState<boolean[]>(PDF_SECTIONS.map((s) => s.defaultOn))

  return (
    <div className="grid-split">
      <div className="card" style={{ background: 'var(--bg-subtle)' }}>
        <div className="pdf-frame">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div
                style={{
                  font: "600 11px/1 'Pretendard'",
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: '#777',
                }}
              >
                AGENT WORK MEMORY · AUDIT REPORT
              </div>
              <h2 style={{ marginTop: 8 }}>AI 변경 감사 자료 · 2026년 4월 ~ 5월 (30일)</h2>
              <div className="meta">발행일 2026-05-10 · 워크스페이스 B2B SaaS · 시리즈 A 28명</div>
            </div>
            <div
              style={{
                textAlign: 'right',
                font: "400 10px/1.5 'Pretendard'",
                color: '#666',
              }}
            >
              Spacewalk Inc. · 사업자등록 000-00-00000
              <br />
              대표 jay@spacewalk.tech
              <br />
              서울특별시 (placeholder)
            </div>
          </div>

          <div
            style={{
              marginTop: 18,
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: 12,
            }}
          >
            {[
              { l: '총 AI 변경', v: `${AUDIT_STATS.totalChanges}건` },
              {
                l: 'Reviewer 승인',
                v: `${AUDIT_STATS.reviewed}건 (${AUDIT_STATS.reviewedRate}%)`,
              },
              { l: '위험 신호', v: '21건' },
              {
                l: '체인 무결성',
                v: `${AUDIT_STATS.integrityPassed.toLocaleString('ko-KR')} / ${AUDIT_STATS.integrityTotal.toLocaleString('ko-KR')} ✓`,
              },
            ].map((k) => (
              <div
                key={k.l}
                style={{ border: '1px solid #ddd', borderRadius: 6, padding: '8px 10px' }}
              >
                <div
                  style={{
                    font: "400 10px/1 'Pretendard'",
                    color: '#666',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                  }}
                >
                  {k.l}
                </div>
                <div
                  style={{
                    font: "700 18px/1.3 'Pretendard'",
                    color: '#000',
                    marginTop: 4,
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {k.v}
                </div>
              </div>
            ))}
          </div>

          <h3 style={{ marginTop: 20, font: "700 14px/1 'Pretendard'", color: '#000' }}>
            인공지능기본법 7대 원칙 적용
          </h3>
          <table>
            <thead>
              <tr>
                <th>원칙</th>
                <th>적용 상태</th>
                <th>근거</th>
              </tr>
            </thead>
            <tbody>
              {COMPLIANCE.map((p) => (
                <tr key={p.name}>
                  <td>{p.name}</td>
                  <td>{p.state === 'ok' ? '충족' : '보강 권고'}</td>
                  <td>{p.note}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <h3 style={{ marginTop: 20, font: "700 14px/1 'Pretendard'", color: '#000' }}>
            주요 이벤트 (요약)
          </h3>
          <table>
            <thead>
              <tr>
                <th>시각</th>
                <th>이벤트</th>
                <th>작업자</th>
                <th>위험</th>
                <th>해시</th>
              </tr>
            </thead>
            <tbody>
              {AUDIT_EVENTS.slice(0, 6).map((e) => (
                <tr key={e.id}>
                  <td style={{ fontVariantNumeric: 'tabular-nums' }}>{e.at.split(' ').slice(-1)[0]}</td>
                  <td>{e.summary}</td>
                  <td>{e.actor}</td>
                  <td>{e.risk ? `${e.risk.sev} · ${e.risk.cat}` : '-'}</td>
                  <td style={{ fontFamily: 'ui-monospace, monospace', fontSize: 10 }}>{e.hash}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div
            style={{
              marginTop: 18,
              display: 'flex',
              justifyContent: 'space-between',
              font: "400 10px/1.4 'Pretendard'",
              color: '#555',
            }}
          >
            <div>* 본 자료는 워크스페이스 자체 운영 지표이며 외부 감사 의견을 대체하지 않습니다.</div>
            <div>page 1 / 1</div>
          </div>
        </div>
      </div>

      <div className="col">
        <div className="card tight">
          <div className="eyebrow">포함 항목 (편집 가능)</div>
          <div className="col" style={{ gap: 6, marginTop: 10 }}>
            {PDF_SECTIONS.map((s, i) => (
              <label
                key={s.label}
                style={{
                  display: 'flex',
                  gap: 8,
                  alignItems: 'center',
                  font: 'var(--t-label1)',
                }}
              >
                <input
                  type="checkbox"
                  checked={sections[i] ?? false}
                  onChange={(e) =>
                    setSections((prev) => prev.map((v, j) => (j === i ? e.target.checked : v)))
                  }
                />
                {s.label}
              </label>
            ))}
          </div>
        </div>

        <div className="card tight">
          <div className="eyebrow">파일 형식</div>
          <div className="seg" style={{ marginTop: 8 }} role="tablist" aria-label="파일 형식">
            {FILE_FORMATS.map((f) => (
              <button
                key={f.id}
                type="button"
                className={format === f.id ? 'active' : ''}
                onClick={() => setFormat(f.id)}
              >
                {f.label}
              </button>
            ))}
          </div>
          <div className="muted" style={{ font: 'var(--t-caption1)', marginTop: 10 }}>
            PDF는 *Pro 플랜* 이상 / CSV는 모든 플랜 / JSON은 API 통합용 (Team 이상)
          </div>
        </div>

        <div
          className="card tight"
          style={{ background: 'var(--accent-light)', borderColor: 'transparent' }}
        >
          <div style={{ font: 'var(--t-label1-strong)', color: 'var(--accent-strong)' }}>
            <Icon name="warn" size={14} /> 가설 H2 검증 포인트
          </div>
          <div
            className="muted"
            style={{ font: 'var(--t-caption1)', color: 'var(--accent-strong)', marginTop: 4 }}
          >
            "Audit → 7대 원칙 → PDF 미리보기 → 업그레이드" 4스텝 시연.
          </div>
        </div>
      </div>
    </div>
  )
}
