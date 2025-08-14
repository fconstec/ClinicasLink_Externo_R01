import type { Appointment, AppointmentStatus } from "@/components/ClinicAdminPanel_Managers/types";

interface RawAppointment {
  id: number | string;
  patientId?: number | string;
  patient_id?: number | string;
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
  [key: string]: any;
}

export function normalizeRawAppointment(raw: RawAppointment): Appointment {
  const sliceTime = (t?: string) => (t ? String(t).slice(0,5) : undefined);
  return {
    id: Number(raw.id),
    patientId: raw.patientId != null
      ? Number(raw.patientId)
      : raw.patient_id != null
      ? Number(raw.patient_id)
      : undefined,
    patientName: raw.patientName || raw.patient_name || raw.patient_name_full || "",
    patientPhone: raw.patientPhone || raw.patient_phone || "",
    professionalId: Number(raw.professionalId ?? raw.professional_id ?? raw.professional),
    professionalName: raw.professionalName || raw.professional_name || "",
    serviceId: raw.serviceId != null
      ? Number(raw.serviceId)
      : raw.service_id != null
      ? Number(raw.service_id)
      : undefined,
    serviceName: raw.serviceName || raw.service || raw.service_name || "",
    date: String(raw.date).slice(0,10),
    time: sliceTime(raw.time) || "",
    endTime: sliceTime(raw.endTime),
    status: (raw.status || "pending") as AppointmentStatus,
    notes: raw.notes,
  } as Appointment;
}