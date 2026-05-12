import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Icon } from '../../components/Icon'
import { OnboardingProgress } from './OnboardingProgress'

const SEGMENTS = ['B2B SaaS', 'D2C 이커머스', '서비스업', '솔로 인디', '기타'] as const
const SIZES = ['1', '2~10', '11~30', '31~50', '51+'] as const

type ChipProps = {
  label: string
  name: string
  active: boolean
  onSelect: () => void
}

function Chip({ label, name, active, onSelect }: ChipProps) {
  return (
    <label
      className="row tight"
      style={{
        padding: '8px 12px',
        border: '1px solid var(--line-soft)',
        borderRadius: 8,
        background: active ? 'var(--primary-light)' : 'var(--bg-base)',
        color: active ? 'var(--primary-strong)' : 'var(--text-normal)',
        font: active ? 'var(--t-label1-strong)' : 'var(--t-label1)',
        cursor: 'pointer',
      }}
    >
      <input
        type="radio"
        name={name}
        checked={active}
        onChange={onSelect}
        aria-label={label}
      />
      {label}
    </label>
  )
}

export function Workspace() {
  const [seg, setSeg] = useState<(typeof SEGMENTS)[number]>('B2B SaaS')
  const [size, setSize] = useState<(typeof SIZES)[number]>('11~30')

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
          <div className="card-h">
            <h3>워크스페이스 정보</h3>
            <span className="sub">모두 나중에 변경 가능</span>
          </div>

          <div className="fieldset">
            <label htmlFor="ws-name">워크스페이스 이름</label>
            <input id="ws-name" className="focus-stub" defaultValue="새 워크스페이스" />
            <div className="hint">팀원에게 보이는 이름. 회사명·서비스명 어느 쪽이든.</div>
          </div>

          <div className="hr" />

          <fieldset className="fieldset" style={{ border: 0, padding: 0, margin: 0 }}>
            <legend style={{ font: 'var(--t-caption1)', color: 'var(--text-assistive)' }}>
              세그먼트
            </legend>
            <div
              role="radiogroup"
              aria-label="세그먼트"
              className="row tight"
              style={{ flexWrap: 'wrap', marginTop: 8 }}
            >
              {SEGMENTS.map((s) => (
                <Chip
                  key={s}
                  label={s}
                  name="seg"
                  active={seg === s}
                  onSelect={() => setSeg(s)}
                />
              ))}
            </div>
          </fieldset>

          <div className="hr" />

          <fieldset className="fieldset" style={{ border: 0, padding: 0, margin: 0 }}>
            <legend style={{ font: 'var(--t-caption1)', color: 'var(--text-assistive)' }}>
              팀 규모
            </legend>
            <div
              role="radiogroup"
              aria-label="팀 규모"
              className="row tight"
              style={{ flexWrap: 'wrap', marginTop: 8 }}
            >
              {SIZES.map((s) => (
                <Chip
                  key={s}
                  label={s}
                  name="size"
                  active={size === s}
                  onSelect={() => setSize(s)}
                />
              ))}
            </div>
          </fieldset>

          <div className="hr" />

          <div className="grid-2">
            <div className="fieldset">
              <label htmlFor="ws-lang">언어</label>
              <select id="ws-lang" className="focus-stub" defaultValue="ko">
                <option value="ko">한국어</option>
                <option value="en">English (선공개)</option>
              </select>
            </div>
            <div className="fieldset">
              <label htmlFor="ws-currency">요금 통화</label>
              <select id="ws-currency" className="focus-stub" defaultValue="KRW">
                <option value="KRW">KRW · 원</option>
                <option value="USD">USD · 달러</option>
              </select>
            </div>
          </div>

          <div className="hr" />
          <div className="row between">
            <span className="muted" style={{ font: 'var(--t-caption1)' }}>
              <Icon name="lock" size={12} /> 이메일·이름 외 개인정보 수집 안 함
            </span>
            <Link className="btn primary lg" to="/onboarding/connect">
              다음 — 도구 연결 <Icon name="arrow" size={14} />
            </Link>
          </div>
        </div>

        <div className="col">
          <div
            className="card tight"
            style={{ background: 'var(--primary-light)', borderColor: 'transparent' }}
          >
            <div style={{ font: 'var(--t-label1-strong)', color: 'var(--primary-strong)' }}>
              왜 묻는가
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
              <li>세그먼트·규모는 디자인 파트너 추적과 자동 제안에만 사용</li>
              <li>외부 노출·제3자 공유 없음 (PRD §9 anonymization)</li>
              <li>요금 통화는 결제 시점에만 사용, 표시 단위 결정용</li>
            </ul>
          </div>

          <div className="card tight">
            <div className="eyebrow">다음에 일어날 일</div>
            <ol
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
              <li>AI 도구 1개 이상 연결</li>
              <li>최근 세션 1건 자동 import (백그라운드 30초~2분)</li>
              <li>Reviewer 1명 지정 → 7대 원칙 §1 활성</li>
              <li>Today에 첫 세션 행 표시 → 완료</li>
            </ol>
            <div className="muted" style={{ font: 'var(--t-caption1)', marginTop: 8 }}>
              예상 소요 시간 · 4~6분
            </div>
          </div>

          <div
            className="card tight"
            style={{ background: 'var(--bg-subtle)', borderColor: 'transparent' }}
          >
            <div className="eyebrow" style={{ color: 'var(--text-assistive)' }}>
              운영 원칙
            </div>
            <div className="muted" style={{ font: 'var(--t-caption1)', marginTop: 4 }}>
              1인 운영 self-serve. 24/7 지원은 없습니다. 대신 워크스페이스 데이터는 본인이 언제든
              JSON으로 export 가능 (Settings · Profile).
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
