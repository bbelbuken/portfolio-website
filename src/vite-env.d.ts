/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Where videos and posters are served from, e.g. https://media.example.com */
  readonly VITE_MEDIA_BASE?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
