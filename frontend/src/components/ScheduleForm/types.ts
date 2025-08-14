import type { AppointmentStatus } from "@/components/ClinicAdminPanel_Managers/types";

export interface PatientSearchResult {
  id: number;
  name: string;
  birthDate?: string;
  phone?: string;
  email?: string;
}

/**
 * Dados consolidados submetidos pelo formulário de agendamento.
 * Padronizamos IDs como number para evitar unions e simplificar validações.
 * serviceName: opcional, apenas para exibição / logging (backend usa serviceId).
 */
export interface SubmittedFormData {
  id?: number;
  patientId?: number;

  patientName: string;
  patientPhone?: string;

  professionalId: number;
  serviceId: number;
  serviceName?: string;

  date: string;       // YYYY-MM-DD
  time: string;       // HH:mm
  endTime?: string;   // HH:mm

  status: AppointmentStatus; // manter obrigatório simplifica o restante do código
  notes?: string;
}