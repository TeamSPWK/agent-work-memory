import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AppShell } from './layout/AppShell'
import { PlaceholderScreen } from './screens/PlaceholderScreen'
import { HYPOTHESES } from './lib/seed/hypotheses'

const screenRoutes = HYPOTHESES.flatMap((h) =>
  h.screens.map((s) => ({
    path: `${h.id}/${s.id}`,
    element: <PlaceholderScreen />,
  })),
)

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <Navigate to="/h1/today" replace /> },
      ...screenRoutes,
      { path: '*', element: <PlaceholderScreen /> },
    ],
  },
])
