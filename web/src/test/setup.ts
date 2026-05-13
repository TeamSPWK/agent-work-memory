import '@testing-library/jest-dom/vitest'

// useIngest는 /api/ingest fetch에 의존 — test 환경(jsdom)에서는 즉시 빈 상태로 stub.
// SessionDetail/Sessions/Today 등이 seed fallback으로 동작하도록.
vi.mock('../lib/useIngest', () => ({
  useIngest: vi.fn(() => ({
    loading: false,
    sessions: [],
    workPackets: [],
    auditEvents: [],
    error: null,
  })),
}))
