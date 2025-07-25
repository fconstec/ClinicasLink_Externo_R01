import { Appointment } from "../components/ClinicAdminPanel_Managers/types";
import type { CalendarEvent } from "src/components/SuperCalendar/types";

function normalizeHour(h: string) {
  if (!h) return "00:00";
  if (h.length === 4) return "0" + h;
  return h;
}

export function mapAppointmentToCalendarEvent(appointment: Appointment): CalendarEvent | null {
  if (!appointment.id) return null;

  const start = `${appointment.date}T${normalizeHour(appointment.time)}`;
  const end =
    appointment.endTime && appointment.endTime.trim() !== ""
      ? `${appointment.date}T${normalizeHour(appointment.endTime)}`
      : start;

  const serviceTitle = appointment.service || appointment.service_name || "";

  return {
    id: String(appointment.id),
    resourceId: String(appointment.professionalId), // always string!
    title: `${appointment.patientName || appointment.patient_name || "Paciente"} - ${serviceTitle}`,
    start,
    end,
    status: appointment.status,
    allDay: false,
    extendedProps: {
      ...appointment,
      serviceName: serviceTitle,
    }
  };
}