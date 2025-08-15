import { useCallback, useState } from "react";
import {
  ProcedureDraft,
  ProcedureImage,
  PersistedProcedure,
  StoredProcedureImage,
} from "../../../../types/procedureDraft";
import {
  addPatientProcedure,
  // updatePatientProcedure, // Descomente se quiser realmente atualizar procedimentos existentes
} from "../../../../api";

/**
 * Converte um procedimento persistido para draft interno.
 */
export function toDraft(p: PersistedProcedure): ProcedureDraft {
  return {
    id: p.id,
    date: p.date || "",
    description: p.description || "",
    professional: p.professional || "",
    value: p.value || "",
    images: (p.images || []) as StoredProcedureImage[],
  };
}

interface SubmitAllOptions {
  onSave?: (persisted: PersistedProcedure[]) => void;
  onCancel?: () => void;
}

export function useProcedureForm(
  patientId: number,
  clinicId?: string,
  initial?: PersistedProcedure[]
) {
  const [rowData, setRowData] = useState<ProcedureDraft[]>(
    (initial || []).map(toDraft)
  );
  const [submitting, setSubmitting] = useState(false);
  const [tempIdCounter, setTempIdCounter] = useState(-1);

  const addProcedureRow = useCallback(() => {
    setRowData(prev => [
      ...prev,
      {
        id: tempIdCounter, // ID temporário negativo
        date: "",
        description: "",
        professional: "",
        value: "",
        images: [],
      },
    ]);
    setTempIdCounter(c => c - 1);
  }, [tempIdCounter]);

  const removeProcedure = useCallback((index: number) => {
    setRowData(prev => prev.filter((_, i) => i !== index));
  }, []);

  const handleRowChange = useCallback(
    (index: number, update: Partial<ProcedureDraft>) => {
      setRowData(prev =>
        prev.map((p, i) => (i === index ? { ...p, ...update } : p))
      );
    },
    []
  );

  /**
   * Monta payload para criação/atualização conforme API.
   * Ajuste aqui se o backend exigir outros campos (ex.: status, tipo, etc).
   */
  function buildPayload(draft: ProcedureDraft) {
    return {
      date: draft.date || null,
      description: draft.description || "",
      professional: draft.professional || "",
      value: draft.value || "",
      clinicId: clinicId || "", // obrigatório na sua assinatura (Omit<Procedure,"id"> & { clinicId: string })
    };
  }

  const submitAll = useCallback(
    async ({ onSave, onCancel }: SubmitAllOptions = {}) => {
      if (!clinicId) {
        alert("ClinicId não encontrado.");
        return;
      }
      setSubmitting(true);
      try {
        const persisted: PersistedProcedure[] = [];

        for (const draft of rowData) {
          const payload = buildPayload(draft);

          if (draft.id <= 0) {
            // Criar novo
            try {
              const created = await addPatientProcedure(patientId, payload);
              persisted.push(created as any);
            } catch (e: any) {
              console.error(
                "[Procedures][submitAll] erro ao criar procedimento:",
                e
              );
              throw e;
            }
          } else {
            // Atualizar existente (OPCIONAL)
            // Se você quiser realmente persistir alterações de procedimentos existentes,
            // descomente o import de updatePatientProcedure e o bloco abaixo.
            /*
            try {
              const updated = await updatePatientProcedure(draft.id, payload);
              persisted.push(updated as any);
            } catch (e: any) {
              console.error(
                "[Procedures][submitAll] erro ao atualizar procedimento:",
                e
              );
              throw e;
            }
            */
            // Por enquanto, se não atualizar no backend, apenas mantém os dados locais:
            persisted.push({
              id: draft.id,
              date: draft.date,
              description: draft.description,
              professional: draft.professional,
              value: draft.value,
              images: draft.images.filter(
                (i): i is StoredProcedureImage => !(i instanceof File)
              ),
            });
          }
        }

        // Atualiza estado com a versão normalizada vinda do backend
        setRowData(persisted.map(toDraft));

        onSave && onSave(persisted);
        onCancel && onCancel();
      } catch (err) {
        console.error("[Procedures][submitAll] erro geral:", err);
        alert("Erro ao salvar procedimentos.");
      } finally {
        setSubmitting(false);
      }
    },
    [rowData, clinicId, patientId]
  );

  return {
    rowData,
    setRowData,
    submitting,
    addProcedureRow,
    removeProcedure,
    handleRowChange,
    submitAll,
  };
}