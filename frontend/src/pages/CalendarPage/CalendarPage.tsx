import React, { useState, useEffect, useMemo } from "react";
import { SuperCalendar } from "src/components/SuperCalendar";
import type { CalendarEvent, CalendarProfessional } from "src/components/SuperCalendar/types";
import AppointmentsFormModal from "../../components/modals/AppointmentsFormModal";
import type { SubmittedFormData } from "../../components/ScheduleForm/types";
import CalendarHeader from "./CalendarHeader";
import { useProfessionals } from "./useProfessionals";
import { useAppointments } from "./useAppointments";
import { useServices } from "./useServices";
import { getErrorMessage } from "./scheduleHelpers";
import type { ScheduleModalInfo } from "./types";
import type { Service, Appointment, Professional } from "../../components/ClinicAdminPanel_Managers/types";
import { mapAppointmentToCalendarEvent } from "src/utils/calendarEventMapper";

const PROFESSIONAL_COLORS = [
  "#0ea5e9", "#e11d48", "#22c55e", "#f59e42", "#a855f7",
  "#f43f5e", "#0d9488", "#fbbf24", "#6366f1", "#84cc16",
];

const CalendarPage: React.FC = () => {
  const [search, setSearch] = useState("");
  const [showScheduleModal, setShowScheduleModal] = useState<boolean>(false);
  const [scheduleModalInfo, setScheduleModalInfo] = useState<ScheduleModalInfo | null>(null);

  const { professionals, loading: loadingProfessionals, fetchProfessionals } = useProfessionals();
  const { appointments, loading: loadingAppointments, fetchAppointments } = useAppointments();
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

  // Usa o mapper para converter todos os appointments em eventos de calendário
  const calendarEvents = useMemo<CalendarEvent[]>(() => {
    return appointments
      .filter((ev: Appointment) => ev.status !== "cancelled" && ev.professionalId != null)
      .map(mapAppointmentToCalendarEvent)
      .filter((e): e is CalendarEvent => e !== null); // type guard correto!
  }, [appointments]);

  useEffect(() => {
    // Debug extra: Veja os appointments puros antes do mapeamento
    console.log("Appointments brutos recebidos no CalendarPage:", appointments);
  }, [appointments]);

  const handleSaveSchedule = async (
    data: SubmittedFormData,
    eventIdAsId?: string | number
  ) => {
    const eventId =
      typeof eventIdAsId === "string"
        ? parseInt(eventIdAsId, 10)
        : eventIdAsId;

    // LOG: Veja os dados recebidos
    console.log("handleSaveSchedule CHAMADO:", data, eventId);

    if (!data.patientName.trim()) {
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

    const payload = {
      patientId: data.patientId,
      patientName: data.patientName,
      patientPhone: data.patientPhone,
      professionalId: profNum,
      service: svc.name,
      serviceId: servNum,
      date: data.date,
      time: data.time,
      endTime: data.endTime,
      status: data.status,
    };

    // LOG: Veja o payload que será enviado
    console.log("Payload enviado ao backend:", payload);

    try {
      // @ts-ignore
      const clinicId = localStorage.getItem("clinic_id");
      const url = eventId
        ? `http://localhost:3001/api/appointments/${eventId}?clinicId=${clinicId}`
        : `http://localhost:3001/api/appointments?clinicId=${clinicId}`;
      const method = eventId ? "PUT" : "POST";

      // LOG: Veja o endpoint e método
      console.log("Enviando para:", url, "método:", method);

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      // LOG: Veja o status da resposta
      console.log("Resposta do fetch:", res);

      if (!res.ok) {
        let errMsg = res.statusText;
        try {
          const errJson = await res.json();
          if (errJson && errJson.message) errMsg = errJson.message;
        } catch {}
        throw new Error(errMsg);
      }

      // O objeto salvo já vem do backend com id correto.
      const saved = await res.json();
      console.log("Agendamento salvo do backend:", saved);

      alert(
        `Agendamento ${eventId ? "atualizado" : "criado"} com sucesso!`
      );
      setShowScheduleModal(false);
      setScheduleModalInfo(null);

      // Não use nenhum setAppointments manual aqui!
      // Apenas recarregue os agendamentos reais do backend:
      fetchAppointments();
    } catch (err) {
      console.error('Erro ao salvar agendamento:', err);
      alert(`Erro: ${getErrorMessage(err)}`);
    }
  };

  const handleNewOrEditCalendarEvent = (info?: {
    date?: string;
    professionalId?: number;
    time?: string;
    endTime?: string;
    eventData?: CalendarEvent;
  }) => {
    const evProps = info?.eventData?.extendedProps;
    if (evProps && typeof evProps.id === "number") {
      setScheduleModalInfo({
        eventData: {
          id: evProps.id,
          patientId: evProps.patientId ?? undefined,
          patientName: evProps.patientName ?? "",
          patientPhone: evProps.patientPhone ?? "",
          professionalId: evProps.professionalId,
          serviceId: evProps.serviceId!,
          serviceName: evProps.serviceName!,
          date: evProps.date,
          time: evProps.time,
          endTime: evProps.endTime,
          status: evProps.status,
        },
      });
    } else {
      setScheduleModalInfo({
        eventData: null,
        date: info?.date ?? "",
        professionalId: info?.professionalId,
        time: info?.time ?? "",
        endTime: info?.endTime ?? "",
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
        professionals={calendarProfs as CalendarProfessional[]}
        search={search}
        extraEvents={calendarEvents as CalendarEvent[]}
        onEditEvent={(event: CalendarEvent) =>
          handleNewOrEditCalendarEvent({ eventData: event.extendedProps })
        }
        onNewEvent={handleNewOrEditCalendarEvent}
        loading={loadingAppointments || loadingProfessionals}
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
          initialData={scheduleModalInfo.eventData ?? undefined}
          initialDate={
            scheduleModalInfo.eventData === null
              ? (scheduleModalInfo.date ?? "")
              : undefined
          }
          initialProfessionalId={
            scheduleModalInfo.eventData === null
              ? scheduleModalInfo.professionalId
              : undefined
          }
          initialTime={
            scheduleModalInfo.eventData === null
              ? (scheduleModalInfo.time ?? "")
              : undefined
          }
          initialEndTime={
            scheduleModalInfo.eventData === null
              ? (scheduleModalInfo.endTime ?? "")
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