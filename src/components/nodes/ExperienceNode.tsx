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
      'Collected Instagram, Facebook, X, TikTok, and YouTube metrics via Bright Data into one PostgreSQL schema',
      'Met the weekly data SLA with 4-hour retries, stale-data carry-forward, and a truncation detector',
      'Served dashboard data as static JSON on S3 + CloudFront, so traffic never hits the database',
      'German-language React dashboard with rankings, peer benchmarks, time-series charts, and CSV export',
      'SQS dead-letter queues, CloudWatch alarms with SNS alerts, and 120+ automated tests',
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
      'Custom brand soundscapes for GAP, Vogue, Kiğılı, Migros, and Turkcell campaigns',
      'Mixed and mastered the documentary of Orfoz, a Michelin-starred restaurant in Bodrum',
      'Mixing and mastering for local artists around Kadıköy',
    ],
  },
  {
    role: 'IT and Networking Intern',
    company: 'Migros',
    period: 'Nov 2015 – Jan 2016 · Istanbul',
    notes: [
      'Worked on the cloud systems and internal network infrastructure',
      'Supported the cybersecurity assessment, software assurance, and process development programs',
    ],
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

      </div>
    </NodeWindow>
  )
}
