import { create } from 'zustand'

interface CanvasStore {
  x: number
  y: number
  scale: number
  setTransform: (x: number, y: number, scale: number) => void
}

export const useCanvasStore = create<CanvasStore>((set) => ({
  x: 0,
  y: 0,
  scale: 1,
  setTransform: (x, y, scale) => set({ x, y, scale }),
}))
