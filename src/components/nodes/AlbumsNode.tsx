import type { NodeData } from '@/types'
import { NodeWindow } from './NodeWindow'
import { NodeSocket } from './NodeSocket'

/**
 * Only mounts Spotify iframes when node.state === 'connected'.
 * Replace SPOTIFY_EMBED_IDS with your actual album IDs.
 */
const ALBUMS = [
  {
    title: 'Album Title 1',
    year: '2024',
    spotifyId: '37i9dQZF1DXcBWIGoYBM5M', // replace with real Spotify album ID
  },
  {
    title: 'Album Title 2',
    year: '2023',
    spotifyId: '37i9dQZF1DX0XUsuxWHRQd',
  },
]

interface AlbumsNodeProps {
  node: NodeData
}

export function AlbumsNode({ node }: AlbumsNodeProps) {
  if (node.state === 'idle') return <NodeSocket node={node} />

  return (
    <NodeWindow node={node} width={340}>
      <div
        className="space-y-3 text-[11px]"
        style={{ fontFamily: '"Fira Code", Consolas, monospace' }}
      >
        <p className="text-[10px] uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>
          // albums.wav
        </p>
        {ALBUMS.map((album) => (
          <div key={album.spotifyId} className="space-y-1">
            <div className="flex justify-between">
              <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                {album.title}
              </span>
              <span style={{ color: 'var(--text-secondary)' }}>{album.year}</span>
            </div>
            {/* Lazy-mounted only when connected */}
            <iframe
              src={`https://open.spotify.com/embed/album/${album.spotifyId}?utm_source=generator&theme=0`}
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
