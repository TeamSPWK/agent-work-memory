import type { KeyboardEvent } from 'react'

/* ARIA APG Tabs Pattern 키보드 네비게이션.
 * ArrowLeft / ArrowRight — 이전/다음 탭으로 wrap-around 이동
 * Home / End — 첫 탭 / 마지막 탭으로 이동
 * Tab 키는 핸들러 외부에서 포커스를 탭 밖(패널)으로 자연 이동시킴 (roving tabindex 패턴) */
export function tabKeyHandler<T extends string>(
  ids: readonly T[],
  current: T,
  setTab: (id: T) => void,
) {
  return (e: KeyboardEvent<HTMLButtonElement>) => {
    const idx = ids.indexOf(current)
    if (idx < 0) return
    let next: T | undefined
    switch (e.key) {
      case 'ArrowRight':
        next = ids[(idx + 1) % ids.length]
        break
      case 'ArrowLeft':
        next = ids[(idx - 1 + ids.length) % ids.length]
        break
      case 'Home':
        next = ids[0]
        break
      case 'End':
        next = ids[ids.length - 1]
        break
      default:
        return
    }
    if (next === undefined) return
    e.preventDefault()
    setTab(next)
    /* 활성 탭으로 포커스 이동 — DOM이 업데이트된 직후 */
    requestAnimationFrame(() => {
      const tablist = (e.target as HTMLElement).closest('[role="tablist"]')
      const target = tablist?.querySelector<HTMLButtonElement>(
        `[role="tab"][aria-selected="true"]`,
      )
      target?.focus()
    })
  }
}
