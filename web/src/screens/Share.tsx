import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { SESSIONS } from '../lib/seed/sessions'
import { SESSION_DETAIL } from '../lib/seed/sessionDetail'
import { Icon } from '../components/Icon'

const SUMMARY = `[5/10 (월) · B2B SaaS 워크스페이스 · AI 작업 요약]
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
   → 검토 요약 대기.
   담당: 프론트엔드`

const CHANNELS = [
  { name: 'Slack #ai-work', icon: 'share' },
  { name: 'Notion · 일일 메모리', icon: 'book' },
  { name: '이메일 (팀 메일링)', icon: 'mail' },
]

export function Share() {
  const { id = '' } = useParams<{ id?: string }>()
  const session = SESSIONS.find((s) => s.id === id)
  const [copied, setCopied] = useState(false)

  if (!session) {
    return (
      <div className="card" style={{ padding: 24 }}>
        <h1 style={{ font: 'var(--t-title3)', color: 'var(--text-strong)', margin: 0 }}>
          세션을 찾을 수 없습니다
        </h1>
        <Link className="btn" to="/sessions" style={{ marginTop: 16, display: 'inline-flex' }}>
          ← Sessions 목록으로
        </Link>
      </div>
    )
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard?.writeText(SUMMARY)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      setCopied(false)
    }
  }

  return (
    <>
      <div className="page-h">
        <div>
          <div className="eyebrow">오늘 화면 또는 설명 메모 저장 후</div>
          <h1>팀 공유 요약</h1>
          <p>슬랙·노션·이메일에 그대로 붙여 넣을 수 있는 한국어 요약입니다.</p>
        </div>
        <div className="actions">
          <Link className="btn" to={`/sessions/${session.id}/explain`}>
            ← 설명 메모
          </Link>
          <button className="btn primary" type="button" onClick={handleCopy}>
            <Icon name="copy" size={14} />
            {copied ? '복사 완료' : '전체 복사'}
          </button>
        </div>
      </div>

      {session.id !== SESSION_DETAIL.id && (
        <div
          className="card tight"
          style={{
            marginBottom: 16,
            background: 'var(--c-orange-95)',
            borderColor: 'transparent',
            color: 'var(--c-orange-30)',
          }}
        >
          ⓘ 데모 mock 한계 — 이 세션(<code>{session.id}</code>)의 공유 요약은 아직 채워지지 않았습니다. 아래는 참고용으로 워크스페이스 일일 요약 예시를 표시합니다.
        </div>
      )}

      <div className="grid-split">
        <div className="card">
          <div className="card-h">
            <h3>요약 미리보기</h3>
            <span className="sub">한국어 / 마크다운 없는 평문</span>
          </div>
          <pre
            style={{
              margin: 0,
              font: 'var(--t-label1)',
              lineHeight: 1.7,
              color: 'var(--text-normal)',
              whiteSpace: 'pre-wrap',
              padding: 16,
              borderRadius: 10,
              background: 'var(--bg-subtle)',
              border: '1px solid var(--line-soft)',
            }}
          >
            {SUMMARY}
          </pre>
        </div>

        <div className="col">
          <div className="card tight">
            <div className="eyebrow">전송 채널 (시연용 placeholder)</div>
            <div className="col" style={{ gap: 10, marginTop: 10 }}>
              {CHANNELS.map((c) => (
                <button
                  key={c.name}
                  className="btn"
                  type="button"
                  style={{ justifyContent: 'flex-start', height: 40 }}
                >
                  <Icon name={c.icon} size={16} />
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          <div className="card tight">
            <div className="eyebrow">포함 항목</div>
            <ul
              style={{
                margin: 0,
                paddingLeft: 16,
                color: 'var(--text-neutral)',
                display: 'flex',
                flexDirection: 'column',
                gap: 6,
              }}
            >
              <li>오늘 통계 (변경/위험/미설명)</li>
              <li>추가 확인 필요 세션 + 담당자</li>
              <li>Explain Back에서 채운 *핸드오프*</li>
              <li>raw transcript 또는 secret 값은 절대 미포함</li>
            </ul>
          </div>

          <div
            className="card tight"
            style={{ background: 'var(--accent-light)', borderColor: 'transparent' }}
          >
            <div style={{ font: 'var(--t-label1-strong)', color: 'var(--accent-strong)' }}>
              <Icon name="warn" size={14} /> 가설 H1 검증 포인트
            </div>
            <div
              className="muted"
              style={{ font: 'var(--t-caption1)', color: 'var(--accent-strong)', marginTop: 4 }}
            >
              "오늘 첫 화면 → 미설명 → Explain Back → 한 번 복사" 사이클이 5분 안에 끝나는지 시연.
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
