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

const HEADER_H = 32;
const BAR_H = 64; // tutorial progress bar under the header
const GRID = 24; // spacing of the candidate spots we try
const MARGIN = 8;

/**
 * Screen-space centre for the hint: the spot that overlaps the open windows
 * least, and among equally clear spots, the one nearest the middle.
 */
function findEmptySpot(): { x: number; y: number } {
    const nodes = Array.from(
        document.querySelectorAll<HTMLElement>('[data-node]'),
    ).map((el) => el.getBoundingClientRect());

    const minX = MARGIN + SIZE.w / 2;
    const maxX = window.innerWidth - MARGIN - SIZE.w / 2;
    const minY = HEADER_H + BAR_H + SIZE.h / 2;
    const maxY = window.innerHeight - MARGIN - SIZE.h / 2;
    const midX = window.innerWidth / 2;
    const midY = (HEADER_H + window.innerHeight) / 2;

    let best = { x: midX, y: midY };
    let bestScore = Infinity;

    for (let y = minY; y <= Math.max(minY, maxY); y += GRID) {
        for (let x = minX; x <= Math.max(minX, maxX); x += GRID) {
            const l = x - SIZE.w / 2;
            const t = y - SIZE.h / 2;
            let overlap = 0;
            for (const r of nodes) {
                const w = Math.min(l + SIZE.w, r.right) - Math.max(l, r.left);
                const h = Math.min(t + SIZE.h, r.bottom) - Math.max(t, r.top);
                if (w > 0 && h > 0) overlap += w * h;
            }
            // Any overlap outweighs distance from the middle
            const score = overlap * 100 + Math.hypot(x - midX, y - midY);
            if (score < bestScore) {
                bestScore = score;
                best = { x, y };
            }
        }
    }
    return best;
}

/**
 * Step 2: two hands pinch outward in an empty part of the screen while a
 * dashed frame grows between their fingertips. Drawn in screen space so the
 * hint itself does not scale while the visitor zooms.
 */
export function ZoomHint() {
    const step = useTutorialStore((s) => s.step);

    const frameRef = useRef<SVGRectElement>(null);
    const leftRef = useRef<SVGGElement>(null);
    const rightRef = useRef<SVGGElement>(null);
    const groupRef = useRef<SVGGElement>(null);
    const svgRef = useRef<SVGSVGElement>(null);

    useEffect(() => {
        if (step !== 2) return;
        const reduced = window.matchMedia(
            '(prefers-reduced-motion: reduce)',
        ).matches;
        const cx = SIZE.w / 2;
        const cy = SIZE.h / 2;
        let rafId: number;
        let cycle = -1;
        const start = performance.now();

        // Windows move and open while the hint loops, so pick the spot again
        // at the start of every loop
        function place() {
            const svg = svgRef.current;
            if (!svg) return;
            const spot = findEmptySpot();
            svg.style.left = `${spot.x}px`;
            svg.style.top = `${spot.y}px`;
            svg.style.visibility = 'visible';
        }

        function draw(now: number) {
            const n = Math.floor((now - start) / CYCLE_MS);
            if (n !== cycle) {
                cycle = n;
                place();
            }

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

    if (step !== 2) return null;

    return (
        <svg
            ref={svgRef}
            aria-hidden
            className='fixed pointer-events-none overflow-visible'
            width={SIZE.w}
            height={SIZE.h}
            style={{
                // Placed by findEmptySpot on the first frame
                visibility: 'hidden',
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
