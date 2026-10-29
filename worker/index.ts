import { NODE_IDS, SYSTEM_PROMPT, TOOL_NAMES } from './prompt';
import { BIRTH_YEAR } from './knowledge';
import { MAX_MESSAGE, TO, isEmail, visitorEmail } from './email';
import { DEFAULT_MODEL, textOf, type Env } from './shared';
import { conversationId, logTurn } from './history';
import { runCron } from './digest';

const MAX_MESSAGES = 12;
const MAX_CHARS = 500;
const MAX_BODY = 16_000;
const MAX_TOKENS = 400;

const ALLOWED_ORIGINS = [
    'https://bbelbuken.com',
    'http://localhost:5173',
    'http://localhost:8787',
];

type Role = 'user' | 'assistant';
interface ChatMessage {
    role: Role;
    content: string;
}

/** A canvas action the browser should run; ids are checked against the graph */
export interface AgentAction {
    tool: string;
    id?: string;
}

function json(body: unknown, status = 200) {
    return new Response(JSON.stringify(body), {
        status,
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Cache-Control': 'no-store',
            'X-Content-Type-Options': 'nosniff',
            'Referrer-Policy': 'strict-origin-when-cross-origin',
        },
    });
}

/** Keeps only well-formed user/assistant turns; anything else is dropped */
function cleanMessages(raw: unknown): ChatMessage[] | null {
    if (!Array.isArray(raw)) return null;
    const out: ChatMessage[] = [];
    for (const m of raw.slice(-MAX_MESSAGES)) {
        if (!m || typeof m !== 'object') continue;
        const { role, content } = m as Record<string, unknown>;
        if (
            (role !== 'user' && role !== 'assistant') ||
            typeof content !== 'string'
        )
            continue;
        const text = content.trim();
        if (!text) continue;
        if (text.length > MAX_CHARS) return null;
        out.push({ role, content: text });
    }
    return out.length && out[out.length - 1].role === 'user' ? out : null;
}

const ACTION_LINE = /^\s*ACTION:\s*([a-z_]+)\s*([a-z-]*)\s*$/gim;

/**
 * The model writes its reply and, when a canvas action helps, ends with
 * lines like "ACTION: open_node fashion". Those lines are cut out of the
 * reply and checked against the whitelist; anything else the model produces
 * is only ever shown as text.
 *
 * A plain-text protocol instead of native tool calling: it behaves the same
 * on every Workers AI model and needs one round trip. Native tools needed a
 * second call to get the reply text, which kept coming back empty.
 */
function parse(raw: string): { reply: string; actions: AgentAction[] } {
    const actions: AgentAction[] = [];
    const seen = new Set<string>();
    for (const [, tool, id] of raw.matchAll(ACTION_LINE)) {
        const key = `${tool}:${id}`;
        if (seen.has(key) || !TOOL_NAMES.includes(tool)) continue;
        seen.add(key);
        if (tool === 'open_contact' || tool === 'leave_message')
            actions.push({ tool });
        else if (NODE_IDS.includes(id)) actions.push({ tool, id });
    }

    let reply = raw
        .replace(ACTION_LINE, '')
        // Reasoning models may leave their scratchpad or a native tool call in
        // the text, and the terminal prints plain text, so markdown goes too
        .replace(/<think>[\s\S]*?<\/think>/g, '')
        .replace(/<tool_call>[\s\S]*$/g, '')
        .replace(/(\*\*|\*|__)(.+?)\1/g, '$2')
        .trim();
    // The model keeps opening overviews with "with a background in sound
    // engineering" and then closes on his sound years again; keep the close
    if ((reply.match(/sound/gi) ?? []).length > 1)
        reply = reply.replace(
            /,? with a (strong )?background in sound engineering/i,
            '',
        );
    return { reply, actions: actions.slice(0, 2) };
}

