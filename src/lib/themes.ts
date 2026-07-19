import type { ThemeDefinition, AccentColor } from '@/types'

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
      '--text-accent': 'var(--accent)',
      '--port-bg': '#ffffff',
      '--port-border': '#000000',
      '--wire-color': '#333333',
      '--wire-glow': 'none',
      '--scrollbar-bg': '#c9bdd6',
      '--scrollbar-thumb': '#888',
    },
  },
  {
    id: 'cga',
    label: 'CGA',
    vars: {
      '--bg': '#1a0030',
      '--bg-pattern': '#2d0050',
      '--window-bg': '#0a0018',
      '--window-border': '#ff00ff',
      '--window-shadow': '4px 4px 0px 0px #ff00ff',
      '--title-bar-bg': '#2d0050',
      '--title-bar-line': '#ff00ff',
      '--text-primary': '#00ffff',
      '--text-secondary': '#ff00ff',
      '--text-accent': 'var(--accent)',
      '--port-bg': '#1a0030',
      '--port-border': '#ff00ff',
      '--wire-color': '#ff00ff',
      '--wire-glow': '0 0 8px #ff00ff, 0 0 16px #ff00ff',
      '--scrollbar-bg': '#2d0050',
      '--scrollbar-thumb': '#ff00ff',
    },
  },
  {
    id: 'dos',
    label: 'DOS',
    vars: {
      '--bg': '#0000aa',
      '--bg-pattern': '#0000cc',
      '--window-bg': '#0000aa',
      '--window-border': '#aaaaaa',
      '--window-shadow': '4px 4px 0px 0px #000055',
      '--title-bar-bg': '#0000cc',
      '--title-bar-line': '#aaaaaa',
      '--text-primary': '#aaaaaa',
      '--text-secondary': '#ffffff',
      '--text-accent': 'var(--accent)',
      '--port-bg': '#0000aa',
      '--port-border': '#aaaaaa',
      '--wire-color': '#aaaaaa',
      '--wire-glow': 'none',
      '--scrollbar-bg': '#0000cc',
      '--scrollbar-thumb': '#aaaaaa',
    },
  },
  {
    id: 'term',
    label: 'Term',
    vars: {
      '--bg': '#0d1a0d',
      '--bg-pattern': '#142114',
      '--window-bg': '#0a140a',
      '--window-border': '#00ff41',
      '--window-shadow': '4px 4px 0px 0px #00ff41',
      '--title-bar-bg': '#142114',
      '--title-bar-line': '#00ff41',
      '--text-primary': '#00ff41',
      '--text-secondary': '#00cc33',
      '--text-accent': 'var(--accent)',
      '--port-bg': '#0d1a0d',
      '--port-border': '#00ff41',
      '--wire-color': '#00ff41',
      '--wire-glow': '0 0 6px #00ff41, 0 0 12px #00ff41',
      '--scrollbar-bg': '#142114',
      '--scrollbar-thumb': '#00ff41',
    },
  },
]

export const ACCENT_COLORS: AccentColor[] = [
  { id: 'rose', value: '#e05a6a' },
  { id: 'cyan', value: '#4fc0d0' },
  { id: 'amber', value: '#c8853a' },
  { id: 'teal', value: '#2e8a72' },
  { id: 'violet', value: '#7c5cbf' },
  { id: 'slate', value: '#6b7d8c' },
]

export function applyTheme(
  preset: ThemeDefinition,
  accentValue: string,
  wallpaper: string,
): void {
  const root = document.documentElement
  Object.entries(preset.vars).forEach(([key, value]) => {
    root.style.setProperty(key, value)
  })
  root.style.setProperty('--accent', accentValue)
  root.setAttribute('data-wallpaper', wallpaper)
  root.setAttribute('data-theme', preset.id)
}
