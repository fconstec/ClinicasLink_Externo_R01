import { buildApiUrl, defaultJsonHeaders } from "./apiPrefix";
import type { Appointment } from "../components/ClinicAdminPanel_Managers/types";

/**
 * Normaliza um item cru da API em Appointment.
 * Ajuste aqui se o seu tipo Appointment for diferente.
 */
function mapAppointment(raw: any): Appointment {
  return {
    id: Number(raw.id),
    patientId: raw.patientId != null ? Number(raw.patientId) : (raw.patient_id != null ? Number(raw.patient_id) : undefined),
    patientName: raw.patientName ?? raw.patient_name,
    patientPhone: raw.patientPhone ?? raw.patient_phone,
    serviceId: raw.serviceId != null
      ? Number(raw.serviceId)
      : (raw.service_id != null ? Number(raw.service_id) : undefined),
    service: raw.service ?? raw.service_name,
    service_name: raw.service_name, // manter se o seu tipo prevê ambas
    professionalId: Number(raw.professionalId ?? raw.professional_id),
    professional_name: raw.professional_name,
    date: raw.date ? String(raw.date) : "",
    time: raw.time ? String(raw.time) : "",
    status: raw.status,
    notes: raw.notes,
    created_at: raw.created_at,
    updated_at: raw.updated_at,
    startUTC: raw.startUTC,
  } as Appointment;
}

async function parseOrThrow<T = any>(res: Response, context: string): Promise<T> {
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`[appointmentsApi] ${context}: ${res.status} ${res.statusText}${body ? " – " + body.slice(0, 300) : ""}`);
  }
  return res.json().catch(() => ({} as T));
}

/**
 * Lista agendamentos. Usa clinicId como query.
 */
export async function fetchAppointments(clinicId?: string): Promise<Appointment[]> {
  const url = await buildApiUrl("appointments", clinicId ? { clinicId } : undefined);
  const res = await fetch(url);
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`[appointmentsApi] fetchAppointments: ${res.status} ${res.statusText}${body ? " – " + body.slice(0, 300) : ""}`);
  }
  const raw = await res.json();
  if (!Array.isArray(raw)) return [];
  return raw
    .map((ap: any) => {
      // Valida ids principais
      const idNum = Number(ap.id);
      const profNum = Number(ap.professionalId ?? ap.professional_id);
      if (isNaN(idNum) || isNaN(profNum)) return null;
      return mapAppointment(ap);
    })
    .filter((x): x is Appointment => x !== null);
}

/**
 * Cria agendamento.
 * appointment: Omit<Appointment, 'id'> -> ajuste se seu backend espera outra estrutura.
 */
export async function createAppointment(
  appointment: Omit<Appointment, "id">,
  clinicId: string
): Promise<Appointment> {
  const url = await buildApiUrl("appointments", { clinicId });
  const res = await fetch(url, {
    method: "POST",
    headers: defaultJsonHeaders(),
    body: JSON.stringify(appointment),
  });
  const json = await parseOrThrow(res, "createAppointment");
  return mapAppointment(json);
}

/**
 * Atualiza agendamento completo ou parcial.
 * partial: envie apenas campos que deseja alterar (date, time, status, notes, etc.).
 */
export async function updateAppointment(
  id: number,
  clinicId: string,
  partial: Partial<Omit<Appointment, "id">>
): Promise<Appointment> {
  const url = await buildApiUrl(`appointments/${id}`, { clinicId });
  const res = await fetch(url, {
    method: "PUT",
    headers: defaultJsonHeaders(),
    body: JSON.stringify(partial),
  });
  const json = await parseOrThrow(res, "updateAppointment");
  return mapAppointment(json);
}

/**
 * Atualiza somente status (se seu backend tiver rota específica, ajuste).
 */
export async function updateAppointmentStatus(
  id: number,
  clinicId: string,
  status: string
): Promise<Appointment> {
  // Caso exista endpoint dedicado, altere "appointments/${id}/status"
  const url = await buildApiUrl(`appointments/${id}`, { clinicId });
  const res = await fetch(url, {
    method: "PATCH",
    headers: defaultJsonHeaders(),
    body: JSON.stringify({ status }),
  });

  // Se o backend não aceitar PATCH, troque para PUT e envie mais campos.
  if (res.status === 405) {
    // fallback PUT (ex.: alguns servidores não permitem PATCH)
    const putRes = await fetch(url, {
      method: "PUT",
      headers: defaultJsonHeaders(),
      body: JSON.stringify({ status }),
    });
    const putJson = await parseOrThrow(putRes, "updateAppointmentStatus (PUT fallback)");
    return mapAppointment(putJson);
  }

  const json = await parseOrThrow(res, "updateAppointmentStatus");
  return mapAppointment(json);
}

/**
 * Exclui agendamento.
 */
export async function deleteAppointment(
  id: number,
  clinicId: string
): Promise<void> {
  const url = await buildApiUrl(`appointments/${id}`, { clinicId });
  const res = await fetch(url, { method: "DELETE" });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`[appointmentsApi] deleteAppointment: ${res.status} ${res.statusText}${body ? " – " + body.slice(0, 300) : ""}`);
  }
}