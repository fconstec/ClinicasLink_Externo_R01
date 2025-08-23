import { buildApiUrl, defaultJsonHeaders } from "./apiPrefix";
import type {
  Professional,
  NewProfessionalData,
} from "../components/ClinicAdminPanel_Managers/types";

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
 * Se você já possui uma função global para resolver imagem (ex.: resolveImageUrl),
 * substitua essa implementação.
 */
function resolveImageUrl(raw: string | undefined | null): string | undefined {
  if (!raw) return undefined;
  if (/^https?:\/\//.test(raw)) return raw;
  return `/uploads/${raw}`; // ajuste conforme seu backend/infra
}

/**
 * Normaliza objeto cru vindo da API para Professional.
 */
function mapProfessional(raw: any): Professional {
  const clinicIdRaw = raw?.clinic_id ?? raw?.clinicId ?? 0;
  const active = raw?.active === false ? false : true;
  const name = sTrim(raw?.name);

  return {
    id: Number(raw?.id),
    name,
    specialty: sTrim(raw?.specialty ?? raw?.speciality),
    photo: raw?.photo ? String(raw.photo) : "",
    available: toBool(raw?.available ?? raw?.isAvailable ?? true),
    clinic_id: Number(clinicIdRaw),
    clinicId: Number(clinicIdRaw),

    email: raw?.email != null ? String(raw.email) : "",
    phone: raw?.phone != null ? String(raw.phone) : "",
    resume: raw?.resume != null ? String(raw.resume) : "",
    color: raw?.color != null ? String(raw.color) : "",

    active,
    deleted_at: raw?.deleted_at ?? null,
    created_at: raw?.created_at,
    updated_at: raw?.updated_at,
    createdAt: raw?.createdAt ?? raw?.created_at,
    updatedAt: raw?.updatedAt ?? raw?.updated_at,

    // Os campos abaixo podem existir no seu tipo Professional; se não existirem, remova-os do retorno:
    isInactive: active === false || !!raw?.deleted_at,
    photoUrl: resolveImageUrl(raw?.photo),
    displayName: active === false ? `${name} (Inativo)` : name,
  } as Professional;
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

  // clinicId/clinic_id aceitos no backend
  fd.append("clinicId", String((data as any).clinicId ?? clinicId));

  // Foto: somente se vier data URL (nova imagem)
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
    // Foto já é um caminho/arquivo existente: mande como texto para manter
    fd.append("photo", String((data as any).photo).trim());
  }

  return fd;
}

/* ============================================================
 * API Functions
 * ============================================================
 */

/**
 * Lista de profissionais.
 * includeInactive = true retorna também ativos=false.
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

/**
 * Cria um profissional.
 */
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
      clinic_id: data.clinicId,
      active: true,
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

/**
 * Atualiza profissional (PUT completo).
 * Permite alterar active (soft delete / reativação) e available (disponibilidade).
 */
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
      clinic_id: (data as any).clinicId ?? clinicId,
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

/**
 * Soft delete: marca active=false.
 */
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

/**
 * Reativar (active=true).
 */
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

/**
 * Busca individual (fallback via listagem).
 */
export async function fetchProfessionalById(
  id: number,
  clinicId: number | string
): Promise<Professional> {
  const list = await fetchProfessionals(clinicId, { includeInactive: true });
  const found = list.find((p) => p.id === id);
  if (!found) throw new Error("Profissional não encontrado");
  return found;
}

/**
 * Hard delete (desencorajado para históricos).
 */
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

/**
 * Atualiza apenas disponibilidade (available).
 */
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