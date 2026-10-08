/**
 * Convert a port element's live viewport position into canvas-local coords.
 * getBoundingClientRect() already includes the CSS transform, so
 * (portCenter - canvasOrigin) / scale gives the correct local coordinate.
 */
export function portCenter(portId: string): { x: number; y: number } | null {
    const el = document.querySelector(
        `[data-port="${portId}"]`,
    ) as HTMLElement | null;
    if (!el) return null;
    const canvasContent = document.getElementById('canvas-content');
    if (!canvasContent) return null;
    const canvasRect = canvasContent.getBoundingClientRect();
    const portRect = el.getBoundingClientRect();
    const scale =
        new DOMMatrix(window.getComputedStyle(canvasContent).transform).a || 1;
    return {
        x: (portRect.left + portRect.width / 2 - canvasRect.left) / scale,
        y: (portRect.top + portRect.height / 2 - canvasRect.top) / scale,
    };
}
