import { useEffect, useRef } from 'react';
import { create } from 'zustand';
import { useGraphStore } from '@/stores/graphStore';
import { readStored, writeStored } from '@/lib/storage';

const TUTORIAL_KEY = 'portfolio:tutorial-done';

/** The connection step 1 demonstrates: about.md → code.branch */
export const TUTORIAL_FROM_PORT = 'about-out-code';
export const TUTORIAL_TO_PORT = 'code-in';

/** Either of these counts as the first branch the visitor opens */
const BRANCH_IDS = ['code-branch', 'audio-branch'];

export type TutorialStep = 1 | 2 | 3 | 'done';

interface TutorialStore {
    step: TutorialStep;
    /** Window the step 3 drag hint sits on — the one opened most recently */
    dragTarget: string | null;
    /** Step 1 → 2 */
    branchConnected: (branchId: string) => void;
    /** Step 2 → 3: the background was panned, or the canvas zoomed */
    markNavigated: () => void;
    /** Step 3 → done: any window was dragged */
    markDragged: () => void;
    setDragTarget: (nodeId: string) => void;
    skip: () => void;
}

function finish() {
    writeStored(TUTORIAL_KEY, '1');
    return { step: 'done' as const };
}

/**
 * First-run tutorial: connect a branch → pan or zoom the canvas → drag a
 * window.
 * Each step only moves to the next one, and finishing (or skipping) is
 * remembered in localStorage.
 */
export const useTutorialStore = create<TutorialStore>((set) => ({
    step: readStored(TUTORIAL_KEY) === '1' ? 'done' : 1,
    dragTarget: null,

    branchConnected: (branchId) =>
        set((s) =>
            s.step === 1
                ? { step: 2, dragTarget: s.dragTarget ?? branchId }
                : s,
        ),
    markNavigated: () => set((s) => (s.step === 2 ? { step: 3 } : s)),
    markDragged: () => set((s) => (s.step === 3 ? finish() : s)),
    setDragTarget: (nodeId) => set({ dragTarget: nodeId }),
    skip: () => set(finish()),
}));

/**
 * Advances step 1 from the graph itself, so header menu opens count the same
 * as wires pulled by hand, and points the drag hint at whichever window was
 * opened last. Steps 2 and 3 end on real gestures (useCanvasGestures,
 * useNodeDrag). Mount once.
 */
export function useTutorialProgress() {
    const nodes = useGraphStore((s) => s.nodes);
    const step = useTutorialStore((s) => s.step);
    const opened = useRef<Set<string>>(new Set());

    useEffect(() => {
        if (step === 'done') return;
        const tutorial = useTutorialStore.getState();

        for (const n of nodes) {
            const open = n.state === 'connected' && !n.alwaysExpanded;
            if (open && !opened.current.has(n.id)) tutorial.setDragTarget(n.id);
            if (open) opened.current.add(n.id);
            else opened.current.delete(n.id);
        }

        if (step === 1) {
            const branch = BRANCH_IDS.find(
                (id) => nodes.find((n) => n.id === id)?.state === 'connected',
            );
            if (branch) tutorial.branchConnected(branch);
        }
    }, [nodes, step]);
}
