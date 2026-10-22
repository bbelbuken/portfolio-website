import { useEffect, useRef } from 'react';
import { useGraphStore } from '@/stores/graphStore';
import {
    TUTORIAL_FROM_PORT,
    TUTORIAL_TO_PORT,
    useTutorialStore,
} from '@/hooks/useTutorial';
import { cubicBezierPath } from '@/lib/bezier';
import { nodeRect, portCenter } from '@/lib/ports';
import { TUTORIAL_Z } from '@/lib/layers';
import { CanvasLayer } from './CanvasLayer';
import { Hand, easeInOut } from './TutorialHand';

const DRAW_MS = 1600; // hand travels from port to port
const HOLD_MS = 700; // pause on the target before looping
const CYCLE_MS = DRAW_MS + HOLD_MS;

const PRESS_MS = 350; // hand grabs the title bar
const SLIDE_MS = 1100; // window outline travels with it
const REST_MS = 700; // pause at the end before looping
const DRAG_CYCLE_MS = PRESS_MS + SLIDE_MS + REST_MS;
const DRAG_DISTANCE = 80;

/** Canvas hints for steps 1 and 2; step 3 is ZoomHint, drawn in screen space */
export function TutorialOverlay() {
    const step = useTutorialStore((s) => s.step);
    if (step === 1) return <WireHint />;
    if (step === 2) return <DragHint />;
    return null;
}

/**
 * Step 1: a ghost wire that draws itself from about.md's CODE output to
 * code.branch's input, with a hand following the path.
 */
function WireHint() {
    const draftWire = useGraphStore((s) => s.draftWire);

    const pathRef = useRef<SVGPathElement>(null);
    const handRef = useRef<SVGGElement>(null);

    useEffect(() => {
        let rafId: number;
        const start = performance.now();

        function tick(now: number) {
            const path = pathRef.current;
            const hand = handRef.current;

            if (path && hand) {
                const from = portCenter(TUTORIAL_FROM_PORT);
                const to = portCenter(TUTORIAL_TO_PORT);

                if (from && to) {
                    path.setAttribute(
                        'd',
                        cubicBezierPath(from.x, from.y, to.x, to.y),
                    );

                    const length = path.getTotalLength();
                    const t = ((now - start) % CYCLE_MS) / DRAW_MS;
                    const progress = Math.min(1, t);

                    // Reveal the wire behind the hand
                    path.style.strokeDasharray = `${length}`;
                    path.style.strokeDashoffset = `${length * (1 - progress)}`;

                    const point = path.getPointAtLength(length * progress);
                    // Tap pulse while the hand rests on the target port
                    const tap =
                        1.3 +
                        (progress === 1
                            ? 0.25 * Math.abs(Math.sin((now - start) / 120))
                            : 0);
                    hand.setAttribute(
                        'transform',
                        `translate(${point.x}, ${point.y}) scale(${tap})`,
                    );
                }
            }

            rafId = requestAnimationFrame(tick);
        }

        rafId = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(rafId);
    }, []);

    return (
        // The wrapper gives the zero-sized canvas content a box to paint in,
        // the same way WireOverlay does
        <CanvasLayer
            zIndex={TUTORIAL_Z}
            style={{
                // Step aside while the user draws their own wire
                opacity: draftWire ? 0 : 1,
                transition: 'opacity 0.15s',
            }}
        >
            {/* Ghost wire */}
            <path
                ref={pathRef}
                fill='none'
                stroke='var(--accent)'
                strokeWidth={2}
                strokeLinecap='round'
                opacity={0.9}
                style={{ filter: 'drop-shadow(0 0 5px var(--accent))' }}
            />

            <Hand handRef={handRef} />
        </CanvasLayer>
    );
}

/**
 * Step 2: a hand grabs the first connected branch by its title bar and pulls
 * a dashed copy of the window sideways, showing that nodes can be moved.
 */
function DragHint() {
    const dragTarget = useTutorialStore((s) => s.dragTarget);

    const ghostRef = useRef<SVGRectElement>(null);
    const handRef = useRef<SVGGElement>(null);

    useEffect(() => {
        if (!dragTarget) return;
        let rafId: number;
        const start = performance.now();

        function tick(now: number) {
            const ghost = ghostRef.current;
            const hand = handRef.current;
            const rect = nodeRect(dragTarget!);

            if (ghost && hand && rect) {
                const t = (now - start) % DRAG_CYCLE_MS;
                const pressed = t >= PRESS_MS * 0.6;
                const slide = easeInOut(
                    Math.min(1, Math.max(0, (t - PRESS_MS) / SLIDE_MS)),
                );
                const dx = slide * DRAG_DISTANCE;

                ghost.setAttribute('x', `${rect.x + dx}`);
                ghost.setAttribute('y', `${rect.y}`);
                ghost.setAttribute('width', `${rect.width}`);
                ghost.setAttribute('height', `${rect.height}`);
                // The outline only shows once the window is "picked up"
                ghost.style.opacity = pressed ? '0.9' : '0';

                // Grab point: left part of the title bar
                const scale = pressed ? 1.15 : 1.35;
                hand.setAttribute(
                    'transform',
                    `translate(${rect.x + 36 + dx}, ${rect.y + 14}) scale(${scale})`,
                );
            }

            rafId = requestAnimationFrame(tick);
        }

        rafId = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(rafId);
    }, [dragTarget]);

    if (!dragTarget) return null;

    return (
        <CanvasLayer zIndex={TUTORIAL_Z}>
            <rect
                ref={ghostRef}
                fill='none'
                stroke='var(--accent)'
                strokeWidth={2}
                strokeDasharray='6 4'
                style={{
                    filter: 'drop-shadow(0 0 4px var(--accent))',
                    transition: 'opacity 0.15s',
                }}
            />
            <Hand handRef={handRef} />
        </CanvasLayer>
    );
}
