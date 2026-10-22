import type { NodeData } from '@/types'
import { STACK } from '@/lib/stack'
import { NodeWindow } from './NodeWindow'
import { NodeSocket } from './NodeSocket'

interface StackNodeProps {
  node: NodeData
}

/** Every skill area from lib/stack.ts, one section under the other. */
export function StackNode({ node }: StackNodeProps) {
  if (node.state === 'idle') return <NodeSocket node={node} />

  return (
    <NodeWindow node={node} width={360}>
      <div
        className="space-y-4 text-[11px]"
        style={{ fontFamily: '"Fira Code", Consolas, monospace' }}
      >
        {STACK.map((section, i) => (
          <div
            key={section.title}
            className="space-y-2"
            style={i > 0 ? { borderTop: '1px solid var(--window-border)', paddingTop: 12 } : undefined}
          >
            <p className="text-[10px] uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>
              // {section.title}
            </p>
            {section.blurb && (
              <p style={{ color: 'var(--text-secondary)' }}>{section.blurb}</p>
            )}
            {section.groups.map((g) => (
              <div key={g.label}>
                <p className="text-[10px]" style={{ color: 'var(--accent)' }}>{g.label}</p>
                <div className="flex flex-wrap gap-1 mt-0.5">
                  {g.items.map((item) => (
                    <span
                      key={item}
                      className="text-[9px] px-1"
                      style={{
                        border: '1px solid var(--window-border)',
                        color: 'var(--text-secondary)',
                      }}
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            ))}
            {section.notes && (
              <ul className="space-y-0.5">
                {section.notes.map((n) => (
                  <li key={n} style={{ color: 'var(--text-secondary)' }}>
                    {'– '}{n}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </NodeWindow>
  )
}
