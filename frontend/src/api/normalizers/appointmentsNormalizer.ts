import type { Appointment, AppointmentStatus } from "@/components/ClinicAdminPanel_Managers/types";

/**
 * Representa o formato cru vindo do backend (snake_case / nomes mistos).
 */
export interface RawAppointment {
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
  startUTC?: string;
  [key: string]: any;
}

const sliceTime = (t?: string) => (t ? String(t).slice(0, 5) : undefined);

/**
 * Normaliza um RawAppointment em Appointment (camelCase).
 * Ajuste se o tipo Appointment mudar.
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
    // Se Appointment NÃO declara startUTC / created_at / updated_at,
    // remova estas linhas ou faça augmentation do tipo.
    // created_at: raw.created_at,
    // updated_at: raw.updated_at,
    // startUTC: raw.startUTC,
  } as Appointment;
}

/**
 * Normaliza array de RawAppointments (fail-safe).
 */
export function normalizeAppointments(data: unknown): Appointment[] {
  if (!Array.isArray(data)) return [];
  return data.map(d => normalizeRawAppointment(d as RawAppointment));
}