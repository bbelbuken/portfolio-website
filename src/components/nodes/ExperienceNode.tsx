import type { NodeData } from '@/types'
import { NodeWindow } from './NodeWindow'
import { NodeSocket } from './NodeSocket'

const EXPERIENCE = [
  {
    role: 'Software Developer (Contract)',
    company: 'ML Marketing GmbH',
    period: 'Jul 2026 – present · Remote',
    notes: [
      'Serverless analytics platform on AWS for 100+ users tracking 5 social networks',
      'Multi-stage AWS CDK (TypeScript) ETL: EventBridge, Lambda, S3, Aurora PostgreSQL',
      'Saved ~$75/mo in NAT Gateway fees via RDS Data API and a scale-to-zero database',
    ],
  },
  {
    role: 'Software Developer',
    company: 'Benex Technology',
    period: 'Apr 2024 – present · Istanbul',
    notes: [
      'Co-built a multi-tenant signage SaaS running 400+ screens for 200+ users at global hotel chains',
      'Unified 9 IoT commands across 7 device platforms behind 1 idempotent queue',
      '130-route Express API, 21 MongoDB models, RBAC with 94 permissions',
      'Live content updates via MongoDB Change Streams and Socket.IO, resilient to failover',
      'Synchronized playback on Tizen, webOS, and Android with 10+ content types',
      'Moved FFmpeg transcoding and Stripe webhooks to Azure Functions and Service Bus',
      '7-agent Claude Code pipeline that plans, codes, tests, and reviews Jira tickets',
      'Canva, live flight schedule, and weather feeds as dynamic screen content',
    ],
  },
  {
    role: 'Sound Engineer',
    company: 'Freelance',
    period: 'Jun 2017 – Apr 2025 · Istanbul',
    notes: [
      'Sound design for GAP, Vogue, Migros, and Turkcell',
      'Sound for a Michelin-starred restaurant documentary',
    ],
  },
  {
    role: 'IT and Networking Intern',
    company: 'Migros',
    period: 'Nov 2015 – Jan 2016 · Istanbul',
    notes: ['Secured cloud systems and internal network infrastructure during cybersecurity assessments'],
  },
]

const EDUCATION = {
  school: 'Bahçeşehir University',
  degree: 'B.Sc. Computer Engineering',
  period: 'Jun 2016',
}

const SKILLS = [
  { label: 'lang', items: ['TypeScript', 'JavaScript', 'Python', 'SQL'] },
  {
    label: 'frameworks',
    items: ['Node.js', 'Express', 'FastAPI', 'Celery', 'Socket.IO', 'React', 'Next.js', 'PyTorch', 'HF Transformers'],
  },
  {
    label: 'cloud',
    items: ['AWS CDK', 'Lambda', 'Aurora', 'S3', 'EventBridge', 'Azure Functions', 'Service Bus', 'App Service'],
  },
  {
    label: 'data/tools',
    items: ['MongoDB', 'PostgreSQL', 'Redis', 'Git', 'GitHub Actions', 'Docker', 'Stripe', 'FFmpeg'],
  },
]

interface ExperienceNodeProps {
  node: NodeData
}

export function ExperienceNode({ node }: ExperienceNodeProps) {
  if (node.state === 'idle') return <NodeSocket node={node} />

  return (
    <NodeWindow node={node} width={380}>
      <div
        className="space-y-4 text-[11px]"
        style={{ fontFamily: '"Fira Code", Consolas, monospace' }}
      >
        <p className="text-[10px] uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>
          // experience.log
        </p>
        {EXPERIENCE.map((e, i) => (
          <div
            key={i}
            className="relative pl-4"
            style={{
              borderLeft: '2px solid var(--accent)',
            }}
          >
            <p style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{e.role}</p>
            <p style={{ color: 'var(--accent)' }}>{e.company}</p>
            <p className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>
              {e.period}
            </p>
            <ul className="mt-1 space-y-0.5">
              {e.notes.map((n) => (
                <li key={n} style={{ color: 'var(--text-secondary)' }}>
                  {'– '}{n}
                </li>
              ))}
            </ul>
          </div>
        ))}

        <p className="text-[10px] uppercase tracking-widest pt-2" style={{ color: 'var(--text-secondary)', borderTop: '1px solid var(--window-border)' }}>
          // education
        </p>
        <div className="relative pl-4" style={{ borderLeft: '2px solid var(--accent)' }}>
          <p style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{EDUCATION.degree}</p>
          <p style={{ color: 'var(--accent)' }}>{EDUCATION.school}</p>
          <p className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>
            {EDUCATION.period}
          </p>
        </div>

        <p className="text-[10px] uppercase tracking-widest pt-2" style={{ color: 'var(--text-secondary)', borderTop: '1px solid var(--window-border)' }}>
          // stack
        </p>
        <div className="space-y-2">
          {SKILLS.map((s) => (
            <div key={s.label}>
              <p className="text-[10px]" style={{ color: 'var(--accent)' }}>{s.label}</p>
              <div className="flex flex-wrap gap-1 mt-0.5">
                {s.items.map((item) => (
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
        </div>
      </div>
    </NodeWindow>
  )
}
