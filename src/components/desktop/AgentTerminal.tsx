import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useDrag } from '@use-gesture/react';
import { RetroWindow } from '@/components/ui/RetroWindow';
import { POP_IN } from '@/lib/motion';
import { useUiStore } from '@/stores/uiStore';
import { useGraphStore } from '@/stores/graphStore';
import { useCanvasStore } from '@/stores/canvasStore';
import { readStored, writeStored } from '@/lib/storage';
import { INITIAL_NODES } from '@/lib/graph';

const WIDTH = 380;
const HEIGHT = 440;
const EDGE_GAP = 8;
const TOP = 34; // just under the header
const MAX_CHARS = 500; // same cap as the Worker
const MAX_MESSAGE = 1000; // the Worker's cap for leave_message
const EMAIL_IN_TEXT = /[^\s@<>"',;:()]+@[^\s@<>"',;:()]+\.[a-z]{2,}/i;
const TYPE_MS = 12; // per character of a reply

// Turkish browsers get the intro in Turkish; replies follow the visitor's
// own language either way
const TURKISH =
    typeof navigator !== 'undefined' &&
    navigator.language.toLowerCase().startsWith('tr');

const COPY = TURKISH
    ? {
          intro: 'Batuhan hakkında ne istersen sor. Kanvastaki pencereleri senin için açabilirim.',
          suggestions: ['Batuhan kimdir?', 'AI yetkinlikleri neler?'],
          leaveMessage: 'Mesaj bırak',
          opened: 'açıldı',
          reopen: 'Tekrar göster:',
          placeholder: 'işleri hakkında sor…',
          form: {
              title: 'Batuhan’a mesaj bırak',
              email: 'e-postan',
              message: 'mesajın',
              note: 'Mesajın ve bu sohbet Batuhan’a e-postayla gider.',
              send: 'gönder',
              cancel: 'vazgeç',
              sent: 'Gönderildi. Batuhan sana bu adresten dönecek:',
          },
      }
    : {
          intro: 'Ask me anything about Batuhan. I can open the windows on the canvas for you.',
          suggestions: ['Who is Batuhan?', "What's his AI skill set?"],
          leaveMessage: 'Leave him a message',
          opened: 'opened',
          reopen: 'Show again:',
          placeholder: 'ask about his work…',
          form: {
              title: 'Leave Batuhan a message',
              email: 'your email',
              message: 'your message',
              note: 'Your message and this chat go to Batuhan by email.',
              send: 'send',
              cancel: 'cancel',
              sent: 'Sent. Batuhan will get back to you at',
          },
      };

interface Action {
    tool: string;
    id?: string;
}

interface Line {
    /** note: the agent's own status lines, never sent to the model */
    role: 'user' | 'assistant' | 'error' | 'note';
    content: string;
    actions?: Action[];
}

function prefersReducedMotion() {
    return (
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches
    );
}

/** The window an action opened, by the name it has on the canvas */
function windowName(a: Action) {
    if (a.tool === 'open_contact') return 'contact.sh';
    if (a.tool === 'open_node')
        return INITIAL_NODES.find((n) => n.id === a.id)?.label ?? null;
    return null; // leave_message shows its own form
}

/**
 * What the agent opened, drawn as a tiny window title bar with the file's
 * name, so it reads as the window that just appeared. Clicking brings the
 * window back into view.
 */
function OpenedTab({ action }: { action: Action }) {
    const name = windowName(action);
    if (!name) return null;
    return (
        <p
            className='flex items-center gap-1.5 py-0.5'
            style={{ color: 'var(--text-secondary)' }}
        >
            <button
                onClick={() => runActions([action])}
                title={`${COPY.reopen} ${name}`}
                className='gear-btn flex items-center gap-1 px-1.5 text-[10px]'
                style={{
                    border: '1px solid var(--window-border)',
                    background: 'var(--title-bar-bg)',
                    color: 'var(--text-primary)',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    lineHeight: '16px',
                }}
            >
                {/* The striped title bar every canvas window has */}
                <span
                    aria-hidden='true'
                    style={{
                        width: 9,
                        height: 7,
                        border: '1px solid var(--window-border)',
                        background:
                            'repeating-linear-gradient(0deg, var(--window-bg) 0 1px, var(--title-bar-line) 1px 2px)',
                    }}
                />
                {name}
            </button>
            {COPY.opened}
        </p>
    );
}

/** Runs what the model asked for: open nodes, move the camera, open contact */
function runActions(actions: Action[]) {
    const graph = useGraphStore.getState();
    for (const a of actions) {
        if (a.tool === 'open_contact') {
            useUiStore.getState().openContact();
        } else if (a.tool === 'open_node' && a.id) {
            // Already-open nodes just get the camera
            graph.openNode(a.id);
            graph.bringToFront(a.id);
            useCanvasStore.getState().focusNode(a.id);
        }
    }
}

/** Prints an assistant reply a few characters at a time, like a terminal */
function TypedText({ text, onDone }: { text: string; onDone?: () => void }) {
    const instant = prefersReducedMotion();
    const [shown, setShown] = useState(instant ? text.length : 0);

    useEffect(() => {
        if (shown >= text.length) {
            onDone?.();
            return;
        }
        const id = setTimeout(() => setShown((n) => n + 2), TYPE_MS);
        return () => clearTimeout(id);
    }, [shown, text, onDone]);

    return <>{text.slice(0, shown)}</>;
}

interface MessageFormProps {
    /** The chat so far, mailed along so he sees what was asked */
    lines: Line[];
    onDone: (sentTo: string | null) => void;
}

/**
 * leave_message: the visitor types their own email and message and sends
 * them. The model only opens this form; it never writes or sends anything.
 */
function MessageForm({ lines, onDone }: MessageFormProps) {
    const [email, setEmail] = useState(
        () =>
            [...lines]
                .reverse()
                .find((l) => l.role === 'user' && EMAIL_IN_TEXT.test(l.content))
                ?.content.match(EMAIL_IN_TEXT)?.[0] ?? '',
    );
    const [message, setMessage] = useState('');
    const [website, setWebsite] = useState(''); // honeypot, bots only
    const [sending, setSending] = useState(false);
    const [error, setError] = useState('');

    async function send(e: React.FormEvent) {
        e.preventDefault();
        if (sending) return;
        setSending(true);
        setError('');
        try {
            const res = await fetch('/api/message', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email,
                    message,
                    website,
                    chat: lines
                        .filter(
                            (l) => l.role === 'user' || l.role === 'assistant',
                        )
                        .map(({ role, content }) => ({ role, content })),
                }),
            });
            const data = (await res.json().catch(() => ({}))) as {
                message?: string;
            };
            if (!res.ok) {
                setError(data.message ?? 'Something went wrong. Try again.');
                return;
            }
            onDone(email.trim());
        } catch {
            setError('No connection. Check your network and try again.');
        } finally {
            setSending(false);
        }
    }

    const field = {
        border: '1px solid var(--window-border)',
        background: 'var(--window-bg)',
        color: 'var(--text-primary)',
        fontFamily: 'inherit',
    };
    const button = {
        border: '1px solid var(--window-border)',
        background: 'transparent',
        color: 'var(--text-primary)',
        cursor: 'pointer',
        fontFamily: 'inherit',
    };

    return (
        <form
            onSubmit={send}
            className='space-y-1.5 p-2'
            style={{ border: '1px dashed var(--accent)' }}
        >
            <p style={{ color: 'var(--accent)' }}>{COPY.form.title}</p>
            <input
                type='email'
                required
                maxLength={254}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={COPY.form.email}
                aria-label={COPY.form.email}
                autoComplete='email'
                className='w-full px-1.5 py-1 outline-none text-[16px] sm:text-[11px]'
                style={field}
            />
            <textarea
                required
                rows={3}
                maxLength={MAX_MESSAGE}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={COPY.form.message}
                aria-label={COPY.form.message}
                className='w-full px-1.5 py-1 outline-none resize-none text-[16px] sm:text-[11px]'
                style={field}
            />
            {/* Off-screen, so people never see or fill it */}
            <input
                tabIndex={-1}
                autoComplete='off'
                aria-hidden='true'
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                style={{
                    position: 'absolute',
                    left: -9999,
                    width: 1,
                    height: 1,
                }}
            />
            <p style={{ color: 'var(--text-secondary)' }}>{COPY.form.note}</p>
            {error && <p style={{ color: 'var(--accent)' }}>! {error}</p>}
            <div className='flex gap-1.5'>
                <button
                    type='submit'
                    disabled={sending}
                    className='px-1.5'
                    style={{ ...button, opacity: sending ? 0.4 : 1 }}
                >
                    {COPY.form.send}
                </button>
                <button
                    type='button'
                    onClick={() => onDone(null)}
                    className='px-1.5'
                    style={button}
                >
                    {COPY.form.cancel}
                </button>
            </div>
        </form>
    );
}

