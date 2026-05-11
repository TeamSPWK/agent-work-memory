import { useLocation } from 'react-router-dom'

type Props = {
  label: string
  note?: string
}

export function PlaceholderScreen({ label, note }: Props) {
  const { pathname } = useLocation()

  return (
    <div className="card" style={{ padding: 24 }}>
      <h1 style={{ font: 'var(--t-title3)', color: 'var(--text-strong)', margin: '0 0 12px' }}>
        {label}
      </h1>
      <p style={{ font: 'var(--t-body2)', color: 'var(--text-assistive)', margin: 0 }}>
        {note ?? 'S2.1 골격 — 화면 stub. S2.2 이후 v0.1 시안 내용으로 채워집니다.'}
      </p>
      <div
        style={{
          marginTop: 16,
          padding: 12,
          background: 'var(--bg-subtle)',
          borderRadius: 8,
          font: 'var(--t-label2)',
          color: 'var(--text-neutral)',
        }}
      >
        route: <code>{pathname}</code>
      </div>
    </div>
  )
}
