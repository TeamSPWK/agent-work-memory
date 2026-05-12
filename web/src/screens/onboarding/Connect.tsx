import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Icon } from '../../components/Icon'
import { OnboardingProgress } from './OnboardingProgress'
import {
  ONBOARDING_TOOLS,
  type OnboardingTool,
  type OnboardingToolState,
} from '../../lib/seed/onboarding'

function StateChip({ state }: { state: OnboardingToolState }) {
  if (state === 'connected')
    return (
      <span className="tag green">
        <span className="dot" />
        연결됨
      </span>
    )
  if (state === 'error')
    return (
      <span className="tag red">
        <span className="dot" />
        오류
      </span>
    )
  return <span className="tag neutral">미연결</span>
}

export function Connect() {
  const [tools, setTools] = useState<OnboardingTool[]>(ONBOARDING_TOOLS)
  const [showAuth, setShowAuth] = useState<OnboardingTool['key'] | null>(null)
  const connectedCount = tools.filter((t) => t.state === 'connected').length

  useEffect(() => {
    if (!showAuth) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowAuth(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [showAuth])

  const confirmAuth = () => {
    setTools((prev) =>
      prev.map((t) => (t.key === showAuth ? { ...t, state: 'connected' } : t)),
    )
    setShowAuth(null)
  }

  const disconnect = (k: OnboardingTool['key']) => {
    setTools((prev) => prev.map((t) => (t.key === k ? { ...t, state: 'idle' } : t)))
  }

  const authTool = tools.find((t) => t.key === showAuth)

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
          <span
            className="muted tnum"
            style={{ font: 'var(--t-caption1)' }}
            aria-label="연결된 도구 수"
          >
            {connectedCount} / {tools.length} 연결됨
          </span>
        </div>
      </div>

      <div className="grid-split">
        <div className="card">
          <div className="card-h">
            <h3>도구</h3>
            <span className="sub">연결 즉시 import 시작</span>
          </div>
          <div className="grid-2" style={{ gap: 12 }}>
            {tools.map((t) => {
              const isConnected = t.state === 'connected'
              return (
                <div
                  key={t.key}
                  className="card tight"
                  style={{
                    borderColor: isConnected ? 'var(--primary-normal)' : 'var(--line-soft)',
                    background: isConnected ? 'var(--primary-light)' : 'var(--bg-base)',
                  }}
                >
                  <div className="row between">
                    <div className="row tight" style={{ alignItems: 'center' }}>
                      <div
                        className="avatar"
                        style={{
                          background: 'var(--text-strong)',
                          borderRadius: 8,
                          width: 32,
                          height: 32,
                        }}
                      >
                        {t.name[0]}
                      </div>
                      <div>
                        <div
                          style={{
                            font: 'var(--t-label1-strong)',
                            color: 'var(--text-strong)',
                          }}
                        >
                          {t.name}
                        </div>
                        <div className="muted" style={{ font: 'var(--t-caption1)' }}>
                          {t.desc}
                        </div>
                      </div>
                    </div>
                    <StateChip state={t.state} />
                  </div>
                  <div className="hr" />
                  <div className="muted" style={{ font: 'var(--t-caption1)', marginBottom: 8 }}>
                    권한 스코프 · {t.scope}
                  </div>
                  {isConnected ? (
                    <button className="btn sm" type="button" onClick={() => disconnect(t.key)}>
                      연결 해제
                    </button>
                  ) : t.state === 'error' ? (
                    <button
                      className="btn sm"
                      type="button"
                      onClick={() => setShowAuth(t.key)}
                    >
                      <Icon name="link" size={12} />
                      재연결
                    </button>
                  ) : (
                    <button
                      className="btn primary sm"
                      type="button"
                      onClick={() => setShowAuth(t.key)}
                    >
                      <Icon name="link" size={12} />
                      연결
                    </button>
                  )}
                </div>
              )
            })}
          </div>

          <div className="hr" />
          <div className="row between">
            <Link className="btn" to="/onboarding/ws">
              ← 이전
            </Link>
            {connectedCount === 0 ? (
              <button
                className="btn primary lg"
                type="button"
                disabled
                style={{ opacity: 0.5 }}
              >
                다음 — 첫 세션 import <Icon name="arrow" size={14} />
              </button>
            ) : (
              <Link className="btn primary lg" to="/onboarding/import">
                다음 — 첫 세션 import <Icon name="arrow" size={14} />
              </Link>
            )}
          </div>
        </div>

        <div className="col">
          <div
            className="card tight"
            style={{ background: 'var(--primary-light)', borderColor: 'transparent' }}
          >
            <div style={{ font: 'var(--t-label1-strong)', color: 'var(--primary-strong)' }}>
              <Icon name="lock" size={14} /> 저장하지 않는 것
            </div>
            <ul
              style={{
                margin: '8px 0 0',
                paddingLeft: 18,
                font: 'var(--t-label2)',
                color: 'var(--primary-strong)',
                display: 'flex',
                flexDirection: 'column',
                gap: 6,
              }}
            >
              <li>원문 transcript (사용자·AI 발화 그대로)</li>
              <li>코드 파일 원본 (변경된 부분 요약만)</li>
              <li>고객·민감 정보 (감지 시 자동 마스킹)</li>
            </ul>
          </div>

          <div className="card tight">
            <div className="eyebrow">저장하는 것</div>
            <ul
              style={{
                margin: '8px 0 0',
                paddingLeft: 18,
                font: 'var(--t-label2)',
                color: 'var(--text-neutral)',
                display: 'flex',
                flexDirection: 'column',
                gap: 6,
              }}
            >
              <li>세션 메타 (시각·도구·작업자·intent 1줄)</li>
              <li>변경 파일 경로 + 추가/삭제 라인 수</li>
              <li>실행된 명령의 위험 분류 결과</li>
              <li>commit 매칭 score</li>
            </ul>
          </div>

          <div
            className="card tight"
            style={{ background: 'var(--bg-subtle)', borderColor: 'transparent' }}
          >
            <div className="eyebrow" style={{ color: 'var(--text-assistive)' }}>
              OAuth만 사용
            </div>
            <div className="muted" style={{ font: 'var(--t-caption1)', marginTop: 4 }}>
              모든 도구는 OAuth 2.0 / 도구별 token 방식. 비밀번호를 저장하지 않습니다. 연결을
              해제하면 30일 후 메타 데이터도 자동 삭제됩니다.
            </div>
          </div>
        </div>
      </div>

      {showAuth && authTool && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${authTool.name} OAuth 권한 확인`}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.45)',
            display: 'grid',
            placeItems: 'center',
            zIndex: 100,
          }}
          onClick={() => setShowAuth(null)}
        >
          <div
            className="card"
            style={{ width: 520, maxWidth: '92vw' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="card-h">
              <h3>{authTool.name} OAuth 권한 확인</h3>
              <button
                className="icon-btn"
                type="button"
                aria-label="닫기"
                onClick={() => setShowAuth(null)}
              >
                <Icon name="x" size={14} />
              </button>
            </div>
            <div className="muted" style={{ font: 'var(--t-label2)', marginBottom: 12 }}>
              Agent Work Memory가 {authTool.name}에 다음 권한을 요청합니다.
            </div>
            <ul
              style={{
                margin: 0,
                paddingLeft: 18,
                font: 'var(--t-label2)',
                color: 'var(--text-neutral)',
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
              }}
            >
              <li>세션 목록 + 메타 읽기</li>
              <li>코드 변경 파일 경로·라인 수 읽기 (원본 제외)</li>
              <li>명령 로그 읽기</li>
            </ul>
            <div className="hr" />
            <div className="row between">
              <span className="muted" style={{ font: 'var(--t-caption1)' }}>
                <Icon name="lock" size={12} /> 쓰기 권한 없음
              </span>
              <div className="row tight">
                <button className="btn" type="button" onClick={() => setShowAuth(null)}>
                  취소
                </button>
                <button className="btn primary" type="button" onClick={confirmAuth}>
                  <Icon name="check" size={14} />
                  허용
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
