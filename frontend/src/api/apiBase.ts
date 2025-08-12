// Lê a base da API de variável de ambiente (sem obrigar formato)
const RAW = (process.env.REACT_APP_API_URL ?? "").trim();

// Remove barras finais extras
const baseNoTrailingSlash = RAW.replace(/\/+$/, "");

// Exporta a base crua (útil para debug)
export const API_BASE_URL = baseNoTrailingSlash || "";

/**
 * Monta uma URL garantindo exatamente um prefixo "/api".
 * Aceita path com ou sem "/api" e com ou sem barra inicial.
 *
 * Exemplos:
 * - apiUrl("/patients") => "<base>/api/patients"
 * - apiUrl("/api/patients") => "<base>/api/patients"
 * - base "<domínio>/api" também funciona sem duplicar.
 */
export function apiUrl(path: string): string {
  const base = API_BASE_URL;
  const hasApiOnBase = /\/api$/i.test(base);

  // Normaliza o path removendo prefixo /api se tiver
  let p = `/${(path || "").replace(/^\/+/, "")}`;
  if (p.toLowerCase().startsWith("/api/")) {
    p = p.slice(4); // remove "/api"
    if (!p.startsWith("/")) p = `/${p}`;
  }

  const prefix = hasApiOnBase ? base : `${base}/api`;
  // Evita barras duplicadas
  return `${prefix}${p}`.replace(/([^:]\/)\/+/g, "$1");
}