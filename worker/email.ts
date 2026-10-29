import { EmailMessage } from 'cloudflare:email';

/**
 * Mail from agent.sh (visitor messages and the weekly digest), delivered
 * through Cloudflare Email Routing. The binding can only send to Batuhan's
 * verified address, so nothing here can mail anyone else.
 */
const FROM = 'agent@bbelbuken.com';
export const TO = 'bbelbuken@gmail.com';

export const MAX_MESSAGE = 1000;

// No spaces, quotes, brackets or line breaks: nothing that could slip an
// extra header into the email
const EMAIL = /^[^\s@<>"',;:()[\]\\]{1,64}@[^\s@<>"',;:()[\]\\]+\.[a-z]{2,}$/i;

export function isEmail(value: string) {
    return value.length <= 254 && EMAIL.test(value);
}

/** UTF-8 text as base64, wrapped at 76 characters like MIME expects */
function base64(text: string) {
    let binary = '';
    for (const byte of new TextEncoder().encode(text))
        binary += String.fromCharCode(byte);
    return btoa(binary).replace(/.{76}/g, '$&\r\n');
}

interface Turn {
    role: 'user' | 'assistant';
    content: string;
}

/** A plain-text email to Batuhan; replyTo must already be a checked address */
export function buildEmail(subject: string, text: string, replyTo?: string) {
    const raw = [
        `From: agent.sh <${FROM}>`,
        `To: ${TO}`,
        ...(replyTo ? [`Reply-To: ${replyTo}`] : []),
        `Subject: =?UTF-8?B?${base64(subject).replace(/\r\n/g, '')}?=`,
        `Date: ${new Date().toUTCString()}`,
        `Message-ID: <${crypto.randomUUID()}@bbelbuken.com>`,
        'MIME-Version: 1.0',
        'Content-Type: text/plain; charset=UTF-8',
        'Content-Transfer-Encoding: base64',
        '',
        base64(text),
    ].join('\r\n');

    return new EmailMessage(FROM, TO, raw);
}

export function visitorEmail(from: string, message: string, chat: Turn[]) {
    const lines = [
        'New message from agent.sh on bbelbuken.com.',
        `Reply to this email to answer ${from}.`,
        '',
        message,
    ];
    if (chat.length) {
        lines.push('', '--- The chat before it ---');
        for (const t of chat)
            lines.push(t.role === 'user' ? `> ${t.content}` : t.content);
    }
    return buildEmail(`agent.sh: message from ${from}`, lines.join('\n'), from);
}
