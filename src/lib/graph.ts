import type { NodeData, Wire } from '@/types'

/*
 * Top-down tree: about.md on top, code and audio side by side under it, and
 * each branch's children in a column under that branch. The canvas scales to
 * the screen, so one layout looks the same everywhere.
 */
const ABOUT_W = 340
const ABOUT_H = 364
const BRANCH_H = 230 // open branch window
const SOCKET_W = 120 // closed branch socket
const ROW_GAP = 70
const BRANCH_GAP = 120
const CHILD_INDENT = 24
const CHILD_STEP = 56

const BRANCH_Y = ABOUT_H + ROW_GAP
// The closed sockets sit mirror-image around about.md's centre line
const CODE_X = ABOUT_W / 2 - BRANCH_GAP / 2 - SOCKET_W
const AUDIO_X = ABOUT_W / 2 + BRANCH_GAP / 2
const CHILD_Y = BRANCH_Y + BRANCH_H + ROW_GAP / 2

function child(branchX: number, i: number) {
  return { x: branchX + CHILD_INDENT, y: CHILD_Y + i * CHILD_STEP }
}

const LAYOUT: Record<string, { x: number; y: number }> = {
  about: { x: 0, y: 0 },
  'code-branch': { x: CODE_X, y: BRANCH_Y },
  'audio-branch': { x: AUDIO_X, y: BRANCH_Y },
  projects: child(CODE_X, 0),
  experience: child(CODE_X, 1),
  education: child(CODE_X, 2),
  stack: child(CODE_X, 3),
  tracks: child(AUDIO_X, 0),
  ads: child(AUDIO_X, 1),
  fashion: child(AUDIO_X, 2),
  documentary: child(AUDIO_X, 3),
}

const NODES: NodeData[] = [
  {
    id: 'about',
    type: 'about',
    label: 'about.md',
    x: 0,
    y: 0,
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
    x: 0,
    y: 0,
    state: 'idle',
    ports: [
      { id: 'code-in', nodeId: 'code-branch', type: 'input' },
      { id: 'code-out-projects', nodeId: 'code-branch', type: 'output', label: 'projects' },
      { id: 'code-out-exp', nodeId: 'code-branch', type: 'output', label: 'experience' },
      { id: 'code-out-edu', nodeId: 'code-branch', type: 'output', label: 'education' },
      { id: 'code-out-stack', nodeId: 'code-branch', type: 'output', label: 'stack' },
    ],
  },
  {
    id: 'audio-branch',
    type: 'audio-branch',
    label: 'audio.branch',
    parentId: 'about',
    parentPortId: 'about-out-audio',
    x: 0,
    y: 0,
    state: 'idle',
    ports: [
      { id: 'audio-in', nodeId: 'audio-branch', type: 'input' },
      { id: 'audio-out-tracks', nodeId: 'audio-branch', type: 'output', label: 'tracks' },
      { id: 'audio-out-ads', nodeId: 'audio-branch', type: 'output', label: 'ads' },
      { id: 'audio-out-fashion', nodeId: 'audio-branch', type: 'output', label: 'fashion' },
      { id: 'audio-out-documentary', nodeId: 'audio-branch', type: 'output', label: 'documentary' },
    ],
  },
  {
    id: 'projects',
    type: 'projects',
    label: 'projects.code',
    parentId: 'code-branch',
    parentPortId: 'code-out-projects',
    x: 0,
    y: 0,
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
    x: 0,
    y: 0,
    state: 'idle',
    ports: [
      { id: 'experience-in', nodeId: 'experience', type: 'input' },
    ],
  },
  {
    id: 'education',
    type: 'education',
    label: 'education.txt',
    parentId: 'code-branch',
    parentPortId: 'code-out-edu',
    x: 0,
    y: 0,
    state: 'idle',
    ports: [
      { id: 'education-in', nodeId: 'education', type: 'input' },
    ],
  },
  {
    id: 'stack',
    type: 'stack',
    label: 'stack.json',
    parentId: 'code-branch',
    parentPortId: 'code-out-stack',
    x: 0,
    y: 0,
    state: 'idle',
    ports: [
      { id: 'stack-in', nodeId: 'stack', type: 'input' },
    ],
  },
  {
    id: 'tracks',
    type: 'tracks',
    label: 'tracks.wav',
    parentId: 'audio-branch',
    parentPortId: 'audio-out-tracks',
    x: 0,
    y: 0,
    state: 'idle',
    ports: [
      { id: 'tracks-in', nodeId: 'tracks', type: 'input' },
    ],
  },
  {
    id: 'ads',
    type: 'ads',
    label: 'ads.mp4',
    parentId: 'audio-branch',
    parentPortId: 'audio-out-ads',
    x: 0,
    y: 0,
    state: 'idle',
    ports: [
      { id: 'ads-in', nodeId: 'ads', type: 'input' },
    ],
  },
  {
    id: 'fashion',
    type: 'fashion',
    label: 'fashion.mp4',
    parentId: 'audio-branch',
    parentPortId: 'audio-out-fashion',
    x: 0,
    y: 0,
    state: 'idle',
    ports: [
      { id: 'fashion-in', nodeId: 'fashion', type: 'input' },
    ],
  },
  {
    id: 'documentary',
    type: 'documentary',
    label: 'documentary.mp4',
    parentId: 'audio-branch',
    parentPortId: 'audio-out-documentary',
    x: 0,
    y: 0,
    state: 'idle',
    ports: [
      { id: 'documentary-in', nodeId: 'documentary', type: 'input' },
    ],
  },
]

export const INITIAL_NODES: NodeData[] = NODES.map((node) => ({
  ...node,
  ...LAYOUT[node.id],
}))

export const INITIAL_WIRES: Wire[] = []

/** Initial nodes, placed by LAYOUT. */
export function createInitialNodes(): NodeData[] {
  return INITIAL_NODES
}

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
