import type { ThemeDefinition, AccentColor } from '@/types';

export const THEMES: ThemeDefinition[] = [
    {
        id: 'mac',
        label: 'Mac',
        vars: {
            '--bg': '#e8e0ec',
            '--bg-pattern': '#c9bdd6',
            '--window-bg': '#f5f0f8',
            '--window-border': '#000000',
            '--window-shadow': '4px 4px 0px 0px #000000',
            '--title-bar-bg': '#c9bdd6',
            '--title-bar-line': '#a99ab8',
            '--text-primary': '#1a1a1a',
            '--text-secondary': '#555555',
            '--text-header': '#555555', // taskbar nav links, clock
            '--text-folder': '#333333', // desktop file/folder labels
            '--text-accent': 'var(--accent)',
            '--port-bg': '#ffffff',
            '--port-border': '#000000',
            '--wire-color': '#333333',
            '--wire-glow': 'none',
            '--scrollbar-bg': '#c9bdd6',
            '--scrollbar-thumb': '#888',
            '--button-active-bg': 'var(--accent)',
            '--button-active-text': '#ffffff',
        },
    },
    {
        id: 'cga',
        label: 'CGA',
        vars: {
            '--bg': '#0a0018',
            '--bg-pattern': '#00fff1',
            '--window-bg': '#0a0018',
            '--window-border': '#ff00ff',
            '--window-shadow': '4px 4px 0px 0px #ff00ff',
            '--title-bar-bg': '#1a0030',
            '--title-bar-line': '#aa00aa',
            '--text-primary': '#00ffff',
            '--text-secondary': '#cc44ff',
            '--text-header': '#00ffff', // nav links & clock: cyan
            '--text-folder': '#00ffff', // desktop labels: cyan
            '--accent': '#ff00ff',
            '--text-accent': '#ff00ff',
            '--port-bg': '#0a0018',
            '--port-border': '#ff00ff',
            '--wire-color': '#00fff1',
            '--wire-glow': '0 0 8px #ff00ff, 0 0 16px #ff00ff',
            '--scrollbar-bg': '#1a0030',
            '--scrollbar-thumb': '#ff00ff',
            '--button-active-bg': '#00ffff',
            '--button-active-text': '#0a0018',
        },
    },
    {
        id: 'dos',
        label: 'DOS',
        vars: {
            '--bg': '#0000aa',
            '--bg-pattern': '#3133cc',
            '--window-bg': '#0000aa',
            '--window-border': '#aaaaaa',
            '--window-shadow': '4px 4px 0px 0px #000066',
            '--title-bar-bg': '#0000cc',
            '--title-bar-line': '#5555aa',
            '--text-primary': '#ffffff',
            '--text-secondary': '#aaaaaa',
            '--text-header': '#ffffff', // nav links & clock: white
            '--text-folder': '#ffffff', // desktop labels: white
            '--accent': '#aaaaaa',
            '--text-accent': '#ffffff',
            '--port-bg': '#0000aa',
            '--port-border': '#aaaaaa',
            '--wire-color': '#aaaaaa',
            '--wire-glow': 'none',
            '--scrollbar-bg': '#0000cc',
            '--scrollbar-thumb': '#aaaaaa',
            '--button-active-bg': '#ffffff',
            '--button-active-text': '#0000aa',
        },
    },
    {
        id: 'term',
        label: 'Term',
        vars: {
            '--bg': '#0a140a',
            '--bg-pattern': '#00bb33',
            '--window-bg': '#081008',
            '--window-border': '#00ff41',
            '--window-shadow': '4px 4px 0px 0px #00ff41',
            '--title-bar-bg': '#0f1e0f',
            '--title-bar-line': '#00aa28',
            '--text-primary': '#00ff41',
            '--text-secondary': '#00cc33',
            '--text-header': '#00ff41', // nav links & clock: bright green
            '--text-folder': '#00ff41', // desktop labels: bright green
            '--accent': '#00ff41',
            '--text-accent': '#00ff41',
            '--port-bg': '#0a140a',
            '--port-border': '#00ff41',
            '--wire-color': '#00ff41',
            '--wire-glow': '0 0 6px #00ff41, 0 0 12px #00ff41',
            '--scrollbar-bg': '#0f1e0f',
            '--scrollbar-thumb': '#00ff41',
            '--button-active-bg': '#00ff41',
            '--button-active-text': '#081008',
        },
    },
];

export const ACCENT_COLORS: AccentColor[] = [
    { id: 'rose', value: '#e05a6a', macBg: '#f0e3e5', macBgPattern: '#d4bbbf' },
    { id: 'cyan', value: '#4fc0d0', macBg: '#e3eff1', macBgPattern: '#b8d4d8' },
    {
        id: 'amber',
        value: '#c8853a',
        macBg: '#f0ece3',
        macBgPattern: '#d4c4a8',
    },
    { id: 'teal', value: '#2e8a72', macBg: '#e3f0ec', macBgPattern: '#b8d4ca' },
    {
        id: 'violet',
        value: '#7c5cbf',
        macBg: '#ebe3f0',
        macBgPattern: '#c8b8d8',
    },
    {
        id: 'slate',
        value: '#6b7d8c',
        macBg: '#e3e9ee',
        macBgPattern: '#bec8d0',
    },
];

export function applyTheme(
    preset: ThemeDefinition,
    accentValue: string,
    wallpaper: string,
): void {
    const root = document.documentElement;

    // Apply all theme vars (non-Mac themes include --accent in their own vars)
    Object.entries(preset.vars).forEach(([key, value]) => {
        root.style.setProperty(key, value);
    });

    // Only Mac uses the user-selected accent + tinted backgrounds
    if (preset.id === 'mac') {
        root.style.setProperty('--accent', accentValue);
        const accentDef = ACCENT_COLORS.find((a) => a.value === accentValue);
        if (accentDef?.macBg) {
            root.style.setProperty('--bg', accentDef.macBg);
            root.style.setProperty(
                '--bg-pattern',
                accentDef.macBgPattern ?? accentDef.macBg,
            );
            root.style.setProperty(
                '--title-bar-bg',
                accentDef.macBgPattern ?? accentDef.macBg,
            );
            root.style.setProperty(
                '--scrollbar-bg',
                accentDef.macBgPattern ?? accentDef.macBg,
            );
        }
    }

    root.setAttribute('data-wallpaper', wallpaper);
    root.setAttribute('data-theme', preset.id);
}
