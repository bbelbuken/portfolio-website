import type { NodeData } from '@/types'
import { NodeWindow } from './NodeWindow'
import { NodeSocket } from './NodeSocket'

const LINKS = [
  { label: 'email', href: 'mailto:hello@yourname.com', value: 'hello@yourname.com' },
  { label: 'github', href: 'https://github.com/yourname', value: 'github.com/yourname' },
  { label: 'linkedin', href: 'https://linkedin.com/in/yourname', value: 'linkedin.com/in/yourname' },
  { label: 'twitter', href: 'https://twitter.com/yourname', value: '@yourname' },
]

interface ContactNodeProps {
  node: NodeData
}

export function ContactNode({ node }: ContactNodeProps) {
  if (node.state === 'idle') return <NodeSocket node={node} />

  return (
    <NodeWindow node={node} width={280}>
      <div
        className="space-y-2 text-[11px]"
        style={{ fontFamily: '"Fira Code", Consolas, monospace' }}
      >
        <p className="text-[10px] uppercase tracking-widest mb-3" style={{ color: 'var(--text-secondary)' }}>
          // contact.sh
        </p>
        {LINKS.map((l) => (
          <a
            key={l.label}
            href={l.href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 py-1 group"
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            <span style={{ color: 'var(--text-secondary)', minWidth: 64 }}>
              {l.label}
            </span>
            <span style={{ color: 'var(--accent)' }}>{'→'}</span>
            <span
              style={{ color: 'var(--text-primary)' }}
              className="group-hover:underline"
            >
              {l.value}
            </span>
          </a>
        ))}
      </div>
    </NodeWindow>
  )
}
