/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BACKEND_URL?: string;
  // Adicione outras variáveis de ambiente aqui, se necessário
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}