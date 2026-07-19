import { useEffect, useRef } from 'react'
import { useGraphStore } from '@/stores/graphStore'
import { cubicBezierPath } from '@/lib/bezier'

/**
 * Convert a port element's live viewport position into canvas-local coords.
 * getBoundingClientRect() already includes the CSS transform, so
 * (portCenter - canvasOrigin) / scale gives the correct local coordinate.
 */
function portCenter(portId: string): { x: number; y: number } | null {
  const el = document.querySelector(`[data-port="${portId}"]`) as HTMLElement | null
  if (!el) return null
  const canvasContent = document.getElementById('canvas-content')
  if (!canvasContent) return null
  const canvasRect = canvasContent.getBoundingClientRect()
  const portRect = el.getBoundingClientRect()
  const scale = new DOMMatrix(window.getComputedStyle(canvasContent).transform).a || 1
  return {
    x: (portRect.left + portRect.width / 2 - canvasRect.left) / scale,
    y: (portRect.top + portRect.height / 2 - canvasRect.top) / scale,
  }
}

/**
 * Single SVG overlay for all wires.
 *
 * Wire paths are updated every animation frame by reading live DOM positions,
 * so they follow nodes during drags without any React re-renders.
 */
export function WireOverlay() {
  const wires = useGraphStore((s) => s.wires)
  const draftWire = useGraphStore((s) => s.draftWire)
  const removeWire = useGraphStore((s) => s.removeWire)

  const svgRef = useRef<SVGSVGElement>(null)

  // Keep refs always current — updated synchronously on every render
  const wiresRef = useRef(wires)
  const draftWireRef = useRef(draftWire)
  wiresRef.current = wires
  draftWireRef.current = draftWire

  useEffect(() => {
    let rafId: number

    function tick() {
      const svg = svgRef.current
      if (svg) {
        // Committed wires — update hit area and visible path
        for (const wire of wiresRef.current) {
          const from = portCenter(wire.fromPortId)
          const to = portCenter(wire.toPortId)
          if (!from || !to) continue
          const d = cubicBezierPath(from.x, from.y, to.x, to.y)
          svg.querySelector<SVGPathElement>(`[data-wire-hit="${wire.id}"]`)?.setAttribute('d', d)
          svg.querySelector<SVGPathElement>(`[data-wire-vis="${wire.id}"]`)?.setAttribute('d', d)
        }

        // Draft wire — recompute "from" live so it follows the port if the node is dragged
        const draft = draftWireRef.current
        const draftPath = svg.querySelector<SVGPathElement>('[data-wire-draft]')
        if (draft && draftPath) {
          const from = portCenter(draft.fromPortId)
          if (from) {
            draftPath.setAttribute(
              'd',
              cubicBezierPath(from.x, from.y, draft.toX, draft.toY),
            )
          }
          draftPath.style.display = 'block'
        } else if (draftPath) {
          draftPath.style.display = 'none'
        }
      }

      rafId = requestAnimationFrame(tick)
    }

    rafId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId)
  }, []) // runs once — data comes from refs updated on each render

  return (
    <svg
      ref={svgRef}
      className="absolute inset-0 w-full h-full pointer-events-none overflow-visible"
      style={{ willChange: 'transform', zIndex: 10 }}
      aria-hidden="true"
    >
      {wires.map((wire) => (
        <g key={wire.id}>
          {/* Wider transparent hit area so wire is easy to click to remove */}
          <path
            data-wire-hit={wire.id}
            fill="none"
            stroke="transparent"
            strokeWidth={12}
            style={{ pointerEvents: 'stroke', cursor: 'pointer' }}
            onClick={() => removeWire(wire.id)}
          />
          {/* Visible wire */}
          <path
            data-wire-vis={wire.id}
            fill="none"
            stroke="var(--wire-color)"
            strokeWidth={2}
            strokeLinecap="round"
            style={{ filter: 'var(--wire-glow)' }}
          />
        </g>
      ))}

      {/* Draft wire — always in DOM, shown/hidden by the RAF tick */}
      <path
        data-wire-draft=""
        fill="none"
        stroke="var(--accent)"
        strokeWidth={2}
        strokeDasharray="6 4"
        strokeLinecap="round"
        opacity={0.85}
        style={{ display: 'none' }}
      />
    </svg>
  )
}
