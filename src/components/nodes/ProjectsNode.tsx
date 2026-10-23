import type { NodeData } from '@/types'
import { NodeWindow } from './NodeWindow'
import { NodeSocket } from './NodeSocket'

const PROJECTS = [
  {
    name: 'elontweetbot',
    desc: 'AI crypto trading bot: scores live X posts with Twitter-RoBERTa, fuses sentiment with a 70+ term crypto lexicon into a 0-100 signal, and trades on Binance Testnet with stop-loss, take-profit, and drawdown limits. Next.js dashboard with P&L charts, monitored with Prometheus, Grafana, and Loki, backed by 59 pytest tests.',
    url: 'https://github.com/bbelbuken/elontweetbot',
    tags: ['PyTorch', 'Transformers', 'NLP', 'FastAPI', 'Celery', 'Redis', 'PostgreSQL', 'Next.js', 'Docker'],
  },
  {
    name: 'this-portfolio',
    desc: 'Node-graph portfolio',
    url: 'https://github.com/bbelbuken',
    tags: ['React', 'TypeScript', 'Vite'],
  },
]

interface ProjectsNodeProps {
  node: NodeData
}

export function ProjectsNode({ node }: ProjectsNodeProps) {
  if (node.state === 'idle') return <NodeSocket node={node} />

  return (
    <NodeWindow node={node} width={320}>
      <div
        className="space-y-2 text-[11px]"
        style={{ fontFamily: '"Fira Code", Consolas, monospace' }}
      >
        {PROJECTS.map((p) => (
          <a
            key={p.name}
            href={p.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block group"
            style={{ textDecoration: 'none' }}
          >
            <div
              className="p-2 transition-colors"
              style={{
                border: '1px solid transparent',
                borderColor: 'transparent',
              }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLElement).style.borderColor = 'var(--accent)')
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLElement).style.borderColor = 'transparent')
              }
            >
              <div className="flex items-center justify-between">
                <span style={{ color: 'var(--accent)' }}>{'> '}{p.name}</span>
                <span style={{ color: 'var(--text-secondary)', fontSize: 10 }}>↗</span>
              </div>
              <p style={{ color: 'var(--text-secondary)', marginTop: 2 }}>{p.desc}</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {p.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[9px] px-1"
                    style={{
                      border: '1px solid var(--window-border)',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </a>
        ))}
      </div>
    </NodeWindow>
  )
}
