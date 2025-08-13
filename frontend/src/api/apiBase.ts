// Valor da env (pode vir com ou sem /api no final)
const RAW = (process.env.REACT_APP_API_URL ?? "").trim();

// Remove barras finais extras
const noTrailing = RAW.replace(/\/+$/, "");

// Remove um "/api" final, se houver
const baseWithoutApi = noTrailing.replace(/\/api$/i, "");

// Exporta SEM "/api" para manter compatibilidade com código legado que faz `${API_BASE_URL}/api/...`
export const API_BASE_URL = baseWithoutApi;

/**
 * Monta uma URL garantindo exatamente um "/api" no prefixo,
 * independentemente de como a env veio e mesmo que o path já contenha "/api".
 *
 * Ex.:
 *  apiUrl("/patients")        -> "<base>/api/patients"
 *  apiUrl("api/patients")     -> "<base>/api/patients"
 *  apiUrl("/api/patients")    -> "<base>/api/patients"
 */
export function apiUrl(path: string): string {
  let p = `${path || ""}`.trim();

  // Normaliza path: remove barras iniciais e prefixo "api/"
  p = p.replace(/^\/+/, "");
  if (p.toLowerCase().startsWith("api/")) {
    p = p.slice(4);
  }

  const url = `${API_BASE_URL}/api/${p}`;
  // Remove barras duplicadas no meio (sem tocar no protocolo)
  return url.replace(/([^:]\/)\/+/g, "$1");
}