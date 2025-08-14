// =============================================================
// PROFISSIONAIS
// =============================================================

export interface Professional {
  id: number;
  name: string;
  specialty: string;
  photo: string;
  available: boolean;
  // Campo vindo do backend em snake_case; normalizar para clinicId quando consumir.
  clinic_id?: number;
  clinicId?: number;
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
  clinicId: number; // camelCase para envio
  email?: string;
  phone?: string;
  resume?: string;
  color?: string;
}

// =============================================================
// AGENDAMENTOS
// =============================================================

export type AppointmentStatus = "pending" | "confirmed" | "completed" | "cancelled";

/**
 * Forma crua que pode vir do backend (múltiplas variações).
 * Usada APENAS como input para normalização.
 */
export interface RawAppointment {
  id: number | string;
  patientId?: number | null;
  patient_id?: number | null;
  patientName?: string;
  patient_name?: string;
  patient_name_full?: string;
  patientPhone?: string;
  patient_phone?: string;

  serviceId?: number | string | null;
  service_id?: number | string | null;
  serviceName?: string;
  service_name?: string;
  service?: string;

  professionalId?: number | string | null;
  professional_id?: number | string | null;
  professionalIdLegacy?: number | string | null;
  professionalName?: string;
  professional_name?: string;
  professional?: string;

  date?: string;
  time?: string;
  endTime?: string;
  end_time?: string;
  endtime?: string;

  status?: AppointmentStatus | string;
  notes?: string;

  created_at?: string;
  updated_at?: string;
  createdAt?: string;
  updatedAt?: string;

  startUTC?: string;
  start_utc?: string;
  endUTC?: string;
  end_utc?: string;
  utc_date_time?: string;
  utcDateTime?: string;

  [key: string]: any; // tolera extras
}

/**
 * Forma normalizada: usar somente esta internamente.
 */
export interface Appointment {
  id: number;
  patientId?: number;
  patientName: string;         // tornar obrigatório simplifica renderizações
  patientPhone?: string;

  serviceId?: number;
  serviceName?: string;
  service?: string;            // opcional (pode remover depois se for redundante)

  professionalId: number;
  professionalName?: string;

  date: string;                // YYYY-MM-DD
  time: string;                // HH:MM
  endTime?: string;            // HH:MM

  status: AppointmentStatus;
  notes?: string;

  createdAt?: string;
  updatedAt?: string;

  startUTC?: string;
  endUTC?: string;
  utcDateTime?: Date;          // enriquecido no front (derivado)
}

/**
 * Dados para criar/atualizar (sem id).
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
 * Dados submetidos pelo formulário (status opcional para fallback).
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

export interface ScheduleModalFormData extends SubmittedFormData {
  id?: number;
}

export type AppointmentMapper = (raw: RawAppointment) => Appointment;

// =============================================================
// PROCEDIMENTOS
// =============================================================

export interface ProcedureImage {
  id: number;
  url: string;
  fileName?: string;
  procedure_id?: number; // vindo do backend
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
  tcle_concordado: boolean; // manter se backend envia snake_case
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
  appointments?: Appointment[];
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
export type NewServiceData = Omit<Service, "id">;

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
  clinicId?: number;
}

export type NewStockItemData = Omit<StockItem, "id" | "updatedAt"> & {
  updatedAt?: string;
};

// =============================================================
// INFORMAÇÕES INSTITUCIONAIS DA CLÍNICA
// (Aqui ainda há snake_case vindo do backend; considere normalizar depois.)
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
  latitude?: number | null;   // se decidir normalizar
  longitude?: number | null;  // se decidir normalizar
}

// =============================================================
// EVENTOS DE CALENDÁRIO
// =============================================================

export interface EventForCalendar {
  id: number | string;
  title: string;
  start: string;
  end: string;
  resource?: any;
}