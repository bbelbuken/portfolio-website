import { useRef, useCallback } from 'react'
import { useGesture } from '@use-gesture/react'
import { useCanvasStore } from '@/stores/canvasStore'
import { useTutorialStore } from '@/hooks/useTutorial'

const MIN_SCALE = 0.15
const MAX_SCALE = 3
/** Breathing room kept around the graph when it is zoomed out to fit */
const FIT_PAD = 24

/** Nodes the opening shot frames */
const INTRO_NODES = ['about', 'code-branch', 'audio-branch']
const INTRO_MS = 1600
const INTRO_START_SCALE = 0.3
// Land a touch further out than a tight fit, so the block has room to breathe
const INTRO_FIT = 0.96
const INTRO_PAD = 16
const TUTORIAL_BAR_H = 64

/** No ramp-up: the opening shot moves from the first frame, then settles. */
function easeOutCubic(t: number) {
  return 1 - (1 - t) ** 3
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
    // Touch hit pads read this to stay finger-sized at any zoom (see index.css)
    contentRef.current.style.setProperty('--canvas-scale', String(liveScale.current))
  }, [])

  /** Bounding box of every node on the canvas, in canvas units */
  const boundsRef = useRef<{
    box: { minX: number; minY: number; maxX: number; maxY: number }
    at: number
  } | null>(null)

  /**
   * Measure the graph. Nodes are absolutely positioned inside the content
   * div, so their offset box is already in canvas coordinates. Cached for a
   * few frames because panning would otherwise re-measure every node on
   * every pointer move.
   */
  const contentBounds = useCallback(() => {
    const content = contentRef.current
    if (!content) return null
    const now = performance.now()
    const cached = boundsRef.current
    if (cached && now - cached.at < 250) return cached.box

    const els = content.querySelectorAll<HTMLElement>('[data-node]')
    if (!els.length) return null
    let minX = Infinity
    let minY = Infinity
    let maxX = -Infinity
    let maxY = -Infinity
    els.forEach((el) => {
      minX = Math.min(minX, el.offsetLeft)
      minY = Math.min(minY, el.offsetTop)
      maxX = Math.max(maxX, el.offsetLeft + el.offsetWidth)
      maxY = Math.max(maxY, el.offsetTop + el.offsetHeight)
    })
    const box = { minX, minY, maxX, maxY }
    boundsRef.current = { box, at: now }
    return box
  }, [])

  /**
   * Lower zoom limit: the fixed floor, or whatever it takes to fit the whole
   * graph on screen — whichever is smaller. However many nodes are open,
   * zooming out always reaches a view that holds all of them.
   */
  const minScale = useCallback(() => {
    const container = containerRef.current
    const box = contentBounds()
    if (!container || !box) return MIN_SCALE
    const fit = Math.min(
      (container.clientWidth - FIT_PAD * 2) / Math.max(1, box.maxX - box.minX),
      (container.clientHeight - FIT_PAD * 2) / Math.max(1, box.maxY - box.minY),
    )
    return Math.min(MIN_SCALE, Math.max(0.05, fit))
  }, [containerRef, contentBounds])

  /**
   * The pannable world: everything the zoomed-all-the-way-out view takes in,
   * centred on the graph. That view is the canvas visitors see, so panning
   * reaches the same edges at every zoom level — close in you can still
   * scroll out to the margin around the nodes, never past it.
   */
  const worldBounds = useCallback(() => {
    const container = containerRef.current
    const box = contentBounds()
    if (!container || !box) return null
    const out = minScale()
    const halfW = container.clientWidth / out / 2
    const halfH = container.clientHeight / out / 2
    const midX = (box.minX + box.maxX) / 2
    const midY = (box.minY + box.maxY) / 2
    return {
      minX: Math.min(box.minX, midX - halfW),
      maxX: Math.max(box.maxX, midX + halfW),
      minY: Math.min(box.minY, midY - halfH),
      maxY: Math.max(box.maxY, midY + halfH),
    }
  }, [containerRef, contentBounds, minScale])

  /**
   * Keep the view inside that world. While the world is smaller than the
   * viewport it may move anywhere inside it but never past an edge; once it
   * is larger, the viewport may move anywhere inside it. Either way nothing
   * spills off the canvas and it can never be flung into empty space.
   */
  const clampPan = useCallback(() => {
    const container = containerRef.current
    const box = worldBounds()
    if (!container || !box) return
    const s = liveScale.current
    const between = (a: number, b: number, value: number) =>
      Math.min(Math.max(value, Math.min(a, b)), Math.max(a, b))

    liveX.current = between(
      -box.minX * s,
      container.clientWidth - box.maxX * s,
      liveX.current,
    )
    liveY.current = between(
      -box.minY * s,
      container.clientHeight - box.maxY * s,
      liveY.current,
    )
  }, [containerRef, worldBounds])

  /** Screen point (container-relative) of the pinch midpoint on the last frame */
  const pinchOrigin = useRef<[number, number] | null>(null)

  /** Client point -> coordinates relative to the canvas container's top-left */
  const toContainer = useCallback(
    (clientX: number, clientY: number): [number, number] => {
      const rect = containerRef.current?.getBoundingClientRect()
      return [clientX - (rect?.left ?? 0), clientY - (rect?.top ?? 0)]
    },
    [containerRef],
  )

  /**
   * Scale around a screen point: the canvas coordinate sitting under
   * (focusX, focusY) stays under it, so zooming tracks the cursor or the
   * pinch midpoint instead of pulling everything toward the centre.
   * With transform-origin 0 0, screen = translate + canvasPoint * scale.
   */
  const zoomAround = useCallback(
    (nextScale: number, focusX: number, focusY: number) => {
      const clamped = Math.min(MAX_SCALE, Math.max(minScale(), nextScale))
      const ratio = clamped / liveScale.current
      liveX.current = focusX - (focusX - liveX.current) * ratio
      liveY.current = focusY - (focusY - liveY.current) * ratio
      liveScale.current = clamped
      clampPan()
      applyTransform()
      setTransform(liveX.current, liveY.current, liveScale.current)
    },
    [applyTransform, clampPan, minScale, setTransform],
  )

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
      frameAt(from * (scale / from) ** easeOutCubic(t))
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
        clampPan()
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
        // Zoom toward the pointer, not the middle of the screen
        const [fx, fy] = toContainer(event.clientX, event.clientY)
        zoomAround(liveScale.current * factor, fx, fy)
        useTutorialStore.getState().markNavigated()
      },
      onPinch: ({ offset: [scale], origin: [ox, oy], first, event }) => {
        event.preventDefault()
        stopIntro()
        const [fx, fy] = toContainer(ox, oy)
        if (first || !pinchOrigin.current) pinchOrigin.current = [fx, fy]

        // Fingers moving together drag the canvas along with them
        liveX.current += fx - pinchOrigin.current[0]
        liveY.current += fy - pinchOrigin.current[1]
        pinchOrigin.current = [fx, fy]
        clampPan()

        // ...and the spread scales around the point between the fingers
        zoomAround(scale, fx, fy)
      },
      onPinchEnd: () => {
        pinchOrigin.current = null
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
