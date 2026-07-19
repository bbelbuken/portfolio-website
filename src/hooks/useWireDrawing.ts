import { useCallback, useRef } from 'react'
import { useGraphStore } from '@/stores/graphStore'
import { useCanvasStore } from '@/stores/canvasStore'
import type { Port } from '@/types'

/**
 * Returns handlers for starting, moving, and completing a wire drag.
 * Position is tracked purely through refs + direct SVG DOM updates
 * (no React re-renders during drag).
 */
export function useWireDrawing() {
  const startDraftWire = useGraphStore((s) => s.startDraftWire)
  const updateDraftWire = useGraphStore((s) => s.updateDraftWire)
  const commitWire = useGraphStore((s) => s.commitWire)
  const cancelDraftWire = useGraphStore((s) => s.cancelDraftWire)

  const canvasX = useCanvasStore((s) => s.x)
  const canvasY = useCanvasStore((s) => s.y)
  const canvasScale = useCanvasStore((s) => s.scale)

  // SVG path element updated during drag without React
  const draftPathRef = useRef<SVGPathElement | null>(null)
  const isDragging = useRef(false)

  const toCanvasCoords = useCallback(
    (clientX: number, clientY: number) => {
      return {
        x: (clientX - canvasX) / canvasScale,
        y: (clientY - canvasY) / canvasScale,
      }
    },
    [canvasX, canvasY, canvasScale],
  )

  const onPortPointerDown = useCallback(
    (e: React.PointerEvent, port: Port, portEl: HTMLElement) => {
      if (port.type !== 'output') return
      e.stopPropagation()
      e.preventDefault()

      const rect = portEl.getBoundingClientRect()
      const from = toCanvasCoords(rect.left + rect.width / 2, rect.top + rect.height / 2)

      startDraftWire(port.id, port.nodeId, from.x, from.y)
      isDragging.current = true

      const onMove = (ev: PointerEvent) => {
        if (!isDragging.current) return
        const to = toCanvasCoords(ev.clientX, ev.clientY)
        updateDraftWire(to.x, to.y)
      }

      const onUp = (ev: PointerEvent) => {
        isDragging.current = false
        window.removeEventListener('pointermove', onMove)
        window.removeEventListener('pointerup', onUp)

        // Find if dropped on an input port
        const el = document.elementFromPoint(ev.clientX, ev.clientY)
        const portEl = el?.closest('[data-port]') as HTMLElement | null
        if (portEl) {
          const portId = portEl.dataset.port
          const portType = portEl.dataset.portType
          const portNodeId = portEl.dataset.portNodeId
          if (portId && portType === 'input' && portNodeId) {
            const inputPort: Port = {
              id: portId,
              nodeId: portNodeId,
              type: 'input',
            }
            commitWire(inputPort)
            return
          }
        }
        cancelDraftWire()
      }

      window.addEventListener('pointermove', onMove)
      window.addEventListener('pointerup', onUp)
    },
    [toCanvasCoords, startDraftWire, updateDraftWire, commitWire, cancelDraftWire],
  )

  return { onPortPointerDown, draftPathRef }
}
