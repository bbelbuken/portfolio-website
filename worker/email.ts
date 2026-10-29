import { EmailMessage } from 'cloudflare:email';

/**
 * Visitor messages from agent.sh, delivered through Cloudflare Email
 * Routing. The binding can only send to Batuhan's verified address, so the
 * form can never be used to mail anyone else.
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

    const raw = [
        `From: agent.sh <${FROM}>`,
        `To: ${TO}`,
        `Reply-To: ${from}`,
        `Subject: =?UTF-8?B?${base64(`agent.sh: message from ${from}`).replace(/\r\n/g, '')}?=`,
        `Date: ${new Date().toUTCString()}`,
        `Message-ID: <${crypto.randomUUID()}@bbelbuken.com>`,
        'MIME-Version: 1.0',
        'Content-Type: text/plain; charset=UTF-8',
        'Content-Transfer-Encoding: base64',
        '',
        base64(lines.join('\n')),
    ].join('\r\n');

    return new EmailMessage(FROM, TO, raw);
}
