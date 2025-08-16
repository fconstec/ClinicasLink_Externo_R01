import { useCallback, useState, useRef } from "react";
import {
  ProcedureDraft,
  PersistedProcedure,
  StoredProcedureImage,
} from "../../../../types/procedureDraft";
import {
  addPatientProcedure,
  // updatePatientProcedure,
  deletePatientProcedure,
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
  // Removemos onCancel automático para não fechar o modal ao salvar
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
  const [savingMessage, setSavingMessage] = useState<string | null>(null);
  const tempIdCounter = useRef(-1);

  const addProcedureRow = useCallback(() => {
    setRowData(prev => [
      ...prev,
      {
        id: tempIdCounter.current,
        date: "",
        description: "",
        professional: "",
        value: "",
        images: [],
      },
    ]);
    tempIdCounter.current -= 1;
  }, []);

  const removeProcedureLocal = useCallback((index: number) => {
    setRowData(prev => prev.filter((_, i) => i !== index));
  }, []);

  const removeProcedure = useCallback(
    async (index: number) => {
      const proc = rowData[index];
      if (!proc) return;
      // Se ainda não foi salvo (id negativo), só remove local
      if (proc.id <= 0) {
        removeProcedureLocal(index);
        return;
      }
      if (!clinicId) {
        alert("clinicId não encontrado.");
        return;
      }
      if (!confirm("Confirmar exclusão do procedimento?")) return;
      try {
        await deletePatientProcedure(proc.id, clinicId);
        removeProcedureLocal(index);
      } catch (err) {
        console.error("[Procedures][delete] erro:", err);
        alert("Erro ao excluir procedimento.");
      }
    },
    [rowData, clinicId, removeProcedureLocal]
  );

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
    async ({ onSave }: SubmitAllOptions = {}) => {
      if (!clinicId) {
        alert("clinicId não encontrado.");
        return;
      }
      setSubmitting(true);
      setSavingMessage(null);
      try {
        const persisted: PersistedProcedure[] = [];

        for (const draft of rowData) {
          const payload = buildPayload(draft);
            if (draft.id <= 0) {
            const created = await addPatientProcedure(patientId, payload);
            persisted.push(created as any);
          } else {
            // Se quiser ativar update no futuro:
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
        setSavingMessage("Alterações salvas.");
        setTimeout(() => setSavingMessage(null), 2500);
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
    savingMessage,
    addProcedureRow,
    removeProcedure,
    handleRowChange,
    submitAll,
  };
}