import { useRef, useCallback } from 'react'
import { useGesture } from '@use-gesture/react'
import { useCanvasStore } from '@/stores/canvasStore'

const MIN_SCALE = 0.25
const MAX_SCALE = 3

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

  /**
   * Pan (and if needed zoom out) so every node on the canvas starts inside
   * the viewport. Node elements are absolutely positioned inside the content
   * div, so their offset box is already in canvas coordinates.
   */
  const fitToView = useCallback(() => {
    const container = containerRef.current
    const content = contentRef.current
    if (!container || !content) return

    const nodes = Array.from(
      content.querySelectorAll<HTMLElement>('[data-node]'),
    )
    if (nodes.length === 0) return

    let minX = Infinity
    let minY = Infinity
    let maxX = -Infinity
    let maxY = -Infinity
    for (const el of nodes) {
      minX = Math.min(minX, el.offsetLeft)
      minY = Math.min(minY, el.offsetTop)
      maxX = Math.max(maxX, el.offsetLeft + el.offsetWidth)
      maxY = Math.max(maxY, el.offsetTop + el.offsetHeight)
    }

    const pad = 16
    const viewW = container.clientWidth - pad * 2
    const viewH = container.clientHeight - pad * 2
    const contentW = maxX - minX
    const contentH = maxY - minY
    if (viewW <= 0 || viewH <= 0 || contentW <= 0 || contentH <= 0) return

    const scale = Math.max(
      MIN_SCALE,
      Math.min(1, viewW / contentW, viewH / contentH),
    )

    liveScale.current = scale
    liveX.current = pad + (viewW - contentW * scale) / 2 - minX * scale
    liveY.current = pad + (viewH - contentH * scale) / 2 - minY * scale
    applyTransform()
    setTransform(liveX.current, liveY.current, liveScale.current)
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
        liveX.current += dx
        liveY.current += dy
        applyTransform()
      },
      onDragEnd: () => {
        setTransform(liveX.current, liveY.current, liveScale.current)
      },
      onWheel: ({ delta: [, dy], event }) => {
        event.preventDefault()
        const factor = dy > 0 ? 0.95 : 1.05
        const next = Math.min(MAX_SCALE, Math.max(MIN_SCALE, liveScale.current * factor))
        liveScale.current = next
        applyTransform()
        setTransform(liveX.current, liveY.current, liveScale.current)
      },
      onPinch: ({ offset: [scale], event }) => {
        event.preventDefault()
        const clamped = Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale))
        liveScale.current = clamped
        applyTransform()
      },
      onPinchEnd: () => {
        setTransform(liveX.current, liveY.current, liveScale.current)
      },
    },
    {
      target: containerRef,
      drag: { filterTaps: true, pointer: { buttons: [1, 4] } },
      wheel: { eventOptions: { passive: false } },
      pinch: { eventOptions: { passive: false } },
    },
  )

  // bindGestures is void when target is provided (auto-bound by @use-gesture)
  void bindGestures
  return { contentRef, liveX, liveY, liveScale, fitToView }
}
