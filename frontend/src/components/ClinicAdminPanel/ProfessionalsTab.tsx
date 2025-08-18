import React, { useState, useEffect, useCallback, useRef } from "react";
import ProfessionalsManager from "@/components/ClinicAdminPanel_Managers/ProfessionalsManager";
import ProfessionalFormModal from "@/components/modals/ProfessionalFormModal";
import type { Professional, NewProfessionalData } from "@/components/ClinicAdminPanel_Managers/types";
import {
  addProfessional,
  updateProfessional,
  fetchProfessionals,
  deactivateProfessional,
  reactivateProfessional
} from "@/api/professionalsApi";
import { normalizeProfessional } from "@/utils/normalizeProfessional";

/**
 * Dados para edição: parcial + id obrigatório.
 */
type EditProfessionalData = Partial<NewProfessionalData> & { id: number };

function isEditData(d: any): d is EditProfessionalData {
  return d && typeof d.id === "number";
}

/**
 * Props: compatibilidade retroativa
 * - professionals / reloadProfessionals ficaram opcionais (legado).
 * - Se quiser simplificar depois, remova-os e ajuste ClinicAdminPanel.
 */
export interface ProfessionalsTabProps {
  clinicId: number;
  professionals?: Professional[];               // legado
  reloadProfessionals?: () => Promise<void>;    // legado
  onChangeOptional?: (professionals: Professional[]) => void;
}

const ProfessionalsTab: React.FC<ProfessionalsTabProps> = ({
  clinicId,
  professionals: legacyProfessionals,
  reloadProfessionals, // não usamos mais para fluxo principal
  onChangeOptional
}) => {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [isProfessionalModalOpen, setIsProfessionalModalOpen] = useState(false);
  const [editingProfessional, setEditingProfessional] = useState<Professional | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Evita re-aplicar professionals prop várias vezes (apenas primeira vez se fornecida)
  const initializedFromProp = useRef(false);

  /**
   * Carrega TODOS (ativos + inativos) apenas para a aba admin.
   */
  const loadAll = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchProfessionals(clinicId, { includeInactive: true });
      setProfessionals(data);
      onChangeOptional?.(data);
    } catch (e: any) {
      console.error("[ProfessionalsTab] loadAll error:", e);
      setError(e.message || "Erro ao carregar profissionais.");
    } finally {
      setLoading(false);
    }
  }, [clinicId, onChangeOptional]);

  /**
   * Inicialização:
   * - Se veio lista por prop (legado) usamos ela uma vez.
   * - Sempre disparamos loadAll para garantir consistência (pode comentar se não quiser).
   */
  useEffect(() => {
    if (!initializedFromProp.current && legacyProfessionals && legacyProfessionals.length > 0) {
      setProfessionals(legacyProfessionals);
      initializedFromProp.current = true;
    }
    loadAll();
  }, [legacyProfessionals, loadAll]);

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

  /**
   * Salvar (criar ou editar).
   * Usa narrowing com isEditData para não causar erro de propriedade 'id'.
   */
  async function handleSubmitProfessional(
    formData: NewProfessionalData | EditProfessionalData
  ) {
    setError(null);
    setLoading(true);
    try {
      if (isEditData(formData) && editingProfessional) {
        // Edição
        const updated = await updateProfessional(formData.id, clinicId, {
          name: (formData.name ?? "").trim(),
          specialty: (formData.specialty ?? "").trim(),
          available: formData.available ?? true,
            email: formData.email,
          phone: formData.phone,
          resume: (formData as any).resume,
          photo: (formData.photo ?? "").trim(),
          clinicId,
        });
        const norm = normalizeProfessional(updated);
        setProfessionals(prev => prev.map(p => (p.id === norm.id ? { ...p, ...norm } : p)));
      } else {
        // Criação
        const payload: NewProfessionalData = {
          name: (formData as NewProfessionalData).name?.trim() || "",
          specialty: (formData as NewProfessionalData).specialty?.trim() || "",
          photo: (formData as NewProfessionalData).photo?.trim() || "",
          available: (formData as NewProfessionalData).available ?? true,
          clinicId,
          email: (formData as NewProfessionalData).email,
          phone: (formData as NewProfessionalData).phone,
          resume: (formData as any).resume,
          color: (formData as any).color,
        };
        const created = await addProfessional(payload);
        const norm = normalizeProfessional(created);
        setProfessionals(prev => [...prev, norm]);
      }
      closeModal();
    } catch (err: any) {
      console.error("[ProfessionalsTab] save error:", err);
      setError(err.message || "Erro ao salvar profissional.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDeactivateProfessional(id: number) {
    if (!window.confirm("Desativar este profissional? Agendamentos antigos serão mantidos.")) return;
    setError(null);
    setLoading(true);
    try {
      const updated = await deactivateProfessional(id, clinicId);
      const norm = normalizeProfessional(updated);
      setProfessionals(prev => prev.map(p => (p.id === id ? { ...p, ...norm } : p)));
    } catch (e: any) {
      console.error("[ProfessionalsTab] deactivate error:", e);
      setError(e.message || "Erro ao desativar profissional.");
    } finally {
      setLoading(false);
    }
  }

  async function handleReactivateProfessional(id: number) {
    setError(null);
    setLoading(true);
    try {
      const updated = await reactivateProfessional(id, clinicId);
      const norm = normalizeProfessional(updated);
      setProfessionals(prev => prev.map(p => (p.id === id ? { ...p, ...norm } : p)));
    } catch (e: any) {
      console.error("[ProfessionalsTab] reactivate error:", e);
      setError(e.message || "Erro ao reativar profissional.");
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
        onDelete={handleDeactivateProfessional}
        reactivateProfessional={handleReactivateProfessional}
        loading={loading}
        error={error}
        clinicId={clinicId}
        showInactive={true}
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
    </>
  );
};

export default ProfessionalsTab;