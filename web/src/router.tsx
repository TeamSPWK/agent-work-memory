import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AppShell } from './layout/AppShell'
import { OnboardingLayout } from './layout/OnboardingLayout'
import { PlaceholderScreen } from './screens/PlaceholderScreen'
import { Today } from './screens/Today'
import { Sessions } from './screens/Sessions'
import { SessionDetail } from './screens/SessionDetail'
import { ExplainBack } from './screens/ExplainBack'
import { Share } from './screens/Share'
import { SelfRecall } from './screens/SelfRecall'
import { Audit } from './screens/Audit'
import { Risk } from './screens/Risk'
import { Incident } from './screens/Incident'
import { StatusBoard } from './screens/dev/StatusBoard'
import { ONBOARDING_STEPS } from './lib/seed/navigation'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <Navigate to="/today" replace /> },
      { path: 'today', element: <Today /> },
      { path: 'sessions', element: <Sessions /> },
      { path: 'sessions/yesterday', element: <SelfRecall /> },
      { path: 'sessions/:id', element: <SessionDetail /> },
      { path: 'sessions/:id/explain', element: <ExplainBack /> },
      { path: 'sessions/:id/share', element: <Share /> },
      { path: 'audit', element: <Audit /> },
      { path: 'risk', element: <Risk /> },
      { path: 'incidents/:id', element: <Incident /> },
      { path: 'workspace', element: <PlaceholderScreen label="Workspace" /> },
      { path: 'settings', element: <PlaceholderScreen label="Settings" /> },
      { path: 'dev/status', element: <StatusBoard /> },
      { path: '*', element: <PlaceholderScreen label="찾을 수 없음" note="요청한 경로가 존재하지 않습니다." /> },
    ],
  },
  {
    path: '/onboarding',
    element: <OnboardingLayout />,
    children: [
      { index: true, element: <Navigate to={`/onboarding/${ONBOARDING_STEPS[0].id}`} replace /> },
      ...ONBOARDING_STEPS.map((s) => ({
        path: s.id,
        element: <PlaceholderScreen label={s.label} note="온보딩 단계 stub" />,
      })),
    ],
  },
])
