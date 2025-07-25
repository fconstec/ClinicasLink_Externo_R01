import type { Appointment } from "../../components/ClinicAdminPanel_Managers/types";

export interface ScheduleModalInitialData {
  id: number;
  patientId?: number;
  patientName: string;
  patientPhone: string;
  professionalId: number;
  serviceId: number;
  serviceName: string;
  date: string;
  time: string;
  endTime?: string; // <-- ADICIONE esta linha!
  status: Appointment["status"];
}

export type ScheduleModalInfo =
  | { eventData: ScheduleModalInitialData }
  | { eventData: null; date: string; professionalId?: number; time: string; endTime?: string }; // <-- ADICIONE esta linha!