/**
 * localStorage access that never throws — private windows, blocked site data
 * and SSR all make it unavailable, and a missing preference is not an error.
 */
export function readStored(key: string): string | null {
  try {
    if (typeof window === 'undefined') return null
    return window.localStorage.getItem(key)
  } catch {
    return null
  }
}

export function writeStored(key: string, value: string): void {
  try {
    if (typeof window === 'undefined') return
    window.localStorage.setItem(key, value)
  } catch {
    // Preference is simply not remembered
  }
}
