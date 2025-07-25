import React, { useState, useEffect, useMemo } from "react";
import SuperCalendar from '@/components/SuperCalendar/SuperCalendar';
import AppointmentsFormModal from '@/components/modals/AppointmentsFormModal';
import { mapAppointmentToCalendarEvent } from '@/utils/calendarEventMapper';
import type { Professional, Service, Appointment } from '@/components/ClinicAdminPanel_Managers/types';
import type { SubmittedFormData as ScheduleFormData } from "@/components/ScheduleForm/types";
import type { CalendarEvent } from '@/components/SuperCalendar/types';

const PROFESSIONAL_CALENDAR_COLORS = [
  '#EF4444', '#F97316', '#EAB308', '#22C55E', '#0EA5E9', '#6366F1', '#EC4899',
  '#DC2626', '#EA580C', '#D97706', '#16A34A', '#0284C7', '#4F46E5', '#DB2777'
];

// Paleta de cores para eventos (aleatória/cíclica)
const EVENT_COLOR_PALETTE = [
  "#e6f4ea", // verde claro
  "#fff9db", // amarelo claro
  "#e0ecfc", // azul claro
  "#fae7f3", // rosa claro
  "#fde6e6", // vermelho claro
  "#f9f6e7", // bege claro
  "#edf6f9", // azul acinzentado claro
  "#f3e8fd", // lilás claro
  "#e5f6fd", // ciano clarinho
  "#f8f7fa", // cinza quase branco
  "#ecfdf5", // verde água pastel
  "#fef3c7", // amarelo pastel extra claro
  "#f3f4f6", // cinza super claro
  "#fdf2f8", // rosa pastel super claro
];

interface CalendarTabProps {
  professionals: Professional[];
  services: Service[];
}

const API_APPOINTMENTS = "http://localhost:3001/api/appointments";

