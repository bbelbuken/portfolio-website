import { useGraphStore } from '@/stores/graphStore'
import { cubicBezierPath } from '@/lib/bezier'

/**
 * Single SVG overlay for all committed wires + the live draft wire.
 * Positioned absolute over the canvas content div so coordinates match.
 * will-change: transform tells the GPU to composite this layer.
 */
export function WireOverlay() {
  const wires = useGraphStore((s) => s.wires)
  const nodes = useGraphStore((s) => s.nodes)
  const draftWire = useGraphStore((s) => s.draftWire)
  const removeWire = useGraphStore((s) => s.removeWire)

  /** Find the canvas-space position of a port's center by walking the DOM */
  function portCenter(portId: string): { x: number; y: number } | null {
    const el = document.querySelector(`[data-port="${portId}"]`) as HTMLElement | null
    if (!el) return null
    // Port position relative to the canvas content div
    const canvasContent = document.getElementById('canvas-content')
    if (!canvasContent) return null
    const canvasRect = canvasContent.getBoundingClientRect()
    const portRect = el.getBoundingClientRect()
    const canvasStyle = window.getComputedStyle(canvasContent)
    const matrix = new DOMMatrix(canvasStyle.transform)
    const scale = matrix.a || 1
    return {
      x: (portRect.left + portRect.width / 2 - canvasRect.left - matrix.m41) / scale,
      y: (portRect.top + portRect.height / 2 - canvasRect.top - matrix.m42) / scale,
    }
  }

  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none overflow-visible"
      style={{ willChange: 'transform', zIndex: 10 }}
      aria-hidden="true"
    >
      {/* Committed wires */}
      {wires.map((wire) => {
        const fromNode = nodes.find((n) => n.id === wire.fromNodeId)
        const toNode = nodes.find((n) => n.id === wire.toNodeId)
        if (!fromNode || !toNode) return null

        const from = portCenter(wire.fromPortId)
        const to = portCenter(wire.toPortId)
        if (!from || !to) return null

        const d = cubicBezierPath(from.x, from.y, to.x, to.y)
        return (
          <g key={wire.id}>
            {/* Hit area for clicking to remove */}
            <path
              d={d}
              fill="none"
              stroke="transparent"
              strokeWidth={12}
              style={{ pointerEvents: 'stroke', cursor: 'pointer' }}
              onClick={() => removeWire(wire.id)}
            />
            <path
              d={d}
              fill="none"
              stroke="var(--wire-color)"
              strokeWidth={2}
              strokeLinecap="round"
              style={{
                filter: 'var(--wire-glow)',
              }}
            />
          </g>
        )
      })}

      {/* Draft wire while dragging */}
      {draftWire && (
        <path
          d={cubicBezierPath(
            draftWire.fromX,
            draftWire.fromY,
            draftWire.toX,
            draftWire.toY,
          )}
          fill="none"
          stroke="var(--accent)"
          strokeWidth={2}
          strokeDasharray="6 4"
          strokeLinecap="round"
          opacity={0.85}
        />
      )}
    </svg>
  )
}
