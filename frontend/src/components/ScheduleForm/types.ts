import type { AppointmentStatus } from "@/components/ClinicAdminPanel_Managers/types";

export interface PatientSearchResult {
  id: number;
  name: string;
  birthDate?: string;
  phone?: string;
  email?: string;
}

export interface SubmittedFormData {
  id?: number | string;
  patientId?: number;
  patientName: string;
  patientPhone?: string;
  professionalId: number | string;
  serviceId: number | string;
  serviceName?: string; // ou 'service' se preferir manter nome antigo
  date: string;
  time: string;
  endTime?: string;
  status?: AppointmentStatus;
  notes?: string;
}