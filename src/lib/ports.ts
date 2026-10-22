/**
 * Convert an element's live viewport box into canvas-local coords.
 * getBoundingClientRect() already includes the CSS transform, so
 * (rect - canvasOrigin) / scale gives the correct local coordinate.
 */
function canvasRect(
    el: HTMLElement | null,
): { x: number; y: number; width: number; height: number } | null {
    if (!el) return null;
    const canvasContent = document.getElementById('canvas-content');
    if (!canvasContent) return null;
    const canvasBox = canvasContent.getBoundingClientRect();
    const box = el.getBoundingClientRect();
    const scale =
        new DOMMatrix(window.getComputedStyle(canvasContent).transform).a || 1;
    return {
        x: (box.left - canvasBox.left) / scale,
        y: (box.top - canvasBox.top) / scale,
        width: box.width / scale,
        height: box.height / scale,
    };
}

/** Center of a port, in canvas-local coords. */
export function portCenter(portId: string): { x: number; y: number } | null {
    const r = canvasRect(
        document.querySelector(`[data-port="${portId}"]`) as HTMLElement | null,
    );
    if (!r) return null;
    return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
}

/** A node's box, in canvas-local coords. */
export function nodeRect(nodeId: string) {
    return canvasRect(
        document.querySelector(`[data-node="${nodeId}"]`) as HTMLElement | null,
    );
}
