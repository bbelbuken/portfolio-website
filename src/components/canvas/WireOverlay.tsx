import { useEffect, useRef, useState } from 'react';
import { useGraphStore } from '@/stores/graphStore';
import { cubicBezierPath } from '@/lib/bezier';
import { portCenter } from '@/lib/ports';
import { FRONT_WIRE_Z, WIRE_Z } from '@/lib/layers';
import { CanvasLayer } from './CanvasLayer';

const DANGER = '#ef4444';
// Red × cursor so intent is immediately obvious
const CUT_CURSOR = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20'%3E%3Cline x1='3' y1='3' x2='17' y2='17' stroke='%23ef4444' stroke-width='2.5' stroke-linecap='round'/%3E%3Cline x1='17' y1='3' x2='3' y2='17' stroke='%23ef4444' stroke-width='2.5' stroke-linecap='round'/%3E%3C/svg%3E") 10 10, crosshair`;

/**
 * Single SVG overlay for all wires.
 *
 * Wire paths are updated every animation frame by reading live DOM positions,
 * so they follow nodes during drags without any React re-renders.
 */
export function WireOverlay() {
    const wires = useGraphStore((s) => s.wires);
    const draftWire = useGraphStore((s) => s.draftWire);
    const removeWire = useGraphStore((s) => s.removeWire);
    const zOrder = useGraphStore((s) => s.zOrder);
    const frontNodeId = zOrder[zOrder.length - 1];
    const [hoveredWire, setHoveredWire] = useState<string | null>(null);

    // Wires touching the front-most node render above it; the rest below.
    const frontWires = wires.filter(
        (w) => w.fromNodeId === frontNodeId || w.toNodeId === frontNodeId,
    );
    const baseWires = wires.filter(
        (w) => w.fromNodeId !== frontNodeId && w.toNodeId !== frontNodeId,
    );

    const rootRef = useRef<HTMLDivElement>(null);

    // Keep refs always current — updated synchronously on every render
    const wiresRef = useRef(wires);
    const draftWireRef = useRef(draftWire);
    wiresRef.current = wires;
    draftWireRef.current = draftWire;

    useEffect(() => {
        let rafId: number;

        function tick() {
            const root = rootRef.current;
            if (root) {
                // Committed wires — update hit area and visible path
                for (const wire of wiresRef.current) {
                    const from = portCenter(wire.fromPortId);
                    const to = portCenter(wire.toPortId);
                    if (!from || !to) continue;
                    const d = cubicBezierPath(from.x, from.y, to.x, to.y);
                    root.querySelector<SVGPathElement>(
                        `[data-wire-hit="${wire.id}"]`,
                    )?.setAttribute('d', d);
                    root.querySelector<SVGPathElement>(
                        `[data-wire-vis="${wire.id}"]`,
                    )?.setAttribute('d', d);
                }

                // Draft wire — recompute "from" live so it follows the port if the node is dragged
                const draft = draftWireRef.current;
                const draftPath =
                    root.querySelector<SVGPathElement>('[data-wire-draft]');
                if (draft && draftPath) {
                    const from = portCenter(draft.fromPortId);
                    if (from) {
                        draftPath.setAttribute(
                            'd',
                            cubicBezierPath(
                                from.x,
                                from.y,
                                draft.toX,
                                draft.toY,
                            ),
                        );
                    }
                    draftPath.style.display = 'block';
                } else if (draftPath) {
                    draftPath.style.display = 'none';
                }
            }

            rafId = requestAnimationFrame(tick);
        }

        rafId = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(rafId);
    }, []); // runs once — data comes from refs updated on each render

    function renderWire(wire: { id: string }) {
        const hot = hoveredWire === wire.id;
        return (
            <g key={wire.id}>
                {/* Wide transparent hit area */}
                <path
                    data-wire-hit={wire.id}
                    fill='none'
                    stroke='transparent'
                    strokeWidth={14}
                    style={{
                        pointerEvents: 'stroke',
                        cursor: CUT_CURSOR,
                    }}
                    onPointerEnter={() => setHoveredWire(wire.id)}
                    onPointerLeave={() => setHoveredWire(null)}
                    onClick={() => {
                        setHoveredWire(null);
                        removeWire(wire.id);
                    }}
                />
                {/* Visible wire — turns red + glows on hover */}
                <path
                    data-wire-vis={wire.id}
                    fill='none'
                    stroke={hot ? DANGER : 'var(--wire-color)'}
                    strokeWidth={2}
                    strokeLinecap='round'
                    style={{
                        filter: hot
                            ? 'drop-shadow(0 0 4px rgba(146, 39, 39, 0.5))'
                            : 'var(--wire-glow)',
                        transition:
                            'stroke 0.12s, stroke-width 0.12s, filter 0.12s',
                        pointerEvents: 'none',
                    }}
                />
            </g>
        );
    }

    return (
        <div ref={rootRef} className='absolute inset-0'>
            {/* Wires not touching the front-most node — they pass behind it */}
            <CanvasLayer zIndex={WIRE_Z}>{baseWires.map(renderWire)}</CanvasLayer>

            {/* Wires attached to the front-most node — drawn on top of it */}
            <CanvasLayer zIndex={FRONT_WIRE_Z}>
                {frontWires.map(renderWire)}

                {/* Draft wire — always in DOM, shown/hidden by the RAF tick */}
                <path
                    data-wire-draft=''
                    fill='none'
                    stroke='var(--accent)'
                    strokeWidth={2}
                    strokeDasharray='6 4'
                    strokeLinecap='round'
                    opacity={0.85}
                    style={{
                        display: 'none',
                        filter: 'drop-shadow(0 0 4px var(--accent))',
                    }}
                />
            </CanvasLayer>
        </div>
    );
}
