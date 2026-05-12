import { useState } from 'react'
import { INCIDENT, type IncidentNote } from '../../lib/seed/incident'
import { Icon } from '../../components/Icon'

const POSTMORTEM_SECTIONS = [
  '요약 / 영향 / Timeline',
  '3분리 (후보 · 확실 · 불명)',
  '관련 세션 · commit · 명령',
  '재발 방지 액션 (사람 작성)',
  'Audit row chain 검증 결과',
]

function nowHHMM() {
  const now = new Date()
  const hh = String(now.getHours()).padStart(2, '0')
  const mm = String(now.getMinutes()).padStart(2, '0')
  return `${hh}:${mm}`
}

export function Note() {
  const [notes, setNotes] = useState<IncidentNote[]>(INCIDENT.notes)
  const [draft, setDraft] = useState('')

  const addNote = () => {
    if (!draft.trim()) return
    setNotes((prev) => [
      ...prev,
      { at: nowHHMM(), who: '개발 리드 (8년차)', text: draft.trim() },
    ])
    setDraft('')
  }

  return (
    <div className="grid-split">
      <div className="card">
        <div className="card-h">
          <h3>조사 누적 메모</h3>
          <span className="sub">{notes.length}건 · 가장 오래된 것부터</span>
        </div>
        <div className="timeline">
          {notes.map((n, i) => (
            <div key={i} className="ev">
              <div className="t tnum">
                {n.at} · {n.who}
              </div>
              <div className="b" style={{ marginTop: 4 }}>
                {n.text}
              </div>
            </div>
          ))}
          {draft && (
            <div className="ev ok">
              <div className="t tnum">지금 · 작성 중</div>
              <div className="b" style={{ marginTop: 4 }}>
                {draft}
              </div>
            </div>
          )}
        </div>

        <div className="hr" />
        <div className="fieldset">
          <label htmlFor="incident-new-note">새 메모</label>
          <textarea
            id="incident-new-note"
            className="focus-stub"
            rows={4}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="예) 16:42 — applicants 테이블 lock 해소 확인. 응답시간 회복 (840ms → 92ms)."
          />
          <div className="row between" style={{ marginTop: 4 }}>
            <span className="muted" style={{ font: 'var(--t-caption1)' }}>
              저장 시 audit row 생성 · 이전 hash와 chain 연결
            </span>
            <button
              className="btn primary"
              type="button"
              disabled={!draft.trim()}
              onClick={addNote}
            >
              <Icon name="plus" size={14} />
              메모 저장
            </button>
          </div>
        </div>
      </div>

      <div className="col">
        <div className="card tight">
          <div className="eyebrow">사고 요약 (자동)</div>
          <div
            style={{
              font: 'var(--t-label1-strong)',
              color: 'var(--text-strong)',
              margin: '6px 0 8px',
            }}
          >
            {INCIDENT.title}
          </div>
          <ul
            style={{
              margin: 0,
              paddingLeft: 18,
              color: 'var(--text-neutral)',
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
              font: 'var(--t-label1)',
            }}
          >
            <li>
              시작 16:31 · 감지 16:34 · 경과 {INCIDENT.elapsedMin}분
            </li>
            <li>관련 AI 변경 · 1건 (s-024 · prod 인덱스)</li>
            <li>위험 카테고리 · DB · 고위험</li>
            <li>Reviewer Brief · 의도-결과 일치 / 부수 변경 1건</li>
          </ul>
        </div>

        <div className="card tight">
          <div className="eyebrow">Postmortem 자동 양식</div>
          <ul
            style={{
              margin: 0,
              paddingLeft: 18,
              color: 'var(--text-neutral)',
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
              font: 'var(--t-label1)',
            }}
          >
            {POSTMORTEM_SECTIONS.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
          <button className="btn primary" type="button" style={{ marginTop: 10 }}>
            <Icon name="download" size={14} />
            Postmortem 다운로드
          </button>
        </div>

        <div
          className="card tight"
          style={{ background: 'var(--accent-light)', borderColor: 'transparent' }}
        >
          <div style={{ font: 'var(--t-label1-strong)', color: 'var(--accent-strong)' }}>
            <Icon name="warn" size={14} /> 가설 H3 검증
          </div>
          <div
            className="muted"
            style={{ font: 'var(--t-caption1)', color: 'var(--accent-strong)', marginTop: 4 }}
          >
            16:31 사고 시작 → 16:38 1차 원인 메모 = 7분. 시연 시 8~10분 안에 끝나는지 확인.
          </div>
        </div>
      </div>
    </div>
  )
}
