import { create } from 'zustand';
import type { ThemePreset, WallpaperPattern } from '@/types';
import { THEMES, ACCENT_COLORS, applyTheme } from '@/lib/themes';

interface ThemeStore {
    preset: ThemePreset;
    accent: string;
    wallpaper: WallpaperPattern;
    controlOpen: boolean;
    setPreset: (preset: ThemePreset) => void;
    setAccent: (accent: string) => void;
    setWallpaper: (wallpaper: WallpaperPattern) => void;
    setControlOpen: (open: boolean) => void;
    initialize: () => void;
}

export const useThemeStore = create<ThemeStore>((set, get) => ({
    preset: 'mac',
    accent: ACCENT_COLORS[0].value,
    wallpaper: 'dots',
    controlOpen: false,

    setPreset: (preset) => {
        const { accent, wallpaper } = get();
        const def = THEMES.find((t) => t.id === preset)!;
        applyTheme(def, accent, wallpaper);
        set({ preset });
    },

    setAccent: (accent) => {
        const { preset, wallpaper } = get();
        const def = THEMES.find((t) => t.id === preset)!;
        applyTheme(def, accent, wallpaper);
        set({ accent });
    },

    setWallpaper: (wallpaper) => {
        const { preset, accent } = get();
        const def = THEMES.find((t) => t.id === preset)!;
        applyTheme(def, accent, wallpaper);
        set({ wallpaper });
    },

    setControlOpen: (open) => set({ controlOpen: open }),

    initialize: () => {
        const { preset, accent, wallpaper } = get();
        const def = THEMES.find((t) => t.id === preset)!;
        applyTheme(def, accent, wallpaper);
    },
}));