// Turkish letters, or common Turkish words typed on an English keyboard
// ("kac yasinda", "ne is yapiyor") — small models often miss those and
// answer in English, so the Worker tells them
const TURKISH =
    /[çğıöşüÇĞİÖŞÜ]|\b(ne|neler|nedir|nasil|kac|hangi|nerede|neden|kim|kimdir|mi|mu|misin|var|yok|icin|bana|onun|hakkinda|yasinda|dogdu|calisti|calisiyor|yapiyor|yapti|anlat|goster|merhaba|selam|tesekkurler|sagol|evet|hayir|tamam|peki|abi|hocam)\b/i;

const SMALL_TALK_WORD =
    '(ok(ay)?|tamam(dır)?|peki|thanks?|thank you|thx|ty|te[sş]ekk[uü]r(ler)?|sa[gğ]ol|cool|nice|great|good|harika|s[uü]per|anlad[iı]m|got it)';
const SMALL_TALK = new RegExp(
    `^${SMALL_TALK_WORD}([\\s,.!]+${SMALL_TALK_WORD})*[\\s.!]*$`,
    'i',
);

/** True when the visitor writes Turkish, so the reply language can be pinned */
function isTurkish(messages: ChatMessage[]) {
    const asked = messages.filter((m) => m.role === 'user').map((m) => m.content);
    const last = asked[asked.length - 1] ?? '';
    // A bare "ok" or "thanks" carries no language: go by the earlier messages
    return (
        TURKISH.test(last) ||
        (last.trim().split(/\s+/).length <= 2 && asked.some((a) => TURKISH.test(a)))
    );
}

/**
 * Facts that depend on the request: his age needs today's date, which a
 * Worker only has inside a request (at startup the clock reads 1970)
 */
function requestNotes(turkish: boolean) {
    const year = new Date().getFullYear();
    let notes = `\n\nHis age right now: ${year - BIRTH_YEAR - 1} or ${year - BIRTH_YEAR} (born ${BIRTH_YEAR}; only the year is known). Give exactly these numbers, don't work it out yourself.`;
    if (turkish)
        notes +=
            '\nThe visitor writes in Turkish (maybe without Turkish letters). Reply in Turkish.';
    return notes;
}

async function chat(env: Env, messages: ChatMessage[], turkish: boolean) {
    const model = (env.MODEL || DEFAULT_MODEL) as keyof AiModels;
    const system = SYSTEM_PROMPT + requestNotes(turkish);
    const result = await env.AI.run(model, {
        messages: [{ role: 'system', content: system }, ...messages],
        max_tokens: MAX_TOKENS,
        temperature: 0.3,
    } as never);
    return parse(textOf(result));
}

async function handleChat(
    request: Request,
    env: Env,
    ctx: ExecutionContext,
) {
    if (request.method !== 'POST') return json({ error: 'method' }, 405);

    const origin = request.headers.get('Origin');
    if (origin && !ALLOWED_ORIGINS.includes(origin))
        return json({ error: 'origin' }, 403);

    const ip = request.headers.get('CF-Connecting-IP') ?? 'local';
    const { success } = await env.CHAT_LIMIT.limit({ key: ip });
    if (!success)
        return json(
            {
                error: 'rate',
                message: 'Too many messages — wait a minute and try again.',
            },
            429,
        );

    const body = await request.text();
    if (body.length > MAX_BODY) return json({ error: 'size' }, 413);

    let parsed: unknown;
    try {
        parsed = JSON.parse(body);
    } catch {
        return json({ error: 'json' }, 400);
    }
    const messages = cleanMessages(
        (parsed as { messages?: unknown })?.messages,
    );
    if (!messages)
        return json(
            {
                error: 'input',
                message: `Keep it under ${MAX_CHARS} characters.`,
            },
            400,
        );

    const turkish = isTurkish(messages);
    const last = messages[messages.length - 1]?.content ?? '';
    // Written after the response goes out, so it never slows the reply
    const record = (
        reply: string,
        actions: AgentAction[],
        status: 'ok' | 'error',
    ) =>
        ctx.waitUntil(
            logTurn(env, {
                conversation: conversationId(
                    (parsed as { conversation?: unknown })?.conversation,
                ),
                kind: 'chat',
                question: last,
                reply,
                actions,
                status,
                country: countryOf(request),
                lang: turkish ? 'tr' : 'en',
            }),
        );

    try {
        const { reply: text, actions: asked } = await chat(
            env,
            messages,
            turkish,
        );
        // "ok" or "thanks" never opens anything, whatever the model adds
        const actions = SMALL_TALK.test(last.trim()) ? [] : asked;
        const reply =
            text ||
            (turkish
                ? 'Emin olamadım, başka türlü sorar mısın?'
                : "I'm not sure — try asking another way.");
        record(reply, actions, 'ok');
        return json({ reply, actions });
    } catch (err) {
        console.error('agent error', err);
        record('', [], 'error');
        // Out of the free daily quota, or the model is briefly unavailable
        return json(
            {
                error: 'model',
                message:
                    'agent.sh is resting for today. Reach Batuhan directly via contact.sh.',
            },
            503,
        );
    }
}

