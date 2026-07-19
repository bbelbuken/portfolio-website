import { useState } from 'react'
import { useThemeStore } from '@/stores/themeStore'
import { THEMES, ACCENT_COLORS } from '@/lib/themes'
import { RetroWindow } from '@/components/ui/RetroWindow'
import { RetroButton } from '@/components/ui/RetroButton'
import type { WallpaperPattern } from '@/types'

const WALLPAPER_OPTIONS: { id: WallpaperPattern; label: string }[] = [
  { id: 'dots', label: 'Dots' },
  { id: 'grid', label: 'Grid' },
  { id: 'plain', label: 'Plain' },
]

export function ThemeControl() {
  const [open, setOpen] = useState(false)
  const { preset, accent, wallpaper, setPreset, setAccent, setWallpaper } = useThemeStore()

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="text-[11px] px-2 py-0.5 transition-colors"
        style={{
          fontFamily: '"Fira Code", Consolas, monospace',
          color: 'var(--text-secondary)',
          border: '1px solid var(--window-border)',
          background: 'var(--window-bg)',
          cursor: 'pointer',
        }}
        title="Open theme control"
      >
        control.md
      </button>
    )
  }

  return (
    <div
      className="fixed z-50"
      style={{ top: 40, right: 16 }}
    >
      <RetroWindow
        title="control.md"
        onClose={() => setOpen(false)}
        style={{ width: 240 }}
      >
        <div
          className="p-4 space-y-4 text-[11px]"
          style={{ fontFamily: '"Fira Code", Consolas, monospace' }}
        >
          {/* Theme presets */}
          <section>
            <p
              className="uppercase tracking-widest text-[9px] mb-2"
              style={{ color: 'var(--text-secondary)' }}
            >
              Theme
            </p>
            <div className="flex gap-1 flex-wrap">
              {THEMES.map((t) => (
                <RetroButton
                  key={t.id}
                  active={preset === t.id}
                  onClick={() => setPreset(t.id)}
                >
                  {t.label}
                </RetroButton>
              ))}
            </div>
          </section>

          {/* Accent colors */}
          <section>
            <p
              className="uppercase tracking-widest text-[9px] mb-2"
              style={{ color: 'var(--text-secondary)' }}
            >
              Accent
            </p>
            <div className="flex gap-2">
              {ACCENT_COLORS.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setAccent(c.value)}
                  className="w-6 h-6 rounded-full flex-shrink-0 transition-transform"
                  style={{
                    background: c.value,
                    border: accent === c.value ? '2px solid var(--window-border)' : '2px solid transparent',
                    outline: accent === c.value ? '1px solid var(--accent)' : 'none',
                    cursor: 'pointer',
                    transform: accent === c.value ? 'scale(1.2)' : 'scale(1)',
                  }}
                  title={c.id}
                  aria-label={`Accent: ${c.id}`}
                />
              ))}
            </div>
          </section>

          {/* Wallpaper */}
          <section>
            <p
              className="uppercase tracking-widest text-[9px] mb-2"
              style={{ color: 'var(--text-secondary)' }}
            >
              Wallpaper
            </p>
            <div className="flex gap-1">
              {WALLPAPER_OPTIONS.map((w) => (
                <RetroButton
                  key={w.id}
                  active={wallpaper === w.id}
                  onClick={() => setWallpaper(w.id)}
                >
                  {w.label}
                </RetroButton>
              ))}
            </div>
          </section>

          {/* Note */}
          <p
            className="text-[9px] leading-relaxed pt-2"
            style={{
              color: 'var(--text-secondary)',
              borderTop: '1px solid var(--window-border)',
            }}
          >
            Note: These changes don&apos;t persist across sessions. Tap outside to close.
          </p>
          <p className="text-[9px]" style={{ color: 'var(--text-secondary)' }}>
            version v1.0.0
          </p>
        </div>
      </RetroWindow>
    </div>
  )
}
