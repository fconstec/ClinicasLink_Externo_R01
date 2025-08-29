import { fileUrl } from "@/api/apiBase";

// Obter SUPABASE_URL da env (Vite ou CRA)
const SUPABASE_URL =
  (typeof import.meta !== "undefined" && (import.meta as any).env?.VITE_SUPABASE_URL) ||
  (typeof process !== "undefined" && process.env?.REACT_APP_SUPABASE_URL) ||
  "";

// Bucket padrão usado pela aplicação
const DEFAULT_SUPABASE_BUCKET = "avatars";

/**
 * Resolve qualquer campo de imagem vindo do backend ou Storage.
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

  // Se parece com um path de Supabase "bucket/path/to/file"
  if (/^[a-z0-9_-]+\/.+/i.test(r)) {
    const parts = r.split("/");
    const bucket = parts[0] || DEFAULT_SUPABASE_BUCKET;
    const path = parts.slice(1).join("/");
    if (SUPABASE_URL) {
      return `${SUPABASE_URL.replace(/\/$/, "")}/storage/v1/object/public/${bucket}/${encodeURI(path)}`;
    }
  }

  // Backend local: /uploads/arquivo.png ou caminhos relativos
  if (r.startsWith("/uploads/")) return fileUrl(r);
  if (r.startsWith("/")) return fileUrl(r);
  if (r.startsWith("uploads/")) return fileUrl("/" + r);
  if (/\.[a-z0-9]{2,5}($|\?)/i.test(r)) return fileUrl("/uploads/" + r);

  return fileUrl("/" + r);
}

/**
 * Auxiliar de debug (opcional)
 */
export function debugResolveImage(src: any) {
  return { original: src, resolved: resolveImageUrl(src) };
}
