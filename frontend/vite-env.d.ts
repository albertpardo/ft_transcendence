/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BACKEND_URL: string; // or whatever env variables you use
	readonly VITE_API_BASE_URL: string;
 
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}