import { supabase } from "../supabaseClient";
import { randomUUID } from "crypto";

// Bucket do Storage. Mantenha igual ao criado no Supabase.
const BUCKET = process.env.SUPABASE_STORAGE_BUCKET || "uploads";

/**
 * Faz upload de um buffer para o Supabase Storage.
 * Retorna apenas o caminho relativo salvo no bucket (ex.: "img-...uuid.png").
 * Usa upsert:true para evitar conflito de nome.
 */
export async function uploadImageFromBuffer(buffer: Buffer, mime: string): Promise<string> {
  const ext = (() => {
    const e = (mime || "").split("/")[1] || "png";
    return e.toLowerCase() === "jpeg" ? "jpg" : e.toLowerCase();
  })();

  const fileName = `img-${Date.now()}-${randomUUID()}.${ext}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(fileName, buffer, { contentType: mime || "image/*", upsert: true });

  if (error) throw error;

  return fileName;
}

/**
 * Recebe uma data URL (base64) "data:image/...;base64,..." e faz upload.
 * Retorna o caminho salvo no Storage.
 */
export async function uploadImageFromDataUrl(dataUrl: string): Promise<string> {
  const match = dataUrl.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
  if (!match) throw new Error("Data URL inválida");
  const mime = match[1];
  const b64 = match[2];
  const buf = Buffer.from(b64, "base64");
  return uploadImageFromBuffer(buf, mime);
}

/**
 * Remove uma imagem do bucket, recebendo um path relativo.
 * (Compatível com valores que venham com "uploads/<path>" ou apenas "<path>")
 */
export async function removeImage(path: string): Promise<void> {
  if (!path) return;

  let bucket = BUCKET;
  let filePath = path;

  const parts = path.split("/");
  if (parts.length > 1) {
    const maybeBucket = parts[0];
    const rest = parts.slice(1).join("/");
    if (maybeBucket === BUCKET) {
      filePath = rest;
    } else if (rest) {
      bucket = maybeBucket;
      filePath = rest;
    }
  }

  if (!filePath) return;
  await supabase.storage.from(bucket).remove([filePath]);
}
