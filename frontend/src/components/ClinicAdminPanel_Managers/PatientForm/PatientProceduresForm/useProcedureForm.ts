import { useCallback, useEffect, useRef, useState } from "react";
import {
  ProcedureDraft,
  PersistedProcedure,
  StoredProcedureImage,
} from "../../../../types/procedureDraft";
import {
  addPatientProcedure,
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
}

function safeConfirm(message: string) {
  if (typeof window !== "undefined" && typeof window.confirm === "function") {
    return window.confirm(message);
  }
  return true;
}

export function useProcedureForm(
  patientId: number,
  clinicId?: string,
  optionalInitial?: PersistedProcedure[]
) {
  const initializedRef = useRef(false);
  const [rowData, setRowData] = useState<ProcedureDraft[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [savingMessage, setSavingMessage] = useState<string | null>(null);
  const tempIdCounter = useRef(-1);
  const lastAddedIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (!initializedRef.current && optionalInitial) {
      setRowData(optionalInitial.map(toDraft));
      initializedRef.current = true;
    }
  }, [optionalInitial]);

  const addProcedureRow = useCallback(() => {
    setRowData(prev => {
      const newDraft: ProcedureDraft = {
        id: tempIdCounter.current,
        date: "",
        description: "",
        professional: "",
        value: "",
        images: [],
      };
      tempIdCounter.current -= 1;
      lastAddedIdRef.current = newDraft.id;
      return [...prev, newDraft];
    });
  }, []);

  const removeProcedureLocalById = useCallback((id: number) => {
    setRowData(prev => prev.filter(p => p.id !== id));
  }, []);

  const removeProcedureById = useCallback(
    async (id: number) => {
      const proc = rowData.find(p => p.id === id);
      if (!proc) return;
      if (proc.id <= 0) {
        removeProcedureLocalById(proc.id);
        return;
      }
      if (!clinicId) {
        window.alert?.("clinicId não encontrado.");
        return;
      }
      if (!safeConfirm("Confirmar exclusão do procedimento?")) return;
      try {
        await deletePatientProcedure(proc.id, clinicId);
        removeProcedureLocalById(proc.id);
      } catch (err) {
        console.error("[Procedures][delete] erro:", err);
        window.alert?.("Erro ao excluir procedimento.");
      }
    },
    [rowData, clinicId, removeProcedureLocalById]
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
        window.alert?.("clinicId não encontrado.");
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
        window.alert?.("Erro ao salvar procedimentos.");
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
    removeProcedureById,
    handleRowChange,
    submitAll,
    lastAddedIdRef,
  };
}