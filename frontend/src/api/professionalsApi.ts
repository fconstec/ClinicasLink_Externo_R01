import { buildApiUrl, defaultJsonHeaders } from "./apiPrefix";
import type {
  Professional,
  NewProfessionalData,
} from "../components/ClinicAdminPanel_Managers/types";
import { normalizeProfessional } from "@/utils/normalizeProfessional";

/* ============================================================
 * Helpers
 * ============================================================
 */

function toBool(val: any): boolean {
  if (typeof val === "boolean") return val;
  if (val === 1 || val === "1") return true;
  if (val === 0 || val === "0") return false;
  if (typeof val === "string") {
    const lowered = val.toLowerCase();
    if (lowered === "true") return true;
    if (lowered === "false") return false;
  }
  return !!val;
}

/**
 * Converte com segurança para string e aplica trim.
 */
function sTrim(val: unknown): string {
  return String(val ?? "").trim();
}

/**
 * Normaliza objeto cru vindo da API para Professional.
 */
function mapProfessional(raw: any): Professional {
  return normalizeProfessional(raw);
}

async function parseBody(res: Response): Promise<any> {
  const txt = await res.text().catch(() => "");
  if (!txt) return {};
  try {
    return JSON.parse(txt);
  } catch {
    return {};
  }
}

async function parseOrThrow<T = any>(
  res: Response,
  context: string
): Promise<T> {
  if (!res.ok) {
    const body = await parseBody(res);
    const msg =
      body?.error ||
      body?.message ||
      `[professionalsApi] ${context}: ${res.status} ${res.statusText}`;
    throw new Error(msg);
  }
  return (await parseBody(res)) as T;
}

function isDataUrlPhoto(v: unknown): v is string {
  return typeof v === "string" && /^data:image\/[a-zA-Z0-9.+-]+;base64,/.test(v);
}

function inferExtFromMime(mime: string): string {
  const m = mime.split("/")[1] || "png";
  return m.toLowerCase() === "jpeg" ? "jpg" : m.toLowerCase();
}

// ==== AJUSTE CARREGAMENTO DE IMAGEM PARA O BANCO SUPABASE ====
async function buildFormDataFromProfessional(
  data: Partial<NewProfessionalData & { active?: boolean }>,
  clinicId: number | string
): Promise<FormData> {
  const fd = new FormData();

  // Campos básicos, sempre stringificados
  if (data.name != null) fd.append("name", sTrim(data.name));
  if (data.specialty != null) fd.append("specialty", sTrim(data.specialty));
  if (data.email != null) fd.append("email", String(data.email ?? ""));
  if (data.phone != null) fd.append("phone", String(data.phone ?? ""));
  if ((data as any).resume != null) fd.append("resume", String((data as any).resume ?? ""));
  if ((data as any).color != null) fd.append("color", String((data as any).color ?? ""));
  if (data.available != null) fd.append("available", String(!!data.available));
  if ((data as any).active != null) fd.append("active", String(!!(data as any).active));

  // clinic_id para o Supabase
  fd.append("clinic_id", String((data as any).clinicId ?? clinicId));

  // Foto: campo 'photo' sempre enviado como string para o Supabase
  // Se for data URL, envia como arquivo para upload; se for string (nome/caminho), envia como texto
  if (isDataUrlPhoto((data as any).photo)) {
    const dataUrl = String((data as any).photo);
    const [meta] = dataUrl.split(",");
    const mimeMatch = meta.match(/^data:(.*?);base64$/i);
    const mime = mimeMatch?.[1] || "image/png";
    const ext = inferExtFromMime(mime);

    const blob = await (await fetch(dataUrl)).blob();
    const file = new File([blob], `photo.${ext}`, { type: mime });
    fd.append("photo", file);
  } else if (typeof (data as any).photo === "string" && String((data as any).photo).trim()) {
    fd.append("photo", String((data as any).photo).trim());
  }

  return fd;
}

/* ============================================================
 * API Functions
 * ============================================================
 */

export async function fetchProfessionals(
  clinicId?: number | string,
  opts?: { includeInactive?: boolean }
): Promise<Professional[]> {
  const url = await buildApiUrl(
    "professionals",
    clinicId
      ? {
          clinicId: String(clinicId),
          ...(opts?.includeInactive ? { showInactive: "true" } : {}),
        }
      : undefined
  );
  const res = await fetch(url);
  const data = await parseOrThrow<any[]>(res, "fetchProfessionals");
  return Array.isArray(data) ? data.map(mapProfessional) : [];
}

