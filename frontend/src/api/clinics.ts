import { API_BASE_URL } from "./apiBase";

function normalize(u: string) {
  return u.replace(/([^:]\/)\/+/g, "$1");
}

/**
 * Busca lista de clínicas. Tenta /api/clinics (padrão) e, se 404, tenta /clinics.
 */
export async function fetchClinics(): Promise<any[]> {
  const primary = normalize(`${API_BASE_URL}/api/clinics`);
  const fallback = normalize(`${API_BASE_URL}/clinics`);

  let res = await fetch(primary);
  if (res.status === 404) {
    res = await fetch(fallback);
  }

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`Erro ao buscar clínicas: ${res.status} ${res.statusText} ${txt}`);
  }

  const data = await res.json();
  return Array.isArray(data) ? data : [];
}