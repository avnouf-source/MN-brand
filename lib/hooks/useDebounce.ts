import { useState, useEffect } from 'react'

/**
 * Custom hook to debounce any value (e.g. search input string).
 * Prevents heavy calculations or filtering across thousands of items on every single keystroke.
 *
 * @param value The value to debounce
 * @param delay Milliseconds to wait before updating (default: 350ms)
 */
export function useDebounce<T>(value: T, delay: number = 350): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}
