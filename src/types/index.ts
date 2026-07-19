export type ThemePreset = 'mac' | 'cga' | 'dos' | 'term'
export type WallpaperPattern = 'dots' | 'grid' | 'plain'

export interface AccentColor {
  id: string
  value: string
  /** Canvas bg override used only when the Mac preset is active */
  macBg?: string
  macBgPattern?: string
}

export interface ThemeDefinition {
  id: ThemePreset
  label: string
  vars: Record<string, string>
}

export type PortType = 'output' | 'input'
export type NodeState = 'idle' | 'connected'

export interface Port {
  id: string
  nodeId: string
  type: PortType
  label?: string
}

export interface NodeData {
  id: string
  type: 'about' | 'code-branch' | 'audio-branch' | 'projects' | 'experience' | 'contact' | 'albums' | 'remixes' | 'ads'
  label: string
  x: number
  y: number
  state: NodeState
  ports: Port[]
  alwaysExpanded?: boolean
}

export interface Wire {
  id: string
  fromPortId: string
  toPortId: string
  fromNodeId: string
  toNodeId: string
}

export interface DraftWire {
  fromPortId: string
  fromNodeId: string
  fromX: number
  fromY: number
  toX: number
  toY: number
}

export interface CanvasState {
  x: number
  y: number
  scale: number
}
