/**
 * Compute a cubic bezier SVG path string between two points.
 * The control handles pull horizontally (good for left-to-right port layouts).
 */
export function cubicBezierPath(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
): string {
  const dx = Math.abs(x2 - x1)
  const tension = Math.max(60, dx * 0.5)
  const cx1 = x1 + tension
  const cy1 = y1
  const cx2 = x2 - tension
  const cy2 = y2
  return `M ${x1} ${y1} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x2} ${y2}`
}
