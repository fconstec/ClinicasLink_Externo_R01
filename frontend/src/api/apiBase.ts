// (Mantém exatamente o que você já tinha; acrescentado apenas documentação)

const RAW = (process.env.REACT_APP_API_URL ?? "").trim();
const noTrailing = RAW.replace(/\/+$/, "");
const baseWithoutApi = noTrailing.replace(/\/api$/i, "");
const finalBase = baseWithoutApi || (process.env.NODE_ENV === "development" ? "http://localhost:3001" : "");
export const API_BASE_URL = finalBase;

/**
 * IMPORTANTE:
 * Rotas de Pacientes (listagem, CRUD, busca, sub-recursos) estão SEM prefixo /api:
 *   GET/POST   /patients
 *   GET/PUT    /patients/:id
 *   GET/PUT    /patients/:id/anamnese  (ou anamnese-tcle)   -> ver naming real
 *   GET        /patients/:id/procedures
 * Ajustar caso backend mude.
 */

export function apiUrl(path: string): string {
  let p = (path || "").trim();
  p = p.replace(/^\/+/, "");
  if (p.toLowerCase().startsWith("api/")) {
    p = p.slice(4);
  }
  const url = `${API_BASE_URL}/api/${p}`;
  return url.replace(/([^:]\/)\/+/g, "$1");
}

export function fileUrl(pathOrUrl: string | undefined | null): string {
  const v = (pathOrUrl ?? "").trim();
  if (!v) return "";
  if (/^(https?:|data:)/i.test(v)) return v;
  return `${API_BASE_URL}/${v.replace(/^\/+/, "")}`.replace(/([^:]\/)\/+/g, "$1");
}