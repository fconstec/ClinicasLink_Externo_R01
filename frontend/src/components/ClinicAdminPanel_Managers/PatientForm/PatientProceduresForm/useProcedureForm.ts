import { useCallback, useState } from "react";
import {
  ProcedureDraft,
  ProcedureImage,
  PersistedProcedure,
  StoredProcedureImage,
} from "@/types/procedureDraft";
import {
  addPatientProcedure,
  // Se existir updatePatientProcedure / patchProcedure importe aqui
} from "@/api";

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
 * Hook para gerir a lista de procedimentos antes de persistir.
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

  const removeProcedure = useCallback((index: number) => {
    setRowData((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleRowChange = useCallback(
    (index: number, update: Partial<ProcedureDraft>) => {
      setRowData((prev) =>
        prev.map((p, i) => (i === index ? { ...p, ...update } : p))
      );
    },
    []
  );

  /**
   * Submete todos os procedimentos.
   * Para novos (id <= 0) chama addPatientProcedure.
   * Para existentes, por enquanto só reusa os dados locais (adapte se tiver endpoint de update).
   */
  const submitAll = useCallback(
    async ({ onSave, onCancel }: SubmitAllOptions = {}) => {
      if (!clinicId) {
        // Caso o backend não precise de clinicId, pode remover esta verificação
        console.warn("[Procedures][submitAll] clinicId ausente (ignorado).");
      }
      setSubmitting(true);
      try {
        const persisted: PersistedProcedure[] = [];

        for (const draft of rowData) {
          const payload = {
            date: draft.date || null,
            description: draft.description || "",
            professional: draft.professional || "",
            value: draft.value || "",
            // Se o backend precisa de clinicId no corpo:
            // clinicId,
          };

          if (draft.id <= 0) {
            // Novo
            let created: PersistedProcedure;

            // Se sua addPatientProcedure suportar clinicId como 3º argumento em outro branch/versão,
            // você pode detectar dinamicamente:
            try {
              if ((addPatientProcedure as any).length >= 3) {
                // @ts-ignore - chamada opcional com clinicId
                created = await (addPatientProcedure as any)(
                  patientId,
                  payload,
                  clinicId
                );
              } else {
                created = await (addPatientProcedure as any)(
                  patientId,
                  payload
                );
              }
            } catch (e) {
              console.error(
                "[Procedures][submitAll] erro ao criar procedimento:",
                e
              );
              throw e;
            }

            persisted.push(created);
          } else {
            // Existente - TODO: trocar por chamada de update se tiver endpoint
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

        // Atualiza estado local com versões normalizadas
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
    [clinicId, patientId, rowData]
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