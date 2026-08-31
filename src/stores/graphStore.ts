import { create } from 'zustand'
import type { NodeData, Wire, DraftWire, Port } from '@/types'
import { INITIAL_NODES, INITIAL_WIRES, childrenOf, visibleNodeIds } from '@/lib/graph'

interface GraphStore {
  nodes: NodeData[]
  wires: Wire[]
  draftWire: DraftWire | null
  wireDropTarget: string | null
  /** Node ids ordered back-to-front; the last entry renders on top */
  zOrder: string[]

  setNodePosition: (nodeId: string, x: number, y: number) => void
  bringToFront: (nodeId: string) => void
  setNodeState: (nodeId: string, state: 'idle' | 'connected') => void
  /** Connect a node to its parent port, opening the parent chain first */
  openNode: (nodeId: string) => void
  /** Open a node together with its direct children (used by the header nav) */
  openNodeTree: (nodeId: string) => void
  /** Disconnect a node: drops its incoming wires and collapses it */
  closeNode: (nodeId: string) => void
  startDraftWire: (fromPortId: string, fromNodeId: string, fromX: number, fromY: number) => void
  updateDraftWire: (toX: number, toY: number) => void
  commitWire: (toPort: Port) => void
  cancelDraftWire: () => void
  removeWire: (wireId: string) => void
  getPortById: (portId: string) => Port | undefined
  getNodeById: (nodeId: string) => NodeData | undefined
  setWireDropTarget: (nodeId: string | null) => void
}

let wireIdCounter = 0

/**
 * Drop wires that reach a node whose parent is no longer connected, and
 * collapse those now-hidden nodes, repeating until nothing else falls away.
 */
function settleGraph(
  nodes: NodeData[],
  wires: Wire[],
): { nodes: NodeData[]; wires: Wire[] } {
  let n = nodes
  let w = wires

  for (let pass = 0; pass <= nodes.length; pass++) {
    const visible = visibleNodeIds(n)
    const nextWires = w.filter(
      (x) => visible.has(x.fromNodeId) && visible.has(x.toNodeId),
    )
    const nextNodes = n.map((x) =>
      !visible.has(x.id) && x.state === 'connected'
        ? { ...x, state: 'idle' as const }
        : x,
    )
    const changed =
      nextWires.length !== w.length || nextNodes.some((x, i) => x !== n[i])
    n = nextNodes
    w = nextWires
    if (!changed) break
  }

  return { nodes: n, wires: w }
}

export const useGraphStore = create<GraphStore>((set, get) => ({
  nodes: INITIAL_NODES,
  wires: INITIAL_WIRES,
  draftWire: null,
  wireDropTarget: null,
  zOrder: INITIAL_NODES.map((n) => n.id),

  setNodePosition: (nodeId, x, y) =>
    set((s) => ({
      nodes: s.nodes.map((n) => (n.id === nodeId ? { ...n, x, y } : n)),
    })),

  bringToFront: (nodeId) =>
    set((s) =>
      s.zOrder[s.zOrder.length - 1] === nodeId
        ? s
        : { zOrder: [...s.zOrder.filter((id) => id !== nodeId), nodeId] },
    ),

  setNodeState: (nodeId, state) =>
    set((s) => ({
      nodes: s.nodes.map((n) => (n.id === nodeId ? { ...n, state } : n)),
    })),

  openNode: (nodeId) => {
    const node = get().getNodeById(nodeId)
    if (!node || !node.parentId || !node.parentPortId) return

    // Make sure the parent is on screen and open before hanging a wire on it
    const parent = get().getNodeById(node.parentId)
    if (parent && !parent.alwaysExpanded && parent.state !== 'connected') {
      get().openNode(parent.id)
    }

    if (get().getNodeById(nodeId)?.state === 'connected') return
    const input = node.ports.find((p) => p.type === 'input')
    if (!input) return

    const wire: Wire = {
      id: `wire-${++wireIdCounter}`,
      fromPortId: node.parentPortId,
      toPortId: input.id,
      fromNodeId: node.parentId,
      toNodeId: node.id,
    }

    set((s) => ({
      wires: s.wires.some(
        (w) => w.fromPortId === wire.fromPortId && w.toPortId === wire.toPortId,
      )
        ? s.wires
        : [...s.wires, wire],
      nodes: s.nodes.map((n) =>
        n.id === nodeId ? { ...n, state: 'connected' as const } : n,
      ),
    }))
  },

  openNodeTree: (nodeId) => {
    get().openNode(nodeId)
    childrenOf(get().nodes, nodeId).forEach((child) => get().openNode(child.id))
  },

  closeNode: (nodeId) => {
    const node = get().getNodeById(nodeId)
    if (!node || node.alwaysExpanded) return
    const remaining = get().wires.filter((w) => w.toNodeId !== nodeId)
    set((s) =>
      settleGraph(
        s.nodes.map((n) =>
          n.id === nodeId ? { ...n, state: 'idle' as const } : n,
        ),
        remaining,
      ),
    )
  },

  startDraftWire: (fromPortId, fromNodeId, fromX, fromY) =>
    set({ draftWire: { fromPortId, fromNodeId, fromX, fromY, toX: fromX, toY: fromY } }),

  updateDraftWire: (toX, toY) =>
    set((s) =>
      s.draftWire ? { draftWire: { ...s.draftWire, toX, toY } } : s,
    ),

  commitWire: (toPort) => {
    const { draftWire, wires, nodes, setNodeState } = get()
    if (!draftWire) return

    // Prevent duplicate connections
    const already = wires.find(
      (w) => w.fromPortId === draftWire.fromPortId && w.toPortId === toPort.id,
    )
    if (already) {
      set({ draftWire: null })
      return
    }

    const wire: Wire = {
      id: `wire-${++wireIdCounter}`,
      fromPortId: draftWire.fromPortId,
      toPortId: toPort.id,
      fromNodeId: draftWire.fromNodeId,
      toNodeId: toPort.nodeId,
    }

    // Mark target node as connected
    const targetNode = nodes.find((n) => n.id === toPort.nodeId)
    if (targetNode && targetNode.state === 'idle') {
      setNodeState(toPort.nodeId, 'connected')
    }

    set((s) => ({ wires: [...s.wires, wire], draftWire: null }))
  },

  cancelDraftWire: () => set({ draftWire: null }),

  setWireDropTarget: (nodeId) => set({ wireDropTarget: nodeId }),

  removeWire: (wireId) => {
    const { wires, nodes } = get()
    const wire = wires.find((w) => w.id === wireId)
    if (!wire) return

    const remainingWires = wires.filter((w) => w.id !== wireId)
    // If no more wires target this node, revert to idle
    const stillConnected = remainingWires.some((w) => w.toNodeId === wire.toNodeId)
    const targetNode = nodes.find((n) => n.id === wire.toNodeId)
    if (targetNode && !targetNode.alwaysExpanded && !stillConnected) {
      get().setNodeState(wire.toNodeId, 'idle')
    }
    set((s) => settleGraph(s.nodes, remainingWires))
  },

  getPortById: (portId) => {
    const { nodes } = get()
    for (const node of nodes) {
      const port = node.ports.find((p) => p.id === portId)
      if (port) return port
    }
    return undefined
  },

  getNodeById: (nodeId) => {
    return get().nodes.find((n) => n.id === nodeId)
  },
}))
