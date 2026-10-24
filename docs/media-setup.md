# Media setup: Spotify + Cloudflare R2

Music plays from Spotify. Videos and their posters live in the Cloudflare R2
bucket `portfolio-medya`. The site reads them from `VITE_MEDIA_BASE`.

## Adding content

### Tracks (albums and remixes)

1. Save the cover as a square `.jpg` in `public/covers/`.
2. Add an entry to `src/data/releases.json`:

   ```json
   {
     "kind": "album",
     "title": "Swamped",
     "year": "",
     "spotifyUrl": "https://open.spotify.com/album/…",
     "cover": "/covers/swamped.jpg"
   }
   ```

   `kind` is `album` or `remix`; tracks.wav shows albums first, then remixes.
   Paste the Spotify link without the `?si=…` part.

### Videos (ads, fashion, documentary)

1. Export as **MP4, H.264 + AAC, "fast start" on**, at most 1080p and well
   under 512 MB (Cloudflare does not cache larger files). Save a `.jpg`
   poster with the same name.
2. Upload both to the bucket folder for its category: `Ads/`, `Fashion/` or
   `Documentary/`. Names are case-sensitive.
3. Add an entry to `src/data/videos.json` with the same paths:

   ```json
   {
     "category": "fashion",
     "title": "Vakko",
     "client": "Vakko",
     "year": "2024",
     "file": "Fashion/vakko.mp4",
     "poster": "Fashion/vakko.jpg"
   }
   ```

   `category` is `ads`, `fashion` or `documentary`. Empty `client`/`year`
   are simply not shown. A video that stays on YouTube takes a `youtubeId`
   instead of `file`/`poster`.

## Where the site reads from

`VITE_MEDIA_BASE=https://media.bbelbuken.com`, the bucket's custom domain:

- **Locally:** in `.env.local` (git-ignored). Restart `npm run dev` after
  changing it.
- **Live site:** in Cloudflare Pages → project → Settings → Environment
  variables. Changing it there needs a redeploy.

## Hosting

- Domain `bbelbuken.com`, registered with Cloudflare Registrar (auto-renew
  on), DNS on Cloudflare.
- Site on Cloudflare Pages, built from `main` (`npm run build` → `dist`,
  `NODE_VERSION=22`). Every push to `main` redeploys.
- Videos on `media.bbelbuken.com` → R2 bucket `portfolio-medya`.

## Already done

- Bucket created, files uploaded, default storage class Standard
  (Infrequent Access would charge per read).
- Budget alert at $1 under Manage account → Billing → Billable Usage.
- Custom domain `media.bbelbuken.com` connected to the bucket.

## Still to do (protection)

1. **Turn off r2.dev.** Bucket → Settings → Public Development URL →
   disable, so the custom domain is the only way in.
2. **Cache everything at the edge.** Caching → Cache Rules → create a rule
   for hostname `media.bbelbuken.com`: eligible for cache, edge TTL 1 month,
   cache key **ignores the query string**. Repeat views and cache-busting
   floods are then answered by Cloudflare's edge and never reach R2, so R2
   reads (the only billable operation) stay near one per file.
3. **Rate limit.** Security → WAF → Rate limiting rules (one is free):
   hostname `media.bbelbuken.com`, e.g. 300 requests per 10 seconds per IP,
   block for 10 seconds.

## Free-tier limits

| | Free per month | Now |
|---|---|---|
| Storage | 10 GB | ~0.35 GB |
| Class A (uploads, listing) | 1M | — |
| Class B (reads) | 10M | — |
| Egress | unlimited | — |

When replacing a file under the same name after step 4, purge it from the
cache (Caching → Configuration → Custom purge) or upload it under a new name.
