export interface StoredProcedureImage {
  id: number;               // id no backend
  url: string;              // URL (relativa ou absoluta)
  fileName?: string;
}

export type ProcedureImage = File | StoredProcedureImage;

export interface ProcedureDraft {
  id: number;               // id persistido; negativo/zero se temporário
  date: string;
  description: string;
  professional: string;
  value: string;
  images: ProcedureImage[];
}

/**
 * Versão persistida mínima para conversão.
 * Se você já possui um tipo Procedure em outro lugar, alinhe / remova este.
 */
export interface PersistedProcedure {
  id: number;
  date: string;
  description: string;
  professional: string;
  value: string;
  images?: StoredProcedureImage[];
}