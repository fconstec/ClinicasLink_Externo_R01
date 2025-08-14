import type { Appointment, AppointmentStatus } from "@/components/ClinicAdminPanel_Managers/types";

/**
 * Mapeamento explícito de snake_case -> camelCase para evitar ambiguidade.
 * Adicione/remova conforme o backend.
 */
const FIELD_MAP: Record<string, string> = {
  id: "id",
  patient_id: "patientId",
  patient_name: "patientName",
  patient_phone: "patientPhone",
  professional_id: "professionalId",
  professional_name: "professionalName",
  service_id: "serviceId",
  service_name: "serviceName",
  service: "service", // às vezes backend já manda service textual
  date: "date",
  time: "time",
  end_time: "endTime",
  endTime: "endTime",
  status: "status",
  notes: "notes",
  created_at: "createdAt",
  updated_at: "updatedAt",
  start_utc: "startUTC",
  startUtc: "startUTC",
  utc_date_time: "utcDateTime",
  utcDateTime: "utcDateTime",
};

export function isAppointmentNormalized(obj: any): boolean {
  if (!obj || typeof obj !== "object") return false;
  // Heurística: se já tem patientName OU professionalId e não contém nenhuma snake conhecida
  if ("patientName" in obj || "professionalId" in obj || "serviceId" in obj) {
    for (const k of Object.keys(obj)) {
      if (k.includes("_") && FIELD_MAP[k]) return false;
    }
    return true;
  }
  return false;
}

function coerceStatus(value: any): AppointmentStatus {
  const allowed: AppointmentStatus[] = ["pending", "confirmed", "completed", "cancelled"];
  if (allowed.includes(value)) return value;
  return "pending";
}

export function normalizeAppointment(raw: any): Appointment {
  if (!raw || typeof raw !== "object") {
    return {
      id: 0,
      patientName: "Paciente",
      professionalId: 0,
      serviceId: 0,
      date: "",
      time: "",
      status: "pending",
    } as Appointment;
  }

  if (isAppointmentNormalized(raw)) {
    // Garantia mínima: normaliza status se estiver incorreto
    if (raw.status && !["pending", "confirmed", "completed", "cancelled"].includes(raw.status)) {
      raw.status = "pending";
    }
    return raw as Appointment;
  }

  const out: Record<string, any> = {};

  // 1. Copia campos conhecidos
  for (const [snake, camel] of Object.entries(FIELD_MAP)) {
    if (raw[snake] !== undefined && out[camel] === undefined) {
      out[camel] = raw[snake];
    }
  }

  // 2. Copia campos adicionais não mapeados (não perde nada)
  for (const key of Object.keys(raw)) {
    if (!(key in FIELD_MAP) && out[key] === undefined) {
      out[key] = raw[key];
    }
  }

  // 3. Coerções / defaults
  out.id = Number(out.id) || 0;
  out.professionalId = out.professionalId != null ? Number(out.professionalId) : 0;
  out.serviceId = out.serviceId != null ? Number(out.serviceId) : 0;
  if (!out.patientName) {
    out.patientName =
      raw.patient_name ||
      raw.patientName ||
      raw.patient ||
      "Paciente";
  }
  out.status = coerceStatus(out.status);

  // Garante strings básicas
  out.date = out.date || "";
  out.time = out.time || "";

  return out as Appointment;
}

export function normalizeAppointments(arr: any[]): Appointment[] {
  if (!Array.isArray(arr)) return [];
  return arr.map(normalizeAppointment);
}

// Aliases semânticos (úteis se alguém procura "ensure*")
export const ensureNormalizedAppointment = normalizeAppointment;
export const ensureNormalizedAppointments = normalizeAppointments;