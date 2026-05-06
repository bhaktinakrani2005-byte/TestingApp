/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CONTACT_ID: string;
  readonly VITE_PUBLIC_BASE_URL: string;
  readonly VITE_BASE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
