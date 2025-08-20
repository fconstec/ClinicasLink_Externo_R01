// Compatível com Vite (import.meta.env) e também com CRA (process.env) em ambiente Node.
// Evita acessar process.env diretamente no runtime do browser.

const RAW_VITE = (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_API_URL) ?? "";
const RAW_PROCESS = typeof process !== "undefined" ? (process.env?.REACT_APP_API_URL ?? "") : "";
const RAW = (RAW_VITE || RAW_PROCESS).toString().trim();

const noTrailing = RAW.replace(/\/+$/, "");
const baseWithoutApi = noTrailing.replace(/\/api$/i, "");
const finalBase = baseWithoutApi || (typeof process !== "undefined" && process.env?.NODE_ENV === "development" ? "http://localhost:3001" : "");

/**
 * A URL base usada pela aplicação frontend para acessar a API.
 * - Em Vite coloque VITE_API_URL no arquivo .env
 * - Em CRA o fallback é REACT_APP_API_URL
 */
export const API_BASE_URL = finalBase;

/**
 * Monta URL para chamadas de API. Recebe um path relativo (com ou sem /api) e normaliza.
 */
export function apiUrl(path: string): string {
  let p = (path || "").toString().trim();
  p = p.replace(/^\/+/, "");
  if (p.toLowerCase().startsWith("api/")) {
    p = p.slice(4);
  }
  const url = `${API_BASE_URL}/api/${p}`;
  return url.replace(/([^:]\/)\/+/g, "$1");
}

/**
 * Monta URL a partir de um path relativo ou de uma URL absoluta.
 * Em produção o API_BASE_URL deve apontar para o host que serve os arquivos estáticos/uploads.
 */
export function fileUrl(pathOrUrl: string | undefined | null): string {
  const v = (pathOrUrl ?? "").toString().trim();
  if (!v) return "";
  if (/^(https?:|data:)/i.test(v)) return v;
  return `${API_BASE_URL}/${v.replace(/^\/+/, "")}`.replace(/([^:]\/)\/+/g, "$1");
}