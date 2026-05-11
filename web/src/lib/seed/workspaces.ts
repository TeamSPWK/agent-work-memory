export type WorkspaceSeed = {
  id: string
  name: string
  segment: string
  plan: string
  disabled?: boolean
}

export const WORKSPACES: WorkspaceSeed[] = [
  { id: 'ws-a', name: 'B2B SaaS · 28명 · 시리즈 A', segment: '인사 자동화', plan: 'Starter' },
  { id: 'ws-b', name: 'D2C 이커머스 · 35명', segment: '푸드/라이프스타일', plan: 'Team (시연 중)' },
  { id: 'ws-c', name: '솔로 인디 · 1명', segment: 'Future B2C 미리보기', plan: 'Free', disabled: true },
]
