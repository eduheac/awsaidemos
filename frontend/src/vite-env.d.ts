/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_USER_POOL_ID: string;
  readonly VITE_USER_POOL_CLIENT_ID: string;
  readonly VITE_API_ENDPOINT: string;
  readonly VITE_FILES_BUCKET: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
