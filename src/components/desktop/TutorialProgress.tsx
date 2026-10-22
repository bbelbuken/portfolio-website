import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useTutorialStore, type TutorialStep } from '@/hooks/useTutorial';

const STEPS: { n: 1 | 2 | 3; label: string }[] = [
    { n: 1, label: 'Pull a wire from about.md' },
    { n: 2, label: 'Drag the background or zoom' },
    { n: 3, label: 'Drag a window by its title' },
];

/** How long the finished bar stays up before it slides away */
const DONE_MS = 1600;

/** Mouse outline with a wheel that rolls down — hint for the zoom step */
function WheelGlyph() {
    return (
        <svg
            width='10'
            height='14'
            viewBox='0 0 10 14'
            aria-hidden
            style={{ flexShrink: 0 }}
        >
            <rect
                x='1'
                y='1'
                width='8'
                height='12'
                rx='4'
                fill='none'
                stroke='currentColor'
                strokeWidth='1.5'
            />
            <rect
                className='wheel-roll'
                x='4.25'
                y='3'
                width='1.5'
                height='3'
                fill='var(--accent)'
            />
        </svg>
    );
}

function Segment({ state }: { state: 'done' | 'active' | 'todo' }) {
    return (
        <span
            className={state === 'active' ? 'segment-pulse' : undefined}
            style={{
                display: 'block',
                width: 44,
                height: 8,
                border: '2px solid var(--window-border)',
                background:
                    state === 'todo' ? 'transparent' : 'var(--accent)',
                boxShadow:
                    state === 'todo'
                        ? 'none'
                        : '2px 2px 0 var(--window-border)',
            }}
        />
    );
}

/**
 * Small retro panel centred under the header while the first-run tutorial
 * runs: three segments fill in as each step is done.
 */
export function TutorialProgress() {
    const step = useTutorialStore((s) => s.step);
    const skip = useTutorialStore((s) => s.skip);

    // Only celebrate a finish that happened on this visit
    const startedDone = useRef(step === 'done');
    const [celebrating, setCelebrating] = useState(false);

    useEffect(() => {
        if (step !== 'done' || startedDone.current) return;
        setCelebrating(true);
        const id = setTimeout(() => setCelebrating(false), DONE_MS);
        return () => clearTimeout(id);
    }, [step]);

    const visible = step !== 'done' || celebrating;
    const current = STEPS.find((s) => s.n === step);

    function segmentState(n: number, s: TutorialStep) {
        if (s === 'done' || n < s) return 'done';
        return n === s ? 'active' : 'todo';
    }

    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    key='tutorial-progress'
                    role='status'
                    aria-live='polite'
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                    className='fixed left-1/2 z-30'
                    style={{
                        top: 40,
                        x: '-50%',
                        maxWidth: 'calc(100vw - 32px)',
                        background: 'var(--window-bg)',
                        border: '2px solid var(--window-border)',
                        boxShadow: 'var(--window-shadow)',
                        fontFamily: '"Fira Code", Consolas, monospace',
                        padding: '8px 12px',
                    }}
                >
                    <div className='flex items-center gap-3'>
                        <div className='flex gap-2'>
                            {STEPS.map((s) => (
                                <Segment
                                    key={s.n}
                                    state={segmentState(s.n, step)}
                                />
                            ))}
                        </div>
                        {step !== 'done' && (
                            <button
                                onClick={skip}
                                className='text-[10px] hover:underline'
                                style={{
                                    color: 'var(--text-secondary)',
                                    background: 'transparent',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontFamily: 'inherit',
                                    padding: 0,
                                }}
                            >
                                skip
                            </button>
                        )}
                    </div>

                    <div
                        className='flex items-center gap-2 mt-1.5 text-[11px]'
                        style={{ color: 'var(--text-primary)' }}
                    >
                        {current ? (
                            <>
                                <span style={{ color: 'var(--accent)' }}>
                                    {current.n}/3
                                </span>
                                <span className='truncate'>
                                    {current.label}
                                </span>
                                {current.n === 2 && <WheelGlyph />}
                            </>
                        ) : (
                            <>
                                <span style={{ color: 'var(--accent)' }}>✓</span>
                                <span>You're set. Look around.</span>
                            </>
                        )}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
