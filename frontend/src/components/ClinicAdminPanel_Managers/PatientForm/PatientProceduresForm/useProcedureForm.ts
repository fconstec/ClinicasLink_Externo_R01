import { useCallback, useState } from "react";
import {
  ProcedureDraft,
  PersistedProcedure,
  StoredProcedureImage,
} from "../../../../types/procedureDraft";
import {
  addPatientProcedure,
  // updatePatientProcedure, // se quiser ativar update
} from "../../../../api/proceduresApi";

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
        id: tempIdCounter,
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

  function buildPayload(draft: ProcedureDraft) {
    return {
      date: draft.date || null,
      description: draft.description || "",
      professional: draft.professional || "",
      value: draft.value || "",
      clinicId: clinicId || "",
    };
  }

  const submitAll = useCallback(
    async ({ onSave, onCancel }: SubmitAllOptions = {}) => {
      if (!clinicId) {
        alert("clinicId não encontrado.");
        return;
      }
      setSubmitting(true);
      try {
        const persisted: PersistedProcedure[] = [];

        for (const draft of rowData) {
          const payload = buildPayload(draft);
          if (draft.id <= 0) {
            const created = await addPatientProcedure(patientId, payload);
            persisted.push(created as any);
          } else {
            // Se quiser atualizar:
            /*
            const updated = await updatePatientProcedure(draft.id, payload);
            persisted.push(updated as any);
            */
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