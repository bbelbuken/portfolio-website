import { useState } from 'react'
import type { NodeData } from '@/types'
import { releasesOf, spotifyEmbedUrl, type Release, type ReleaseKind } from '@/lib/media'
import { NodeWindow } from './NodeWindow'
import { NodeSocket } from './NodeSocket'

/** Albums first, then remixes, split by a divider */
const SECTIONS: { kind: ReleaseKind; label: string }[] = [
  { kind: 'album', label: 'albums' },
  { kind: 'remix', label: 'remixes' },
]

interface CoverCardProps {
  release: Release
  active: boolean
  onToggle: () => void
}

function CoverCard({ release: r, active, onToggle }: CoverCardProps) {
  return (
    <button
      onClick={onToggle}
      onPointerDown={(e) => e.stopPropagation()}
      className="group text-left"
      style={{ background: 'transparent', border: 'none', padding: 0, cursor: 'pointer' }}
      aria-pressed={active}
      aria-label={`${active ? 'Close' : 'Play'} ${r.title}`}
    >
      <div
        className="relative aspect-square overflow-hidden"
        style={{
          border: `2px solid ${active ? 'var(--accent)' : 'var(--window-border)'}`,
          background: 'var(--window-border)',
        }}
      >
        {r.cover && (
          <img
            src={r.cover}
            alt=""
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover"
            draggable={false}
          />
        )}
        <span
          className="absolute bottom-1 right-1 px-1 text-[10px] transition-opacity opacity-80 group-hover:opacity-100"
          style={{ background: 'var(--window-bg)', color: 'var(--accent)', border: '1px solid var(--window-border)' }}
        >
          {active ? '■' : '▶'}
        </span>
      </div>
      <p className="mt-1 truncate" style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
        {r.title}
      </p>
      {r.year && (
        <p className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>
          {r.year}
        </p>
      )}
    </button>
  )
}

interface TracksNodeProps {
  node: NodeData
}

/**
 * Albums and remixes as cover cards. Covers are our own copies, so the grid
 * looks the same whatever Spotify does; the Spotify player only loads for
 * the release someone actually plays, right under its section.
 */
export function TracksNode({ node }: TracksNodeProps) {
  const [playing, setPlaying] = useState<string | null>(null)

  if (node.state === 'idle') return <NodeSocket node={node} />

  const sections = SECTIONS.map((s) => ({ ...s, releases: releasesOf(s.kind) })).filter(
    (s) => s.releases.length > 0,
  )

  return (
    <NodeWindow node={node} width={340}>
      <div
        className="space-y-3 text-[11px]"
        style={{ fontFamily: '"Fira Code", Consolas, monospace' }}
      >
        {sections.length === 0 && (
          <p style={{ color: 'var(--text-secondary)' }}>Nothing here yet.</p>
        )}

        {sections.map((s, i) => {
          const current = s.releases.find((r) => r.spotifyUrl === playing)
          return (
            <section
              key={s.kind}
              className="space-y-2"
              style={i > 0 ? { borderTop: '1px solid var(--window-border)', paddingTop: 12 } : undefined}
            >
              <p className="text-[10px]" style={{ color: 'var(--accent)' }}>
                {s.label}
              </p>
              <div className="grid grid-cols-2 gap-3">
                {s.releases.map((r) => (
                  <CoverCard
                    key={r.spotifyUrl}
                    release={r}
                    active={r.spotifyUrl === playing}
                    onToggle={() => setPlaying(r.spotifyUrl === playing ? null : r.spotifyUrl)}
                  />
                ))}
              </div>
              {current && (
                <iframe
                  key={current.spotifyUrl}
                  src={spotifyEmbedUrl(current.spotifyUrl)}
                  title={current.title}
                  width="100%"
                  height="152"
                  style={{ border: 'none' }}
                  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                />
              )}
            </section>
          )
        })}
      </div>
    </NodeWindow>
  )
}
