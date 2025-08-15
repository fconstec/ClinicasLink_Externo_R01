import { useCallback, useState } from "react";
import {
  ProcedureDraft,
  ProcedureImage,
  PersistedProcedure,
  StoredProcedureImage,
} from "../../../../types/procedureDraft";
import {
  addPatientProcedure,
  // Se existir updatePatientProcedure importe aqui
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

/**
 * Hook para gerenciar procedimentos em formulário modal.
 */
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

  /**
   * Adiciona novo draft (ID temporário negativo).
   */
  const addProcedureRow = useCallback(() => {
    setRowData((prev) => [
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
    setTempIdCounter((c) => c - 1);
  }, [tempIdCounter]);

  /**
   * Remove procedimento pelo índice.
   */
  const removeProcedure = useCallback((index: number) => {
    setRowData((prev) => prev.filter((_, i) => i !== index));
  }, []);

  /**
   * Atualiza campos de um procedimento.
   */
  const handleRowChange = useCallback(
    (index: number, update: Partial<ProcedureDraft>) => {
      setRowData((prev) =>
        prev.map((p, i) => (i === index ? { ...p, ...update } : p))
      );
    },
    []
  );

  /**
   * Envia todos os procedimentos (cria novos; placeholder para update).
   */
  const submitAll = useCallback(
    async ({ onSave, onCancel }: SubmitAllOptions = {}) => {
      setSubmitting(true);
      try {
        const persisted: PersistedProcedure[] = [];

        for (const draft of rowData) {
          const payload: any = {
            date: draft.date || null,
            description: draft.description || "",
            professional: draft.professional || "",
            value: draft.value || "",
            // Se sua API precisar explicitamente de clinicId no body:
            // clinicId,
          };

          if (draft.id <= 0) {
            // Draft novo
            let created: PersistedProcedure;

            // Detecta se sua função addPatientProcedure aceita 3 argumentos (patientId, payload, clinicId)
            const fnLen = (addPatientProcedure as any).length;
            if (fnLen >= 3 && clinicId) {
              created = await (addPatientProcedure as any)(
                patientId,
                payload,
                clinicId
              );
            } else {
              created = await (addPatientProcedure as any)(patientId, payload);
            }
            persisted.push(created);
          } else {
            // Procedimento existente - TODO: substituir por update se houver endpoint
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
        console.error("[Procedures][submitAll] erro:", err);
        alert("Erro ao salvar procedimentos.");
      } finally {
        setSubmitting(false);
      }
    },
    [patientId, clinicId, rowData]
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