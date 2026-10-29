/**
 * Everything the site says about Batuhan, in one place. The node windows
 * render it, and agent.sh (worker/prompt.ts) feeds the same data to the
 * model — so the bot can never drift from what the page shows.
 */

export const NAME = 'Batuhan Belbüken';

export const EMAIL = 'bbelbuken@gmail.com';

/** Public copy of his CV in public/, without his phone number */
export const CV_FILE = 'Batuhan_Belbuken_Resume.pdf';

export const LINKS = [
    { label: 'email', href: `mailto:${EMAIL}`, value: EMAIL },
    {
        label: 'github',
        href: 'https://github.com/bbelbuken',
        value: 'github.com/bbelbuken',
    },
    {
        label: 'linkedin',
        href: 'https://www.linkedin.com/in/bbelbuken',
        value: 'linkedin.com/in/bbelbuken',
    },
    { label: 'cv', href: `/${CV_FILE}`, value: 'resume.pdf' },
    {
        label: 'location',
        href: 'https://maps.google.com/?q=Istanbul,Turkey',
        value: 'Istanbul, Turkey',
    },
];

/** about.md paragraphs; the first one highlights ABOUT_HIGHLIGHT */
export const ABOUT = [
    "I'm a software developer and former sound engineer based in Istanbul. I build multi-tenant SaaS, real-time IoT systems, serverless data pipelines on AWS and Azure, and agentic AI workflows with Claude Code and MCP.",
    'Before code, I spent 8 years designing sound for brands like GAP, Vogue, and Turkcell. Next stop: AI.',
];

export const ABOUT_HIGHLIGHT = 'software developer';

export const FUN_FACTS = [
    'Fenerbahçe basketball, from youth teams to pro',
    'One year on the Turkish national team',
];

export const EXPERIENCE = [
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
];

export const PROJECTS = [
    {
        name: 'elontweetbot',
        desc: 'AI crypto trading bot: scores live X posts with Twitter-RoBERTa, fuses sentiment with a 70+ term crypto lexicon into a 0-100 signal, and trades on Binance Testnet with stop-loss, take-profit, and drawdown limits. Next.js dashboard with P&L charts, monitored with Prometheus, Grafana, and Loki, backed by 59 pytest tests.',
        url: 'https://github.com/bbelbuken/elontweetbot',
        tags: [
            'PyTorch',
            'Transformers',
            'NLP',
            'FastAPI',
            'Celery',
            'Redis',
            'PostgreSQL',
            'Next.js',
            'Docker',
        ],
    },
    {
        name: 'this-portfolio',
        desc: 'This node-graph site, with agent.sh built in: an AI agent on Cloudflare Workers AI that answers questions about me from the same data the page shows and opens windows on the canvas through validated actions. Chats are logged to D1, and a weekly LLM review of them tells me what to improve.',
        url: 'https://github.com/bbelbuken/portfolio-website',
        tags: [
            'React',
            'TypeScript',
            'Vite',
            'Workers AI',
            'LLM agents',
            'Cloudflare D1',
        ],
    },
];

export const EDUCATION = [
    {
        degree: 'B.Sc. Computer Engineering',
        school: 'Bahçeşehir University',
        period: 'Sep 2012 – Jun 2016',
    },
];
