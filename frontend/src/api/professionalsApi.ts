import { buildApiUrl, defaultJsonHeaders } from "./apiPrefix";
import type {
  Professional,
  NewProfessionalData,
} from "../components/ClinicAdminPanel_Managers/types";

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
 * Normaliza objeto cru vindo da API para Professional.
 * Mantém sempre string nos campos obrigatórios.
 */
function mapProfessional(raw: any): Professional {
  const clinicIdRaw = raw.clinic_id ?? raw.clinicId ?? 0;
  return {
    id: Number(raw.id),
    name: String(raw.name ?? "").trim(),
    specialty: String(raw.specialty ?? raw.speciality ?? "").trim(),
    photo: raw.photo ? String(raw.photo) : "",
    available: toBool(raw.available ?? raw.isAvailable),
    clinic_id: Number(clinicIdRaw),
    // Campos opcionais
    clinicId: Number(clinicIdRaw),
    email: raw.email !== undefined && raw.email !== null ? String(raw.email) : "",
    phone: raw.phone !== undefined && raw.phone !== null ? String(raw.phone) : "",
    resume: raw.resume !== undefined && raw.resume !== null ? String(raw.resume) : "",
    color: raw.color !== undefined && raw.color !== null ? String(raw.color) : "",
  };
}

async function parseOrThrow<T = any>(res: Response, context: string): Promise<T> {
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(
      `[professionalsApi] ${context}: ${res.status} ${res.statusText}${
        body ? " – " + body.slice(0, 300) : ""
      }`
    );
  }
  // tentar json, fallback objeto vazio
  try {
    return (await res.json()) as T;
  } catch {
    return {} as T;
  }
}

/**
 * Lista de profissionais (clinicId opcional).
 * Aceita number | string para evitar erro de tipo.
 */
export async function fetchProfessionals(
  clinicId?: number | string
): Promise<Professional[]> {
  const url = await buildApiUrl(
    "professionals",
    clinicId ? { clinicId: String(clinicId) } : undefined
  );
  const res = await fetch(url);
  const data = await parseOrThrow<any>(res, "fetchProfessionals");
  return Array.isArray(data) ? data.map(mapProfessional) : [];
}

/**
 * Cria um profissional (POST).
 * Espera NewProfessionalData (clinicId em camelCase).
 */
export async function addProfessional(
  data: NewProfessionalData
): Promise<Professional> {
  const url = await buildApiUrl("professionals");
  // Backend pode esperar clinic_id; adicionamos.
  const payload = {
    ...data,
    clinic_id: data.clinicId,
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
 * Atualiza (PUT) profissional.
 * Agora aceita (id, clinicId, dataParcial). Campos ausentes não são apagados
 * se o backend suportar PUT parcial; se for PUT completo, garanta enviar todos
 * os campos preenchidos no chamador.
 */
export async function updateProfessional(
  id: number,
  clinicId: number | string,
  data: Partial<NewProfessionalData>
): Promise<Professional> {
  const url = await buildApiUrl(`professionals/${id}`, {
    clinicId: String(clinicId),
  });

  // Monta payload convertendo camelCase clinicId para clinic_id
  const payload: any = {
    ...data,
    clinic_id: data.clinicId ?? clinicId,
  };

  const res = await fetch(url, {
    method: "PUT", // troque para PATCH se seu backend suportar corretamente atualização parcial
    headers: defaultJsonHeaders(),
    body: JSON.stringify(payload),
  });
  const json = await parseOrThrow(res, "updateProfessional");
  return mapProfessional(json);
}

/**
 * Remove profissional.
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
 * Alterna disponibilidade (PATCH; fallback PUT se necessário).
 */
export async function toggleProfessionalAvailability(
  id: number,
  clinicId: number | string,
  available: boolean
): Promise<Professional> {
  const url = await buildApiUrl(`professionals/${id}/availability`, {
    clinicId: String(clinicId),
  });

  const body = JSON.stringify({ available });

  let res = await fetch(url, {
    method: "PATCH",
    headers: defaultJsonHeaders(),
    body,
  });

  if (res.status === 405) {
    res = await fetch(url, {
      method: "PUT",
      headers: defaultJsonHeaders(),
      body,
    });
  }

  const json = await parseOrThrow(res, "toggleProfessionalAvailability");
  return mapProfessional(json);
}