// Base da API para Vite. Remove dependência de process.env no runtime do navegador.
// Fonte: VITE_API_URL (Vercel/ambiente), com fallbacks seguros.

type AnyEnv = { [k: string]: any };

function readEnv(key: string): string | undefined {
  try {
    const env = (import.meta as AnyEnv)?.env as AnyEnv;
    const val = env?.[key];
    if (typeof val === "string") return val;
  } catch {
    /* ignore */
  }
  return undefined;
}

// 1) Preferir VITE_API_URL (defina em Vercel)
// 2) Opcional: window.__APP_API_URL (se você injeta via <script>)
// 3) Dev fallback: http://localhost:3001
// 4) Prod fallback: origin (somente se seu backend estiver no mesmo domínio)
const fromVite = (readEnv("VITE_API_URL") || "").trim();
const fromWindow =
  typeof window !== "undefined" && (window as any).__APP_API_URL
    ? String((window as any).__APP_API_URL).trim()
    : "";

let base = fromVite || fromWindow;

if (base.endsWith("/")) base = base.replace(/\/+$/, "");
// Garantir que não terminamos com /api: deixamos essa decisão para quem monta as rotas
if (/\/api$/i.test(base)) base = base.replace(/\/api$/i, "");

// Fallbacks
if (!base) {
  const isDev = readEnv("MODE") === "development" || readEnv("DEV") === "true";
  if (isDev) {
    base = "http://localhost:3001";
  } else if (typeof window !== "undefined" && window.location?.origin) {
    base = window.location.origin;
  } else {
    base = "";
  }
}

export const API_BASE_URL = base;

// Helpers compatíveis com código legado
export function apiUrl(path: string): string {
  let p = (path || "").trim().replace(/^\/+/, "");
  if (p.toLowerCase().startsWith("api/")) p = p.slice(4);
  const url = `${API_BASE_URL}/api/${p}`;
  return url.replace(/([^:]\/)\/+/g, "$1");
}

export function fileUrl(pathOrUrl: string | undefined | null): string {
  const v = (pathOrUrl ?? "").trim();
  if (!v) return "";
  if (/^(https?:|data:)/i.test(v)) return v;
  return `${API_BASE_URL}/${v.replace(/^\/+/, "")}`.replace(/([^:]\/)\/+/g, "$1");
}