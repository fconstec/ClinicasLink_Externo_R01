import React, { useState, useEffect, useMemo, useCallback } from "react";
import SuperCalendar from "@/components/SuperCalendar/SuperCalendar";
import AppointmentsFormModal from "@/components/modals/AppointmentsFormModal";
import { mapAppointmentToCalendarEvent } from "@/utils/calendarEventMapper";
import type {
  Professional,
  Service,
  Appointment,
  AppointmentStatus,
} from "@/components/ClinicAdminPanel_Managers/types";
import type { SubmittedFormData as ScheduleFormData } from "@/components/ScheduleForm/types";
import type { CalendarEvent } from "@/components/SuperCalendar/types";
import { API_BASE_URL } from "@/api/apiBase";

const PROFESSIONAL_CALENDAR_COLORS = [
  "#EF4444",
  "#F97316",
  "#EAB308",
  "#22C55E",
  "#0EA5E9",
  "#6366F1",
  "#EC4899",
  "#DC2626",
  "#EA580C",
  "#D97706",
  "#16A34A",
  "#0284C7",
  "#4F46E5",
  "#DB2777",
];

const EVENT_COLOR_PALETTE = [
  "#e6f4ea",
  "#fff9db",
  "#e0ecfc",
  "#fae7f3",
  "#fde6e6",
  "#f9f6e7",
  "#edf6f9",
  "#f3e8fd",
  "#e5f6fd",
  "#f8f7fa",
  "#ecfdf5",
  "#fef3c7",
  "#f3f4f6",
  "#fdf2f8",
];

// Tipagem das props do componente
interface CalendarTabProps {
  professionals: Professional[];
  services: Service[];
}

/**
 * Tipo cru vindo do backend (snake_case ou variações).
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
  [key: string]: any;
}

/**
 * Normaliza um RawAppointment em Appointment (camelCase).
 * Ajuste se seu Appointment tiver diferenças.
 */
function normalizeRawAppointment(raw: RawAppointment): Appointment {
  const sliceTime = (t?: string) => (t ? String(t).slice(0, 5) : undefined);

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
  } as Appointment;
}

interface ScheduleModalEditing {
  eventData: {
    id: number;
    patientId?: number;
    patientName: string;
    patientPhone?: string;
    professionalId: number;
    serviceId: number;
    serviceName: string;
    date: string;
    time: string;
    endTime?: string;
    status?: AppointmentStatus;
    notes?: string;
  };
}

interface ScheduleModalCreating {
  eventData: null;
  date: string;
  professionalId?: number;
  time: string;
  endTime?: string;
}

type ScheduleModalInfo = ScheduleModalEditing | ScheduleModalCreating;

