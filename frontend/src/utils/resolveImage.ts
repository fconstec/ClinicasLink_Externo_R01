import { fileUrl } from "@/api/apiBase";

// URL do Supabase do ambiente (CRA -> REACT_APP_*, Vite -> VITE_*)
const SUPABASE_URL =
  (typeof process !== "undefined" && (process.env as any)?.REACT_APP_SUPABASE_URL) ||
  (typeof import.meta !== "undefined" && (import.meta as any).env?.VITE_SUPABASE_URL) ||
  "";

// Bucket padrão
const BUCKET = "uploads";

/**
 * Converte qualquer valor (string/obj/File) em uma URL exibível.
 */
export function resolveImageUrl(src: any): string {
  if (!src) return "";

  // Pré-visualização local de File
  if (src instanceof File) return URL.createObjectURL(src);

  // String direta
  if (typeof src === "string") return buildFromRaw(src);

  // Tenta campos comuns vindos do backend
  const candidates = [
    src.url,
    src.fileUrl,
    src.photoUrl,
    src.photo,
    src.path,
    src.filePath,
    src.relativePath,
    src.fullPath,
    src.filename,
    src.fileName,
    src.name,
  ].filter(Boolean) as string[];

  for (const c of candidates) {
    const u = buildFromRaw(c);
    if (u) return u;
  }
  return "";
}

function buildFromRaw(raw: string): string {
  let r = (raw || "").trim();
  if (!r) return "";

  // já é URL completa
  if (/^(https?:|data:|blob:)/i.test(r)) return r;

  // Se temos SUPABASE_URL, sempre priorize ela
  if (SUPABASE_URL) {
    // normaliza: remove “/” inicial e “uploads/” duplicado
    r = r.replace(/^\/+/, "");
    r = r.replace(/^uploads\//, "");

    // Detecta bucket explícito (ex.: "avatars/arquivo.png")
    let bucket = BUCKET;
    let path = r;
    const m = r.match(/^([^/]+)\/(.+)/);
    if (m) {
      const maybeBucket = m[1];
      const rest = m[2];
      // Se veio com "avatars/..." ou "uploads/..." usa esse bucket
      if (["uploads", "avatars"].includes(maybeBucket)) {
        bucket = maybeBucket;
        path = rest;
      }
    }

    const base = SUPABASE_URL.replace(/\/+$/, "");
    return `${base}/storage/v1/object/public/${bucket}/${encodeURI(path)}`;
  }

  // Fallback DEV: serve pelo backend local
  if (r.startsWith("/")) return fileUrl(r);
  return fileUrl("/" + r);
}

// Auxiliar de debug (opcional)
export function debugResolveImage(src: any) {
  return { original: src, resolved: resolveImageUrl(src) };
}
