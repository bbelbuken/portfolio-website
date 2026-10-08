import { create } from 'zustand';
import type { ThemePreset, WallpaperPattern } from '@/types';
import { THEMES, ACCENT_COLORS, applyTheme } from '@/lib/themes';
import { readStored, writeStored } from '@/lib/storage';

const KEYS = {
    preset: 'portfolio:theme-preset',
    accent: 'portfolio:theme-accent',
    wallpaper: 'portfolio:theme-wallpaper',
};

function storedPreset(): ThemePreset {
    const value = readStored(KEYS.preset);
    return THEMES.some((t) => t.id === value)
        ? (value as ThemePreset)
        : 'mac';
}

function storedAccent(): string {
    const value = readStored(KEYS.accent);
    return ACCENT_COLORS.some((c) => c.value === value)
        ? (value as string)
        : ACCENT_COLORS[0].value;
}

function storedWallpaper(): WallpaperPattern {
    const value = readStored(KEYS.wallpaper);
    return value === 'dots' || value === 'grid' || value === 'plain'
        ? value
        : 'dots';
}

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
    preset: storedPreset(),
    accent: storedAccent(),
    wallpaper: storedWallpaper(),
    controlOpen: false,

    setPreset: (preset) => {
        const { accent, wallpaper } = get();
        const def = THEMES.find((t) => t.id === preset)!;
        applyTheme(def, accent, wallpaper);
        writeStored(KEYS.preset, preset);
        set({ preset });
    },

    setAccent: (accent) => {
        const { preset, wallpaper } = get();
        const def = THEMES.find((t) => t.id === preset)!;
        applyTheme(def, accent, wallpaper);
        writeStored(KEYS.accent, accent);
        set({ accent });
    },

    setWallpaper: (wallpaper) => {
        const { preset, accent } = get();
        const def = THEMES.find((t) => t.id === preset)!;
        applyTheme(def, accent, wallpaper);
        writeStored(KEYS.wallpaper, wallpaper);
        set({ wallpaper });
    },

    setControlOpen: (open) => set({ controlOpen: open }),

    initialize: () => {
        const { preset, accent, wallpaper } = get();
        const def = THEMES.find((t) => t.id === preset)!;
        applyTheme(def, accent, wallpaper);
    },
}));
