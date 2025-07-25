export interface CalendarProfessional {
  id: number;
  name: string;
  color: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string; // <-- Remova o "?" para garantir sempre preenchido!
  allDay?: boolean;
  resourceId: string | number;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  patientName?: string;
  serviceName?: string;
  extendedProps: any;
  [key: string]: any;
}