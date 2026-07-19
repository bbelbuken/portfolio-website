import { create } from 'zustand'
import type { NodeData, Wire, DraftWire, Port } from '@/types'
import { INITIAL_NODES, INITIAL_WIRES } from '@/lib/graph'

interface GraphStore {
  nodes: NodeData[]
  wires: Wire[]
  draftWire: DraftWire | null

  setNodePosition: (nodeId: string, x: number, y: number) => void
  setNodeState: (nodeId: string, state: 'idle' | 'connected') => void
  startDraftWire: (fromPortId: string, fromNodeId: string, fromX: number, fromY: number) => void
  updateDraftWire: (toX: number, toY: number) => void
  commitWire: (toPort: Port) => void
  cancelDraftWire: () => void
  removeWire: (wireId: string) => void
  getPortById: (portId: string) => Port | undefined
  getNodeById: (nodeId: string) => NodeData | undefined
}

let wireIdCounter = 0

export const useGraphStore = create<GraphStore>((set, get) => ({
  nodes: INITIAL_NODES,
  wires: INITIAL_WIRES,
  draftWire: null,

  setNodePosition: (nodeId, x, y) =>
    set((s) => ({
      nodes: s.nodes.map((n) => (n.id === nodeId ? { ...n, x, y } : n)),
    })),

  setNodeState: (nodeId, state) =>
    set((s) => ({
      nodes: s.nodes.map((n) => (n.id === nodeId ? { ...n, state } : n)),
    })),

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
    set({ wires: remainingWires })
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
