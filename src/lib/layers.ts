/**
 * Stacking order for canvas content:
 * background nodes < other wires < front-most node < that node's own wires.
 */
export const NODE_Z_BASE = 5
/** Wires that do not touch the front-most node */
export const WIRE_Z = 30
/** Wires attached to the front-most node — drawn on top of it */
export const FRONT_WIRE_Z = 32

/**
 * z-index for a node, derived from its place in the graph store's zOrder.
 * The front-most node is lifted above the other nodes' wires, while its own
 * wires (FRONT_WIRE_Z) still draw on top of it.
 */
export function nodeZIndex(zOrder: string[], nodeId: string): number {
  const idx = zOrder.indexOf(nodeId)
  if (idx === zOrder.length - 1) return WIRE_Z + 1
  return NODE_Z_BASE + Math.max(0, idx)
}
