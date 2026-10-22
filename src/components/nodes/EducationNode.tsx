import type { NodeData } from '@/types'
import { NodeWindow } from './NodeWindow'
import { NodeSocket } from './NodeSocket'

const EDUCATION = [
  {
    degree: 'B.Sc. Computer Engineering',
    school: 'Bahçeşehir University',
    period: 'Sep 2012 – Jun 2016',
  },
]

interface EducationNodeProps {
  node: NodeData
}

export function EducationNode({ node }: EducationNodeProps) {
  if (node.state === 'idle') return <NodeSocket node={node} />

  return (
    <NodeWindow node={node} width={280}>
      <div
        className="space-y-4 text-[11px]"
        style={{ fontFamily: '"Fira Code", Consolas, monospace' }}
      >
        <p className="text-[10px] uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>
          // education.txt
        </p>
        {EDUCATION.map((e) => (
          <div key={e.school} className="relative pl-4" style={{ borderLeft: '2px solid var(--accent)' }}>
            <p style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{e.degree}</p>
            <p style={{ color: 'var(--accent)' }}>{e.school}</p>
            <p className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>
              {e.period}
            </p>
          </div>
        ))}
      </div>
    </NodeWindow>
  )
}
