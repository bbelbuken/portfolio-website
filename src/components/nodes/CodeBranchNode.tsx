import type { NodeData } from '@/types'
import { NodeWindow } from './NodeWindow'
import { NodeSocket } from './NodeSocket'

interface CodeBranchNodeProps {
  node: NodeData
}

export function CodeBranchNode({ node }: CodeBranchNodeProps) {
  if (node.state === 'idle') return <NodeSocket node={node} />

  return (
    <NodeWindow node={node} width={220}>
      <div
        className="text-[11px] space-y-2"
        style={{ color: 'var(--text-secondary)', fontFamily: '"Fira Code", Consolas, monospace' }}
      >
        <p style={{ color: 'var(--accent)', fontWeight: 600 }}>{'> CODE'}</p>
        <p>Connect the ports to explore projects, experience, and contact.</p>
        <div className="space-y-1 pt-2" style={{ borderTop: '1px solid var(--window-border)' }}>
          <p>
            <span style={{ color: 'var(--accent)' }}>{'/'}</span> projects.code
          </p>
          <p>
            <span style={{ color: 'var(--accent)' }}>{'/'}</span> experience.log
          </p>
          <p>
            <span style={{ color: 'var(--accent)' }}>{'/'}</span> contact.sh
          </p>
        </div>
      </div>
    </NodeWindow>
  )
}
