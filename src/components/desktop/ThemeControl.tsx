import type { ReactNode } from 'react';
import { useThemeStore } from '@/stores/themeStore';
import { THEMES, ACCENT_COLORS } from '@/lib/themes';
import { AnimatePresence, motion } from 'framer-motion';
import { RetroWindow } from '@/components/ui/RetroWindow';
import { POP_IN } from '@/lib/motion';
import { useTickReveal } from '@/hooks/useTickReveal';
import { useUiStore } from '@/stores/uiStore';
import { HEADER_H } from './headerStyles';
import { RetroButton } from '@/components/ui/RetroButton';
import type { WallpaperPattern } from '@/types';

const WALLPAPER_OPTIONS: { id: WallpaperPattern; label: string }[] = [
    { id: 'dots', label: 'Dots' },
    { id: 'grid', label: 'Grid' },
    { id: 'plain', label: 'Plain' },
];

interface ThemeControlProps {
    icon?: ReactNode;
}

export function ThemeControl({ icon }: ThemeControlProps) {
    // Fine-grained selectors — each subscription is independent so the window
    // state never resets when other theme fields change.
    const controlOpen = useThemeStore((s) => s.controlOpen);
    const setControlOpen = useThemeStore((s) => s.setControlOpen);
    const setOpenMenu = useUiStore((s) => s.setOpenMenu);

    return (
        <>
            {/* Trigger button — shows icon if provided, otherwise "control.md" text */}
            <button
                onClick={() => {
                    // Opening one header window closes the others
                    setOpenMenu(null);
                    setControlOpen(!controlOpen);
                }}
                className='gear-btn flex items-center justify-center'
                data-open={controlOpen || undefined}
                style={{
                    width: 22,
                    height: 22,
                    color: controlOpen
                        ? 'var(--button-active-text)'
                        : 'var(--text-primary)',
                    border: '1.5px solid var(--window-border)',
                    background: controlOpen
                        ? 'var(--accent)'
                        : 'var(--window-bg)',
                    cursor: 'pointer',
                    opacity: 1,
                    padding: 0,
                }}
                title='control.md'
                aria-label='Open theme control'
            >
                <span className='gear-icon flex'>
                    {icon ?? (
                        <span
                            style={{
                                fontFamily: '"Fira Code", Consolas, monospace',
                                fontSize: 10,
                            }}
                        >
                            ⚙
                        </span>
                    )}
                </span>
            </button>

            {/* Click-outside backdrop — stops at the header so the other
                header items stay hoverable and clickable */}
            {controlOpen && (
                <div
                    className='fixed inset-x-0 bottom-0 z-40'
                    style={{ top: HEADER_H }}
                    onPointerDown={() => setControlOpen(false)}
                />
            )}

            <AnimatePresence>
                {controlOpen && (
                    // Control window — opens below the icon on the left side
                    <motion.div
                        key='control'
                        {...POP_IN}
                        className='fixed z-50'
                        style={{
                            top: 34,
                            left: 8,
                            transformOrigin: 'top left',
                        }}
                        onPointerDown={(e) => e.stopPropagation()}
                    >
                        <RetroWindow
                            title='control.md'
                            onClose={() => setControlOpen(false)}
                            style={{ width: 256 }}
                        >
                            <ControlBody />
                        </RetroWindow>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}

/** Theme, accent, wallpaper, then the footer note and version line */
const CONTROL_ROWS = 5;

/**
 * control.md's contents. Mounted fresh on every open, so the rows print top
 * to bottom one tick at a time, the same way contact.sh does.
 */
function ControlBody() {
    const preset = useThemeStore((s) => s.preset);
    const accent = useThemeStore((s) => s.accent);
    const wallpaper = useThemeStore((s) => s.wallpaper);
    const setPreset = useThemeStore((s) => s.setPreset);
    const setAccent = useThemeStore((s) => s.setAccent);
    const setWallpaper = useThemeStore((s) => s.setWallpaper);
    const shown = useTickReveal(CONTROL_ROWS);

    return (
        <div
            className='p-4 space-y-4 text-[11px]'
            style={{
                fontFamily: '"Fira Code", Consolas, monospace',
            }}
        >
            {/* Theme presets */}
            {shown > 0 && (
                <section>
                    <p
                        className='uppercase tracking-widest text-[9px] mb-2'
                        style={{
                            color: 'var(--text-secondary)',
                        }}
                    >
                        Theme
                    </p>
                    <div className='flex gap-1'>
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
            )}

            {/* Accent colors — Mac only */}
            {shown > 1 && (
                <section
                    style={{
                        opacity: preset !== 'mac' ? 0.3 : 1,
                        pointerEvents: preset !== 'mac' ? 'none' : 'auto',
                        transition: 'opacity 0.15s',
                    }}
                >
                    <p
                        className='uppercase tracking-widest text-[9px] mb-2'
                        style={{
                            color: 'var(--text-secondary)',
                        }}
                    >
                        {preset !== 'mac' ? 'Accent · mac only' : 'Accent'}
                    </p>
                    <div className='flex gap-2'>
                        {ACCENT_COLORS.map((c) => (
                            <button
                                key={c.id}
                                onClick={() => setAccent(c.value)}
                                className='w-6 h-6 rounded-full flex-shrink-0'
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
                                    transform:
                                        accent === c.value
                                            ? 'scale(1.15)'
                                            : 'scale(1)',
                                    transition: 'transform 0.1s',
                                }}
                                title={c.id}
                                aria-label={`Accent: ${c.id}`}
                            />
                        ))}
                    </div>
                </section>
            )}

            {/* Wallpaper */}
            {shown > 2 && (
                <section>
                    <p
                        className='uppercase tracking-widest text-[9px] mb-2'
                        style={{
                            color: 'var(--text-secondary)',
                        }}
                    >
                        Wallpaper
                    </p>
                    <div className='flex gap-1'>
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
            )}

            {/* Footer note */}
            {shown > 3 && (
                <p
                    className='text-[9px] leading-relaxed pt-2'
                    style={{
                        color: 'var(--text-secondary)',
                        borderTop: '1px solid var(--window-border)',
                    }}
                >
                    Note: These settings are remembered in your browser, so past
                    you gets to decide how future you is welcomed. Choose the
                    CGA theme responsibly.
                </p>
            )}
            {shown > 4 && (
                <p
                    className='text-[9px]'
                    style={{ color: 'var(--text-secondary)' }}
                >
                    version v1.0.0 / tap outside to close
                </p>
            )}
        </div>
    );
}