const CalendarTab: React.FC<CalendarTabProps> = ({
  professionals,
  services,
}) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleModalInfo, setScheduleModalInfo] = useState<any>(null);

  // Fetch appointments do backend
  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const clinicId = localStorage.getItem("clinic_id");
      const url = `${API_APPOINTMENTS}?clinicId=${clinicId}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(res.statusText);
      const data = await res.json();
      if (Array.isArray(data)) {
        const processed = data
          .map((ap: any): Appointment | null => {
            const idNum = Number(ap.id);
            const profNum = Number(ap.professionalId ?? ap.professional_id ?? ap.professional);
            if (
              isNaN(idNum) ||
              !ap.date ||
              !ap.time ||
              isNaN(profNum)
            ) {
              return null;
            }
            return {
              id: idNum,
              patientId:
                ap.patientId != null
                  ? Number(ap.patientId)
                  : ap.patient_id != null
                  ? Number(ap.patient_id)
                  : undefined,
              patientName: String(ap.patientName || ap.patient_name || ""),
              patientPhone: ap.patientPhone || "",
              serviceId: Number(ap.serviceId ?? ap.service_id),
              service: ap.service || ap.service_name || "",
              service_name: ap.service_name || ap.service || "",
              professionalId: profNum,
              professional_name: ap.professional_name || "",
              date: String(ap.date).slice(0, 10),
              time: String(ap.time).slice(0, 5),
              endTime: ap.endTime ? String(ap.endTime).slice(0, 5) : undefined,
              status: ap.status || "pending",
            };
          })
          .filter((x): x is Appointment => x !== null && typeof x.id === "number" && x.id > 0);
        setAppointments(processed);
      } else {
        setAppointments([]);
      }
    } catch {
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
    // eslint-disable-next-line
  }, []);

  const calendarPageProfessionals = useMemo(() =>
    professionals
      .filter((p) => p.available)
      .map((p, index) => ({
        id: Number(p.id),
        name: p.name,
        color: PROFESSIONAL_CALENDAR_COLORS[index % PROFESSIONAL_CALENDAR_COLORS.length],
      }))
  , [professionals]);

  // Eventos com cores cíclicas/aleatórias
  const calendarFormattedEvents: CalendarEvent[] = useMemo(() =>
    appointments
      .filter((ev) => {
        if (ev.status === "cancelled") return false;
        if (ev.professionalId === undefined || isNaN(Number(ev.professionalId))) return false;
        const professionalCalendarEntryExists = calendarPageProfessionals.find(
          (pCal) => pCal.id === Number(ev.professionalId)
        );
        if (!professionalCalendarEntryExists) {
          return false;
        }
        return true;
      })
      .map((appt, idx) => {
        const baseEvent = mapAppointmentToCalendarEvent(appt);
        const color = EVENT_COLOR_PALETTE[idx % EVENT_COLOR_PALETTE.length];
        if (!baseEvent) return null;
        // Aqui usamos backgroundColor (e color para garantir)
        return { ...baseEvent, backgroundColor: color, color } as CalendarEvent;
      })
      .filter((e): e is CalendarEvent => !!e)
  , [appointments, calendarPageProfessionals]);

  // Handler para novo evento ou edição
  const handleNewOrEditCalendarEvent = (info: any) => {
    if (!info.eventData) {
      let initialDate = "";
      let initialTime = "";
      let initialEndTime = "";
      let initialProfessionalId = undefined;

      if (info?.date instanceof Date) {
        initialDate = info.date.toISOString().slice(0, 10); // YYYY-MM-DD
        initialTime = info.date.toTimeString().slice(0,5);  // HH:MM
      } else if (typeof info?.date === "string") {
        initialDate = info.date;
        initialTime = info.time || "";
      }

      if (info?.endTime instanceof Date) {
        initialEndTime = info.endTime.toTimeString().slice(0,5);
      } else if (typeof info?.endTime === "string") {
        initialEndTime = info.endTime;
      } else if (info?.end instanceof Date) {
        initialEndTime = info.end.toTimeString().slice(0,5);
      }

      if (info?.professionalId) {
        initialProfessionalId = info.professionalId;
      }

      setScheduleModalInfo({
        initialDate,
        initialTime,
        initialEndTime,
        initialProfessionalId,
        initialData: undefined
      });
    } else {
      setScheduleModalInfo({
        initialData: info.eventData,
        initialDate: undefined,
        initialTime: undefined,
        initialEndTime: undefined,
        initialProfessionalId: undefined
      });
    }
    setShowScheduleModal(true);
  };

  // Função de submit do modal que salva no backend
  const handleModalSubmit = async (formData: ScheduleFormData, eventIdAsId?: string | number) => {
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

    const payload = {
      patientId: formData.patientId,
      patientName: formData.patientName,
      patientPhone: formData.patientPhone,
      professionalId: profNum,
      service: svc.name,
      serviceId: servNum,
      date: formData.date,
      time: formData.time,
      endTime: formData.endTime,
      status: formData.status,
    };

    try {
      const clinicId = localStorage.getItem("clinic_id");
      const url = eventId
        ? `http://localhost:3001/api/appointments/${eventId}?clinicId=${clinicId}`
        : `http://localhost:3001/api/appointments?clinicId=${clinicId}`;
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
          if (errJson && errJson.message) errMsg = errJson.message;
        } catch {}
        throw new Error(errMsg);
      }

      await res.json();

      alert(
        `Agendamento ${eventId ? "atualizado" : "criado"} com sucesso!`
      );
      setShowScheduleModal(false);
      setScheduleModalInfo(undefined);
      await fetchAppointments(); // Recarrega os dados do backend!
    } catch (err) {
      console.error('Erro ao salvar agendamento:', err);
      alert(`Erro ao salvar agendamento`);
    }
  };

  return (
    <>
      <SuperCalendar
        professionals={calendarPageProfessionals}
        search={""}
        extraEvents={calendarFormattedEvents}
        onEditEvent={(eventInfo) =>
          handleNewOrEditCalendarEvent({
            eventData:
              eventInfo.extendedProps ||
              eventInfo.event?.extendedProps ||
              eventInfo,
          })
        }
        onNewEvent={(info) => handleNewOrEditCalendarEvent(info)}
        loading={loading}
      />
      {showScheduleModal && scheduleModalInfo && (
        <AppointmentsFormModal
          open={showScheduleModal}
          onClose={() => {
            setShowScheduleModal(false);
            setScheduleModalInfo(undefined);
          }}
          professionals={professionals}
          services={services}
          initialDate={scheduleModalInfo?.initialDate}
          initialTime={scheduleModalInfo?.initialTime}
          initialEndTime={scheduleModalInfo?.initialEndTime}
          initialProfessionalId={scheduleModalInfo?.initialProfessionalId}
          initialData={scheduleModalInfo?.initialData}
          onSubmit={handleModalSubmit}
          onAddPatient={() => {}}
        />
      )}
    </>
  );
};

export default CalendarTab;