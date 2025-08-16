// Centraliza e padroniza exports do módulo de procedimentos de paciente.

import PatientProceduresForm from "./PatientProceduresForm";
import ProcedureRow from "./ProcedureRow";
import ProcedureImageGalleryModal from "./ProcedureImageGalleryModal";

// Exports principais (nomeados)
export { PatientProceduresForm, ProcedureRow, ProcedureImageGalleryModal };

// Alias para compatibilidade retro (caso o código antigo ainda importe ProcedureImageGallery)
export { ProcedureImageGalleryModal as ProcedureImageGallery };

// Re-exporta tudo do hook (tipos + hook)
export * from "./useProcedureForm";