/**
 * The leave_message form: the visitor's own words, typed into a form and
 * sent by them, mailed to Batuhan. The model never writes or sends these.
 */
async function handleMessage(
    request: Request,
    env: Env,
    ctx: ExecutionContext,
) {
    if (request.method !== 'POST') return json({ error: 'method' }, 405);

    const origin = request.headers.get('Origin');
    if (origin && !ALLOWED_ORIGINS.includes(origin))
        return json({ error: 'origin' }, 403);

    const body = await request.text();
    if (body.length > MAX_BODY) return json({ error: 'size' }, 413);

    let parsed: Record<string, unknown>;
    try {
        parsed = JSON.parse(body) ?? {};
    } catch {
        return json({ error: 'json' }, 400);
    }

    // Hidden field only bots fill in: pretend it worked
    if (parsed.website) return json({ ok: true });

    const email = typeof parsed.email === 'string' ? parsed.email.trim() : '';
    const message =
        typeof parsed.message === 'string' ? parsed.message.trim() : '';
    if (!isEmail(email))
        return json({ error: 'email', message: 'Check the email address.' }, 400);
    if (!message || message.length > MAX_MESSAGE)
        return json(
            {
                error: 'input',
                message: `Write a message under ${MAX_MESSAGE} characters.`,
            },
            400,
        );

    // The chat so far goes along, so he knows what was asked
    const chat = (Array.isArray(parsed.chat) ? parsed.chat : [])
        .slice(-MAX_MESSAGES)
        .filter(
            (m): m is ChatMessage =>
                !!m &&
                (m.role === 'user' || m.role === 'assistant') &&
                typeof m.content === 'string',
        )
        .map((m) => ({ role: m.role, content: m.content.slice(0, MAX_CHARS) }));

    // Counted only for real sends, so a typo doesn't use up a try
    const ip = request.headers.get('CF-Connecting-IP') ?? 'local';
    const { success } = await env.MESSAGE_LIMIT.limit({ key: ip });
    if (!success)
        return json(
            { error: 'rate', message: 'Wait a minute before sending another.' },
            429,
        );

    if (!env.SEND_EMAIL)
        return json(
            { error: 'email-off', message: `Couldn't send it. Email him at ${TO}.` },
            503,
        );
    try {
        await env.SEND_EMAIL.send(visitorEmail(email, message, chat));
        // Only that it was sent: the message itself is in his inbox
        ctx.waitUntil(
            logTurn(env, {
                conversation: conversationId(parsed.conversation),
                kind: 'message_sent',
                country: countryOf(request),
            }),
        );
        return json({ ok: true });
    } catch (err) {
        console.error('send error', err);
        return json(
            { error: 'send', message: `Couldn't send it. Email him at ${TO}.` },
            503,
        );
    }
}

/** Cloudflare's two-letter country code; never the IP itself */
function countryOf(request: Request) {
    const country = (request.cf as { country?: unknown } | undefined)?.country;
    return typeof country === 'string' ? country : null;
}

export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url);
        if (url.pathname === '/api/chat') return handleChat(request, env, ctx);
        if (url.pathname === '/api/message')
            return handleMessage(request, env, ctx);
        return env.ASSETS.fetch(request);
    },
    async scheduled(controller, env) {
        await runCron(controller.cron, env);
    },
} satisfies ExportedHandler<Env>;
