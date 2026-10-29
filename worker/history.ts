import type { Env } from './shared';

/**
 * agent.sh chat history in D1. One row per question (or per message sent
 * through the form). No IPs or browser details, and emails or phone
 * numbers typed into the chat are masked before they are stored.
 */
export interface Turn {
    conversation: string | null;
    kind: 'chat' | 'message_sent';
    question?: string;
    reply?: string;
    actions?: unknown[];
    status?: 'ok' | 'error';
    country?: string | null;
    lang?: 'tr' | 'en';
}

export const RETENTION_DAYS = 90;

const EMAIL_IN_TEXT = /[^\s@<>"',;:()]+@[^\s@<>"',;:()]+\.[a-z]{2,}/gi;
// 9+ digits with spaces, dots, dashes or brackets between: phone numbers,
// not years ("2017–2025" uses an en dash) or counts
const PHONE = /\+?\d[\d\s().-]{7,}\d/g;

export function redact(text: string) {
    return text.replace(EMAIL_IN_TEXT, '[email]').replace(PHONE, '[phone]');
}

const UUID =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** The browser's per-tab id, or null when it isn't a well-formed UUID */
export function conversationId(value: unknown) {
    return typeof value === 'string' && UUID.test(value) ? value : null;
}

/** Never throws: a history write must not break the chat */
export async function logTurn(env: Env, t: Turn) {
    try {
        await env.DB.prepare(
            `INSERT INTO turns
               (conversation, created_at, kind, question, reply, actions, status, country, lang)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        )
            .bind(
                t.conversation,
                Date.now(),
                t.kind,
                t.question ? redact(t.question) : null,
                t.reply ? redact(t.reply) : null,
                t.actions?.length ? JSON.stringify(t.actions) : null,
                t.status ?? null,
                t.country ?? null,
                t.lang ?? null,
            )
            .run();
    } catch (err) {
        console.error('history error', err);
    }
}
