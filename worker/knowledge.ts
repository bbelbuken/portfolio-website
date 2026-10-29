/**
 * Extra background only agent.sh knows — the page never shows it. Taken from
 * Batuhan's LinkedIn (skills with where each was used, full role and project
 * write-ups) and his CV, October 2026.
 *
 * Deliberately left out: phone number, his recruiter-only "open to work"
 * preferences, connection counts. Update this when LinkedIn changes.
 */

/** Only the year — the Worker turns it into an age per request */
export const BIRTH_YEAR = 1993

/** Where each skill was used, so "what did he use at X?" has a real answer */
export const SKILLS_BY_CONTEXT: {
  /** Short name used in the skill → place index */
  label: string
  context: string
  summary: string
  skills: string[]
}[] = [
  {
    label: 'Loop at Benex',
    context:
      'Loop, the multi-tenant digital signage SaaS he co-built at Benex Technology (BENEX), Apr 2024 – present',
    summary: 'backend Node.js/Express/TypeScript with MongoDB; real-time Socket.IO and Change Streams; Azure Functions and Service Bus; React/Next.js admin; players on Tizen, webOS and Android; Claude Code agents with MCP',
    skills: [
      'Node.js', 'Express.js', 'TypeScript', 'JavaScript', 'REST APIs', 'JWT', 'RBAC', 'Zod',
      'MongoDB', 'Mongoose', 'MongoDB Change Streams', 'Socket.IO', 'WebSocket',
      'React', 'Next.js', 'Zustand', 'TanStack Query', 'Tailwind CSS', 'Webpack', 'Babel',
      'Microsoft Azure', 'Azure Functions', 'Azure Service Bus', 'Azure Web Apps', 'Application Insights',
      'Content Distribution Networks (CDN)', 'CI/CD', 'FFmpeg', 'Stripe',
      'Samsung Tizen', 'LG webOS', 'Android', 'Raspberry Pi', 'Cross-Platform Player Integration',
      'AI Agents', 'Claude Code', 'Model Context Protocol (MCP)', 'Jira', 'Canva API',
    ],
  },
  {
    label: 'ML Marketing',
    context:
      'Serverless social media analytics platform, contract for ML Marketing GmbH (Germany, remote), Jul 2026 – present',
    summary: 'AWS CDK (TypeScript) with Lambda, EventBridge, S3 and Aurora PostgreSQL; CloudFront for the dashboard; SQS/CloudWatch monitoring; Bright Data scraping; React dashboard',
    skills: [
      'Amazon Web Services (AWS)', 'AWS CDK', 'Infrastructure as Code', 'AWS Lambda', 'Amazon EventBridge',
      'Amazon S3', 'Amazon CloudFront', 'Amazon Aurora PostgreSQL', 'RDS Data API', 'Amazon SQS',
      'Amazon CloudWatch', 'Amazon SNS', 'Serverless Computing', 'ETL', 'Web Scraping', 'Bright Data',
      'PostgreSQL', 'TypeScript', 'Node.js', 'React',
    ],
  },
  {
    label: 'elontweetbot',
    context: 'elontweetbot, his AI crypto trading bot side project (X sentiment analysis)',
    summary: 'PyTorch with a Hugging Face Twitter-RoBERTa model for sentiment; FastAPI, Celery and Redis for serving; PostgreSQL; Prometheus/Grafana monitoring; Next.js dashboard',
    skills: [
      'Python', 'PyTorch', 'Hugging Face Transformers', 'Twitter-RoBERTa', 'Machine Learning',
      'Natural Language Processing (NLP)', 'Sentiment Analysis', 'Algorithmic Trading', 'FastAPI',
      'Celery', 'Redis', 'Pydantic', 'PostgreSQL', 'SQLAlchemy', 'Alembic', 'Twitter/X API (Tweepy)', 'Docker',
      'Docker Compose', 'Prometheus', 'Grafana', 'Loki', 'pytest', 'Next.js', 'TypeScript', 'Tailwind CSS',
    ],
  },
  {
    label: 'this portfolio',
    context: 'This portfolio site (bbelbuken.com) and agent.sh',
    summary: 'React, TypeScript and Vite on Cloudflare Workers, with Workers AI for agent.sh and R2 for media',
    skills: [
      'React', 'TypeScript', 'Vite', 'Tailwind CSS', 'Zustand', 'Framer Motion', 'Cloudflare Workers',
      'Cloudflare Workers AI', 'Cloudflare R2', 'LLM prompt design', 'Agent action validation',
    ],
  },
  {
    label: 'general (no specific project)',
    context: 'General skills listed on his LinkedIn without a specific project',
    summary: 'SQL/NoSQL, Prisma, Git and GitHub Actions, Redux',
    skills: [
      'SQL', 'NoSQL', 'Databases', 'Prisma ORM', 'Postman', 'Git', 'GitHub', 'GitHub Actions',
      'Redux', 'Redux Thunk', 'HTML5', 'CSS', 'Computer Science',
    ],
  },
]

/** Write-ups beyond what the canvas windows show */
export const EXTRA_NOTES = [
  'LinkedIn headline: Software Developer @ BENEX | Node.js, TypeScript, Next.js, Python | AWS, Azure | Building Agentic AI Workflows (Claude Code, MCP).',
  'He lives in Kadıköy, Istanbul.',
  'At Benex the signage product he co-built from scratch is called Loop. He wrapped each device platform\'s native API behind one idempotent command queue, and the 7-agent Claude Code pipeline there automates Jira tickets end to end: plan, code, test, review.',
  'elontweetbot details: ingests posts from the X API with Tweepy, stores tweets, signals and trades in PostgreSQL via SQLAlchemy and Alembic, retries failed Celery tasks with exponential backoff into a dead-letter table, and has a Next.js dashboard with tweet and signal feeds, P&L charts and a manual trading override. It trades only on Binance Testnet.',
  'Migros internship (Nov 2015 – Jan 2016): took part in information and logistics management meetings, helped develop cloud systems and internal network infrastructure, and supported the cybersecurity assessment, software assurance and process development programs.',
  'Sound engineering (Jun 2017 – Apr 2025, freelance, about 8 years): custom brand soundscapes for GAP, Vogue, Kiğılı, Migros and Turkcell; mixing and mastering for the documentary of Orfoz, a Michelin-starred fish restaurant in Bodrum; mixing and mastering for local artists around Kadıköy.',
  'Education: B.Sc. Computer Engineering, Bahçeşehir University (2012–2016); high school at Çevre Koleji (2007–2012).',
  'Spoken languages: Turkish (native), English (full professional proficiency), Spanish (elementary).',
  'Outside work: rower at Kalamış Kürek Kulübü since March 2025; in his youth he played basketball for Fenerbahçe and one year for the Turkish national team.',
]
