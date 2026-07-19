import { useRef } from 'react'
import { useCanvasGestures } from '@/hooks/useCanvasGestures'
import { CanvasGrid } from './CanvasGrid'
import { WireOverlay } from './WireOverlay'

interface CanvasProps {
  children: React.ReactNode
}

export function Canvas({ children }: CanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  // useGesture with target option auto-binds and returns void; contentRef is the transformed div
  const { contentRef } = useCanvasGestures(
    containerRef as React.RefObject<HTMLElement | null>,
  )

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden select-none touch-none"
      style={{ background: 'var(--bg)', cursor: 'grab' }}
    >
      {/* Static background grid (stays fixed, pattern shifts with canvas) */}
      <CanvasGrid />

      {/* Canvas content -- all nodes live here, transformed as one unit */}
      <div
        id="canvas-content"
        ref={contentRef}
        className="absolute"
        style={{
          transformOrigin: '0 0',
          willChange: 'transform',
          width: 0,
          height: 0,
        }}
      >
        {/* Wire SVG lives inside content so its coords match node positions */}
        <WireOverlay />
        {children}
      </div>
    </div>
  )
}
