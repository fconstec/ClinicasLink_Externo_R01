// Tipos centrais unificados para procedimentos e imagens.

export interface StoredProcedureImage {
  id: number;
  url: string;
  fileName?: string;
}

export type ProcedureImage = File | StoredProcedureImage;

export interface ProcedureDraft {
  id: number;          // ID persistido; negativo para drafts novos
  date: string;
  description: string;
  professional: string;
  value: string;
  images: ProcedureImage[];
}

export interface PersistedProcedure {
  id: number;
  date: string;
  description: string;
  professional: string;
  value: string;
  images?: StoredProcedureImage[];
}