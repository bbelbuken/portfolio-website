import { create } from 'zustand';

interface CanvasStore {
    x: number;
    y: number;
    scale: number;
    setTransform: (x: number, y: number, scale: number) => void;
    /** Glides the camera to a node; set by the canvas once it is mounted */
    focusNode: (nodeId: string) => void;
    registerFocus: (fn: (nodeId: string) => void) => void;
}

export const useCanvasStore = create<CanvasStore>((set) => ({
    x: 0,
    y: 0,
    scale: 1,
    setTransform: (x, y, scale) => set({ x, y, scale }),
    focusNode: () => {},
    registerFocus: (fn) => set({ focusNode: fn }),
}));
