import { useCallback, useRef } from 'react'
import { useGraphStore } from '@/stores/graphStore'
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
  const setWireDropTarget = useGraphStore((s) => s.setWireDropTarget)

  const draftPathRef = useRef<SVGPathElement | null>(null)
  const isDragging = useRef(false)
  const lastDropTarget = useRef<string | null>(null)
  const lastHighlightedPort = useRef<HTMLElement | null>(null)

  /**
   * Convert a viewport (clientX, clientY) point into canvas-local coordinates
   * by reading the live DOM transform of #canvas-content.
   * This is correct regardless of pan position or zoom level.
   */
  const toCanvasCoords = useCallback((clientX: number, clientY: number) => {
    const canvasContent = document.getElementById('canvas-content')
    if (!canvasContent) return { x: clientX, y: clientY }
    const rect = canvasContent.getBoundingClientRect()
    const scale = new DOMMatrix(window.getComputedStyle(canvasContent).transform).a || 1
    return {
      x: (clientX - rect.left) / scale,
      y: (clientY - rect.top) / scale,
    }
  }, [])

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

        // Find elements under cursor (pierces SVG overlay)
        const els = document.elementsFromPoint(ev.clientX, ev.clientY)

        // Find the NodeSocket container under the cursor
        const nodeEl = els.find(
          (el) => (el as HTMLElement).dataset?.node,
        ) as HTMLElement | null
        const hoveredId = nodeEl?.dataset.node ?? null

        // Highlight the input port as soon as the wire touches the node container —
        // skip ports that already have a wire connected
        const candidatePort = nodeEl
          ? (nodeEl.querySelector('[data-port-type="input"]') as HTMLElement | null)
          : null
        const existingWires = useGraphStore.getState().wires
        const alreadyConnected = candidatePort
          ? existingWires.some((w) => w.toPortId === candidatePort.dataset.port)
          : false
        const targetPort = alreadyConnected ? null : candidatePort

        if (targetPort !== lastHighlightedPort.current) {
          if (lastHighlightedPort.current) {
            lastHighlightedPort.current.style.background = 'var(--port-bg)'
            lastHighlightedPort.current.style.borderColor = 'var(--port-border)'
          }
          if (targetPort) {
            targetPort.style.background = 'var(--accent)'
            targetPort.style.borderColor = 'var(--accent)'
          }
          lastHighlightedPort.current = targetPort
        }

        const effectiveHoveredId = alreadyConnected ? null : hoveredId
        if (effectiveHoveredId !== lastDropTarget.current) {
          lastDropTarget.current = effectiveHoveredId
          setWireDropTarget(effectiveHoveredId)
        }
      }

      const onUp = () => {
        isDragging.current = false
        lastDropTarget.current = null
        setWireDropTarget(null)
        window.removeEventListener('pointermove', onMove)
        window.removeEventListener('pointerup', onUp)

        // Commit to whichever port was highlighted during the drag
        const droppedPort = lastHighlightedPort.current
        if (lastHighlightedPort.current) {
          lastHighlightedPort.current.style.background = 'var(--port-bg)'
          lastHighlightedPort.current.style.borderColor = 'var(--port-border)'
          lastHighlightedPort.current = null
        }

        if (droppedPort) {
          const portId = (droppedPort as HTMLElement).dataset.port
          const portNodeId = (droppedPort as HTMLElement).dataset.portNodeId
          if (portId && portNodeId) {
            commitWire({ id: portId, nodeId: portNodeId, type: 'input' })
            return
          }
        }
        cancelDraftWire()
      }

      window.addEventListener('pointermove', onMove)
      window.addEventListener('pointerup', onUp)
    },
    [toCanvasCoords, startDraftWire, updateDraftWire, commitWire, cancelDraftWire, setWireDropTarget],
  )

  return { onPortPointerDown, draftPathRef }
}
