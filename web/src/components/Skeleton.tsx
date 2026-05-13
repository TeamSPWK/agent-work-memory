import type { CSSProperties } from 'react'

type Props = {
  width?: number | string
  height?: number | string
  radius?: number
  className?: string
  style?: CSSProperties
  ariaLabel?: string
}

/**
 * Skeleton block — 토스식 정적 로딩 대체.
 * 실제 콘텐츠 모양과 같은 위치·크기로 그려서 ingest fetch 동안 빈 화면이나
 * "데이터 불러오는 중…" 텍스트가 보이지 않게 한다.
 */
export function Skeleton({ width, height = 16, radius = 6, className, style, ariaLabel }: Props) {
  return (
    <div
      className={'skel' + (className ? ' ' + className : '')}
      role={ariaLabel ? 'status' : 'presentation'}
      aria-label={ariaLabel}
      aria-hidden={!ariaLabel}
      style={{
        width: width ?? '100%',
        height,
        borderRadius: radius,
        ...style,
      }}
    />
  )
}

/** Today hero 위치에 그릴 큰 카드 모양. */
export function TodayHeroSkeleton() {
  return (
    <section
      className="today-hero skel-card"
      aria-label="오늘 우선 작업 불러오는 중"
      style={{ marginBottom: 16 }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <Skeleton width={140} height={12} />
        <Skeleton width="80%" height={28} />
        <Skeleton width="55%" height={14} />
      </div>
      <Skeleton width={180} height={44} radius={10} />
    </section>
  )
}

/** KPI 4 grid 자리. */
export function KpiGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid-4" style={{ marginBottom: 16 }} aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <div className="card tight" key={i}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Skeleton width="55%" height={12} />
            <Skeleton width={80} height={28} />
            <Skeleton width="40%" height={11} />
          </div>
        </div>
      ))}
    </div>
  )
}

/** 세션·감사 표 모양. */
export function TableRowsSkeleton({ rows = 6, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div aria-hidden="true" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {Array.from({ length: rows }).map((_, r) => (
        <div
          key={r}
          style={{
            display: 'grid',
            gridTemplateColumns: `1.4fr repeat(${cols - 1}, 1fr)`,
            gap: 12,
            padding: '8px 0',
            borderBottom: '1px solid var(--line-soft)',
          }}
        >
          {Array.from({ length: cols }).map((_, c) => (
            <Skeleton key={c} height={14} width={c === 0 ? '92%' : c === cols - 1 ? '40%' : '70%'} />
          ))}
        </div>
      ))}
    </div>
  )
}
