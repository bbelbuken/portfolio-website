import { useEffect, useState } from 'react'
import { useGraphStore } from '@/stores/graphStore'
import { readStored, writeStored } from '@/lib/storage'

const TUTORIAL_KEY = 'portfolio:tutorial-done'

/** The one connection the tutorial demonstrates: about.md → code.branch */
export const TUTORIAL_FROM_PORT = 'about-out-code'
export const TUTORIAL_TO_PORT = 'code-in'

/**
 * True while the first-run hint should be showing. It ends — permanently,
 * remembered in localStorage — the moment code.branch is connected.
 */
export function useTutorialActive(): boolean {
  const connected = useGraphStore(
    (s) => s.nodes.find((n) => n.id === 'code-branch')?.state === 'connected',
  )
  const [done, setDone] = useState(() => readStored(TUTORIAL_KEY) === '1')

  useEffect(() => {
    if (!connected || done) return
    writeStored(TUTORIAL_KEY, '1')
    setDone(true)
  }, [connected, done])

  return !done && !connected
}
