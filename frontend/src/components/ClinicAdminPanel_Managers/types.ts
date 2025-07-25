// --- PROFISSIONAIS ---

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
  clinicId: number; // camelCase para envio ao backend
  email?: string;
  phone?: string;
  resume?: string;
  color?: string;
}

// --- AGENDAMENTOS ---

export interface Appointment {
  id: number;
  patientId?: number | null;
  patient_name?: string;
  patientName?: string;
  patient_phone?: string;
  patientPhone?: string;
  service_id?: number;
  serviceId?: number;
  service?: string;
  service_name?: string;
  professional_id?: number;
  professionalId: number;
  professional_name?: string;
  date: string;
  time: string;
  endTime?: string; // <-- Adicionado para permitir range de horários
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
  created_at?: string;
  updated_at?: string;
  startUTC?: string;
}

// --- PROCEDIMENTOS ---

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

// --- EVOLUÇÃO CLÍNICA ---

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

// --- PACIENTE ---

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

// --- SERVIÇOS ---

export interface Service {
  id: number;
  name: string;
  duration: string;
  value: string;
  description?: string;
}

export type NewServiceData = Omit<Service, 'id'>;

// --- ESTOQUE ---

export interface StockItem {
  id: number;
  name: string;
  category: string;
  quantity: number;
  minQuantity: number;
  unit: string;
  updatedAt: string;
  validity?: string;
}

// O campo updatedAt é opcional para criação de novo item!
export type NewStockItemData = Omit<StockItem, 'id' | 'updatedAt'> & { updatedAt?: string };

// --- INFORMAÇÕES INSTITUCIONAIS DA CLÍNICA ---

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
  // Localização geocodificada do endereço (resultado do geocoding)
  latitude_address?: number | null;
  longitude_address?: number | null;
  // Localização manual/ajustada pelo mapa
  latitude_map?: number | null;
  longitude_map?: number | null;
}

// --- AUXILIARES PARA HOOKS E HANDLERS ---

export interface ScheduleModalFormData {
  id?: number;
  patientId: number | null;
  serviceId: number | null;
  professionalId: number | null;
  date: string;
  time: string;
  notes?: string;
}

export interface EventForCalendar {
  id: number | string;
  title: string;
  start: string;
  end: string;
  resource?: any;
}