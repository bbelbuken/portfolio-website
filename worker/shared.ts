/** Bindings and model helpers shared by the chat API and the crons */
export interface Env {
    ASSETS: Fetcher;
    AI: Ai;
    CHAT_LIMIT: RateLimit;
    MESSAGE_LIMIT: RateLimit;
    /** agent.sh chat history */
    DB: D1Database;
    /** Email Routing; missing until it is set up on the zone */
    SEND_EMAIL?: SendEmail;
    /** Optional override (wrangler vars / .dev.vars), for trying other models */
    MODEL?: string;
}

/**
 * ~1 s replies, stays on the profile, about 65 neurons a question (so ~150
 * questions a day on the free tier). llama-3.1-8b-instruct-fp8-fast is the
 * budget fallback: ~0.6 s and ~12 neurons, but it drops details more often.
 */
export const DEFAULT_MODEL = '@cf/meta/llama-4-scout-17b-16e-instruct';

/** Workers AI returns { response } or, on newer models, OpenAI-style choices */
export function textOf(result: unknown): string {
    const r = (result ?? {}) as {
        response?: unknown;
        choices?: { message?: { content?: unknown } }[];
    };
    const text = r.choices?.[0]?.message?.content ?? r.response ?? '';
    return typeof text === 'string' ? text : '';
}