interface AgentBodyProps {
    height: number;
    /** Held by AgentTerminal, so minimising keeps the conversation */
    lines: Line[];
    setLines: React.Dispatch<React.SetStateAction<Line[]>>;
}

function AgentBody({ height, lines, setLines }: AgentBodyProps) {
    const [input, setInput] = useState('');
    const [busy, setBusy] = useState(false);
    const [formOpen, setFormOpen] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Keep the newest line in view as replies print
    useEffect(() => {
        const el = scrollRef.current;
        if (el) el.scrollTop = el.scrollHeight;
    });

    useEffect(() => {
        // Phones would throw the keyboard over the canvas on open
        if (window.matchMedia('(pointer: fine)').matches)
            inputRef.current?.focus();
    }, []);

    async function ask(question: string) {
        const text = question.trim().slice(0, MAX_CHARS);
        if (!text || busy) return;
        const history = [...lines, { role: 'user' as const, content: text }];
        setLines(history);
        setInput('');
        setBusy(true);

        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: history
                        .filter(
                            (l) => l.role === 'user' || l.role === 'assistant',
                        )
                        .map(({ role, content }) => ({ role, content })),
                }),
            });
            const data = (await res.json().catch(() => ({}))) as {
                reply?: string;
                actions?: Action[];
                message?: string;
            };
            if (!res.ok || !data.reply) {
                setLines((l) => [
                    ...l,
                    {
                        role: 'error',
                        content:
                            data.message ?? 'Something went wrong. Try again.',
                    },
                ]);
                return;
            }
            const actions = data.actions ?? [];
            runActions(actions);
            if (actions.some((a) => a.tool === 'leave_message'))
                setFormOpen(true);
            setLines((l) => [
                ...l,
                { role: 'assistant', content: data.reply!, actions },
            ]);
        } catch {
            setLines((l) => [
                ...l,
                {
                    role: 'error',
                    content: 'No connection. Check your network and try again.',
                },
            ]);
        } finally {
            setBusy(false);
        }
    }

    return (
        <div className='flex flex-col text-[11px]' style={{ height }}>
            <div
                ref={scrollRef}
                className='flex-1 overflow-y-auto p-3 space-y-2'
                style={{ minHeight: 0, overscrollBehavior: 'contain' }}
                onWheel={(e) => e.stopPropagation()}
            >
                <p style={{ color: 'var(--text-secondary)' }}>{COPY.intro}</p>

                {lines.length === 0 && (
                    <div className='flex flex-wrap gap-1.5 pt-1'>
                        {COPY.suggestions.map((s) => (
                            <button
                                key={s}
                                onClick={() => ask(s)}
                                className='px-1.5 py-0.5 hover:underline'
                                style={{
                                    border: '1px solid var(--window-border)',
                                    background: 'transparent',
                                    color: 'var(--text-primary)',
                                    cursor: 'pointer',
                                    fontFamily: 'inherit',
                                }}
                            >
                                {s}
                            </button>
                        ))}
                        {/* Straight to the form: no model call needed */}
                        {!formOpen && (
                            <button
                                onClick={() => setFormOpen(true)}
                                className='px-1.5 py-0.5 hover:underline'
                                style={{
                                    border: '1px dashed var(--accent)',
                                    background: 'transparent',
                                    color: 'var(--accent)',
                                    cursor: 'pointer',
                                    fontFamily: 'inherit',
                                }}
                            >
                                ✉ {COPY.leaveMessage}
                            </button>
                        )}
                    </div>
                )}

                {lines.map((l, i) => (
                    <div key={i} className='space-y-0.5'>
                        {l.role === 'user' && (
                            // Tinted strip so the visitor's own lines stand
                            // apart from the replies
                            <p
                                className='px-1.5 py-0.5 -mx-1.5'
                                style={{
                                    color: 'var(--text-primary)',
                                    fontWeight: 600,
                                    background:
                                        'color-mix(in srgb, var(--accent) 6%, transparent)',
                                    borderLeft: '2px solid var(--accent)',
                                }}
                            >
                                <span style={{ color: 'var(--accent)' }}>
                                    {'> '}
                                </span>
                                {l.content}
                            </p>
                        )}
                        {l.role === 'assistant' && (
                            <>
                                {l.actions?.map((a) => (
                                    <OpenedTab
                                        key={`${a.tool}:${a.id ?? ''}`}
                                        action={a}
                                    />
                                ))}
                                <p
                                    style={{
                                        color: 'var(--text-secondary)',
                                        whiteSpace: 'pre-wrap',
                                    }}
                                >
                                    {i === lines.length - 1 ? (
                                        <TypedText text={l.content} />
                                    ) : (
                                        l.content
                                    )}
                                </p>
                            </>
                        )}
                        {l.role === 'error' && (
                            <p style={{ color: 'var(--accent)' }}>
                                ! {l.content}
                            </p>
                        )}
                        {l.role === 'note' && (
                            <p style={{ color: 'var(--accent)' }}>
                                ✓ {l.content}
                            </p>
                        )}
                    </div>
                ))}

                {formOpen && (
                    <MessageForm
                        lines={lines}
                        onDone={(sentTo) => {
                            setFormOpen(false);
                            if (sentTo)
                                setLines((l) => [
                                    ...l,
                                    {
                                        role: 'note',
                                        content: `${COPY.form.sent} ${sentTo}`,
                                    },
                                ]);
                        }}
                    />
                )}
                {busy && (
                    <p style={{ color: 'var(--text-secondary)' }}>
                        thinking
                        <span
                            className='caret-blink'
                            style={{ color: 'var(--accent)' }}
                        >
                            _
                        </span>
                    </p>
                )}
            </div>

            <form
                className='flex items-center gap-2 px-3 py-2'
                style={{ borderTop: '2px solid var(--window-border)' }}
                onSubmit={(e) => {
                    e.preventDefault();
                    ask(input);
                }}
            >
                <span style={{ color: 'var(--accent)' }}>{'>'}</span>
                <input
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    maxLength={MAX_CHARS}
                    placeholder={busy ? '' : COPY.placeholder}
                    aria-label='Ask agent.sh'
                    enterKeyHint='send'
                    // 16px on phones keeps iOS from zooming the page on focus
                    className='flex-1 min-w-0 bg-transparent outline-none text-[16px] sm:text-[12px]'
                    style={{
                        color: 'var(--text-primary)',
                        fontFamily: 'inherit',
                    }}
                />
                <button
                    type='submit'
                    disabled={busy || !input.trim()}
                    className='px-1.5'
                    style={{
                        border: '1px solid var(--window-border)',
                        background: 'transparent',
                        color: 'var(--text-primary)',
                        cursor: busy ? 'default' : 'pointer',
                        fontFamily: 'inherit',
                        opacity: busy || !input.trim() ? 0.4 : 1,
                    }}
                >
                    run
                </button>
            </form>
        </div>
    );
}

