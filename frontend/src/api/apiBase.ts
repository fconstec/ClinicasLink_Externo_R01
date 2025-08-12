// Valor vindo da env (pode vir com ou sem /api)
const RAW = (process.env.REACT_APP_API_URL ?? "").trim();

// Remove barras finais
const noTrailing = RAW.replace(/\/+$/, "");

// Remove um /api final, se houver
const baseWithoutApi = noTrailing.replace(/\/api$/i, "");

// Exporta SEM /api (compatível com `${API_BASE_URL}/api/...` já existente no projeto)
export const API_BASE_URL = baseWithoutApi;

/**
 * Constrói URL garantindo exatamente um "/api" no prefixo, independentemente de como a env veio.
 * Aceita path com ou sem "/api" e com ou sem barra inicial.
 */
export function apiUrl(path: string): string {
  let p = `${path || ""}`.trim();

  // Remove prefixo /api do path, se passaram
  p = p.replace(/^\/+/, "");          // remove barras iniciais
  if (p.toLowerCase().startsWith("api/")) {
    p = p.slice(4); // remove "api/"
  }

  const url = `${API_BASE_URL}/api/${p}`;
  // Normaliza barras duplicadas (sem mexer no protocolo)
  return url.replace(/([^:]\/)\/+/g, "$1");
}