import { useRef, useCallback } from 'react'
import { useGesture } from '@use-gesture/react'
import { useCanvasStore } from '@/stores/canvasStore'
import { useTutorialStore } from '@/hooks/useTutorial'

const MIN_SCALE = 0.25
const MAX_SCALE = 3

/** Nodes the opening shot frames */
const INTRO_NODES = ['about', 'code-branch', 'audio-branch']
const INTRO_MS = 1600
const INTRO_START_SCALE = 0.3
// Land a touch further out than a tight fit, so the block has room to breathe
const INTRO_FIT = 0.96
const INTRO_PAD = 16
const TUTORIAL_BAR_H = 64

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2
}

export function useCanvasGestures(containerRef: React.RefObject<HTMLElement | null>) {
  // These refs track the live values during drag without triggering re-renders
  const liveX = useRef(0)
  const liveY = useRef(0)
  const liveScale = useRef(1)
  const contentRef = useRef<HTMLDivElement | null>(null)

  const setTransform = useCanvasStore((s) => s.setTransform)

  const applyTransform = useCallback(() => {
    if (!contentRef.current) return
    contentRef.current.style.transform = `translate(${liveX.current}px, ${liveY.current}px) scale(${liveScale.current})`
  }, [])

  const introFrame = useRef<number | null>(null)
  // Set by a real background pan, so taps and node drags don't count
  const panned = useRef(false)

  /** Stop the intro swoop and hand control to the visitor. */
  const stopIntro = useCallback(() => {
    if (introFrame.current === null) return
    cancelAnimationFrame(introFrame.current)
    introFrame.current = null
    setTransform(liveX.current, liveY.current, liveScale.current)
  }, [setTransform])

  /**
   * Opening shot: start far out and swoop in until about.md and the two
   * branch sockets fill the space under the header (and the tutorial bar,
   * while it shows). about.md is centred horizontally, the block vertically.
   * Node elements are absolutely positioned inside the content div, so their
   * offset box is already in canvas coordinates.
   */
  const introToView = useCallback(() => {
    const container = containerRef.current
    const content = contentRef.current
    if (!container || !content) return

    const boxes = INTRO_NODES.map((id) =>
      content.querySelector<HTMLElement>(`[data-node="${id}"]`),
    ).filter((el): el is HTMLElement => !!el)
    const about = boxes[0]
    if (!about) return

    const minX = Math.min(...boxes.map((el) => el.offsetLeft))
    const maxX = Math.max(...boxes.map((el) => el.offsetLeft + el.offsetWidth))
    const minY = Math.min(...boxes.map((el) => el.offsetTop))
    const maxY = Math.max(...boxes.map((el) => el.offsetTop + el.offsetHeight))
    const aboutMid = about.offsetLeft + about.offsetWidth / 2
    const halfW = Math.max(aboutMid - minX, maxX - aboutMid)

    // Keep the first-run tutorial bar under the header clear of the nodes
    const top = useTutorialStore.getState().step === 'done' ? 0 : TUTORIAL_BAR_H
    const viewW = container.clientWidth - INTRO_PAD * 2
    const viewH = container.clientHeight - INTRO_PAD * 2 - top
    if (viewW <= 0 || viewH <= 0 || halfW <= 0) return

    const scale = Math.max(
      MIN_SCALE,
      Math.min(1, viewW / (halfW * 2), viewH / (maxY - minY)) * INTRO_FIT,
    )
    // Screen point the shot zooms into, and the canvas point that lands there
    const focusX = container.clientWidth / 2
    const focusY = INTRO_PAD + top + viewH / 2
    const pointX = aboutMid
    const pointY = (minY + maxY) / 2

    function frameAt(s: number) {
      liveScale.current = s
      liveX.current = focusX - pointX * s
      liveY.current = focusY - pointY * s
      applyTransform()
      // Push every frame so the background grid zooms with the nodes and the
      // whole canvas reads as one camera move
      setTransform(liveX.current, liveY.current, liveScale.current)
    }

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) {
      frameAt(scale)
      return
    }

    const from = scale * INTRO_START_SCALE
    const start = performance.now()
    function tick(now: number) {
      const t = Math.min(1, (now - start) / INTRO_MS)
      // Scale on a log curve so the dive feels even all the way in
      frameAt(from * (scale / from) ** easeInOutCubic(t))
      introFrame.current = t < 1 ? requestAnimationFrame(tick) : null
    }
    frameAt(from)
    introFrame.current = requestAnimationFrame(tick)
  }, [applyTransform, containerRef, setTransform])

  const bindGestures = useGesture(
    {
      onDrag: ({ delta: [dx, dy], event, cancel }) => {
        // Only pan on middle-mouse or when not over a node
        const target = event.target as HTMLElement
        if (target.closest('[data-node]') || target.closest('[data-port]')) {
          cancel()
          return
        }
        stopIntro()
        if (dx || dy) panned.current = true
        liveX.current += dx
        liveY.current += dy
        applyTransform()
        // Keep the background grid moving with the nodes while dragging
        setTransform(liveX.current, liveY.current, liveScale.current)
      },
      onDragEnd: () => {
        setTransform(liveX.current, liveY.current, liveScale.current)
        if (panned.current) useTutorialStore.getState().markNavigated()
        panned.current = false
      },
      onWheel: ({ delta: [, dy], event }) => {
        event.preventDefault()
        stopIntro()
        const factor = dy > 0 ? 0.95 : 1.05
        const next = Math.min(MAX_SCALE, Math.max(MIN_SCALE, liveScale.current * factor))
        liveScale.current = next
        applyTransform()
        setTransform(liveX.current, liveY.current, liveScale.current)
        useTutorialStore.getState().markNavigated()
      },
      onPinch: ({ offset: [scale], event }) => {
        event.preventDefault()
        stopIntro()
        const clamped = Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale))
        liveScale.current = clamped
        applyTransform()
        setTransform(liveX.current, liveY.current, liveScale.current)
      },
      onPinchEnd: () => {
        setTransform(liveX.current, liveY.current, liveScale.current)
        useTutorialStore.getState().markNavigated()
      },
    },
    {
      target: containerRef,
      drag: { filterTaps: true, pointer: { buttons: [1, 4] } },
      wheel: { eventOptions: { passive: false } },
      // Start each pinch from the current zoom, not from 1
      pinch: { eventOptions: { passive: false }, from: () => [liveScale.current, 0] },
    },
  )

  // bindGestures is void when target is provided (auto-bound by @use-gesture)
  void bindGestures
  return { contentRef, liveX, liveY, liveScale, introToView }
}
