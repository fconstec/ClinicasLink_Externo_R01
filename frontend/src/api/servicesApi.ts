import { buildApiUrl, defaultJsonHeaders } from "./apiPrefix";
import type { Service, NewServiceData } from "../components/ClinicAdminPanel_Managers/types";

type ClinicId = number | string;

/**
 * Normaliza objeto cru em Service.
 */
function mapService(raw: any): Service {
  return {
    id: Number(raw.id),
    name: String(raw.name ?? "").trim(),
    duration: raw.duration != null ? String(raw.duration) : "",
    value: raw.value != null ? String(raw.value) : "",
    description: raw.description ?? undefined,
  };
}

async function parseOrThrow(res: Response, context: string) {
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(
      `[servicesApi] ${context}: ${res.status} ${res.statusText}${
        body ? " – " + body.slice(0, 300) : ""
      }`
    );
  }
  return res.json();
}

/**
 * Lista serviços da clínica.
 */
export async function fetchServices(clinicId?: ClinicId): Promise<Service[]> {
  const query = clinicId != null ? { clinicId: String(clinicId) } : undefined;
  const url = await buildApiUrl("services", query);
  const res = await fetch(url);
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(
      `[servicesApi] fetchServices: ${res.status} ${res.statusText}${
        txt ? " – " + txt.slice(0, 300) : ""
      }`
    );
  }
  const data = await res.json();
  return Array.isArray(data) ? data.map(mapService) : [];
}

/**
 * Cria serviço.
 * Mantemos clinicId junto no body se o backend espera dessa forma.
 */
export async function addService(
  data: NewServiceData & { clinicId: ClinicId }
): Promise<Service> {
  const payload = { ...data, clinicId: String(data.clinicId) };
  const url = await buildApiUrl("services");
  const res = await fetch(url, {
    method: "POST",
    headers: defaultJsonHeaders(),
    body: JSON.stringify(payload),
  });
  const json = await parseOrThrow(res, "addService");
  return mapService(json);
}

/**
 * Atualiza serviço.
 */
export async function updateService(
  id: number,
  data: Omit<Service, "id"> & { clinicId: ClinicId }
): Promise<Service> {
  const payload = { ...data, clinicId: String(data.clinicId) };
  const url = await buildApiUrl(`services/${id}`);
  const res = await fetch(url, {
    method: "PUT",
    headers: defaultJsonHeaders(),
    body: JSON.stringify(payload),
  });
  const json = await parseOrThrow(res, "updateService");
  return mapService(json);
}

/**
 * Remove serviço.
 */
export async function deleteService(id: number, clinicId: ClinicId): Promise<void> {
  const url = await buildApiUrl(`services/${id}`, { clinicId: String(clinicId) });
  const res = await fetch(url, { method: "DELETE" });
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(
      `[servicesApi] deleteService: ${res.status} ${res.statusText}${
        txt ? " – " + txt.slice(0, 300) : ""
      }`
    );
  }
}