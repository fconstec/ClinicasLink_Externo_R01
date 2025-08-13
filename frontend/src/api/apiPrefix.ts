import { API_BASE_URL } from "./apiBase";

let detectedPrefix: "" | "/api" | null = null;
let pending: Promise<"" | "/api"> | null = null;

const CANDIDATE_TEST_PATHS = [
  "patients",
  "services",
  "stock",
  "professionals",
];

async function probe(path: string): Promise<"api" | "root" | "none"> {
  const base = API_BASE_URL.replace(/\/+$/, "");
  // Testa /api/path
  try {
    let res = await fetch(`${base}/api/${path}`, { method: "HEAD" });
    if (res.status !== 404) return "api";
    // fallback GET
    res = await fetch(`${base}/api/${path}`, { method: "GET" });
    if (res.status !== 404) return "api";
  } catch { /* ignore */ }
  // Testa root
  try {
    let res = await fetch(`${base}/${path}`, { method: "HEAD" });
    if (res.status !== 404) return "root";
    res = await fetch(`${base}/${path}`, { method: "GET" });
    if (res.status !== 404) return "root";
  } catch { /* ignore */ }
  return "none";
}

/**
 * Detecta se deve usar /api. Testa vários endpoints candidatos até achar um existente.
 * Se achar mistura (ex.: patients só na raiz e stock só em /api) isso não cobre totalmente;
 * nesse caso use buildApiUrl com option.forceApi por recurso.
 */
export async function detectApiPrefix(): Promise<"" | "/api"> {
  if (detectedPrefix) return detectedPrefix;
  if (pending) return pending;

  pending = (async () => {
    for (const path of CANDIDATE_TEST_PATHS) {
      const r = await probe(path);
      if (r === "api") {
        detectedPrefix = "/api";
        return detectedPrefix;
      }
      if (r === "root") {
        // só decide root se ainda não encontrou nada; continua testando
        if (!detectedPrefix) detectedPrefix = "";
        // mas segue tentando outra rota que talvez esteja sob /api
      }
    }
    return detectedPrefix ?? "";
  })();

  const result = await pending;
  pending = null;
  return result;
}

interface BuildOptions {
  forceApi?: boolean;     // força usar /api mesmo se detecção geral não achou
  noPrefix?: boolean;     // força NÃO usar /api
}

/**
 * Monta URL com prefixo detectado, permitindo forçar /api ou raiz para casos mistos.
 */
export async function buildApiUrl(
  path: string,
  params?: Record<string, string | number | undefined | null>,
  options?: BuildOptions
) {
  const base = API_BASE_URL.replace(/\/+$/, "");
  let prefix: "" | "/api" = await detectApiPrefix();

  if (options?.forceApi) prefix = "/api";
  if (options?.noPrefix) prefix = "";

  const clean = path.replace(/^\/+/, "");
  const url = new URL(`${base}${prefix}${prefix ? "/" : "/"}${clean}`);
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") url.searchParams.set(k, String(v));
    });
  }
  return url.toString();
}

export function defaultJsonHeaders(extra?: Record<string, string>) {
  const h: Record<string, string> = { "Content-Type": "application/json" };
  return extra ? { ...h, ...extra } : h;
}