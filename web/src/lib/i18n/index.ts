import { create } from 'zustand'
import { ko, type MessageKey } from './messages.ko'

/* 가벼운 i18n — 라이브러리 의존성 없이 시작.
 * locale은 store에 두고, 새 언어가 추가되면 catalog map에 messages.<locale>.ts를 등록.
 * 키 누락 시 dev에서 console.warn + 키 자체를 fallback (런타임 깨지지 않게). */

export type Locale = 'ko' | 'en' | 'ja'

const CATALOGS: Record<Locale, Record<string, string>> = {
  ko,
  // 자리만 잡아둠 — 비어 있으면 ko fallback.
  en: {},
  ja: {},
}

type LocaleState = {
  locale: Locale
  setLocale: (l: Locale) => void
}

export const useLocale = create<LocaleState>((set) => ({
  locale: 'ko',
  setLocale: (locale) => set({ locale }),
}))

function resolveTemplate(template: string, vars?: Record<string, string | number>): string {
  if (!vars) return template
  return template.replace(/\{(\w+)\}/g, (_, name) => {
    const v = vars[name]
    return v === undefined ? `{${name}}` : String(v)
  })
}

/** 직접 호출용 — 이벤트 핸들러·루프 안 등 React 외부 컨텍스트. */
export function t(key: MessageKey, vars?: Record<string, string | number>): string {
  const locale = useLocale.getState().locale
  const catalog = CATALOGS[locale]
  const fallback = CATALOGS.ko
  const raw = catalog[key] ?? fallback[key]
  if (raw === undefined) {
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.warn(`[i18n] missing key: ${key} (locale=${locale})`)
    }
    return key
  }
  return resolveTemplate(raw, vars)
}

/** React 훅 — locale 변경에 반응. */
export function useT() {
  const locale = useLocale((s) => s.locale)
  return (key: MessageKey, vars?: Record<string, string | number>): string => {
    const catalog = CATALOGS[locale]
    const fallback = CATALOGS.ko
    const raw = catalog[key] ?? fallback[key]
    if (raw === undefined) {
      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.warn(`[i18n] missing key: ${key} (locale=${locale})`)
      }
      return key
    }
    return resolveTemplate(raw, vars)
  }
}

export type { MessageKey }
