import { isLocalEnv } from '../lib/env'

// Phase C8a C3 — dev 메타 inside-app 격리 (DESIGN_SYSTEM §12.5).
// "m2 prototype" 라벨은 운영 사용자에게 *"이게 베타인가 운영인가"* 혼란.
// 로컬 호스트(127.0.0.1·localhost·0.0.0.0)에서만 노출, 운영 도메인 자동 숨김.
export function AppLogo() {
  const local = isLocalEnv()
  return (
    <div className="logo">
      <div className="logo-mark">A</div>
      <div className="logo-text">Agent Work Memory</div>
      {local && <div className="logo-sub">m2 prototype</div>}
    </div>
  )
}
