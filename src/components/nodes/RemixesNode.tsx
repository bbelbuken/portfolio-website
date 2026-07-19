import type { NodeData } from '@/types'
import { NodeWindow } from './NodeWindow'
import { NodeSocket } from './NodeSocket'

const REMIXES = [
  {
    title: 'Artist – Track (Your Remix)',
    year: '2024',
    spotifyId: '37i9dQZF1DXcBWIGoYBM5M',
  },
  {
    title: 'Artist 2 – Song (Your Remix)',
    year: '2023',
    spotifyId: '37i9dQZF1DX0XUsuxWHRQd',
  },
]

interface RemixesNodeProps {
  node: NodeData
}

export function RemixesNode({ node }: RemixesNodeProps) {
  if (node.state === 'idle') return <NodeSocket node={node} />

  return (
    <NodeWindow node={node} width={340}>
      <div
        className="space-y-3 text-[11px]"
        style={{ fontFamily: '"Fira Code", Consolas, monospace' }}
      >
        <p className="text-[10px] uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>
          // remixes.flac
        </p>
        {REMIXES.map((r) => (
          <div key={r.spotifyId} className="space-y-1">
            <div className="flex justify-between">
              <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                {r.title}
              </span>
              <span style={{ color: 'var(--text-secondary)' }}>{r.year}</span>
            </div>
            <iframe
              src={`https://open.spotify.com/embed/track/${r.spotifyId}?utm_source=generator&theme=0`}
              width="100%"
              height="80"
              style={{ border: 'none' }}
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
            />
          </div>
        ))}
      </div>
    </NodeWindow>
  )
}
