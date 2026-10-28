import { useState } from 'react'
import type { NodeData } from '@/types'
import { mediaUrl, videoPoster, videosOf, type Video, type VideoCategory } from '@/lib/media'
import { NodeWindow } from './NodeWindow'
import { NodeSocket } from './NodeSocket'

interface VideoListNodeProps {
  node: NodeData
  category: VideoCategory
}

/** Waits before each retry of a failed poster */
const POSTER_RETRY_MS = [1000, 2500, 5000]

/**
 * Poster image that rides out short failures: a burst of requests can be
 * briefly rate-limited (r2.dev in particular), so a failed poster is tried
 * again a few times, and nothing shows until it has actually loaded — no
 * broken-image icon in the meantime.
 */
function Poster({ src }: { src: string }) {
  const [attempt, setAttempt] = useState(0)
  const [loaded, setLoaded] = useState(false)

  function retry() {
    if (attempt >= POSTER_RETRY_MS.length) return
    setTimeout(() => setAttempt((n) => n + 1), POSTER_RETRY_MS[attempt])
  }

  return (
    <img
      key={attempt}
      src={attempt ? `${src}${src.includes('?') ? '&' : '?'}retry=${attempt}` : src}
      alt=""
      draggable={false}
      onLoad={() => setLoaded(true)}
      onError={retry}
      className="absolute inset-0 w-full h-full object-cover transition-opacity"
      style={{ opacity: loaded ? 1 : 0 }}
    />
  )
}

function videoKey(v: Video) {
  return v.file ?? v.youtubeId ?? v.title
}

/** The player that replaces a poster once it is clicked */
function Player({ video }: { video: Video }) {
  if (video.youtubeId) {
    return (
      <iframe
        className="absolute inset-0 w-full h-full"
        src={`https://www.youtube-nocookie.com/embed/${video.youtubeId}?autoplay=1&rel=0`}
        title={video.title}
        style={{ border: 'none' }}
        allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
        allowFullScreen
      />
    )
  }
  if (!video.file) return null
  return (
    <video
      className="absolute inset-0 w-full h-full"
      src={mediaUrl(video.file)}
      poster={videoPoster(video)}
      controls
      autoPlay
      playsInline
      preload="none"
      style={{ background: '#000' }}
    />
  )
}

/**
 * Ads or fashion films. Each card shows only its poster until clicked, so
 * opening the window downloads no video at all.
 */
export function VideoListNode({ node, category }: VideoListNodeProps) {
  const [playing, setPlaying] = useState<string | null>(null)

  if (node.state === 'idle') return <NodeSocket node={node} />

  const videos = videosOf(category)

  return (
    <NodeWindow node={node} width={360}>
      <div
        className="space-y-4 text-[11px]"
        style={{ fontFamily: '"Fira Code", Consolas, monospace' }}
      >
        {videos.length === 0 && (
          <p style={{ color: 'var(--text-secondary)' }}>Nothing here yet.</p>
        )}

        {videos.map((v) => {
          const key = videoKey(v)
          const active = playing === key
          const poster = videoPoster(v)
          return (
            <div key={key} className="space-y-1">
              <div className="flex justify-between gap-2">
                <span className="truncate" style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                  {v.title}
                </span>
                <span className="flex-shrink-0" style={{ color: 'var(--text-secondary)' }}>
                  {[v.client, v.year].filter(Boolean).join(' · ')}
                </span>
              </div>
              <div
                className="relative w-full"
                style={{ paddingBottom: '56.25%', border: '2px solid var(--window-border)', background: 'var(--window-border)' }}
              >
                {active ? (
                  <Player video={v} />
                ) : (
                  // The poster sits beside the button, not inside it: iOS Safari
                  // does not stretch absolutely positioned children of a <button>
                  // over the card, which left posters blank and ▶ at the top
                  <>
                  {poster && <Poster src={poster} />}
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => setPlaying(key)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        setPlaying(key)
                      }
                    }}
                    onPointerDown={(e) => e.stopPropagation()}
                    className="group absolute inset-0 flex items-center justify-center"
                    style={{ cursor: 'pointer' }}
                    aria-label={`Play ${v.title}`}
                  >
                    <span
                      className="px-2 py-0.5 text-[12px] transition-transform group-hover:scale-110"
                      style={{
                        background: 'var(--window-bg)',
                        color: 'var(--accent)',
                        border: '2px solid var(--window-border)',
                        boxShadow: '2px 2px 0 var(--window-border)',
                      }}
                    >
                      ▶
                    </span>
                  </div>
                  </>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </NodeWindow>
  )
}
