// =============================================================
// PROFISSIONAIS
// =============================================================

export interface Professional {
  id: number;
  name: string;
  specialty: string;
  photo: string;
  available: boolean;
  clinic_id: number; // snake_case vindo do backend
  email?: string;
  phone?: string;
  resume?: string;
  color?: string;
}

export interface NewProfessionalData {
  name: string;
  specialty: string;
  photo: string;
  available: boolean;
  clinicId: number;      // camelCase para envio ao backend
  email?: string;
  phone?: string;
  resume?: string;
  color?: string;
}

// =============================================================
// AGENDAMENTOS
// =============================================================

export type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

/**
 * Forma "crua" (RawAppointment) aceita múltiplas variações de nome
 * que podem vir do backend (snake + camel). Use um mapper para
 * normalizar em Appointment (normalizado).
 */
export interface RawAppointment {
  id: number | string;
  patientId?: number | null;
  patient_id?: number | null;
  patient_name?: string;
  patientName?: string;
  patient_phone?: string;
  patientPhone?: string;
  service_id?: number;
  serviceId?: number;
  service?: string;
  service_name?: string;
  professional_id?: number;
  professionalId?: number;
  professional_name?: string;
  date?: string;
  time?: string;
  endTime?: string;
  status?: AppointmentStatus | string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
  startUTC?: string;
}

/**
 * Forma normalizada que o front DEVERIA usar internamente.
 * (Pode gradualmente substituir o uso direto de campos snake/camel mistos.)
 */
export interface Appointment {
  id: number;
  patientId?: number;
  patientName?: string;
  patientPhone?: string;
  serviceId?: number;
  serviceName?: string;             // nome único normalizado
  professionalId: number;
  professionalName?: string;
  date: string;                      // YYYY-MM-DD
  time: string;                      // HH:MM
  endTime?: string;                  // HH:MM
  status: AppointmentStatus;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
  startUTC?: string;
  // Campos legados (opcional manter enquanto não limpa tudo)
  service?: string;
  service_name?: string;
  professional_name?: string;
}

/**
 * Dados para criar/atualizar (sem id). Se quiser tornar status opcional
 * (com fallback 'pending'), deixe status?: AppointmentStatus.
 */
export interface NewAppointmentData {
  patientId?: number | null;
  patientName?: string;
  patientPhone?: string;
  professionalId: number;
  serviceId?: number;
  serviceName?: string;
  date: string;
  time: string;
  endTime?: string;
  status: AppointmentStatus;
  notes?: string;
}

/**
 * SubmittedFormData usado pelo form de agendamento.
 * Tornamos status opcional para permitir fallback no código.
 * Incluímos endTime e notes para não gerar erros ao referenciar.
 */
export interface SubmittedFormData {
  patientId?: number | null;
  patientName?: string;
  patientPhone?: string;
  serviceId: number | string;
  professionalId: number | string;
  date: string;
  time: string;
  endTime?: string;
  status?: AppointmentStatus;
  notes?: string;
}

/**
 * ScheduleModalFormData (caso seja usado em outro local).
 * Pode simplesmente ser um alias de SubmittedFormData + id:
 */
export interface ScheduleModalFormData extends SubmittedFormData {
  id?: number;
}

/**
 * Função util esperada para mapear RawAppointment -> Appointment.
 * (Implementação fica em outro arquivo, mas o tipo ajuda.)
 */
export type AppointmentMapper = (raw: RawAppointment) => Appointment;

// =============================================================
// PROCEDIMENTOS
// =============================================================

export interface ProcedureImage {
  id: number;
  url: string;
  fileName?: string;
  procedure_id?: number;
}

export interface Procedure {
  id: number;
  date: string;
  description: string;
  professional: string;
  value: string;
  images?: ProcedureImage[];
}

// =============================================================
// EVOLUÇÃO CLÍNICA
// =============================================================

export interface Evolution {
  id: number;
  anamnese: string;
  tcle: string;
  patientId: number;
  professionalId: number;
  tcle_concordado: boolean;
  tcle_nome: string;
  tcle_data_hora: string;
  createdAt: string;
}

// =============================================================
// PACIENTE
// =============================================================

export interface Patient {
  id: number;
  name: string;
  birthDate: string;
  phone: string;
  email: string;
  address: string;
  photo?: string | null;
  images?: string[];
  procedures?: Procedure[];
  evolutions?: Evolution[];
  anamnesis?: string;
  tcle?: string;
  appointments?: Appointment[]; // já usando forma normalizada
}

// =============================================================
// SERVIÇOS
// =============================================================

export interface Service {
  id: number;
  name: string;
  duration: string;
  value: string;
  description?: string;
}
export type NewServiceData = Omit<Service, 'id'>;

// =============================================================
// ESTOQUE
// =============================================================

export interface StockItem {
  id: number;
  name: string;
  category: string;
  quantity: number;
  minQuantity: number;
  unit: string;
  updatedAt: string;
  validity?: string;
  clinicId?: number; // opcional (interno) se precisar identificar a clínica
}

export type NewStockItemData = Omit<StockItem, 'id' | 'updatedAt'> & {
  updatedAt?: string;
};

// =============================================================
// INFORMAÇÕES INSTITUCIONAIS DA CLÍNICA
// =============================================================

export interface ClinicInfoData {
  clinicId: string;
  name?: string;
  email?: string;
  phone?: string;
  street?: string;
  number?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  cep?: string;
  description?: string;
  website?: string;
  openingHours?: string;
  coverUrl?: string | null;
  galleryUrls?: string[];
  specialties?: string[];
  customSpecialties?: string[];
  latitude_address?: number | null;
  longitude_address?: number | null;
  latitude_map?: number | null;
  longitude_map?: number | null;
}

// =============================================================
// AUXILIARES PARA CALENDÁRIO / EVENTOS
// =============================================================

export interface EventForCalendar {
  id: number | string;
  title: string;
  start: string;
  end: string;
  resource?: any;
}