/** A big version of the favicon: a tiny node window whose screen holds a prompt */
function LauncherIcon() {
    return (
        <svg viewBox='0 0 32 32' width='100%' height='100%' aria-hidden='true'>
            <rect
                x='5'
                y='5'
                width='24'
                height='24'
                fill='var(--window-border)'
            />
            <rect
                x='2'
                y='2'
                width='24'
                height='24'
                fill='var(--window-bg)'
                stroke='var(--window-border)'
                strokeWidth='2'
            />
            <rect
                x='3'
                y='3'
                width='22'
                height='6'
                fill='var(--title-bar-bg)'
            />
            <path
                d='M3 5h22M3 7h22'
                stroke='var(--title-bar-line)'
                strokeWidth='0.8'
            />
            <path d='M3 9h22' stroke='var(--window-border)' strokeWidth='2' />
            <text
                x='5.5'
                y='20.5'
                fontSize='9'
                fontFamily='"Fira Code", Consolas, monospace'
                fontWeight='700'
                fill='var(--accent)'
            >
                {'>'}
            </text>
            {/* Its own element: browsers won't animate opacity on a tspan */}
            <text
                className='caret-blink'
                x='11'
                y='20.5'
                fontSize='9'
                fontFamily='"Fira Code", Consolas, monospace'
                fontWeight='700'
                fill='var(--accent)'
            >
                _
            </text>
            <circle
                cx='26'
                cy='17'
                r='3.5'
                fill='var(--accent)'
                stroke='var(--window-border)'
                strokeWidth='1.5'
            />
        </svg>
    );
}

