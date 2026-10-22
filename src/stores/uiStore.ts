import { create } from 'zustand'

interface UiStore {
  /** contact.sh terminal — floats above the canvas, outside the node graph */
  contactOpen: boolean
  toggleContact: () => void
  closeContact: () => void
}

export const useUiStore = create<UiStore>((set) => ({
  contactOpen: false,
  toggleContact: () => set((s) => ({ contactOpen: !s.contactOpen })),
  closeContact: () => set({ contactOpen: false }),
}))
