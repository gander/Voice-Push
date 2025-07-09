/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ENDPOINT_URL?: string
  readonly VITE_AUDIO_FORMAT?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}