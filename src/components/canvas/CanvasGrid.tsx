import { useCanvasStore } from '@/stores/canvasStore'

/**
 * Renders a wallpaper-aware dot/grid/plain background.
 * Follows canvas pan/zoom so the pattern moves with the canvas.
 * Updated via CSS custom properties -- no re-render on theme change.
 */
export function CanvasGrid() {
  const { x, y, scale } = useCanvasStore()

  // Parallax: move the pattern at a fraction of canvas speed for depth
  const patternX = (x % (20 * scale))
  const patternY = (y % (20 * scale))
  const dotSize = Math.max(1, 1.5 * scale)
  const spacing = 20 * scale

  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
      aria-hidden="true"
    >
      {/* Dots pattern */}
      <svg
        className="canvas-dots absolute inset-0 w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id="dots-pattern"
            x={patternX}
            y={patternY}
            width={spacing}
            height={spacing}
            patternUnits="userSpaceOnUse"
          >
            <circle
              cx={spacing / 2}
              cy={spacing / 2}
              r={dotSize}
              fill="var(--bg-pattern)"
              opacity="0.7"
            />
          </pattern>
          <pattern
            id="grid-pattern"
            x={patternX}
            y={patternY}
            width={spacing}
            height={spacing}
            patternUnits="userSpaceOnUse"
          >
            <path
              d={`M ${spacing} 0 L 0 0 0 ${spacing}`}
              fill="none"
              stroke="var(--bg-pattern)"
              strokeWidth="0.5"
              opacity="0.5"
            />
          </pattern>
        </defs>
        <rect
          width="100%"
          height="100%"
          fill="var(--bg)"
          className="canvas-bg-rect"
        />
        <rect
          width="100%"
          height="100%"
          fill="url(#dots-pattern)"
          className="canvas-dots-rect"
        />
        <rect
          width="100%"
          height="100%"
          fill="url(#grid-pattern)"
          className="canvas-grid-rect"
        />
      </svg>
    </div>
  )
}
