// Tipos centrais unificados para procedimentos e imagens.

export interface StoredProcedureImage {
  id: number;          // ID retornado pelo backend
  url: string;         // Pode ser absoluta ou relativa (/uploads/...)
  fileName?: string;
}

export type ProcedureImage = File | StoredProcedureImage;

export interface ProcedureDraft {
  id: number;          // ID persistido; use valor negativo para drafts novos
  date: string;
  description: string;
  professional: string;
  value: string;
  images: ProcedureImage[];
}

// Caso precise converter de um tipo Procedure externo,
// crie um adaptador mantendo a estrutura mínima abaixo:
export interface PersistedProcedure {
  id: number;
  date: string;
  description: string;
  professional: string;
  value: string;
  images?: StoredProcedureImage[];
}