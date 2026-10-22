import { useEffect, useState } from 'react'

/** Gap between rows, a little quicker than contact.sh's printout */
const TICK_MS = 110

/**
 * How many rows of a header window to show: counts up one row per tick from
 * the moment the window mounts, so its contents print top to bottom the way
 * contact.sh does. Shows everything at once under reduced motion.
 */
export function useTickReveal(total: number, stepMs = TICK_MS): number {
  const [shown, setShown] = useState(() =>
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
      ? total
      : 0,
  )

  useEffect(() => {
    if (shown >= total) return
    const id = setTimeout(() => setShown((n) => n + 1), stepMs)
    return () => clearTimeout(id)
  }, [shown, total, stepMs])

  return shown
}
