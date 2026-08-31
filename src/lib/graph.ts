import type { NodeData, Wire } from '@/types'

export const INITIAL_NODES: NodeData[] = [
  {
    id: 'about',
    type: 'about',
    label: 'about.md',
    x: 160,
    y: 120,
    state: 'connected',
    alwaysExpanded: true,
    ports: [
      { id: 'about-out-code', nodeId: 'about', type: 'output', label: '> CODE' },
      { id: 'about-out-audio', nodeId: 'about', type: 'output', label: 'AUDIO' },
    ],
  },
  {
    id: 'code-branch',
    type: 'code-branch',
    label: 'code.branch',
    parentId: 'about',
    parentPortId: 'about-out-code',
    x: 520,
    y: 60,
    state: 'idle',
    ports: [
      { id: 'code-in', nodeId: 'code-branch', type: 'input' },
      { id: 'code-out-projects', nodeId: 'code-branch', type: 'output', label: 'projects' },
      { id: 'code-out-exp', nodeId: 'code-branch', type: 'output', label: 'experience' },
      { id: 'code-out-contact', nodeId: 'code-branch', type: 'output', label: 'contact' },
    ],
  },
  {
    id: 'audio-branch',
    type: 'audio-branch',
    label: 'audio.branch',
    parentId: 'about',
    parentPortId: 'about-out-audio',
    x: 520,
    y: 320,
    state: 'idle',
    ports: [
      { id: 'audio-in', nodeId: 'audio-branch', type: 'input' },
      { id: 'audio-out-albums', nodeId: 'audio-branch', type: 'output', label: 'albums' },
      { id: 'audio-out-remixes', nodeId: 'audio-branch', type: 'output', label: 'remixes' },
      { id: 'audio-out-ads', nodeId: 'audio-branch', type: 'output', label: 'ads/video' },
    ],
  },
  {
    id: 'projects',
    type: 'projects',
    label: 'projects.code',
    parentId: 'code-branch',
    parentPortId: 'code-out-projects',
    x: 880,
    y: -40,
    state: 'idle',
    ports: [
      { id: 'projects-in', nodeId: 'projects', type: 'input' },
    ],
  },
  {
    id: 'experience',
    type: 'experience',
    label: 'experience.log',
    parentId: 'code-branch',
    parentPortId: 'code-out-exp',
    x: 880,
    y: 100,
    state: 'idle',
    ports: [
      { id: 'experience-in', nodeId: 'experience', type: 'input' },
    ],
  },
  {
    id: 'contact',
    type: 'contact',
    label: 'contact.sh',
    parentId: 'code-branch',
    parentPortId: 'code-out-contact',
    x: 880,
    y: 220,
    state: 'idle',
    ports: [
      { id: 'contact-in', nodeId: 'contact', type: 'input' },
    ],
  },
  {
    id: 'albums',
    type: 'albums',
    label: 'albums.wav',
    parentId: 'audio-branch',
    parentPortId: 'audio-out-albums',
    x: 880,
    y: 280,
    state: 'idle',
    ports: [
      { id: 'albums-in', nodeId: 'albums', type: 'input' },
    ],
  },
  {
    id: 'remixes',
    type: 'remixes',
    label: 'remixes.flac',
    parentId: 'audio-branch',
    parentPortId: 'audio-out-remixes',
    x: 880,
    y: 400,
    state: 'idle',
    ports: [
      { id: 'remixes-in', nodeId: 'remixes', type: 'input' },
    ],
  },
  {
    id: 'ads',
    type: 'ads',
    label: 'ads.mp4',
    parentId: 'audio-branch',
    parentPortId: 'audio-out-ads',
    x: 880,
    y: 520,
    state: 'idle',
    ports: [
      { id: 'ads-in', nodeId: 'ads', type: 'input' },
    ],
  },
]

export const INITIAL_WIRES: Wire[] = []

/**
 * A node is on screen only once its parent is connected — so the canvas starts
 * with about.md plus the two branches, and each branch reveals its own children.
 */
export function visibleNodeIds(nodes: NodeData[]): Set<string> {
  const byId = new Map(nodes.map((n) => [n.id, n]))
  const visible = new Set<string>()

  function isVisible(node: NodeData): boolean {
    if (!node.parentId) return true
    const parent = byId.get(node.parentId)
    if (!parent) return true
    return isVisible(parent) && (parent.state === 'connected' || !!parent.alwaysExpanded)
  }

  for (const node of nodes) {
    if (isVisible(node)) visible.add(node.id)
  }
  return visible
}

/** Direct children of a node, in declaration order. */
export function childrenOf(nodes: NodeData[], nodeId: string): NodeData[] {
  return nodes.filter((n) => n.parentId === nodeId)
}
