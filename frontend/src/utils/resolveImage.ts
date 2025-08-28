import { fileUrl } from "@/api/apiBase";

// Obter SUPABASE_URL da env (Vite ou CRA)
const SUPABASE_URL =
  (typeof import.meta !== "undefined" && (import.meta as any).env?.VITE_SUPABASE_URL) ||
  (typeof process !== "undefined" && process.env?.REACT_APP_SUPABASE_URL) ||
  "";

// Default bucket que decidimos usar (mude se o seu bucket tiver outro nome)
const DEFAULT_SUPABASE_BUCKET = "avatars";

/**
 * Resolve qualquer campo de imagem vindo do backend ou Supabase Storage.
 * Para fotos salvas pelo backend local, use /uploads/<nome>.
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

  // Já é uma URL válida (http(s), data, blob)
  if (/^(https?:|data:|blob:)/i.test(r)) return r;

  // Já é uma URL pública do Supabase Storage
  if (/\/storage\/v1\/object\/public\//i.test(r)) {
    return r;
  }

  // Se parece com um path de supabase "bucket/path/to/file" ou "avatars/..."
  if (/^[a-z0-9_-]+\/.+/i.test(r)) {
    const parts = r.split("/");
    const maybeBucket = parts[0];
    const bucket = maybeBucket === DEFAULT_SUPABASE_BUCKET ? maybeBucket : DEFAULT_SUPABASE_BUCKET;
    if (SUPABASE_URL) {
      const pathWithoutBucket = maybeBucket === bucket ? parts.slice(1).join("/") : r;
      const cleanPath = pathWithoutBucket.replace(/^\//, "");
      return `${SUPABASE_URL.replace(/\/$/, "")}/storage/v1/object/public/${bucket}/${encodeURI(cleanPath)}`;
    }
  }

  // Backend local: /uploads/arquivo.png
  if (r.startsWith("/uploads/")) return fileUrl(r);
  if (r.startsWith("/")) return fileUrl(r);

  // Caminho relativo indicando uploads
  if (r.startsWith("uploads/")) return fileUrl("/" + r);

  // Nome simples com extensão -> /uploads/filename
  if (/\.[a-z0-9]{2,5}($|\?)/i.test(r)) return fileUrl("/uploads/" + r);

  // Último fallback
  return fileUrl("/" + r);
}

/**
 * Auxiliar de debug (opcional)
 */
export function debugResolveImage(src: any) {
  return { original: src, resolved: resolveImageUrl(src) };
}
