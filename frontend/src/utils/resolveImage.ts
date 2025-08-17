import { fileUrl } from "@/api/apiBase";

/**
 * Converte um valor (File | string | objeto com múltiplos campos) em uma URL exibível.
 * Suporta variações comuns vindas do backend.
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
    src.name, // pode ser apenas nome cru
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
  if (/^(https?:|data:|blob:)/i.test(r)) return r;

  // Caminhos absolutos
  if (r.startsWith("/uploads/")) return fileUrl(r);
  if (r.startsWith("/")) return fileUrl(r);

  // Caminho relativo indicando uploads
  if (r.startsWith("uploads/")) return fileUrl("/" + r);

  // Nome simples com extensão
  if (/\.[a-z0-9]{2,5}($|\?)/i.test(r)) return fileUrl("/uploads/" + r);

  // Último fallback: prefixa barra
  return fileUrl("/" + r);
}

/**
 * Auxiliar de debug (opcional)
 */
export function debugResolveImage(src: any) {
  return { original: src, resolved: resolveImageUrl(src) };
}