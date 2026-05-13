/**
 * 로컬 실행환경(localhost·127.0.0.1·0.0.0.0) 여부.
 * `npm run serve` 백그라운드 + 본인 dogfooding 환경에만 노출되어야 하는 dev 메뉴 분기에 사용.
 * Vite의 import.meta.env.DEV는 `npm run build` 후 prod로 빌드되면 false가 되므로 hostname 기준이 더 정확.
 * SSR/test(jsdom)에서도 안전하게 false 폴백.
 */
export function isLocalEnv(): boolean {
  if (typeof window === 'undefined' || !window.location) return false
  const host = window.location.hostname
  return host === 'localhost' || host === '127.0.0.1' || host === '0.0.0.0'
}
