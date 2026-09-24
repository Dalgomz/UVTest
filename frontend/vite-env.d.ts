/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BACKEND_URL: string;
  readonly VITE_DEFAULT_APPNAME: string;
  readonly VITE_MAP_BOUNDS: string;
  readonly VITE_MAP_PADDING: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}