import type { NodeData } from '@/types'
import { NodeWindow } from './NodeWindow'
import { NodeSocket } from './NodeSocket'

const VIDEOS = [
  {
    title: 'Brand Campaign 2024',
    client: 'Client Name',
    youtubeId: 'dQw4w9WgXcQ', // replace with real YouTube video ID
  },
  {
    title: 'Fashion Film – Summer',
    client: 'Label Name',
    youtubeId: 'dQw4w9WgXcQ',
  },
]

interface AdsNodeProps {
  node: NodeData
}

export function AdsNode({ node }: AdsNodeProps) {
  if (node.state === 'idle') return <NodeSocket node={node} />

  return (
    <NodeWindow node={node} width={360}>
      <div
        className="space-y-4 text-[11px]"
        style={{ fontFamily: '"Fira Code", Consolas, monospace' }}
      >
        <p className="text-[10px] uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>
          // ads/fashion.mp4
        </p>
        {VIDEOS.map((v) => (
          <div key={v.youtubeId + v.title} className="space-y-1">
            <div className="flex justify-between">
              <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{v.title}</span>
              <span style={{ color: 'var(--text-secondary)' }}>{v.client}</span>
            </div>
            {/* Lazy-mounted only when connected */}
            <div
              className="relative w-full"
              style={{ paddingBottom: '56.25%', border: '1px solid var(--window-border)' }}
            >
              <iframe
                className="absolute inset-0 w-full h-full"
                src={`https://www.youtube.com/embed/${v.youtubeId}`}
                title={v.title}
                style={{ border: 'none' }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                loading="lazy"
              />
            </div>
          </div>
        ))}
      </div>
    </NodeWindow>
  )
}