const SEEN_KEY = 'portfolio:agent-seen';

/**
 * The minimised agent.sh, bottom-right. Until a visitor opens it once it
 * hops every few seconds with a little "ask my AI" tag; after that it stays
 * still, on this visit and every later one. The caret always blinks.
 */
function AgentLauncher({
    seen,
    onOpen: open,
}: {
    seen: boolean;
    onOpen: () => void;
}) {
    return (
        <motion.div
            key='agent-launcher'
            {...POP_IN}
            className='fixed flex items-center gap-2'
            style={{ right: EDGE_GAP + 4, bottom: EDGE_GAP + 4, zIndex: 36 }}
            onPointerDown={(e) => e.stopPropagation()}
        >
            {/* Inner wrapper: the outer one's transform belongs to POP_IN */}
            <div
                className={`flex items-center gap-2 ${seen ? '' : 'agent-bounce'}`}
            >
                {!seen && (
                    <button
                        onClick={open}
                        className='text-[11px] px-2 py-1'
                        style={{
                            background: 'var(--window-bg)',
                            color: 'var(--text-primary)',
                            border: '2px solid var(--window-border)',
                            boxShadow: '2px 2px 0 var(--window-border)',
                            fontFamily: '"Fira Code", Consolas, monospace',
                            cursor: 'pointer',
                            whiteSpace: 'nowrap',
                        }}
                    >
                        <span style={{ color: 'var(--accent)' }}>new:</span> ask
                        my AI
                    </button>
                )}
                <button
                    onClick={open}
                    aria-label='Open agent.sh, the AI agent'
                    title='agent.sh'
                    className='gear-btn'
                    style={{
                        width: 52,
                        height: 52,
                        padding: 0,
                        border: 'none',
                        background: 'transparent',
                        cursor: 'pointer',
                    }}
                >
                    <span className='agent-screen block w-full h-full'>
                        <LauncherIcon />
                    </span>
                </button>
            </div>
        </motion.div>
    );
}

