import { fileUrl } from "@/api/apiBase";

/**
 * Aceita File, string ou objeto com diversos campos de caminho/url
 * e retorna uma URL utilizável no <img>.
 */
export function resolveImageUrl(
  src: File | string | (Record<string, any> & { url?: string }) | null | undefined
): string {
  if (!src) return "";
  if (src instanceof File) {
    return URL.createObjectURL(src);
  }
  if (typeof src === "string") {
    return buildFromRaw(src);
  }
  // Objeto: testar múltiplos campos.
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
    src.name, // às vezes backend devolve apenas name (cuidado: pode conflitar com File.name serializado)
  ].filter(Boolean) as string[];

  for (const c of candidates) {
    const u = buildFromRaw(c);
    if (u) return u;
  }
  return "";
}

function buildFromRaw(raw: string): string {
  if (!raw) return "";
  const r = raw.trim();
  if (!r) return "";
  if (/^(https?:|data:|blob:)/i.test(r)) return r;
  if (r.startsWith("/uploads/") || r.startsWith("/")) {
    return fileUrl(r.startsWith("/uploads/") || r.startsWith("/") ? r : "/" + r);
  }
  if (r.startsWith("uploads/")) return fileUrl("/" + r);
  // Heurística: se parece um nome de arquivo (tem extensão), prefixar /uploads/
  if (/\.[a-z0-9]{2,5}($|\?)/i.test(r)) {
    return fileUrl("/uploads/" + r);
  }
  return fileUrl("/" + r);
}