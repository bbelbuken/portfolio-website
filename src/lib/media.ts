import releases from '@/data/releases.json'
import videos from '@/data/videos.json'

/*
 * Music and video content for the audio branch. The entries live in
 * src/data/*.json so content can be edited without touching code.
 */

export type ReleaseKind = 'album' | 'remix'

export interface Release {
  kind: ReleaseKind
  title: string
  year: string
  /** open.spotify.com link to the album or track */
  spotifyUrl: string
  /** Local copy of the cover in public/covers/, e.g. /covers/my-album.jpg */
  cover?: string
}

export type VideoCategory = 'ads' | 'fashion' | 'documentary'

export interface Video {
  category: VideoCategory
  title: string
  client: string
  year: string
  /** Path inside the media bucket, e.g. ads/gap-2023.mp4 */
  file?: string
  /** Poster path inside the media bucket, e.g. ads/gap-2023.jpg */
  poster?: string
  /** For the few videos that stay on YouTube instead of the bucket */
  youtubeId?: string
}

/**
 * Videos and posters are served from the R2 bucket's custom domain in
 * production (VITE_MEDIA_BASE). Without it, files come from public/media/,
 * which is handy while developing.
 */
const MEDIA_BASE = (import.meta.env.VITE_MEDIA_BASE ?? '/media').replace(/\/$/, '')

export function mediaUrl(path: string): string {
  // Encode each segment so names with spaces or brackets still resolve
  const encoded = path.replace(/^\//, '').split('/').map(encodeURIComponent).join('/')
  return `${MEDIA_BASE}/${encoded}`
}

export const RELEASES = releases as Release[]
export const VIDEOS = videos as Video[]

export function releasesOf(kind: ReleaseKind): Release[] {
  return RELEASES.filter((r) => r.kind === kind)
}

export function videosOf(category: VideoCategory): Video[] {
  return VIDEOS.filter((v) => v.category === category)
}

/** open.spotify.com/album/ID → open.spotify.com/embed/album/ID */
export function spotifyEmbedUrl(url: string): string {
  const { pathname } = new URL(url)
  return `https://open.spotify.com/embed${pathname.replace(/^\/intl-[a-z]+/, '')}?utm_source=generator&theme=0`
}

export function videoPoster(v: Video): string | undefined {
  if (v.poster) return mediaUrl(v.poster)
  if (v.youtubeId) return `https://i.ytimg.com/vi/${v.youtubeId}/hqdefault.jpg`
  return undefined
}