/**
 * agent.sh: a chat window that floats above the canvas, bottom-right, and
 * folds down into a launcher there. It is not a graph node, but the model's
 * actions open and focus nodes for the visitor. The conversation survives
 * minimising but lives only in memory; a reload starts fresh.
 */
export function AgentTerminal() {
    const open = useUiStore((s) => s.agentOpen);
    const close = useUiStore((s) => s.closeAgent);
    const toggle = useUiStore((s) => s.toggleAgent);
    const [lines, setLines] = useState<Line[]>([]);
    // Opening agent.sh from anywhere (launcher, header, about.md) settles it
    const [seen, setSeen] = useState(() => readStored(SEEN_KEY) === '1');
    const [pos, setPos] = useState({ x: 0, y: 0 });
    const [size, setSize] = useState({ w: WIDTH, h: HEIGHT });

    // Opens in the bottom-right corner, sized down to fit small screens.
    // A layout effect, so the first painted frame is already the final size
    // and place — no flash of the default size before it jumps down
    useLayoutEffect(() => {
        if (!open) return;
        writeStored(SEEN_KEY, '1');
        setSeen(true);
        const w = Math.min(WIDTH, window.innerWidth - EDGE_GAP * 2);
        const h = Math.min(HEIGHT, Math.round(window.innerHeight * 0.5));
        setSize({ w, h });
        setPos({
            x: window.innerWidth - w - EDGE_GAP,
            y: window.innerHeight - h - EDGE_GAP,
        });
    }, [open]);

    useEffect(() => {
        if (!open) return;
        function onKey(e: KeyboardEvent) {
            if (e.key === 'Escape') close();
        }
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [open, close]);

    const bind = useDrag(({ delta: [dx, dy] }) => {
        setPos((p) => ({
            x: Math.min(
                window.innerWidth - 60,
                Math.max(-size.w + 60, p.x + dx),
            ),
            y: Math.min(window.innerHeight - 40, Math.max(TOP, p.y + dy)),
        }));
    });

    return (
        <AnimatePresence>
            {!open && <AgentLauncher seen={seen} onOpen={toggle} />}
            {open && (
                <motion.div
                    key='agent-terminal'
                    {...POP_IN}
                    className='fixed'
                    style={{
                        left: pos.x,
                        top: pos.y,
                        width: size.w,
                        height: size.h,
                        zIndex: 36,
                        transformOrigin: 'bottom right',
                    }}
                    onPointerDown={(e) => e.stopPropagation()}
                >
                    <RetroWindow
                        title='agent.sh'
                        style={{ height: '100%' }}
                        titleBarRight={
                            <button
                                onClick={close}
                                className='w-4 h-4 flex items-center justify-center text-[10px] font-bold'
                                style={{
                                    border: '1.5px solid var(--window-border)',
                                    background: 'var(--window-bg)',
                                    color: 'var(--text-primary)',
                                    cursor: 'pointer',
                                    lineHeight: 1,
                                    position: 'relative',
                                    zIndex: 1,
                                }}
                                aria-label='Minimise agent.sh'
                                title='Minimise'
                            >
                                –
                            </button>
                        }
                    >
                        <div
                            className='absolute top-0 h-7 cursor-move'
                            style={{ left: 0, right: 34, touchAction: 'none' }}
                            {...bind()}
                        />
                        {/* Title bar is 28px and the frame 2px each side */}
                        <AgentBody
                            height={size.h - 32}
                            lines={lines}
                            setLines={setLines}
                        />
                    </RetroWindow>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
