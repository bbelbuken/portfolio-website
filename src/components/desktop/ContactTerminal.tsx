import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useDrag } from '@use-gesture/react';
import { RetroWindow } from '@/components/ui/RetroWindow';
import { POP_IN } from '@/lib/motion';
import { useUiStore } from '@/stores/uiStore';
import { EMAIL, LINKS } from '@/data/profile';

const LINE_MS = 160; // between printed lines
const WIDTH = 320;
const TOP = 34; // just under the header, like control.md
const CORNER_GAP = 8;

function prefersReducedMotion() {
    return (
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches
    );
}

/**
 * The terminal body: prints one link per line (the title bar already names
 * the command).
 * Mounted fresh on every open, so the little run replays each time.
 */
function TerminalBody() {
    const instant = prefersReducedMotion();
    const [printed, setPrinted] = useState(instant ? LINKS.length : 0);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (printed < LINKS.length) {
            const id = setTimeout(() => setPrinted(printed + 1), LINE_MS);
            return () => clearTimeout(id);
        }
    }, [printed]);

    async function copyEmail() {
        try {
            await navigator.clipboard.writeText(EMAIL);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        } catch {
            // Clipboard blocked — the mailto link still works
        }
    }

    return (
        <div className='p-3 space-y-1.5 text-[11px]'>
            {LINKS.slice(0, printed).map((l) => (
                <div key={l.label} className='flex items-center gap-2'>
                    <span
                        style={{ color: 'var(--text-secondary)', minWidth: 64 }}
                    >
                        {l.label}
                    </span>
                    <span style={{ color: 'var(--accent)' }}>{'→'}</span>
                    <a
                        href={l.href}
                        target='_blank'
                        rel='noopener noreferrer'
                        // No inline text-decoration: it would beat hover:underline
                        className='hover:underline truncate'
                        style={{ color: 'var(--text-primary)' }}
                    >
                        {l.value}
                    </a>
                    {l.label === 'cv' && (
                        <a
                            href={l.href}
                            download
                            aria-label='Download CV'
                            className='ml-auto shrink-0 whitespace-nowrap text-[10px] px-1 hover:underline'
                            style={{
                                border: '1px solid var(--window-border)',
                                color: 'var(--text-secondary)',
                                fontFamily: 'inherit',
                            }}
                        >
                            ↓ download
                        </a>
                    )}
                    {l.value === EMAIL && (
                        <button
                            onClick={copyEmail}
                            className='ml-auto text-[10px] px-1'
                            style={{
                                border: '1px solid var(--window-border)',
                                background: copied
                                    ? 'var(--accent)'
                                    : 'transparent',
                                color: copied
                                    ? 'var(--window-bg)'
                                    : 'var(--text-secondary)',
                                cursor: 'pointer',
                                fontFamily: 'inherit',
                            }}
                        >
                            {copied ? 'copied' : 'copy'}
                        </button>
                    )}
                </div>
            ))}

        </div>
    );
}

/**
 * contact.sh as a floating terminal window. It sits above the canvas and is
 * not part of the node graph, so opening it never moves the tutorial along.
 */
export function ContactTerminal() {
    const open = useUiStore((s) => s.contactOpen);
    const close = useUiStore((s) => s.closeContact);

    const [pos, setPos] = useState({ x: 0, y: 0 });

    // Opens in the top-right corner each time, mirroring control.md on the left
    useEffect(() => {
        if (!open) return;
        const width = Math.min(WIDTH, window.innerWidth - 32);
        setPos({ x: window.innerWidth - width - CORNER_GAP, y: TOP });
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
                Math.max(-WIDTH + 60, p.x + dx),
            ),
            y: Math.min(window.innerHeight - 40, Math.max(TOP, p.y + dy)),
        }));
    });

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    key='contact-terminal'
                    {...POP_IN}
                    className='fixed'
                    style={{
                        left: pos.x,
                        top: pos.y,
                        width: `min(${WIDTH}px, calc(100vw - 32px))`,
                        zIndex: 35,
                        transformOrigin: 'top right',
                    }}
                >
                    <RetroWindow title='contact.sh' onClose={close}>
                        {/* Draggable title bar — stops short of the close button */}
                        <div
                            className='absolute top-0 h-7 cursor-move'
                            style={{ left: 0, right: 34, touchAction: 'none' }}
                            {...bind()}
                        />
                        <TerminalBody />
                    </RetroWindow>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
