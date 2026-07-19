import type { NodeData } from '@/types'
import { NodeWindow } from './NodeWindow'

interface AboutNodeProps {
  node: NodeData
}

export function AboutNode({ node }: AboutNodeProps) {
  return (
    <NodeWindow node={node} width={340}>
      <div
        className="space-y-3 text-[12px] leading-relaxed"
        style={{ color: 'var(--text-primary)', fontFamily: '"Fira Code", Consolas, monospace' }}
      >
        <p>
          <span style={{ color: 'var(--accent)' }}>{'> '}</span>
          <strong>Your Name</strong>
        </p>
        <p style={{ color: 'var(--text-secondary)' }}>
          I'm a{' '}
          <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
            creative developer
          </span>{' '}
          who builds at the intersection of code and sound. I design interactive
          experiences, develop web apps, and produce music.
        </p>
        <p style={{ color: 'var(--text-secondary)' }}>
          Currently building things I wish existed. Pull a wire and explore.
        </p>
        <div
          className="pt-2 text-[10px] space-y-1"
          style={{
            borderTop: '1px solid var(--window-border)',
            color: 'var(--text-secondary)',
          }}
        >
          <p>
            <span style={{ color: 'var(--accent)' }}>{'→'}</span> Connect a wire to explore
          </p>
          <p>
            <span style={{ color: 'var(--accent)' }}>{'→'}</span> Scroll / pinch to zoom canvas
          </p>
          <p>
            <span style={{ color: 'var(--accent)' }}>{'→'}</span> Drag nodes to rearrange
          </p>
        </div>
      </div>
    </NodeWindow>
  )
}
