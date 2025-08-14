import { buildApiUrl, defaultJsonHeaders } from "./apiPrefix";
import type { Appointment, AppointmentStatus } from "../components/ClinicAdminPanel_Managers/types";

/**
 * Formato cru retornado pelo backend (snake_case e variações).
 * Acrescente/ajuste conforme evoluir o backend.
 */
interface RawAppointment {
  id: number | string;
  patientId?: number | string;
  patient_id?: number | string;
  patientName?: string;
  patient_name?: string;
  patient_name_full?: string;
  patientPhone?: string;
  patient_phone?: string;
  professionalId?: number | string;
  professional_id?: number | string;
  professional?: number | string;
  professionalName?: string;
  professional_name?: string;
  serviceId?: number | string;
  service_id?: number | string;
  serviceName?: string;
  service?: string;
  service_name?: string;
  date: string;
  time?: string;
  endTime?: string;
  status?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
  startUTC?: string;
  // Campos adicionais dinâmicos
  [key: string]: any;
}

/**
 * Fatia string de horário para formato HH:MM.
 */
function sliceTime(t?: string): string | undefined {
  if (!t) return undefined;
  return String(t).slice(0, 5);
}

/**
 * Normaliza um RawAppointment para Appointment (camelCase).
 * Ajuste para refletir exatamente o seu tipo Appointment.
 */
export function normalizeRawAppointment(raw: RawAppointment): Appointment {
  return {
    id: Number(raw.id),
    patientId:
      raw.patientId != null
        ? Number(raw.patientId)
        : raw.patient_id != null
        ? Number(raw.patient_id)
        : undefined,
    patientName:
      raw.patientName ||
      raw.patient_name ||
      raw.patient_name_full ||
      "",
    patientPhone: raw.patientPhone || raw.patient_phone || "",
    professionalId: Number(
      raw.professionalId ?? raw.professional_id ?? raw.professional
    ),
    // Caso seu tipo Appointment inclua professionalName/serviceName:
    professionalName: raw.professionalName || raw.professional_name || "",
    serviceId:
      raw.serviceId != null
        ? Number(raw.serviceId)
        : raw.service_id != null
        ? Number(raw.service_id)
        : undefined,
    serviceName: raw.serviceName || raw.service || raw.service_name || "",
    date: String(raw.date).slice(0, 10),
    time: sliceTime(raw.time) || "",
    endTime: sliceTime(raw.endTime),
    status: (raw.status || "pending") as AppointmentStatus,
    notes: raw.notes,
    // Se Appointment NÃO declara os campos abaixo, remova ou use @ts-expect-error
    created_at: raw.created_at,
    updated_at: raw.updated_at,
    startUTC: raw.startUTC,
  } as Appointment;
}

/**
 * Lança erro detalhado incluindo até 300 chars do corpo.
 */
async function throwDetailedError(res: Response, context: string): Promise<never> {
  const body = await res.text().catch(() => "");
  throw new Error(
    `[appointmentsApi] ${context}: ${res.status} ${res.statusText}${
      body ? " – " + body.slice(0, 300) : ""
    }`
  );
}

async function parseJson<T>(res: Response, context: string): Promise<T> {
  if (!res.ok) {
    await throwDetailedError(res, context);
  }
  return (await res.json().catch(() => {
    throw new Error(`[appointmentsApi] ${context}: resposta não é JSON válido`);
  })) as T;
}

/**
 * Lista agendamentos normalizados.
 */
export async function fetchAppointments(clinicId?: string): Promise<Appointment[]> {
  const url = await buildApiUrl(
    "appointments",
    clinicId ? { clinicId } : undefined
  );
  const res = await fetch(url);
  if (!res.ok) {
    await throwDetailedError(res, "fetchAppointments");
  }
  const raw = (await res.json().catch(() => [])) as unknown;
  if (!Array.isArray(raw)) return [];
  return raw
    .map(r => {
      try {
        return normalizeRawAppointment(r as RawAppointment);
      } catch {
        return null;
      }
    })
    .filter((a): a is Appointment => a !== null);
}

/**
 * Payload para criação. Ajuste conforme backend.
 * Se o backend precisa de "service" textual, inclua.
 */
export interface CreateAppointmentPayload {
  patientId?: number;
  patientName: string;
  patientPhone?: string;
  professionalId: number;
  serviceId: number;
  service?: string;       // legacy
  serviceName?: string;   // opcional se quiser enviar redundante
  date: string;           // YYYY-MM-DD
  time: string;           // HH:MM
  endTime: string;        // HH:MM
  status?: AppointmentStatus;
  notes?: string;
}

/**
 * Payload de atualização parcial/completa (id fora).
 */
export type UpdateAppointmentPayload = Partial<CreateAppointmentPayload>;

/**
 * Cria agendamento.
 */
export async function createAppointment(
  payload: CreateAppointmentPayload,
  clinicId: string
): Promise<Appointment> {
  const url = await buildApiUrl("appointments", { clinicId });
  const res = await fetch(url, {
    method: "POST",
    headers: defaultJsonHeaders(),
    body: JSON.stringify(payload),
  });
  const json = await parseJson<RawAppointment>(res, "createAppointment");
  return normalizeRawAppointment(json);
}

/**
 * Atualiza agendamento (PUT completo ou PATCH conforme backend).
 * Aqui usamos PUT por padrão para manter compatibilidade.
 */
export async function updateAppointment(
  id: number,
  clinicId: string,
  partial: UpdateAppointmentPayload
): Promise<Appointment> {
  const url = await buildApiUrl(`appointments/${id}`, { clinicId });
  const res = await fetch(url, {
    method: "PUT",
    headers: defaultJsonHeaders(),
    body: JSON.stringify(partial),
  });
  const json = await parseJson<RawAppointment>(res, "updateAppointment");
  return normalizeRawAppointment(json);
}

/**
 * Atualiza somente status com PATCH; fallback para PUT se 405.
 */
export async function updateAppointmentStatus(
  id: number,
  clinicId: string,
  status: AppointmentStatus
): Promise<Appointment> {
  const url = await buildApiUrl(`appointments/${id}`, { clinicId });
  let res = await fetch(url, {
    method: "PATCH",
    headers: defaultJsonHeaders(),
    body: JSON.stringify({ status }),
  });

  if (res.status === 405) {
    // Fallback PUT se servidor não suporta PATCH
    res = await fetch(url, {
      method: "PUT",
      headers: defaultJsonHeaders(),
      body: JSON.stringify({ status }),
    });
  }

  const json = await parseJson<RawAppointment>(res, "updateAppointmentStatus");
  return normalizeRawAppointment(json);
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
    await throwDetailedError(res, "deleteAppointment");
  }
}