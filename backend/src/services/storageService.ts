import { supabase } from "../supabaseClient";
import { randomUUID } from "crypto";

const BUCKET = process.env.SUPABASE_STORAGE_BUCKET || "avatars";

export async function uploadImageFromBuffer(buffer: Buffer, mime: string): Promise<string> {
  const ext = (() => {
    const e = mime.split("/")[1] || "png";
    return e === "jpeg" ? "jpg" : e;
  })();
  const fileName = `img-${Date.now()}-${randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from(BUCKET).upload(fileName, buffer, {
    contentType: mime,
    upsert: false,
  });
  if (error) throw error;
  return `${BUCKET}/${fileName}`;
}

export async function uploadImageFromDataUrl(dataUrl: string): Promise<string> {
  const match = dataUrl.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
  if (!match) throw new Error("Data URL inválida");
  const mime = match[1];
  const b64 = match[2];
  const buf = Buffer.from(b64, "base64");
  return uploadImageFromBuffer(buf, mime);
}

export async function removeImage(path: string): Promise<void> {
  const [bucket, ...rest] = path.split("/");
  const filePath = rest.join("/");
  if (!bucket || !filePath) return;
  await supabase.storage.from(bucket).remove([filePath]);
}
