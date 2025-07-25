import { useState, useEffect } from "react";
import type { Procedure } from "../../types";
import {
  fetchPatientProcedures,
  addPatientProcedure,
  updatePatientProcedure,
  deletePatientProcedure,
} from "@/api";

export interface ProcedureDraft extends Omit<Procedure, "images"> {
  images: (File | { id: number; url: string; fileName?: string })[];
  newImages?: File[];
  removedImageIds?: number[];
}

function normalizeField(field: any) {
  return (!field || field === "null") ? "" : field;
}

// REMOVIDO: emptyProcedure

export function useProcedureForm(
  patientId: number,
  clinicId?: string,
  initialProcedures?: Procedure[]
) {
  const [rowData, setRowData] = useState<ProcedureDraft[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!clinicId) return;
    fetchPatientProcedures(patientId, clinicId)
      .then((res: any[]) =>
        setRowData(
          res.length > 0
            ? res.map((p: any) => ({
                ...p,
                date: normalizeField(p.date),
                description: normalizeField(p.description),
                professional: normalizeField(p.professional),
                value: normalizeField(p.value),
                images: p.images || [],
                newImages: [],
                removedImageIds: [],
              }))
            : []
        )
      )
      .catch(() => setRowData([]));
  }, [patientId, clinicId]);

  // NOVO: adicionar procedimento faz chamada ao backend
  async function addProcedureRow() {
    if (!clinicId) return;
    // Cria procedimento vazio (ou só com patientId/clinicId)
    const payload = {
      description: "",
      professional: "",
      value: "",
      date: "",
      clinicId: clinicId,
    };
    try {
      const created = await addPatientProcedure(patientId, payload);
      setRowData((prev: ProcedureDraft[]) => [
        ...prev,
        {
          ...created,
          date: normalizeField(created.date),
          description: normalizeField(created.description),
          professional: normalizeField(created.professional),
          value: normalizeField(created.value),
          images: created.images || [],
          newImages: [],
          removedImageIds: [],
        },
      ]);
    } catch (err) {
      alert("Erro ao criar procedimento.");
    }
  }

  function removeProcedure(idx: number) {
    const proc = rowData[idx];
    if (
      clinicId &&
      proc.id &&
      typeof proc.id === "number" &&
      !isNaN(proc.id) &&
      proc.id > 0
    ) {
      deletePatientProcedure(proc.id, clinicId).then(() => {
        setRowData((prev: ProcedureDraft[]) => prev.filter((_, i: number) => i !== idx));
      });
    } else {
      setRowData((prev: ProcedureDraft[]) => prev.filter((_, i: number) => i !== idx));
    }
  }

  function handleRowChange(idx: number, update: Partial<ProcedureDraft>) {
    setRowData((prev: ProcedureDraft[]) =>
      prev.map((proc: ProcedureDraft, i: number) =>
        i === idx ? { ...proc, ...update } : proc
      )
    );
  }

  async function submitAll(
    onSave?: (procs: Procedure[]) => void,
    onCancel?: () => void
  ) {
    setSubmitting(true);
    try {
      if (!clinicId) throw new Error("Clínica não definida");

      const results: Procedure[] = [];
      for (const proc of rowData) {
        const payload = {
          description: normalizeField(proc.description),
          professional: normalizeField(proc.professional),
          value: normalizeField(proc.value),
          date: normalizeField(proc.date),
          clinicId: clinicId,
        } as Omit<Procedure, "id"> & { clinicId: string };

        // UPDATE sempre (todos já têm id do banco)
        const updated = await updatePatientProcedure(proc.id, payload);
        results.push({ ...updated, images: updated.images || [] });
      }
      alert("Procedimentos salvos com sucesso!");
      if (onSave) onSave(results);
      if (onCancel) onCancel();
    } catch (err) {
      console.error(err);
      alert("Erro ao salvar procedimentos. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  }

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