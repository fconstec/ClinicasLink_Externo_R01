import { supabase } from "../supabaseClient";
import { randomUUID } from "crypto";

// Bucket padrão para os uploads no Supabase. Pode ser sobrescrito via env.
const BUCKET = process.env.SUPABASE_STORAGE_BUCKET || "uploads";

// Faz upload do buffer diretamente no Storage e retorna apenas o caminho
// relativo dentro do bucket (ex: "img-123.png").
export async function uploadImageFromBuffer(buffer: Buffer, mime: string): Promise<string> {
  const ext = (() => {
    const e = mime.split("/")[1] || "png";
    return e === "jpeg" ? "jpg" : e;
  })();
  const fileName = `img-${Date.now()}-${randomUUID()}.${ext}`;
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(fileName, buffer, { contentType: mime, upsert: false });
  if (error) throw error;
  // Retornamos somente o caminho relativo dentro do bucket
  return fileName;
}

// Aceita Data URL (base64) e delega para uploadImageFromBuffer
export async function uploadImageFromDataUrl(dataUrl: string): Promise<string> {
  const match = dataUrl.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
  if (!match) throw new Error("Data URL inválida");
  const mime = match[1];
  const b64 = match[2];
  const buf = Buffer.from(b64, "base64");
  return uploadImageFromBuffer(buf, mime);
}

// Remove imagem do Storage. Suporta caminhos com ou sem nome do bucket.
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
