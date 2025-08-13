import { API_BASE_URL } from "./apiBase";

let detectedPrefix: "" | "/api" | null = null;
let pending: Promise<"" | "/api"> | null = null;

/**
 * Detecta se o backend exige prefixo /api. Usa HEAD e fallback GET.
 */
export async function detectApiPrefix(): Promise<"" | "/api"> {
  if (detectedPrefix) return detectedPrefix;
  if (pending) return pending;

  pending = (async () => {
    const base = API_BASE_URL.replace(/\/+$/, "");
    const testUrl = `${base}/api/patients`;
    try {
      let res = await fetch(testUrl, { method: "HEAD" });
      if (res.status !== 404) {
        detectedPrefix = "/api";
        return detectedPrefix;
      }
      // fallback GET (caso HEAD não seja suportado corretamente)
      res = await fetch(testUrl, { method: "GET" });
      if (res.status !== 404) {
        detectedPrefix = "/api";
        return detectedPrefix;
      }
    } catch {
      // ignore
    }
    detectedPrefix = "";
    return detectedPrefix;
  })();

  const result = await pending;
  pending = null;
  return result;
}

/**
 * Monta URL final unindo base + prefix + path.
 */
export async function buildApiUrl(
  path: string,
  params?: Record<string, string | number | undefined | null>
) {
  const prefix = await detectApiPrefix();
  const base = API_BASE_URL.replace(/\/+$/, "");
  const clean = path.replace(/^\/+/, "");
  const url = new URL(`${base}${prefix}${prefix && clean ? "/" : "/"}${clean}`);
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") {
        url.searchParams.set(k, String(v));
      }
    });
  }
  return url.toString();
}

/**
 * (Opcional) Central para headers padrão. Edite aqui se precisar de Authorization.
 */
export function defaultJsonHeaders(extra?: Record<string, string>) {
  const h: Record<string, string> = { "Content-Type": "application/json" };
  // Exemplo:
  // const token = localStorage.getItem("token");
  // if (token) h.Authorization = `Bearer ${token}`;
  return extra ? { ...h, ...extra } : h;
}