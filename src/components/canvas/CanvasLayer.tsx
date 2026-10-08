import type { CSSProperties, ReactNode } from 'react';

/**
 * Half the size of the SVG viewport each canvas layer gets.
 * #canvas-content is a zero-sized anchor, and a zero-sized <svg> does not
 * paint anything outside its viewport even with overflow:visible — so each
 * layer spans a large box centred on the canvas origin instead, and shifts
 * its contents back so canvas coordinates still map 1:1.
 */
const OFFSET = 20000;

interface CanvasLayerProps {
    zIndex: number;
    children: ReactNode;
    style?: CSSProperties;
}

export function CanvasLayer({ zIndex, children, style }: CanvasLayerProps) {
    return (
        <svg
            className='absolute pointer-events-none overflow-visible'
            style={{
                left: -OFFSET,
                top: -OFFSET,
                width: OFFSET * 2,
                height: OFFSET * 2,
                willChange: 'transform',
                zIndex,
                ...style,
            }}
            aria-hidden='true'
        >
            <g transform={`translate(${OFFSET}, ${OFFSET})`}>{children}</g>
        </svg>
    );
}
