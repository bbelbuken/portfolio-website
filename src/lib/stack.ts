/** Content for stack.json — one section per skill area, shown top to bottom. */
export interface StackGroup {
  label: string
  items: string[]
}

export interface StackSection {
  title: string
  blurb?: string
  groups: StackGroup[]
  /** Where these skills were used, one line each */
  notes?: string[]
}

export const STACK: StackSection[] = [
  {
    title: 'AI & Agents',
    blurb:
      'Next stop: AI. Already shipping agentic workflows at work and NLP models in side projects.',
    groups: [
      {
        label: 'agents',
        items: ['AI Agents', 'Agentic Workflows', 'Claude Code', 'Model Context Protocol (MCP)', 'Multi-Agent Pipelines'],
      },
      {
        label: 'ml/nlp',
        items: ['Machine Learning', 'NLP', 'Sentiment Analysis', 'PyTorch', 'Hugging Face Transformers', 'Twitter-RoBERTa'],
      },
      {
        label: 'serving',
        items: ['FastAPI', 'Celery', 'Redis', 'Pydantic', 'Docker Compose'],
      },
    ],
    notes: [
      '7-agent Claude Code pipeline that plans, codes, tests, and reviews Jira tickets',
      'Transformer sentiment scoring on live X posts, fused into a 0-100 trade signal',
    ],
  },
  {
    title: 'Backend',
    groups: [
      { label: 'runtime', items: ['Node.js', 'Express.js', 'FastAPI', 'Celery'] },
      { label: 'realtime', items: ['Socket.IO', 'WebSocket', 'MongoDB Change Streams'] },
      {
        label: 'api',
        items: ['REST APIs', 'Microservices', 'JWT', 'RBAC', 'Zod', 'Pydantic', 'Idempotent Queues'],
      },
      { label: 'integrations', items: ['Stripe', 'FFmpeg', 'Canva', 'X API', 'Bright Data', 'Web Scraping'] },
    ],
  },
  {
    title: 'Frontend',
    groups: [
      { label: 'frameworks', items: ['React', 'Next.js'] },
      { label: 'state', items: ['Zustand', 'Redux', 'Redux Thunk', 'TanStack Query'] },
      { label: 'styling', items: ['Tailwind CSS', 'CSS', 'HTML5'] },
      { label: 'build', items: ['Vite', 'Webpack', 'Babel'] },
    ],
  },
  {
    title: 'Cloud & DevOps',
    groups: [
      {
        label: 'aws',
        items: ['CDK', 'Lambda', 'Aurora PostgreSQL', 'S3', 'CloudFront', 'EventBridge', 'SQS', 'CloudWatch', 'SNS', 'RDS Data API'],
      },
      {
        label: 'azure',
        items: ['Functions', 'Service Bus', 'Web Apps', 'App Service', 'Application Insights'],
      },
      {
        label: 'practices',
        items: ['Serverless', 'Infrastructure as Code', 'ETL Pipelines', 'CDN', 'CI/CD', 'GitHub Actions', 'Docker'],
      },
    ],
  },
  {
    title: 'Data',
    groups: [
      { label: 'databases', items: ['MongoDB', 'PostgreSQL', 'Redis', 'SQL', 'NoSQL'] },
      { label: 'orm', items: ['Mongoose', 'Prisma', 'SQLAlchemy', 'Alembic'] },
      { label: 'design', items: ['Database Design', 'Multi-Tenant Schemas', 'Data Normalization'] },
    ],
  },
  {
    title: 'Devices & IoT',
    groups: [
      { label: 'platforms', items: ['Samsung Tizen', 'LG webOS', 'Android', 'Raspberry Pi'] },
      { label: 'playback', items: ['Cross-Platform Player Integration', 'Synchronized Playback', 'Digital Signage'] },
    ],
  },
  {
    title: 'Tools & Observability',
    groups: [
      { label: 'observability', items: ['Prometheus', 'Grafana', 'Loki', 'CloudWatch', 'Application Insights'] },
      { label: 'testing', items: ['pytest', 'Postman'] },
      { label: 'workflow', items: ['Git', 'GitHub', 'Jira', 'Docker'] },
    ],
  },
  {
    title: 'Languages',
    groups: [
      { label: 'code', items: ['TypeScript', 'JavaScript', 'Python', 'SQL'] },
      { label: 'spoken', items: ['Turkish (native)', 'English (professional)', 'Spanish (elementary)'] },
    ],
  },
]
