import { create } from 'zustand'

interface UiStore {
  /** contact.sh terminal — floats above the canvas, outside the node graph */
  contactOpen: boolean
  toggleContact: () => void
  closeContact: () => void
  /** Which header dropdown is open ('code' | 'audio'); one at a time */
  openMenu: string | null
  setOpenMenu: (menu: string | null) => void
}

export const useUiStore = create<UiStore>((set) => ({
  contactOpen: false,
  toggleContact: () => set((s) => ({ contactOpen: !s.contactOpen })),
  closeContact: () => set({ contactOpen: false }),
  openMenu: null,
  setOpenMenu: (menu) => set({ openMenu: menu }),
}))
