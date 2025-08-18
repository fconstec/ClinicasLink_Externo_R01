import { buildApiUrl, defaultJsonHeaders } from "./apiPrefix";
import type {
  Professional,
  NewProfessionalData,
} from "../components/ClinicAdminPanel_Managers/types";

/* ============================================================
 * Helpers
 * ============================================================
 */

/**
 * Converte valores variados em booleano semântico.
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
  const clinicIdRaw = raw.clinic_id ?? raw.clinicId ?? 0;
  const active = raw.active === false ? false : true;
  const name = String(raw.name ?? "").trim();

  return {
    id: Number(raw.id),
    name,
    specialty: String(raw.specialty ?? raw.speciality ?? "").trim(),
    photo: raw.photo ? String(raw.photo) : "",
    available: toBool(raw.available ?? raw.isAvailable ?? true),
    clinic_id: Number(clinicIdRaw),
    clinicId: Number(clinicIdRaw),

    email: raw.email != null ? String(raw.email) : "",
    phone: raw.phone != null ? String(raw.phone) : "",
    resume: raw.resume != null ? String(raw.resume) : "",
    color: raw.color != null ? String(raw.color) : "",

    active,
    deleted_at: raw.deleted_at ?? null,
    created_at: raw.created_at,
    updated_at: raw.updated_at,
    createdAt: raw.createdAt ?? raw.created_at,
    updatedAt: raw.updatedAt ?? raw.updated_at,

    isInactive: active === false || !!raw.deleted_at,
    photoUrl: resolveImageUrl(raw.photo),
    displayName: active === false ? `${name} (Inativo)` : name,
  };
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
  const payload = {
    ...data,
    clinic_id: data.clinicId,
    active: true, // garantir explicitamente
  };
  const res = await fetch(url, {
    method: "POST",
    headers: defaultJsonHeaders(),
    body: JSON.stringify(payload),
  });
  const json = await parseOrThrow(res, "addProfessional");
  return mapProfessional(json);
}

/**
 * Atualiza profissional (PUT completo).
 * Se seu backend tratar parcial, ótimo; senão, envie todos os campos.
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

  const payload: any = {
    ...data,
    clinic_id: data.clinicId ?? clinicId,
  };

  const res = await fetch(url, {
    method: "PUT",
    headers: defaultJsonHeaders(),
    body: JSON.stringify(payload),
  });
  const json = await parseOrThrow(res, "updateProfessional");
  return mapProfessional(json);
}

/**
 * Soft delete: marca active=false.
 * (Preferível ao deleteProfessional para preservar histórico.)
 */
export async function deactivateProfessional(
  id: number,
  clinicId: number | string
): Promise<Professional> {
  // Para desativar corretamente, precisamos dos dados atuais para não sobrescrever com undefined
  // Caso a API exija PUT completo.
  // Se a API aceitar PUT parcial, basta enviar { active:false } + clinicId.
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
 * Busca individual (se precisar exibir formulário com dados atualizados).
 * Backend atual não mostrou GET /professionals/:id, então usamos fetch lista + find.
 * Se criar endpoint específico, substitua esta estratégia.
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
 * Mantenha apenas para limpar registros errados sem agendamentos.
 * No fluxo normal, prefira deactivateProfessional.
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
 * Atualiza apenas disponibilidade (available) reusando updateProfessional.
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