import {
  AUDIT_STATS,
  INTEGRITY_BREAK,
  INTEGRITY_TIMELINE,
} from '../../lib/seed/audit'
import { Icon } from '../../components/Icon'

export function Integrity() {
  return (
    <>
      <div
        className="card tight"
        role="status"
        aria-label="mock 한계 안내"
        style={{
          marginBottom: 16,
          background: 'var(--c-orange-95)',
          borderColor: 'transparent',
          color: 'var(--c-orange-30)',
        }}
      >
        ⓘ 데모 mock 한계 — 이 화면의 해시 값은 디자인 데이터입니다. 실제 SHA-256 chain
        계산·재검증은 m2 S4 (Supabase 트리거 + <code>hash-chain-verify</code> Edge Function)에서 적용됩니다.
      </div>

      <div className="grid-3" style={{ marginBottom: 16 }}>
        <div className="card tight">
          <div className="kpi">
            <div className="l">검증 대상</div>
            <div className="v tnum">{AUDIT_STATS.integrityTotal.toLocaleString('ko-KR')}</div>
            <div className="muted" style={{ font: 'var(--t-caption1)' }}>
              지난 30일 이벤트
            </div>
          </div>
        </div>
        <div className="card tight">
          <div className="kpi">
            <div className="l">무결성 통과</div>
            <div className="v tnum" style={{ color: 'var(--status-positive)' }}>
              {AUDIT_STATS.integrityPassed.toLocaleString('ko-KR')}
            </div>
            <div className="muted" style={{ font: 'var(--t-caption1)' }}>
              SHA-256 chain 일치
            </div>
          </div>
        </div>
        <div className="card tight">
          <div className="kpi">
            <div className="l">깨진 row</div>
            <div className="v tnum" style={{ color: 'var(--status-negative)' }}>
              {AUDIT_STATS.integrityBroken}
            </div>
            <div className="muted" style={{ font: 'var(--t-caption1)' }}>
              {INTEGRITY_BREAK.at} — 세션 시작 row
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-h">
          <h3>깨진 구간 detail</h3>
          <span className="sub">m2 S4 SHA-256 hash chain 적용 예정</span>
        </div>

        <div
          style={{
            background: 'var(--bg-subtle)',
            borderRadius: 10,
            padding: 14,
            marginBottom: 14,
          }}
        >
          <div className="muted" style={{ font: 'var(--t-caption1)', marginBottom: 6 }}>
            발견된 불일치
          </div>
          <div className="mono" style={{ color: 'var(--status-negative)', fontSize: 13 }}>
            {INTEGRITY_BREAK.evId} · expected_prev={INTEGRITY_BREAK.expectedPrev} · stored_prev=
            {INTEGRITY_BREAK.storedPrev}
          </div>
          <div className="mono muted" style={{ fontSize: 12, marginTop: 4 }}>
            SHA-256(prev={INTEGRITY_BREAK.expectedPrev}, payload={INTEGRITY_BREAK.payloadDesc}) ={' '}
            {INTEGRITY_BREAK.expectedHash}… · stored={INTEGRITY_BREAK.storedPrev}
          </div>
        </div>

        <div className="timeline">
          {INTEGRITY_TIMELINE.map((row) => (
            <div key={row.evId} className={'ev' + (row.kind === 'risk' ? ' risk' : ' ok')}>
              <div className="t">
                {row.at} · {row.evId}
                {row.kind === 'risk' ? ' (broken)' : ''}
              </div>
              <div
                className="h"
                style={row.kind === 'risk' ? { color: 'var(--status-negative)' } : undefined}
              >
                {row.headline}
              </div>
              <div className={'b' + (row.kind === 'risk' ? '' : ' muted')}>{row.body}</div>
            </div>
          ))}
        </div>

        <div className="hr" />
        <div className="row between">
          <div className="muted" style={{ font: 'var(--t-caption1)' }}>
            {INTEGRITY_BREAK.cause}
          </div>
          <div className="row tight">
            <button className="btn sm" type="button">
              백필 후보로 분류
            </button>
            <button className="btn sm" type="button">
              외부 수정 의심
            </button>
            <button className="btn weak sm" type="button">
              <Icon name="pencil" size={12} />
              사유 메모
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
