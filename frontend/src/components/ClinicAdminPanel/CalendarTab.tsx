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
import { buildApiUrl } from "@/api/apiPrefix";

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

  /**
   * Tenta carregar appointments usando múltiplos padrões de rota para diagnosticar 404.
   * Assim que identificarmos a rota real usada pelo backend, podemos simplificar.
   */
  const loadAppointments = useCallback(async () => {
    if (!clinicId) return;
    setLoading(true);
    setError(null);

    async function fetchAppointmentsWithFallback(): Promise<Appointment[]> {
      const attempts: { label: string; url: string }[] = [];

      async function build(
        label: string,
        path: string,
        params?: Record<string, any>,
        forceApi = false
      ) {
        const u = await buildApiUrl(
          path,
            params,
            forceApi ? { forceApi: true } : undefined
        );
        attempts.push({ label, url: u });
        return u;
      }

      // Ordem de tentativas (ajuste conforme conhecer seu backend):
      // 1. /appointments?clinicId=
      // 2. /appointments?clinic_id=
      // 3. /clinics/{id}/appointments
      // 4. forceApi /appointments?clinicId=
      // 5. forceApi /clinics/{id}/appointments
      await build("appointments clinicId", "appointments", { clinicId });
      await build("appointments clinic_id", "appointments", { clinic_id: clinicId });
      await build("clinics/:id/appointments", `clinics/${clinicId}/appointments`);
      await build("forceApi appointments clinicId", "appointments", { clinicId }, true);
      await build("forceApi clinics/:id/appointments", `clinics/${clinicId}/appointments`, undefined, true);

      const triedResults: { label: string; url: string; status?: number; ok?: boolean; note?: string }[] = [];

      for (const attempt of attempts) {
        try {
          const res = await fetch(attempt.url);
          triedResults.push({ label: attempt.label, url: attempt.url, status: res.status, ok: res.ok });
          if (res.ok) {
            const data = await res.json();
            console.log("[CalendarTab] Sucesso carregando via", attempt.label, attempt.url);
            if (Array.isArray(data)) {
              return data.map((raw) => normalizeRawAppointment(raw as RawAppointment));
            }
            return [];
          }
          // Continua tentando se não ok
        } catch (err: any) {
          triedResults.push({
            label: attempt.label,
            url: attempt.url,
            note: err?.message || "erro fetch",
          });
        }
      }

      console.warn(
        "[CalendarTab] Todas tentativas falharam para appointments. Tried:",
        triedResults
      );
      throw new Error("Nenhuma rota de appointments respondeu (404?).");
    }

    try {
      const list = await fetchAppointmentsWithFallback();
      setAppointments(list);
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

  /**
   * Criação/atualização com fallback de rota (somente para 404).
   * - Evita duplicar criação: só tenta outra rota se a anterior retornar 404/Not Found.
   */
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
      service: svc.name, // se backend ainda espera
      serviceName: svc.name,
      date: formData.date,
      time: formData.time,
      endTime: formData.endTime,
      status,
      notes: (formData as any).notes,
    };

    interface Attempt {
      label: string;
      method: string;
      url: string;
    }

    async function build(label: string, path: string, params?: Record<string, any>, forceApi = false) {
      return {
        label,
        method: eventId ? "PUT" : "POST",
        url: await buildApiUrl(
          path,
          params,
          forceApi ? { forceApi: true } : undefined
        ),
      } as Attempt;
    }

    // Cria lista de tentativas (ordem semelhante ao fetch de listagem)
    const attempts: Attempt[] = [];
    if (eventId) {
      // Update
      attempts.push(
        await build("update /appointments?clinicId", `appointments/${eventId}`, { clinicId }),
        await build("update /appointments?clinic_id", `appointments/${eventId}`, { clinic_id: clinicId }),
        await build("update /clinics/:id/appointments/:id", `clinics/${clinicId}/appointments/${eventId}`),
        await build("update forceApi /appointments?clinicId", `appointments/${eventId}`, { clinicId }, true),
        await build("update forceApi /clinics/:id/appointments/:id", `clinics/${clinicId}/appointments/${eventId}`, undefined, true)
      );
    } else {
      // Create
      attempts.push(
        await build("create /appointments?clinicId", "appointments", { clinicId }),
        await build("create /appointments?clinic_id", "appointments", { clinic_id: clinicId }),
        await build("create /clinics/:id/appointments", `clinics/${clinicId}/appointments`),
        await build("create forceApi /appointments?clinicId", "appointments", { clinicId }, true),
        await build("create forceApi /clinics/:id/appointments", `clinics/${clinicId}/appointments`, undefined, true)
      );
    }

    const tried: { label: string; url: string; status?: number; ok?: boolean; note?: string }[] = [];

    try {
      for (const attempt of attempts) {
        try {
          const res = await fetch(attempt.url, {
            method: attempt.method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
          tried.push({ label: attempt.label, url: attempt.url, status: res.status, ok: res.ok });
          if (res.ok) {
            await res.json().catch(() => null);
            alert(
              `Agendamento ${eventId ? "atualizado" : "criado"} com sucesso!`
            );
            setShowScheduleModal(false);
            setScheduleModalInfo(null);
            // Recarrega
            loadAppointments();
            return;
          } else if (res.status !== 404) {
            // Se não for 404, não tenta outras rotas para evitar repetição
            let msg = res.statusText;
            try {
              const errJ = await res.json();
              if (errJ?.message) msg = errJ.message;
            } catch {
              /* ignore */
            }
            throw new Error(msg);
          }
          // se 404, tenta próxima
        } catch (err: any) {
          // erro de rede ou fetch
          if (!err?.message?.includes("404")) {
            tried.push({
              label: attempt.label,
              url: attempt.url,
              note: err?.message || "erro",
            });
          }
          // continua
        }
      }

      console.warn(
        "[CalendarTab] Falharam todas as tentativas de salvar appointment",
        tried
      );
      alert("Erro ao salvar agendamento (rota não encontrada).");
    } catch (e) {
      console.error("Erro ao salvar agendamento:", e, tried);
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