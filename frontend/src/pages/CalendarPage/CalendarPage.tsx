import React, { useState, useEffect, useMemo } from "react";
import { SuperCalendar } from "src/components/SuperCalendar";
import type {
  CalendarEvent,
  CalendarProfessional,
} from "src/components/SuperCalendar/types";
import AppointmentsFormModal from "../../components/modals/AppointmentsFormModal";
import type { SubmittedFormData } from "../../components/ScheduleForm/types";
import CalendarHeader from "./CalendarHeader";
import { useProfessionals } from "./useProfessionals";
import { useAppointments } from "./useAppointments";
import { useServices } from "./useServices";
import { getErrorMessage } from "./scheduleHelpers";
import type {
  Appointment,
  Professional,
  AppointmentStatus,
} from "../../components/ClinicAdminPanel_Managers/types";
import { mapAppointmentToCalendarEvent } from "src/utils/calendarEventMapper";
import { API_BASE_URL } from "../../api/apiBase";

const PROFESSIONAL_COLORS = [
  "#0ea5e9",
  "#e11d48",
  "#22c55e",
  "#f59e42",
  "#a855f7",
  "#f43f5e",
  "#0d9488",
  "#fbbf24",
  "#6366f1",
  "#84cc16",
];

interface ScheduleModalEditData {
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
}

type ScheduleModalInfo =
  | {
      eventData: ScheduleModalEditData;
    }
  | {
      eventData: null;
      date: string;
      professionalId?: number;
      time: string;
      endTime?: string;
    };

const CalendarPage: React.FC = () => {
  const [search, setSearch] = useState("");
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleModalInfo, setScheduleModalInfo] =
    useState<ScheduleModalInfo | null>(null);

  const {
    professionals,
    loading: loadingProfessionals,
    fetchProfessionals,
  } = useProfessionals();
  const {
    appointments,
    loading: loadingAppointments,
    fetchAppointments,
  } = useAppointments();
  const { services, fetchServices } = useServices();

  useEffect(() => {
    fetchProfessionals();
    fetchAppointments();
    fetchServices();
  }, [fetchProfessionals, fetchAppointments, fetchServices]);

  const calendarProfs = useMemo<CalendarProfessional[]>(
    () =>
      professionals.map((p: Professional, i: number) => ({
        id: p.id,
        name: p.name,
        color: PROFESSIONAL_COLORS[i % PROFESSIONAL_COLORS.length],
      })),
    [professionals]
  );

  const calendarEvents: CalendarEvent[] = useMemo(() => {
    return appointments
      .filter(
        (a: Appointment) =>
          a.status !== "cancelled" && a.professionalId != null
      )
      .map((appt) => mapAppointmentToCalendarEvent(appt, { services }))
      .filter((e): e is CalendarEvent => e !== null);
  }, [appointments, services]);

  useEffect(() => {
    console.log("Appointments (CalendarPage):", appointments);
  }, [appointments]);

  const handleSaveSchedule = async (
    data: SubmittedFormData,
    eventIdAsId?: string | number
  ) => {
    const eventId =
      typeof eventIdAsId === "string"
        ? parseInt(eventIdAsId, 10)
        : eventIdAsId;

    if (!data.patientName?.trim()) {
      alert("Nome do paciente é obrigatório.");
      return;
    }
    const profNum = Number(data.professionalId);
    const servNum = Number(data.serviceId);
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

    const status: AppointmentStatus = (data.status || "pending") as AppointmentStatus;
    const serviceName =
      (data as any).serviceName || (data as any).service || svc.name;

    const payload = {
      patientId: data.patientId,
      patientName: data.patientName,
      patientPhone: data.patientPhone,
      professionalId: profNum,
      service: serviceName,
      serviceId: servNum,
      date: data.date,
      time: data.time,
      endTime: data.endTime,
      status,
      // notes: data.notes,
    };

    try {
      const clinicId = localStorage.getItem("clinic_id") || "";
      if (!clinicId) {
        alert("Clínica não identificada.");
        return;
      }
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
        let errMsg = res.statusText;
        try {
          const errJson = await res.json();
          if (errJson?.message) errMsg = errJson.message;
        } catch {}
        throw new Error(errMsg);
      }
      await res.json();
      alert(
        `Agendamento ${eventId ? "atualizado" : "criado"} com sucesso!`
      );
      setShowScheduleModal(false);
      setScheduleModalInfo(null);
      fetchAppointments();
    } catch (err) {
      console.error("Erro ao salvar agendamento:", err);
      alert(`Erro: ${getErrorMessage(err)}`);
    }
  };

  const handleNewOrEditCalendarEvent = (info?: {
    date?: string;
    professionalId?: number;
    time?: string;
    endTime?: string;
    event?: CalendarEvent;
  }) => {
    const ev = info?.event;
    if (ev?.extendedProps) {
      const ext = ev.extendedProps;
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
    } else {
      setScheduleModalInfo({
        eventData: null,
        date: info?.date || "",
        professionalId: info?.professionalId,
        time: info?.time || "",
        endTime: info?.endTime || "",
      });
    }
    setShowScheduleModal(true);
  };

  return (
    <div className="p-4 md:p-6">
      <CalendarHeader
        search={search}
        setSearch={setSearch}
        onAddSchedule={() =>
          handleNewOrEditCalendarEvent({
            date: new Date().toISOString().slice(0, 10),
          })
        }
      />

      <SuperCalendar
        professionals={calendarProfs}
        search={search}
        extraEvents={calendarEvents}
        onEditEvent={(event) =>
          handleNewOrEditCalendarEvent({ event })
        }
        onNewEvent={(info) => handleNewOrEditCalendarEvent(info)}
        loading={loadingAppointments || loadingProfessionals}
        onRefresh={fetchAppointments}
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
          onSubmit={handleSaveSchedule}
          onAddPatient={() => {}}
        />
      )}
    </div>
  );
};

export default CalendarPage;