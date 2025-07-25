export interface Clinic {
  id: number;
  name: string;
  specialties?: string[];
  customSpecialties?: string[];
  coverImage?: string;
  rating?: number;
  reviews?: number;
  address?: string;
  featured?: boolean | null;
  isNew?: boolean | null;
  created_at?: string;
  latitude?: number;    
  longitude?: number;  
  phone?: string;               // Adicionado
  // Adicione outros campos usados nos cards, se necessário:
  // description?: string;
  // email?: string;
}