import { buildApiUrl, defaultJsonHeaders } from "./apiPrefix";
import type { Professional, NewProfessionalData } from "../components/ClinicAdminPanel_Managers/types";

/**
 * Normaliza objeto cru vindo da API em Professional.
 * Garante photo sempre string ("" se ausente) para satisfazer o tipo.
 */
function mapProfessional(raw: any): Professional {
  return {
    id: Number(raw.id),
    name: String(raw.name ?? "").trim(),
    specialty: String(raw.specialty ?? raw.speciality ?? ""),
    photo: raw.photo ? String(raw.photo) : "",           // <= sempre string
    available: Boolean(
      raw.available !== undefined ? raw.available : raw.isAvailable
    ),
    clinic_id: Number(raw.clinic_id ?? raw.clinicId ?? 0),
    email: raw.email ?? "",                               // se o tipo exigir string
    phone: raw.phone ?? "",                               // idem
    resume: raw.resume ?? "",                             // se no tipo for string; ajuste se for opcional
    color: raw.color ?? "",                               // idem
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
  return res.json().catch(() => ({} as T));
}

/**
 * Lista profissionais da clínica (clinicId opcional).
 */
export async function fetchProfessionals(clinicId?: string): Promise<Professional[]> {
  const url = await buildApiUrl("professionals", clinicId ? { clinicId } : undefined);
  const res = await fetch(url);
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(
      `[professionalsApi] fetchProfessionals: ${res.status} ${res.statusText}${
        body ? " – " + body.slice(0, 300) : ""
      }`
    );
  }
  const data = await res.json();
  return Array.isArray(data) ? data.map(mapProfessional) : [];
}

/**
 * Cria profissional.
 */
export async function addProfessional(data: NewProfessionalData): Promise<Professional> {
  const url = await buildApiUrl("professionals");
  const res = await fetch(url, {
    method: "POST",
    headers: defaultJsonHeaders(),
    body: JSON.stringify(data),
  });
  const json = await parseOrThrow(res, "addProfessional");
  return mapProfessional(json);
}

/**
 * Atualiza profissional inteiro.
 */
export async function updateProfessional(
  id: number,
  data: Omit<Professional, "id"> & { clinic_id: number }
): Promise<Professional> {
  const url = await buildApiUrl(`professionals/${id}`);
  const res = await fetch(url, {
    method: "PUT",
    headers: defaultJsonHeaders(),
    body: JSON.stringify(data),
  });
  const json = await parseOrThrow(res, "updateProfessional");
  return mapProfessional(json);
}

/**
 * Remove profissional.
 */
export async function deleteProfessional(id: number, clinicId: string): Promise<void> {
  const url = await buildApiUrl(`professionals/${id}`, { clinicId });
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
 * (Opcional) Atualiza apenas disponibilidade.
 */
export async function toggleProfessionalAvailability(
  id: number,
  clinicId: string,
  available: boolean
): Promise<Professional> {
  const url = await buildApiUrl(`professionals/${id}/availability`, { clinicId });
  const res = await fetch(url, {
    method: "PATCH",
    headers: defaultJsonHeaders(),
    body: JSON.stringify({ available }),
  });

  if (res.status === 405) {
    // fallback PUT se PATCH não for suportado:
    const putRes = await fetch(url, {
      method: "PUT",
      headers: defaultJsonHeaders(),
      body: JSON.stringify({ available }),
    });
    const putJson = await parseOrThrow(putRes, "toggleProfessionalAvailability (PUT fallback)");
    return mapProfessional(putJson);
  }

  const json = await parseOrThrow(res, "toggleProfessionalAvailability");
  return mapProfessional(json);
}