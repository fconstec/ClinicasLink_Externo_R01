// =============================================================
// PROFISSIONAIS
// =============================================================

export interface Professional {
  id: number;
  name: string;
  specialty: string;
  photo: string;
  available: boolean;
  clinic_id?: number;   // snake_case (backend cru)
  clinicId?: number;    // normalizado
  email?: string;
  phone?: string;
  resume?: string;
  color?: string;

  active?: boolean;           // soft delete: false = desativado
  deleted_at?: string | null; // reservado se quiser implementar depois
  created_at?: string;
  updated_at?: string;
  createdAt?: string;
  updatedAt?: string;

  // Derivados (frontend only)
  isInactive?: boolean;
  photoUrl?: string;
  displayName?: string;
}

export interface NewProfessionalData {
  name: string;
  specialty: string;
  photo: string;
  available: boolean;
  clinicId: number;
  email?: string;
  phone?: string;
  resume?: string;
  color?: string;
}

export type UpdateProfessionalData = Partial<
  Omit<Professional, "id" | "clinic_id" | "isInactive" | "displayName" | "photoUrl">
> & { id: number; clinicId?: number };

// =============================================================
// AGENDAMENTOS
// =============================================================

export type AppointmentStatus = "pending" | "confirmed" | "completed" | "cancelled";

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

  professionalSpecialty?: string;
  professional_specialty?: string;

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

  [key: string]: any;
}

export interface Appointment {
  id: number;
  patientId?: number;
  patientName: string;
  patientPhone?: string;

  serviceId?: number;
  serviceName?: string;
  service?: string;

  professionalId: number;
  professionalName?: string;
  professionalSpecialty?: string;

  date: string;
  time: string;
  endTime?: string;

  status: AppointmentStatus;
  notes?: string;

  createdAt?: string;
  updatedAt?: string;
  startUTC?: string;
  endUTC?: string;
  utcDateTime?: Date;
}

export interface NewAppointmentData {
  patientId?: number | null;
  patientName?: string;
  patientPhone?: string;
  professionalId: number;
  professionalName?: string;          // snapshot
  professionalSpecialty?: string;     // snapshot
  serviceId?: number;
  serviceName?: string;
  date: string;
  time: string;
  endTime?: string;
  status: AppointmentStatus;
  notes?: string;
}

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
  url?: string;
  fileName?: string;
  filename?: string;
  path?: string;
  filePath?: string;
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
  appointments?: Appointment[];
  photoUrl?: string;
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
// INFORMAÇÕES INSTITUCIONAIS
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
  latitude?: number | null;
  longitude?: number | null;
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