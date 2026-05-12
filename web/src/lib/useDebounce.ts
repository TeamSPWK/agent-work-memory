import { useEffect, useState } from 'react'

/* 입력값이 안정된 후 ms 만큼 지연된 값을 반환.
 * 검색·필터 같이 매 keystroke마다 비싼 연산이 일어나는 곳에 사용. */
export function useDebounce<T>(value: T, delayMs = 200): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delayMs)
    return () => clearTimeout(id)
  }, [value, delayMs])
  return debounced
}
