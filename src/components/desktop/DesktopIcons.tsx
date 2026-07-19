import { useGraphStore } from '@/stores/graphStore'

const ICONS = [
  { id: 'about', label: 'about.md', icon: '📄' },
  { id: 'code-branch', label: 'code.sh', icon: '⌨' },
  { id: 'audio-branch', label: 'audio.wav', icon: '♬' },
  { id: 'projects', label: 'projects', icon: '📁' },
]

/**
 * Left-side desktop shortcuts.
 * Clicking scrolls/centers the canvas on that node (future enhancement).
 * For now they serve as visual nav anchors matching the reference design.
 */
export function DesktopIcons() {
  const nodes = useGraphStore((s) => s.nodes)

  function handleClick(nodeId: string) {
    const node = nodes.find((n) => n.id === nodeId)
    if (!node) return
    // Future: pan canvas to node position
    const el = document.querySelector(`[data-node="${nodeId}"]`)
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  return (
    <div
      className="fixed left-2 z-30 flex flex-col gap-2"
      style={{ top: 48 }}
    >
      {ICONS.map((icon) => (
        <button
          key={icon.id}
          onClick={() => handleClick(icon.id)}
          className="flex flex-col items-center gap-0.5 p-1 w-14 group"
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            fontFamily: '"Fira Code", Consolas, monospace',
          }}
        >
          <div
            className="w-10 h-10 flex items-center justify-center text-xl"
            style={{
              border: '1px solid transparent',
            }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLElement).style.borderColor = 'var(--accent)')
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLElement).style.borderColor = 'transparent')
            }
          >
            {icon.icon}
          </div>
          <span
            className="text-[9px] text-center leading-tight"
            style={{ color: 'var(--text-folder)' }}
          >
            {icon.label}
          </span>
        </button>
      ))}
    </div>
  )
}
