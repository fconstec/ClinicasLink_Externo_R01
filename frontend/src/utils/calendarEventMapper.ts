import type {
  Appointment,
  AppointmentStatus,
  Service,
} from "@/components/ClinicAdminPanel_Managers/types";
import type {
  AppointmentCalendarEvent,
} from "@/components/SuperCalendar/types";

function ensureHHMM(value: string | undefined): string {
  if (!value) return "00:00";
  let v = value.trim();
  if (/^\d{1,2}:\d{2}:\d{2}$/.test(v)) v = v.slice(0, 5);
  if (/^\d:\d{2}$/.test(v)) v = "0" + v;
  if (!/^\d{2}:\d{2}$/.test(v)) return "00:00";
  return v;
}

export interface MapOptions {
  services?: Service[];
  serviceDurationMap?: Record<number, number>;
  showStatusInTitle?: boolean;
}

function parseServiceDuration(raw?: string): number | undefined {
  if (!raw) return;
  const d = raw.trim();
  if (/^\d+$/.test(d)) return Number(d);
  if (/^\d+\s*(min|m)$/i.test(d)) return Number(d.replace(/\D/g, ""));
  if (/^\d{1,2}:\d{2}$/.test(d)) {
    const [h, m] = d.split(":").map(Number);
    if (!isNaN(h) && !isNaN(m)) return h * 60 + m;
  }
  return;
}

function deriveEnd(date: string, startHHMM: string, durationMin?: number): string | undefined {
  if (!durationMin || durationMin <= 0) return;
  const [h, m] = startHHMM.split(":").map(Number);
  if (isNaN(h) || isNaN(m)) return;
  const total = h * 60 + m + durationMin;
  const hh = Math.floor(total / 60) % 24;
  const mm = total % 60;
  return `${date}T${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
}

export function mapAppointmentToCalendarEvent(
  appt: Appointment,
  opts?: MapOptions
): AppointmentCalendarEvent | null {
  if (!appt || !appt.id || !appt.date || !appt.time) return null;

  const startTime = ensureHHMM(appt.time);
  const start = `${appt.date}T${startTime}`;

  let end: string | undefined;
  if (appt.endTime) {
    const endTime = ensureHHMM(appt.endTime);
    end = `${appt.date}T${endTime}`;
    if (end <= start) end = undefined;
  }

  if (!end) {
    let dur: number | undefined;
    if (appt.serviceId != null) {
      if (opts?.serviceDurationMap) {
        dur = opts.serviceDurationMap[appt.serviceId];
      } else if (opts?.services) {
        const svc = opts.services.find((s) => s.id === appt.serviceId);
        dur = parseServiceDuration(svc?.duration);
      }
    }
    end = deriveEnd(appt.date, startTime, dur) || start;
  }

  const serviceName =
    (appt as any).serviceName ||
    appt.service ||
    (appt as any).service_name ||
    "";
  const patientName = appt.patientName || (appt as any).patient_name || "Paciente";
  const status = appt.status as AppointmentStatus;

  let title = `${patientName}${serviceName ? " - " + serviceName : ""}`;
  if (opts?.showStatusInTitle) {
    title += ` [${status}]`;
  }

  return {
    id: String(appt.id),
    title,
    start,
    end,
    allDay: false,
    resourceId: String(appt.professionalId),
    status,
    patientName,
    serviceName,
    extendedProps: {
      ...appt,
      serviceName,
      displayTitle: title,
    },
  };
}