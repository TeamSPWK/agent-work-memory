import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AppShell } from './layout/AppShell'
import { OnboardingLayout } from './layout/OnboardingLayout'
import { PublicShell } from './layout/PublicShell'
import { PlaceholderScreen } from './screens/PlaceholderScreen'
import { ONBOARDING_STEPS } from './lib/seed/navigation'

/* Lazy chunks
 * - 외부 공개 페이지(/landing 등)와 인사이드앱(/today 등)은 진입 경로가 다르므로
 *   별도 청크로 분할되도록 dynamic import.
 * - React Router 7의 route-level `lazy` 사용 — Suspense fallback은 라우터가 관리. */

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <Navigate to="/today" replace /> },
      { path: 'today', lazy: async () => ({ Component: (await import('./screens/Today')).Today }) },
      { path: 'sessions', lazy: async () => ({ Component: (await import('./screens/Sessions')).Sessions }) },
      { path: 'sessions/yesterday', lazy: async () => ({ Component: (await import('./screens/SelfRecall')).SelfRecall }) },
      { path: 'sessions/:id', lazy: async () => ({ Component: (await import('./screens/SessionDetail')).SessionDetail }) },
      { path: 'sessions/:id/explain', lazy: async () => ({ Component: (await import('./screens/ExplainBack')).ExplainBack }) },
      { path: 'sessions/:id/share', lazy: async () => ({ Component: (await import('./screens/Share')).Share }) },
      { path: 'audit', lazy: async () => ({ Component: (await import('./screens/Audit')).Audit }) },
      { path: 'risk', lazy: async () => ({ Component: (await import('./screens/Risk')).Risk }) },
      { path: 'incidents/:id', lazy: async () => ({ Component: (await import('./screens/Incident')).Incident }) },
      { path: 'workspace', lazy: async () => ({ Component: (await import('./screens/Workspace')).Workspace }) },
      { path: 'settings', lazy: async () => ({ Component: (await import('./screens/Settings')).Settings }) },
      { path: 'dev/status', lazy: async () => ({ Component: (await import('./screens/dev/StatusBoard')).StatusBoard }) },
      { path: '*', element: <PlaceholderScreen label="찾을 수 없음" note="요청한 경로가 존재하지 않습니다." /> },
    ],
  },
  {
    path: '/onboarding',
    element: <OnboardingLayout />,
    children: [
      { index: true, element: <Navigate to={`/onboarding/${ONBOARDING_STEPS[0].id}`} replace /> },
      { path: 'ws', lazy: async () => ({ Component: (await import('./screens/onboarding/Workspace')).Workspace }) },
      { path: 'connect', lazy: async () => ({ Component: (await import('./screens/onboarding/Connect')).Connect }) },
      { path: 'import', lazy: async () => ({ Component: (await import('./screens/onboarding/Import')).Import }) },
      { path: 'reviewer', lazy: async () => ({ Component: (await import('./screens/onboarding/Reviewer')).Reviewer }) },
      { path: 'done', lazy: async () => ({ Component: (await import('./screens/onboarding/Done')).Done }) },
    ],
  },
  {
    element: <PublicShell />,
    children: [
      { path: '/landing', lazy: async () => ({ Component: (await import('./routes/public/Landing')).Landing }) },
      { path: '/pricing', lazy: async () => ({ Component: (await import('./routes/public/Pricing')).Pricing }) },
      { path: '/signup', lazy: async () => ({ Component: (await import('./routes/public/Auth')).Signup }) },
      { path: '/login', lazy: async () => ({ Component: (await import('./routes/public/Auth')).Login }) },
      { path: '/reset', lazy: async () => ({ Component: (await import('./routes/public/Auth')).Reset }) },
      { path: '/legal/terms', lazy: async () => ({ Component: (await import('./routes/public/Legal')).Terms }) },
      { path: '/legal/privacy', lazy: async () => ({ Component: (await import('./routes/public/Legal')).Privacy }) },
      { path: '/legal/refund', lazy: async () => ({ Component: (await import('./routes/public/Legal')).Refund }) },
      { path: '/legal/business', lazy: async () => ({ Component: (await import('./routes/public/Legal')).Business }) },
      { path: '/company', lazy: async () => ({ Component: (await import('./routes/public/Company')).Company }) },
      { path: '/status', lazy: async () => ({ Component: (await import('./routes/public/Status')).Status }) },
      { path: '/404', lazy: async () => ({ Component: (await import('./routes/public/Errors')).Err404 }) },
      { path: '/500', lazy: async () => ({ Component: (await import('./routes/public/Errors')).Err500 }) },
      { path: '/maintenance', lazy: async () => ({ Component: (await import('./routes/public/Errors')).Maint }) },
    ],
  },
])
