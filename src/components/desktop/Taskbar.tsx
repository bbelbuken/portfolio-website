import { useEffect, useState } from 'react'
import { ThemeControl } from './ThemeControl'

const NAV_LINKS = [
  { label: 'about', href: '#about' },
  { label: 'code', href: '#code' },
  { label: 'audio', href: '#audio' },
  { label: 'contact', href: '#contact' },
]

function Clock() {
  const [time, setTime] = useState('')

  useEffect(() => {
    const update = () => {
      const now = new Date()
      setTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      )
    }
    update()
    const id = setInterval(update, 10000)
    return () => clearInterval(id)
  }, [])

  return (
    <span
      className="text-[11px]"
      style={{ color: 'var(--text-secondary)', fontFamily: '"Fira Code", Consolas, monospace' }}
    >
      {time}
    </span>
  )
}

export function Taskbar() {
  return (
    <header
      className="fixed top-0 inset-x-0 z-40 flex items-center justify-between px-4"
      style={{
        height: 32,
        background: 'var(--title-bar-bg)',
        borderBottom: '2px solid var(--window-border)',
        fontFamily: '"Fira Code", Consolas, monospace',
      }}
    >
      {/* Left: system icon */}
      <div className="flex items-center gap-4">
        <span
          className="text-[13px] font-bold"
          style={{ color: 'var(--text-primary)' }}
        >
          ◈
        </span>
        <nav className="flex items-center gap-4">
          {NAV_LINKS.map((l) => (
            <a
              key={l.label}
              href={l.href}
              className="text-[11px] hover:underline"
              style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}
              onClick={(e) => e.preventDefault()}
            >
              {l.label}
            </a>
          ))}
        </nav>
      </div>

      {/* Right: clock + theme control button */}
      <div className="flex items-center gap-3">
        <Clock />
        <ThemeControl />
      </div>
    </header>
  )
}
