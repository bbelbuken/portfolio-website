import { type ReactNode } from 'react'

interface RetroWindowProps {
  title: string
  children: ReactNode
  className?: string
  style?: React.CSSProperties
  onClose?: () => void
  /** Extra content rendered in the title bar (e.g. close button override) */
  titleBarRight?: ReactNode
}

/**
 * Retro window frame: 2px solid border, hard box-shadow, striped title bar.
 * All colors read from CSS custom properties so theme switches are instant.
 */
export function RetroWindow({
  title,
  children,
  className = '',
  style,
  onClose,
  titleBarRight,
}: RetroWindowProps) {
  return (
    <div
      className={`flex flex-col ${className}`}
      style={{
        background: 'var(--window-bg)',
        border: '2px solid var(--window-border)',
        boxShadow: 'var(--window-shadow)',
        fontFamily: '"Fira Code", Consolas, monospace',
        ...style,
      }}
    >
      {/* Title bar */}
      <div
        className="flex items-center justify-between px-2 flex-shrink-0"
        style={{
          background: 'var(--title-bar-bg)',
          borderBottom: '2px solid var(--window-border)',
          height: 28,
          backgroundImage: `repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            var(--title-bar-line) 2px,
            var(--title-bar-line) 3px
          )`,
        }}
      >
        <span
          className="text-[11px] font-medium tracking-wide"
          style={{
            color: 'var(--text-primary)',
            background: 'var(--title-bar-bg)',
            padding: '0 6px',
            lineHeight: '28px',
          }}
        >
          {title}
        </span>
        {titleBarRight ?? (
          onClose ? (
            <button
              onClick={onClose}
              className="w-4 h-4 flex items-center justify-center text-[10px] font-bold"
              style={{
                border: '1.5px solid var(--window-border)',
                background: 'var(--window-bg)',
                color: 'var(--text-primary)',
                cursor: 'pointer',
                lineHeight: 1,
              }}
              aria-label="Close"
            >
              ×
            </button>
          ) : null
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">{children}</div>
    </div>
  )
}
