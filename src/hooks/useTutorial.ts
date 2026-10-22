import { useEffect } from 'react'
import { create } from 'zustand'
import { useGraphStore } from '@/stores/graphStore'
import { childrenOf } from '@/lib/graph'
import { readStored, writeStored } from '@/lib/storage'

const TUTORIAL_KEY = 'portfolio:tutorial-done'

/** The connection step 1 demonstrates: about.md → code.branch */
export const TUTORIAL_FROM_PORT = 'about-out-code'
export const TUTORIAL_TO_PORT = 'code-in'

/** Either of these counts as the first branch the visitor opens */
const BRANCH_IDS = ['code-branch', 'audio-branch']

export type TutorialStep = 1 | 2 | 3 | 'done'

interface TutorialStore {
  step: TutorialStep
  /** Branch the drag hint sits on — whichever one was connected first */
  dragTarget: string | null
  /** Step 1 → 2 */
  branchConnected: (branchId: string) => void
  /** Step 2 → 3: a node was dragged or a sub-branch was opened */
  markDragged: () => void
  /** Step 3 → done: the canvas was zoomed */
  markZoomed: () => void
  skip: () => void
}

function finish() {
  writeStored(TUTORIAL_KEY, '1')
  return { step: 'done' as const }
}

/**
 * First-run tutorial: connect a branch → drag a node → zoom the canvas.
 * Each step only moves to the next one, and finishing (or skipping) is
 * remembered in localStorage.
 */
export const useTutorialStore = create<TutorialStore>((set) => ({
  step: readStored(TUTORIAL_KEY) === '1' ? 'done' : 1,
  dragTarget: null,

  branchConnected: (branchId) =>
    set((s) => (s.step === 1 ? { step: 2, dragTarget: branchId } : s)),
  markDragged: () => set((s) => (s.step === 2 ? { step: 3 } : s)),
  markZoomed: () => set((s) => (s.step === 3 ? finish() : s)),
  skip: () => set(finish()),
}))

/**
 * Advances steps 1 and 2 from the graph itself, so header menu opens count
 * the same as wires pulled by hand. Mount once.
 */
export function useTutorialProgress() {
  const nodes = useGraphStore((s) => s.nodes)
  const step = useTutorialStore((s) => s.step)

  useEffect(() => {
    if (step === 1) {
      const branch = BRANCH_IDS.find(
        (id) => nodes.find((n) => n.id === id)?.state === 'connected',
      )
      if (branch) useTutorialStore.getState().branchConnected(branch)
    } else if (step === 2) {
      const subBranchOpen = BRANCH_IDS.some((id) =>
        childrenOf(nodes, id).some((c) => c.state === 'connected'),
      )
      if (subBranchOpen) useTutorialStore.getState().markDragged()
    }
  }, [nodes, step])
}
