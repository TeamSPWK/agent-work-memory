import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AppShell } from './layout/AppShell'
import { OnboardingLayout } from './layout/OnboardingLayout'
import { PublicShell } from './layout/PublicShell'
import { PlaceholderScreen } from './screens/PlaceholderScreen'
import { Landing } from './routes/public/Landing'
import { Pricing } from './routes/public/Pricing'
import {
  Signup,
  Login,
  Reset,
  Terms,
  Privacy,
  Refund,
  Business,
  Company,
  Status,
  Err404,
  Err500,
  Maint,
} from './routes/public/PublicStub'
import { Today } from './screens/Today'
import { Sessions } from './screens/Sessions'
import { SessionDetail } from './screens/SessionDetail'
import { ExplainBack } from './screens/ExplainBack'
import { Share } from './screens/Share'
import { SelfRecall } from './screens/SelfRecall'
import { Audit } from './screens/Audit'
import { Risk } from './screens/Risk'
import { Incident } from './screens/Incident'
import { Workspace } from './screens/Workspace'
import { Settings } from './screens/Settings'
import { Workspace as OnboardingWorkspace } from './screens/onboarding/Workspace'
import { Connect } from './screens/onboarding/Connect'
import { Import as OnboardingImport } from './screens/onboarding/Import'
import { Reviewer } from './screens/onboarding/Reviewer'
import { Done } from './screens/onboarding/Done'
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
      { path: 'workspace', element: <Workspace /> },
      { path: 'settings', element: <Settings /> },
      { path: 'dev/status', element: <StatusBoard /> },
      { path: '*', element: <PlaceholderScreen label="찾을 수 없음" note="요청한 경로가 존재하지 않습니다." /> },
    ],
  },
  {
    path: '/onboarding',
    element: <OnboardingLayout />,
    children: [
      { index: true, element: <Navigate to={`/onboarding/${ONBOARDING_STEPS[0].id}`} replace /> },
      { path: 'ws', element: <OnboardingWorkspace /> },
      { path: 'connect', element: <Connect /> },
      { path: 'import', element: <OnboardingImport /> },
      { path: 'reviewer', element: <Reviewer /> },
      { path: 'done', element: <Done /> },
    ],
  },
  {
    element: <PublicShell />,
    children: [
      { path: '/landing', element: <Landing /> },
      { path: '/pricing', element: <Pricing /> },
      { path: '/signup', element: <Signup /> },
      { path: '/login', element: <Login /> },
      { path: '/reset', element: <Reset /> },
      { path: '/legal/terms', element: <Terms /> },
      { path: '/legal/privacy', element: <Privacy /> },
      { path: '/legal/refund', element: <Refund /> },
      { path: '/legal/business', element: <Business /> },
      { path: '/company', element: <Company /> },
      { path: '/status', element: <Status /> },
      { path: '/404', element: <Err404 /> },
      { path: '/500', element: <Err500 /> },
      { path: '/maintenance', element: <Maint /> },
    ],
  },
])
