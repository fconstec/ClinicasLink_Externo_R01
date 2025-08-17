import React, { useState, useEffect, useCallback } from "react";
import ProfessionalsManager from "@/components/ClinicAdminPanel_Managers/ProfessionalsManager";
import ProfessionalFormModal from "@/components/modals/ProfessionalFormModal";
import type {
  Professional,
  NewProfessionalData,
} from "@/components/ClinicAdminPanel_Managers/types";
import {
  addProfessional,
  updateProfessional,
  deleteProfessional,
  fetchProfessionals,
} from "@/api/professionalsApi";

// Ajuste do import: caminho relativo porque alias '@' estava falhando
// Se configurar paths no tsconfig (baseUrl: "src", paths: {"@/*": ["*"]}) pode voltar para "@/utils/normalizeProfessional"
import {
  normalizeProfessional,
  normalizeProfessionals,
} from "../../utils/normalizeProfessional";

interface ProfessionalsTabProps {
  professionals: Professional[];
  clinicId: number;
  reloadProfessionals: () => Promise<void>;
}

const ProfessionalsTab: React.FC<ProfessionalsTabProps> = ({
  professionals: initialProfessionals,
  clinicId,
  reloadProfessionals,
}) => {
  const [professionals, setProfessionals] = useState<
    (Professional & { photoUrl?: string })[]
  >([]);
  const [isProfessionalModalOpen, setIsProfessionalModalOpen] = useState(false);
  const [editingProfessional, setEditingProfessional] =
    useState<Professional | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Normaliza lista inicial
  useEffect(() => {
    setProfessionals(normalizeProfessionals(initialProfessionals || []));
  }, [initialProfessionals]);

  const localReload = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchProfessionals(clinicId); // agora aceitaremos number | string
      setProfessionals(normalizeProfessionals(data));
    } catch (e: any) {
      console.error("[ProfessionalsTab] Erro reload:", e);
      setError("Erro ao recarregar profissionais.");
    } finally {
      setLoading(false);
    }
  }, [clinicId]);

  function openAddModal() {
    setEditingProfessional(null);
    setIsProfessionalModalOpen(true);
  }

  function openEditModal(p: Professional) {
    setEditingProfessional(p);
    setIsProfessionalModalOpen(true);
  }

  function closeModal() {
    setEditingProfessional(null);
    setIsProfessionalModalOpen(false);
  }

  async function handleSubmitProfessional(
    data: NewProfessionalData | (Partial<NewProfessionalData> & { id: number })
  ) {
    setError(null);
    setLoading(true);
    try {
      if ("id" in data && data.id != null && editingProfessional) {
        // EDITAR
        const updated = await updateProfessional(Number(data.id), clinicId, {
          name: (data.name ?? "").trim(),
          specialty: (data.specialty ?? "").trim(),
          available: data.available ?? true,
          email: data.email,
          phone: data.phone,
          resume: (data as any).resume,
          photo: (data.photo ?? "").trim(),
          clinicId, // enviado só para consistência; API converterá para clinic_id
        });
        const norm = normalizeProfessional(updated);
        setProfessionals(prev =>
          prev.map(p => (p.id === norm.id ? { ...p, ...norm } : p))
        );
      } else {
        // ADICIONAR
        const payload: NewProfessionalData = {
          name: (data.name ?? "").trim(),
          specialty: (data.specialty ?? "").trim(),
          photo: (data.photo ?? "").trim(),
          available: data.available ?? true,
          clinicId,
          email: data.email,
          phone: data.phone,
          resume: (data as any).resume,
          color: (data as any).color,
        };
        const created = await addProfessional(payload);
        const norm = normalizeProfessional(created);
        setProfessionals(prev => {
          const filtered = prev.filter(p => p.id !== norm.id);
            return [...filtered, norm];
        });
      }
      closeModal();
    } catch (err: any) {
      console.error("[ProfessionalsTab] Erro ao salvar:", err);
      setError(err.message || "Erro ao salvar profissional.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteProfessional(id: number) {
    if (!confirm("Confirmar exclusão do profissional?")) return;
    setError(null);
    setLoading(true);
    try {
      await deleteProfessional(id, String(clinicId)); // passa clinicId (assinatura da API exige)
      setProfessionals(prev => prev.filter(p => p.id !== id));
    } catch (err: any) {
      console.error("[ProfessionalsTab] Erro ao excluir:", err);
      setError(err.message || "Erro ao excluir profissional.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <ProfessionalsManager
        professionals={professionals}
        onAdd={openAddModal}
        onEdit={openEditModal}
        onDelete={handleDeleteProfessional}
        loading={loading}
        error={error}
        clinicId={clinicId}
      />

      {isProfessionalModalOpen && (
        <ProfessionalFormModal
          onClose={closeModal}
          onSubmit={handleSubmitProfessional}
          initialData={editingProfessional || undefined}
          isEditMode={!!editingProfessional}
          clinicId={clinicId}
        />
      )}

      <div className="mt-4 flex gap-3">
        <button
          type="button"
          onClick={localReload}
          className="px-3 py-2 text-sm rounded border border-gray-300 hover:bg-gray-100 disabled:opacity-60"
          disabled={loading}
        >
          Recarregar (local)
        </button>
        <button
          type="button"
          onClick={reloadProfessionals}
          className="px-3 py-2 text-sm rounded border border-gray-300 hover:bg-gray-100 disabled:opacity-60"
          disabled={loading}
        >
          Recarregar (pai)
        </button>
      </div>
    </>
  );
};

export default ProfessionalsTab;