import type { Appointment, AppointmentStatus } from "@/components/ClinicAdminPanel_Managers/types";

/**
 * Profissional exibido como “resource” no calendário (coluna / linha).
 */
export interface CalendarProfessional {
  id: number;
  name: string;
  color: string;
}

/**
 * Evento genérico. Use o genérico T para tipar extendedProps.
 */
export interface CalendarEvent<T = any> { // usando any para evitar propagação de unknown em filtros
  id: string;
  title: string;
  start: string;
  end: string;
  allDay?: boolean;
  resourceId: string;        // normalizado como string
  status: AppointmentStatus;
  patientName?: string;
  serviceName?: string;
  backgroundColor?: string;
  color?: string;
  extendedProps: T;
}

/**
 * Evento especializado para agendamentos.
 */
export type AppointmentCalendarEvent = CalendarEvent<
  Appointment & {
    displayTitle?: string;
    durationMinutes?: number;
  }
>;

export interface SuperCalendarProps {
  professionals: CalendarProfessional[];
  search: string;
  extraEvents: CalendarEvent[]; // pode ser AppointmentCalendarEvent[]
  onEditEvent: (eventInfo: CalendarEvent) => void;
  onNewEvent: (info: {
    date?: string | Date;
    professionalId?: number | string;
    time?: string;
    endTime?: string;
    event?: CalendarEvent;
  }) => void;
  loading?: boolean;
  onRefresh?: () => void | Promise<void>; // <-- adicionado
  // error?: string; // habilitar se quiser exibir erro interno
}