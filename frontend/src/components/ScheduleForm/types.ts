import type { Appointment } from "../ClinicAdminPanel_Managers/types";

export type PatientSearchResult = {
  id: number;
  name: string;
  birthDate?: string;
  phone?: string;
  email?: string;
};

export type Service = {
  id: number;
  name: string;
  duration: string;
  description?: string;
  value: string;
};

export interface SubmittedFormData {
  patientId?: number;
  patientName: string;
  patientPhone?: string;
  professionalId: number;
  serviceId: number;
  service: string; // <-- Adicione esta linha!
  date: string;
  time: string;
  endTime?: string; // <-- Mantido aqui!
  status?: Appointment["status"];
  id?: string | number;
}