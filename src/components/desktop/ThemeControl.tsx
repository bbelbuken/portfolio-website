import type { ReactNode } from 'react'
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

interface ThemeControlProps {
  icon?: ReactNode
}

export function ThemeControl({ icon }: ThemeControlProps) {
  // Fine-grained selectors — each subscription is independent so the window
  // state never resets when other theme fields change.
  const controlOpen = useThemeStore((s) => s.controlOpen)
  const setControlOpen = useThemeStore((s) => s.setControlOpen)
  const preset = useThemeStore((s) => s.preset)
  const accent = useThemeStore((s) => s.accent)
  const wallpaper = useThemeStore((s) => s.wallpaper)
  const setPreset = useThemeStore((s) => s.setPreset)
  const setAccent = useThemeStore((s) => s.setAccent)
  const setWallpaper = useThemeStore((s) => s.setWallpaper)

  return (
    <>
      {/* Trigger button — shows icon if provided, otherwise "control.md" text */}
      <button
        onClick={() => setControlOpen(true)}
        className="flex items-center justify-center"
        style={{
          width: 22,
          height: 22,
          color: 'var(--text-secondary)',
          border: '1.5px solid var(--window-border)',
          background: controlOpen ? 'var(--accent)' : 'var(--window-bg)',
          cursor: 'pointer',
          opacity: 1,
          padding: 0,
        }}
        title="control.md"
        aria-label="Open theme control"
      >
        {icon ?? (
          <span style={{ fontFamily: '"Fira Code", Consolas, monospace', fontSize: 10 }}>
            ⚙
          </span>
        )}
      </button>

      {controlOpen && (
        <>
          {/* Click-outside backdrop — covers full screen, closes on click */}
          <div
            className="fixed inset-0 z-40"
            onPointerDown={() => setControlOpen(false)}
          />

          {/* Control window — opens below the icon on the left side */}
          <div
            className="fixed z-50"
            style={{ top: 34, left: 8 }}
            onPointerDown={(e) => e.stopPropagation()}
          >
            <RetroWindow
              title="control.md"
              onClose={() => setControlOpen(false)}
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
                        className="w-6 h-6 rounded-full flex-shrink-0"
                        style={{
                          background: c.value,
                          border:
                            accent === c.value
                              ? '2px solid var(--window-border)'
                              : '2px solid transparent',
                          outline:
                            accent === c.value
                              ? '2px solid var(--accent)'
                              : 'none',
                          outlineOffset: '1px',
                          cursor: 'pointer',
                          transform: accent === c.value ? 'scale(1.15)' : 'scale(1)',
                          transition: 'transform 0.1s',
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

                {/* Footer note */}
                <p
                  className="text-[9px] leading-relaxed pt-2"
                  style={{
                    color: 'var(--text-secondary)',
                    borderTop: '1px solid var(--window-border)',
                  }}
                >
                  Note: These changes don&apos;t persist across sessions. It would be too
                  strange to be welcomed by the CGA theme because past you accidentally
                  chose it for a laugh.
                </p>
                <p className="text-[9px]" style={{ color: 'var(--text-secondary)' }}>
                  version v1.0.0 / tap outside to close
                </p>
              </div>
            </RetroWindow>
          </div>
        </>
      )}
    </>
  )
}
