import type { NodeData } from '@/types'
import { NodeWindow } from './NodeWindow'
import { NodeSocket } from './NodeSocket'

interface AudioBranchNodeProps {
  node: NodeData
}

export function AudioBranchNode({ node }: AudioBranchNodeProps) {
  if (node.state === 'idle') return <NodeSocket node={node} />

  return (
    <NodeWindow node={node} width={220}>
      <div
        className="text-[11px] space-y-2"
        style={{ color: 'var(--text-secondary)', fontFamily: '"Fira Code", Consolas, monospace' }}
      >
        <p style={{ color: 'var(--accent)', fontWeight: 600 }}>🎛️ AUDIO</p>
        <p>Patch into albums, remixes, or ads/fashion videos.</p>
        <div className="space-y-1 pt-2" style={{ borderTop: '1px solid var(--window-border)' }}>
          <p>
            <span style={{ color: 'var(--accent)' }}>{'♬'}</span> albums.wav
          </p>
          <p>
            <span style={{ color: 'var(--accent)' }}>{'♬'}</span> remixes.flac
          </p>
          <p>
            <span style={{ color: 'var(--accent)' }}>{'▶'}</span> ads.mp4
          </p>
        </div>
      </div>
    </NodeWindow>
  )
}
