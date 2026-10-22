import { useEffect, useRef } from 'react';
import { useTutorialStore } from '@/hooks/useTutorial';
import { TUTORIAL_Z } from '@/lib/layers';
import { Hand, easeInOut } from './TutorialHand';

const PRESS_MS = 300; // both fingertips land close together
const SPREAD_MS = 1100; // they pull apart and the frame grows
const HOLD_MS = 500; // rest at full spread
const FADE_MS = 400; // fade out before looping
const CYCLE_MS = PRESS_MS + SPREAD_MS + HOLD_MS + FADE_MS;

const SIZE = { w: 260, h: 220 };
const START = 12; // fingertip offset from the centre, per axis
const END = 70;

/**
 * Step 3: two hands pinch outward from the middle of the canvas while a
 * dashed frame grows between their fingertips. Drawn in screen space so the
 * hint itself does not scale while the visitor zooms.
 */
export function ZoomHint() {
    const step = useTutorialStore((s) => s.step);

    const frameRef = useRef<SVGRectElement>(null);
    const leftRef = useRef<SVGGElement>(null);
    const rightRef = useRef<SVGGElement>(null);
    const groupRef = useRef<SVGGElement>(null);

    useEffect(() => {
        if (step !== 3) return;
        const reduced = window.matchMedia(
            '(prefers-reduced-motion: reduce)',
        ).matches;
        const cx = SIZE.w / 2;
        const cy = SIZE.h / 2;
        let rafId: number;
        const start = performance.now();

        function draw(now: number) {
            const t = reduced ? PRESS_MS + SPREAD_MS : (now - start) % CYCLE_MS;
            const pressed = t >= PRESS_MS * 0.6;
            const spread = easeInOut(
                Math.min(1, Math.max(0, (t - PRESS_MS) / SPREAD_MS)),
            );
            const d = START + (END - START) * spread;
            const fadeStart = PRESS_MS + SPREAD_MS + HOLD_MS;
            const opacity =
                t < fadeStart ? 1 : 1 - (t - fadeStart) / FADE_MS;

            const scale = pressed ? 1.5 : 1.7;
            // Fingertips sit on the frame's corners and point at the centre
            leftRef.current?.setAttribute(
                'transform',
                `translate(${cx - d}, ${cy - d}) rotate(135) scale(${scale})`,
            );
            rightRef.current?.setAttribute(
                'transform',
                `translate(${cx + d}, ${cy + d}) rotate(-45) scale(${scale})`,
            );

            const frame = frameRef.current;
            if (frame) {
                frame.setAttribute('x', `${cx - d}`);
                frame.setAttribute('y', `${cy - d}`);
                frame.setAttribute('width', `${d * 2}`);
                frame.setAttribute('height', `${d * 2}`);
                frame.style.opacity = pressed ? '0.9' : '0';
            }
            groupRef.current?.setAttribute('opacity', `${opacity}`);

            if (!reduced) rafId = requestAnimationFrame(draw);
        }

        rafId = requestAnimationFrame(draw);
        return () => cancelAnimationFrame(rafId);
    }, [step]);

    if (step !== 3) return null;

    return (
        <svg
            aria-hidden
            className='fixed pointer-events-none overflow-visible'
            width={SIZE.w}
            height={SIZE.h}
            style={{
                left: '50%',
                top: 'calc(32px + (100vh - 32px) / 2)',
                transform: 'translate(-50%, -50%)',
                zIndex: TUTORIAL_Z,
            }}
        >
            <g ref={groupRef}>
                <rect
                    ref={frameRef}
                    fill='none'
                    stroke='var(--accent)'
                    strokeWidth={2}
                    strokeDasharray='6 4'
                    style={{ filter: 'drop-shadow(0 0 4px var(--accent))' }}
                />
                <Hand handRef={leftRef} />
                <Hand handRef={rightRef} />
            </g>
        </svg>
    );
}