export async function addProfessional(
  data: NewProfessionalData
): Promise<Professional> {
  const url = await buildApiUrl("professionals");

  // Se houver nova foto (data URL), enviar multipart; caso contrário, JSON
  if (isDataUrlPhoto((data as any).photo)) {
    const fd = await buildFormDataFromProfessional(data, data.clinicId);
    const res = await fetch(url, { method: "POST", body: fd });
    const json = await parseOrThrow(res, "addProfessional[multipart]");
    return mapProfessional(json);
  } else {
    const payload = {
      ...data,
      name: sTrim(data.name),
      specialty: sTrim(data.specialty),
      clinic_id: data.clinicId, // campo do banco Supabase
      active: true,
      photo: typeof data.photo === "string" ? data.photo.trim() : "",
    };
    const res = await fetch(url, {
      method: "POST",
      headers: defaultJsonHeaders(),
      body: JSON.stringify(payload),
    });
    const json = await parseOrThrow(res, "addProfessional[json]");
    return mapProfessional(json);
  }
}

export async function updateProfessional(
  id: number,
  clinicId: number | string,
  data: Partial<NewProfessionalData & { active?: boolean }>
): Promise<Professional> {
  const url = await buildApiUrl(`professionals/${id}`, {
    clinicId: String(clinicId),
  });

  if (isDataUrlPhoto((data as any).photo)) {
    const fd = await buildFormDataFromProfessional(data, clinicId);
    const res = await fetch(url, { method: "PUT", body: fd });
    const json = await parseOrThrow(res, "updateProfessional[multipart]");
    return mapProfessional(json);
  } else {
    const payload: any = {
      ...data,
      name: data.name != null ? sTrim(data.name) : undefined,
      specialty: data.specialty != null ? sTrim(data.specialty) : undefined,
      clinic_id: (data as any).clinicId ?? clinicId, // campo do banco Supabase
      photo: typeof data.photo === "string" ? data.photo.trim() : "",
    };
    const res = await fetch(url, {
      method: "PUT",
      headers: defaultJsonHeaders(),
      body: JSON.stringify(payload),
    });
    const json = await parseOrThrow(res, "updateProfessional[json]");
    return mapProfessional(json);
  }
}

// Os demais métodos não precisam de ajuste para a coluna photo.

export async function deactivateProfessional(
  id: number,
  clinicId: number | string
): Promise<Professional> {
  const current = await fetchProfessionalById(id, clinicId).catch(() => null);

  const basePayload = current
    ? {
        name: current.name,
        specialty: current.specialty,
        photo: current.photo,
        available: current.available,
        email: current.email,
        phone: current.phone,
        resume: current.resume,
        color: current.color,
      }
    : {};

  return updateProfessional(id, clinicId, {
    ...basePayload,
    active: false,
  });
}

export async function reactivateProfessional(
  id: number,
  clinicId: number | string
): Promise<Professional> {
  const current = await fetchProfessionalById(id, clinicId).catch(() => null);

  const basePayload = current
    ? {
        name: current.name,
        specialty: current.specialty,
        photo: current.photo,
        available: current.available,
        email: current.email,
        phone: current.phone,
        resume: current.resume,
        color: current.color,
      }
    : {};

  return updateProfessional(id, clinicId, {
    ...basePayload,
    active: true,
  });
}

export async function fetchProfessionalById(
  id: number,
  clinicId: number | string
): Promise<Professional> {
  const list = await fetchProfessionals(clinicId, { includeInactive: true });
  const found = list.find((p) => p.id === id);
  if (!found) throw new Error("Profissional não encontrado");
  return found;
}

export async function deleteProfessional(
  id: number,
  clinicId: number | string
): Promise<void> {
  const url = await buildApiUrl(`professionals/${id}`, {
    clinicId: String(clinicId),
  });
  const res = await fetch(url, { method: "DELETE" });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(
      `[professionalsApi] deleteProfessional: ${res.status} ${res.statusText}${
        body ? " – " + body.slice(0, 300) : ""
      }`
    );
  }
}

export async function setProfessionalAvailability(
  id: number,
  clinicId: number | string,
  available: boolean
): Promise<Professional> {
  const current = await fetchProfessionalById(id, clinicId).catch(() => null);

  const basePayload = current
    ? {
        name: current.name,
        specialty: current.specialty,
        photo: current.photo,
        email: current.email,
        phone: current.phone,
        resume: current.resume,
        color: current.color,
        active: current.active,
      }
    : {};

  return updateProfessional(id, clinicId, {
    ...basePayload,
    available,
  });
}
