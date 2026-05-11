import { create } from 'zustand'

export type Persona = 'Operator' | 'Reviewer' | 'Admin'
export type Theme = 'light' | 'dark'

type UiState = {
  persona: Persona
  theme: Theme
  workspaceId: string
  setPersona: (p: Persona) => void
  setTheme: (t: Theme) => void
  toggleTheme: () => void
  setWorkspaceId: (id: string) => void
}

export const useUi = create<UiState>((set) => ({
  persona: 'Operator',
  theme: 'light',
  workspaceId: 'ws-a',
  setPersona: (persona) => set({ persona }),
  setTheme: (theme) => {
    document.documentElement.setAttribute('data-theme', theme)
    set({ theme })
  },
  toggleTheme: () =>
    set((s) => {
      const next: Theme = s.theme === 'dark' ? 'light' : 'dark'
      document.documentElement.setAttribute('data-theme', next)
      return { theme: next }
    }),
  setWorkspaceId: (workspaceId) => set({ workspaceId }),
}))
