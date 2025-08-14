import type { Appointment, AppointmentStatus } from "@/components/ClinicAdminPanel_Managers/types";

/**
 * Mapeamento explícito snake_case => camelCase.
 * Adicione entradas conforme o backend evoluir.
 */
const FIELD_MAP: Record<string, string> = {
  id: "id",

  patient_id: "patientId",
  patient_name: "patientName",
  patient_name_full: "patientName",
  patient_phone: "patientPhone",

  professional_id: "professionalId",
  professional_name: "professionalName",
  professional_name_full: "professionalName",

  service_id: "serviceId",
  service_name: "serviceName",
  service: "service",               // quando backend já manda texto amigável

  date: "date",
  time: "time",

  end_time: "endTime",
  endTime: "endTime",
  endtime: "endTime",

  status: "status",
  notes: "notes",

  created_at: "createdAt",
  updated_at: "updatedAt",

  start_utc: "startUTC",
  startUtc: "startUTC",
  startUTC: "startUTC",

  end_utc: "endUTC",
  endUtc: "endUTC",
  endUTC: "endUTC",

  utc_date_time: "utcDateTime",
  utcDateTime: "utcDateTime",
};

/**
 * Heurística reforçada:
 * Considera normalizado se:
 *  - já tem patientName OU professionalId OU serviceId
 *  - e não existe nenhuma chave com underscore (_)
 */
export function isAppointmentNormalized(obj: any): boolean {
  if (!obj || typeof obj !== "object") return false;
  const hasAnchor =
    "patientName" in obj || "professionalId" in obj || "serviceId" in obj;
  if (!hasAnchor) return false;
  for (const k of Object.keys(obj)) {
    if (k.includes("_")) return false;
  }
  return true;
}

function coerceStatus(value: any): AppointmentStatus {
  const allowed: AppointmentStatus[] = ["pending", "confirmed", "completed", "cancelled"];
  if (allowed.includes(value)) return value;

  if (typeof value === "string") {
    const v = value.toLowerCase();
    if (v.startsWith("pend")) return "pending";
    if (v.startsWith("conf")) return "confirmed";
    if (v.startsWith("comp")) return "completed";
    if (v.startsWith("canc")) return "cancelled";
  }
  return "pending";
}

interface NormalizeOptions {
  /** Remove chaves não pertencentes a Appointment (whitelist). Default: false */
  strict?: boolean;
  /** Converte null -> undefined. Default: true */
  stripNulls?: boolean;
}

const DEFAULT_OPTIONS: NormalizeOptions = {
  strict: false,
  stripNulls: true,
};

export function normalizeAppointment(
  raw: any,
  options: NormalizeOptions = DEFAULT_OPTIONS
): Appointment {
  const { strict, stripNulls } = { ...DEFAULT_OPTIONS, ...options };

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

  // Caso já pareça normalizado
  if (isAppointmentNormalized(raw)) {
    const outNorm: Record<string, any> = { ...raw };

    outNorm.id = Number(outNorm.id) || 0;
    outNorm.professionalId =
      outNorm.professionalId != null ? Number(outNorm.professionalId) : 0;
    if (outNorm.serviceId != null)
      outNorm.serviceId = Number(outNorm.serviceId) || 0;

    outNorm.status = coerceStatus(outNorm.status);
    outNorm.patientName =
      (typeof outNorm.patientName === "string"
        ? outNorm.patientName.trim()
        : "") || "Paciente";

    if (typeof outNorm.date !== "string") outNorm.date = String(outNorm.date ?? "");
    if (typeof outNorm.time !== "string") outNorm.time = String(outNorm.time ?? "");
    if (outNorm.endTime && typeof outNorm.endTime !== "string")
      outNorm.endTime = String(outNorm.endTime);

    if (stripNulls) {
      for (const k of Object.keys(outNorm)) {
        if (outNorm[k] === null) outNorm[k] = undefined;
      }
    }

    return outNorm as Appointment;
  }

  const out: Record<string, any> = {};

  // 1. Mapear campos conhecidos (snake / variantes)
  for (const [from, to] of Object.entries(FIELD_MAP)) {
    if (raw[from] !== undefined && out[to] === undefined) {
      out[to] = raw[from];
    }
  }

  // 2. Copiar extras se não for strict
  if (!strict) {
    for (const key of Object.keys(raw)) {
      if (!(key in FIELD_MAP) && out[key] === undefined) {
        out[key] = raw[key];
      }
    }
  }

  // 3. Coerções numéricas
  out.id = Number(out.id) || 0;
  out.professionalId =
    out.professionalId != null ? Number(out.professionalId) : 0;
  if (out.serviceId != null) out.serviceId = Number(out.serviceId) || 0;

  // 4. Fallbacks semânticos
  if (!out.patientName) {
    out.patientName =
      raw.patient_name_full ||
      raw.patient_name ||
      raw.patientName ||
      raw.patient ||
      "Paciente";
  }
  if (typeof out.patientName === "string") {
    out.patientName = out.patientName.trim() || "Paciente";
  }

  // Variantes de endTime (se ainda não veio)
  if (!out.endTime) {
    out.endTime = raw.endtime || raw.end_time || raw.endTime || undefined;
  }
  if (out.endTime && typeof out.endTime !== "string") {
    out.endTime = String(out.endTime);
  }

  out.status = coerceStatus(out.status);

  // 5. Garantir strings básicas
  out.date = typeof out.date === "string" ? out.date : String(out.date ?? "");
  out.time = typeof out.time === "string" ? out.time : String(out.time ?? "");

  if (out.patientPhone != null && typeof out.patientPhone !== "string") {
    out.patientPhone = String(out.patientPhone);
  }

  // 6. Limpeza de null -> undefined
  if (stripNulls) {
    for (const k of Object.keys(out)) {
      if (out[k] === null) out[k] = undefined;
    }
  }

  return out as Appointment;
}

export function normalizeAppointments(
  arr: any[],
  options?: NormalizeOptions
): Appointment[] {
  if (!Array.isArray(arr)) return [];
  return arr.map((r) => normalizeAppointment(r, options));
}

// Aliases semânticos
export const ensureNormalizedAppointment = normalizeAppointment;
export const ensureNormalizedAppointments = normalizeAppointments;