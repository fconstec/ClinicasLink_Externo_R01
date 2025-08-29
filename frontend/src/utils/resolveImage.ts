import { fileUrl } from "@/api/apiBase";

// URL do Supabase vinda do ambiente (CRA -> REACT_APP_*, Vite -> VITE_*)
const SUPABASE_URL =
  (typeof process !== "undefined" && (process.env as any)?.REACT_APP_SUPABASE_URL) ||
  (typeof import.meta !== "undefined" && (import.meta as any).env?.VITE_SUPABASE_URL) ||
  "";

// Bucket real usado no seu projeto (deve existir no Supabase e ser público)
const BUCKET = "uploads";

/**
 * Resolve qualquer campo de imagem vindo do backend ou Storage.
 * Aceita: File, data URL, caminho relativo, URL pública, etc.
 */
export function resolveImageUrl(src: any): string {
  if (!src) return "";
  if (src instanceof File) return URL.createObjectURL(src);
  if (typeof src === "string") return buildFromRaw(src);

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
  const r = (raw || "").trim();
  if (!r) return "";

  // Já é uma URL válida
  if (/^(https?:|data:|blob:)/i.test(r)) return r;

  // Já é uma URL pública do Supabase Storage
  if (/\/storage\/v1\/object\/public\//i.test(r)) {
    return r;
  }

  // Monta a URL pública a partir de um caminho salvo no banco
  if (SUPABASE_URL) {
    let bucket = BUCKET;
    let path = r;

    // Se vier algo como "uploads/algum/caminho.png" ou outro bucket:
    const match = r.match(/^([^/]+)\/(.+)/);
    if (match) {
      const maybeBucket = match[1];
      const rest = match[2];
      if (maybeBucket === bucket) {
        path = rest;
      } else {
        // Se vier prefixado com outro bucket, respeita esse bucket
        bucket = maybeBucket;
        path = rest;
      }
    }

    const cleanPath = path.replace(/^\//, "");
    return `${SUPABASE_URL.replace(/\/$/, "")}/storage/v1/object/public/${bucket}/${encodeURI(cleanPath)}`;
  }

  // Fallbacks locais (dev)
  if (r.startsWith("/uploads/")) return fileUrl(r);
  if (r.startsWith("/")) return fileUrl(r);
  if (r.startsWith("uploads/")) return fileUrl("/" + r);
  if (/\.[a-z0-9]{2,5}($|\?)/i.test(r)) return fileUrl("/uploads/" + r);

  return fileUrl("/" + r);
}

/** Auxiliar de debug (opcional) */
export function debugResolveImage(src: any) {
  return { original: src, resolved: resolveImageUrl(src) };
}