const CalendarTab: React.FC<CalendarTabProps> = ({ professionals, services }) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleModalInfo, setScheduleModalInfo] =
    useState<ScheduleModalInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  const clinicId = useMemo(
    () => localStorage.getItem("clinic_id") || "",
    []
  );

  const loadAppointments = useCallback(async () => {
    if (!clinicId) return;
    setLoading(true);
    setError(null);
    try {
      const url = `${API_BASE_URL}/appointments?clinicId=${clinicId}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(res.statusText);
      const data: unknown = await res.json();
      if (Array.isArray(data)) {
        setAppointments(
          data.map((raw) => normalizeRawAppointment(raw as RawAppointment))
        );
      } else {
        setAppointments([]);
      }
    } catch (e: any) {
      console.error("[CalendarTab] Erro carregando appointments:", e);
      setError(e.message || "Erro ao carregar agendamentos.");
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  }, [clinicId]);

  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  const calendarProfessionals = useMemo(
    () =>
      professionals
        .filter((p) => (p as any).available !== false)
        .map((p, idx) => ({
          id: Number(p.id),
          name: p.name,
          color:
            PROFESSIONAL_CALENDAR_COLORS[
              idx % PROFESSIONAL_CALENDAR_COLORS.length
            ],
        })),
    [professionals]
  );

  const calendarEvents: CalendarEvent[] = useMemo(() => {
    let idx = 0;
    return appointments
      .filter(
        (a) =>
          a.status !== "cancelled" &&
          a.professionalId != null &&
          calendarProfessionals.some(
            (p) => p.id === Number(a.professionalId)
          )
      )
      .map((appt) => {
        const ev = mapAppointmentToCalendarEvent(appt, { services });
        if (!ev) return null;
        const color = EVENT_COLOR_PALETTE[idx++ % EVENT_COLOR_PALETTE.length];
        return {
          ...ev,
          backgroundColor: color,
          color,
        } as CalendarEvent;
      })
      .filter((e): e is CalendarEvent => !!e);
  }, [appointments, calendarProfessionals, services]);

  const handleNewOrEditCalendarEvent = (info: {
    date?: string;
    professionalId?: number;
    time?: string;
    endTime?: string;
    event?: CalendarEvent;
  }) => {
    if (!info?.event) {
      const date = info.date || "";
      const time = info.time || "";
      const endTime = info.endTime || "";
      setScheduleModalInfo({
        eventData: null,
        date,
        time,
        endTime,
        professionalId: info.professionalId,
      });
      setShowScheduleModal(true);
      return;
    }

    const ev = info.event;
    const ext = ev.extendedProps || {};

    setScheduleModalInfo({
      eventData: {
        id: Number(ext.id ?? ev.id),
        patientId: ext.patientId,
        patientName: ext.patientName || "",
        patientPhone: ext.patientPhone,
        professionalId: Number(ext.professionalId ?? ev.resourceId),
        serviceId: Number(ext.serviceId),
        serviceName:
          ext.serviceName || ext.service || ext.service_name || "",
        date: ext.date,
        time: ext.time,
        endTime: ext.endTime,
        status: ext.status,
        notes: ext.notes,
      },
    });
    setShowScheduleModal(true);
  };

  const handleModalSubmit = async (
    formData: ScheduleFormData,
    eventIdAsId?: string | number
  ) => {
    if (!clinicId) {
      alert("Clínica não identificada.");
      return;
    }

    const eventId =
      typeof eventIdAsId === "string"
        ? parseInt(eventIdAsId, 10)
        : eventIdAsId;

    const profNum = Number(formData.professionalId);
    const servNum = Number(formData.serviceId);

    if (isNaN(profNum) || profNum <= 0) {
      alert("Profissional inválido.");
      return;
    }
    if (isNaN(servNum) || servNum <= 0) {
      alert("Serviço inválido.");
      return;
    }

    const svc = services.find((s) => s.id === servNum);
    if (!svc) {
      alert("Serviço não encontrado.");
      return;
    }

    const status: AppointmentStatus = (formData.status || "pending") as AppointmentStatus;

    const payload = {
      patientId: formData.patientId,
      patientName: formData.patientName,
      patientPhone: formData.patientPhone,
      professionalId: profNum,
      serviceId: servNum,
      service: svc.name,       // se o backend ainda espera este campo
      serviceName: svc.name,   // redundante por compatibilidade
      date: formData.date,
      time: formData.time,
      endTime: formData.endTime,
      status,
      notes: (formData as any).notes,
    };

    try {
      const url = eventId
        ? `${API_BASE_URL}/appointments/${eventId}?clinicId=${clinicId}`
        : `${API_BASE_URL}/appointments?clinicId=${clinicId}`;
      const method = eventId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        let msg = res.statusText;
        try {
          const errJ = await res.json();
          if (errJ?.message) msg = errJ.message;
        } catch {}
        throw new Error(msg);
      }
      await res.json();
      alert(`Agendamento ${eventId ? "atualizado" : "criado"} com sucesso!`);
      setShowScheduleModal(false);
      setScheduleModalInfo(null);
      loadAppointments();
    } catch (e) {
      console.error("Erro ao salvar agendamento:", e);
      alert("Erro ao salvar agendamento.");
    }
  };

  return (
    <>
      <SuperCalendar
        professionals={calendarProfessionals}
        search=""
        extraEvents={calendarEvents}
        onEditEvent={(event) =>
          handleNewOrEditCalendarEvent({ event })
        }
        onNewEvent={(info) => handleNewOrEditCalendarEvent(info)}
        loading={loading}
        onRefresh={loadAppointments}
      />

      {showScheduleModal && scheduleModalInfo && (
        <AppointmentsFormModal
          open
          onClose={() => {
            setShowScheduleModal(false);
            setScheduleModalInfo(null);
          }}
          professionals={professionals}
          services={services}
          initialData={
            scheduleModalInfo.eventData
              ? scheduleModalInfo.eventData
              : undefined
          }
          initialDate={
            scheduleModalInfo.eventData === null
              ? scheduleModalInfo.date
              : undefined
          }
          initialProfessionalId={
            scheduleModalInfo.eventData === null
              ? scheduleModalInfo.professionalId
              : undefined
          }
          initialTime={
            scheduleModalInfo.eventData === null
              ? scheduleModalInfo.time
              : undefined
          }
          initialEndTime={
            scheduleModalInfo.eventData === null
              ? scheduleModalInfo.endTime
              : undefined
          }
          onSubmit={handleModalSubmit}
          onAddPatient={() => {}}
        />
      )}
      {error && !loading && (
        <div style={{ padding: 12, color: "red" }}>
          Erro ao carregar agendamentos: {error}
          <button
            onClick={loadAppointments}
            style={{ marginLeft: 8 }}
            type="button"
          >
            Recarregar
          </button>
        </div>
      )}
    </>
  );
};

export default CalendarTab;