import { memo, type CSSProperties, type ReactNode } from 'react'

type IconProps = {
  name: string
  size?: number
  className?: string
  style?: CSSProperties
}

const stroke = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

const paths: Record<string, ReactNode> = {
  home: (
    <>
      <path {...stroke} d="M4 11l8-7 8 7" />
      <path {...stroke} d="M6 10v9h12v-9" />
    </>
  ),
  list: <path {...stroke} d="M4 6h16M4 12h16M4 18h10" />,
  review: (
    <>
      <circle {...stroke} cx="11" cy="11" r="6" />
      <path {...stroke} d="M20 20l-4.5-4.5" />
    </>
  ),
  radar: (
    <>
      <circle {...stroke} cx="12" cy="12" r="8" />
      <circle {...stroke} cx="12" cy="12" r="4" />
      <path {...stroke} d="M12 4v8l5 3" />
    </>
  ),
  audit: (
    <>
      <path {...stroke} d="M5 4h10l4 4v12H5z" />
      <path {...stroke} d="M15 4v4h4" />
      <path {...stroke} d="M9 13h6M9 17h4" />
    </>
  ),
  incident: (
    <>
      <path {...stroke} d="M12 3l9 16H3z" />
      <path {...stroke} d="M12 10v4" />
      <circle cx="12" cy="17" r="1" fill="currentColor" />
    </>
  ),
  workspace: (
    <>
      <path {...stroke} d="M4 7h16v12H4z" />
      <path {...stroke} d="M4 7l8-4 8 4" />
    </>
  ),
  settings: (
    <>
      <circle {...stroke} cx="12" cy="12" r="3" />
      <path {...stroke} d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" />
    </>
  ),
  // gear — 개발 상태 메뉴 등 dev 화면용. settings보다 단순한 톱니 1개.
  gear: (
    <>
      <circle {...stroke} cx="12" cy="12" r="3" />
      <path {...stroke} d="M12 4v2M12 18v2M4 12h2M18 12h2M6.3 6.3l1.4 1.4M16.3 16.3l1.4 1.4M6.3 17.7l1.4-1.4M16.3 7.7l1.4-1.4" />
    </>
  ),
  bell: (
    <>
      <path {...stroke} d="M6 16V11a6 6 0 1 1 12 0v5l1.5 2H4.5z" />
      <path {...stroke} d="M10 20a2 2 0 0 0 4 0" />
    </>
  ),
  moon: <path {...stroke} d="M19 14a8 8 0 1 1-9-9 7 7 0 0 0 9 9z" />,
  sun: (
    <>
      <circle {...stroke} cx="12" cy="12" r="4" />
      <path
        {...stroke}
        d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"
      />
    </>
  ),
  chev: <path {...stroke} d="M9 6l6 6-6 6" />,
  chevdown: <path {...stroke} d="M6 9l6 6 6-6" />,
  plus: <path {...stroke} d="M12 5v14M5 12h14" />,
  download: (
    <>
      <path {...stroke} d="M12 4v12" />
      <path {...stroke} d="M7 11l5 5 5-5" />
      <path {...stroke} d="M5 20h14" />
    </>
  ),
  share: (
    <>
      <circle {...stroke} cx="6" cy="12" r="2" />
      <circle {...stroke} cx="18" cy="6" r="2" />
      <circle {...stroke} cx="18" cy="18" r="2" />
      <path {...stroke} d="M8 11l8-4M8 13l8 4" />
    </>
  ),
  copy: (
    <>
      <rect {...stroke} x="8" y="8" width="12" height="12" rx="2" />
      <path {...stroke} d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3" />
    </>
  ),
  check: <path {...stroke} d="M5 12l5 5L20 7" />,
  x: <path {...stroke} d="M6 6l12 12M6 18L18 6" />,
  warn: (
    <>
      <path {...stroke} d="M12 4l9 16H3z" />
      <path {...stroke} d="M12 11v4" />
      <circle cx="12" cy="18" r="1" fill="currentColor" />
    </>
  ),
  lock: (
    <>
      <rect {...stroke} x="5" y="11" width="14" height="9" rx="2" />
      <path {...stroke} d="M8 11V8a4 4 0 1 1 8 0v3" />
    </>
  ),
  chain: (
    <>
      <path {...stroke} d="M10 14a4 4 0 0 1 0-5l3-3a4 4 0 0 1 6 6l-1 1" />
      <path {...stroke} d="M14 10a4 4 0 0 1 0 5l-3 3a4 4 0 1 1-6-6l1-1" />
    </>
  ),
  play: <path {...stroke} d="M7 4v16l13-8z" />,
  filter: <path {...stroke} d="M4 5h16l-6 8v6l-4-2v-4z" />,
  cal: (
    <>
      <rect {...stroke} x="4" y="6" width="16" height="14" rx="2" />
      <path {...stroke} d="M4 10h16M9 4v4M15 4v4" />
    </>
  ),
  user: (
    <>
      <circle {...stroke} cx="12" cy="9" r="4" />
      <path {...stroke} d="M4 20a8 8 0 0 1 16 0" />
    </>
  ),
  arrow: <path {...stroke} d="M5 12h14M13 6l6 6-6 6" />,
  sparkle: (
    <>
      <path {...stroke} d="M12 4l1.8 4.2L18 10l-4.2 1.8L12 16l-1.8-4.2L6 10l4.2-1.8z" />
      <path {...stroke} d="M19 16l.8 1.8L21 19l-1.2.8L19 22l-.8-2.2L17 19l1.8-.4z" />
    </>
  ),
  git: (
    <>
      <circle {...stroke} cx="6" cy="6" r="2" />
      <circle {...stroke} cx="18" cy="6" r="2" />
      <circle {...stroke} cx="6" cy="18" r="2" />
      <path {...stroke} d="M6 8v8M18 8v2a4 4 0 0 1-4 4H8" />
    </>
  ),
  db: (
    <>
      <ellipse {...stroke} cx="12" cy="6" rx="7" ry="3" />
      <path {...stroke} d="M5 6v12a7 3 0 0 0 14 0V6" />
      <path {...stroke} d="M5 12a7 3 0 0 0 14 0" />
    </>
  ),
  deploy: <path {...stroke} d="M4 13l8 7 8-7M4 8l8-5 8 5" />,
  flame: <path {...stroke} d="M12 3c2 4 5 5 5 9a5 5 0 0 1-10 0c0-2 1-3 2-4 0 2 1 3 3 3 0-3 0-5 0-8z" />,
  key: (
    <>
      <circle {...stroke} cx="8" cy="14" r="4" />
      <path {...stroke} d="M11 11l9-9M16 7l3 3" />
    </>
  ),
  file: (
    <>
      <path {...stroke} d="M6 4h8l4 4v12H6z" />
      <path {...stroke} d="M14 4v4h4" />
    </>
  ),
  mail: (
    <>
      <rect {...stroke} x="3" y="6" width="18" height="12" rx="2" />
      <path {...stroke} d="M3 7l9 7 9-7" />
    </>
  ),
  pencil: <path {...stroke} d="M4 20l4-1 11-11-3-3L5 16z" />,
  book: (
    <>
      <path {...stroke} d="M5 4h12a2 2 0 0 1 2 2v14H7a2 2 0 0 1-2-2z" />
      <path {...stroke} d="M5 18a2 2 0 0 0 2 2" />
    </>
  ),
  drag: (
    <>
      <circle cx="9" cy="6" r="1.5" fill="currentColor" />
      <circle cx="9" cy="12" r="1.5" fill="currentColor" />
      <circle cx="9" cy="18" r="1.5" fill="currentColor" />
      <circle cx="15" cy="6" r="1.5" fill="currentColor" />
      <circle cx="15" cy="12" r="1.5" fill="currentColor" />
      <circle cx="15" cy="18" r="1.5" fill="currentColor" />
    </>
  ),
  flag: <path {...stroke} d="M5 21V4h11l-2 4 2 4H5" />,
  eye: (
    <>
      <path {...stroke} d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" />
      <circle {...stroke} cx="12" cy="12" r="3" />
    </>
  ),
  bolt: <path {...stroke} d="M13 3L4 14h7l-1 7 9-11h-7z" />,
  link: (
    <>
      <path {...stroke} d="M10 14a4 4 0 0 0 5.6 0l2.8-2.8a4 4 0 0 0-5.6-5.6L11.5 7" />
      <path {...stroke} d="M14 10a4 4 0 0 0-5.6 0l-2.8 2.8a4 4 0 0 0 5.6 5.6L12.5 17" />
    </>
  ),
}

/* paths 객체가 모듈 로드 시 React 노드 48개를 일괄 생성하므로, Icon 자체는 memo로
 * 재사용해 부모 re-render 시 불필요한 reconciliation을 줄인다. SVG sprite로의 전환은 별도 sprint. */
function IconImpl({ name, size = 18, className = '', style }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      style={style}
      aria-hidden="true"
      focusable="false"
    >
      {paths[name] ?? null}
    </svg>
  )
}

export const Icon = memo(IconImpl)
