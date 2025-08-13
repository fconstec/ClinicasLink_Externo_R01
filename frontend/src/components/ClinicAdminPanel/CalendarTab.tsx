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

interface CalendarTabProps {
  professionals: Professional[];
  services: Service[];
}

const CalendarTab: React.FC<CalendarTabProps> = ({ professionals, services }) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleModalInfo, setScheduleModalInfo] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const clinicId = useMemo(() => localStorage.getItem("clinic_id") || "", []);

  const loadAppointments = useCallback(async () => {
    if (!clinicId) return;
    setLoading(true);
    setError(null);
    try {
      const url = `${API_BASE_URL}/appointments?clinicId=${clinicId}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(res.statusText);
      const data = await res.json();
      if (Array.isArray(data)) {
        setAppointments(
          data.map((raw: any) => ({
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
            professionalName:
              raw.professionalName || raw.professional_name || "",
            serviceId:
              raw.serviceId != null
                ? Number(raw.serviceId)
                : raw.service_id != null
                ? Number(raw.service_id)
                : undefined,
            serviceName:
              raw.serviceName || raw.service || raw.service_name || "",
            date: String(raw.date).slice(0, 10),
            time: (raw.time || "").slice(0, 5),
            endTime: raw.endTime ? String(raw.endTime).slice(0, 5) : undefined,
            status: (raw.status || "pending") as AppointmentStatus,
            notes: raw.notes,
            // campos legados mantidos se outros lugares usam:
            service: raw.service,
            service_name: raw.service_name,
            professional_name: raw.professional_name,
          }))
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
        .filter((p) => (p as any).available !== false) // se tiver flag de disponibilidade
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
          calendarProfessionals.some((p) => p.id === Number(a.professionalId))
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

  const handleNewOrEditCalendarEvent = (info: any) => {
    // Abrindo novo
    if (!info?.event) {
      const date =
        info?.date instanceof Date
          ? info.date.toISOString().slice(0, 10)
          : info?.date || "";
      const time =
        info?.time ||
        (info?.date instanceof Date
          ? info.date.toTimeString().slice(0, 5)
          : "");
      const endTime =
        info?.endTime ||
        (info?.end instanceof Date
          ? info.end.toTimeString().slice(0, 5)
          : info?.endTime || "");
      setScheduleModalInfo({
        eventData: null,
        date,
        time,
        endTime,
        professionalId: info?.professionalId
          ? Number(info.professionalId)
          : undefined,
      });
      setShowScheduleModal(true);
      return;
    }

    // Editando: info.event é CalendarEvent
    const ext = info.event.extendedProps || {};
    setScheduleModalInfo({
      eventData: {
        id: Number(ext.id ?? info.event.id),
        patientId: ext.patientId,
        patientName: ext.patientName || "",
        patientPhone: ext.patientPhone,
        professionalId: Number(ext.professionalId ?? info.event.resourceId),
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
      service: svc.name,
      serviceName: svc.name,
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
      alert(
        `Agendamento ${eventId ? "atualizado" : "criado"} com sucesso!`
      );
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