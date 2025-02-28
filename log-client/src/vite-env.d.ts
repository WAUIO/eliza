/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_WS_LOG_URL: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
