-- agent.sh chat history. No IPs or browser details; emails and phone
-- numbers are masked before insert. Rows older than 90 days are deleted
-- daily by the Worker's cron.
CREATE TABLE turns (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    conversation TEXT,            -- random per browser tab, held in memory only
    created_at INTEGER NOT NULL,  -- ms since epoch
    kind TEXT NOT NULL,           -- 'chat' | 'message_sent'
    question TEXT,
    reply TEXT,
    actions TEXT,                 -- JSON, e.g. [{"tool":"open_node","id":"about"}]
    status TEXT,                  -- 'ok' | 'error'
    country TEXT,                 -- Cloudflare's country code
    lang TEXT                     -- 'tr' | 'en'
);

CREATE INDEX turns_created ON turns (created_at);
