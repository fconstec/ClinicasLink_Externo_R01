import React, { useState, useEffect } from "react";
import ProfessionalsManager from '@/components/ClinicAdminPanel_Managers/ProfessionalsManager';
import ProfessionalFormModal from '@/components/modals/ProfessionalFormModal';
import type { Professional, NewProfessionalData } from '@/components/ClinicAdminPanel_Managers/types';
import { addProfessional } from "@/api/professionalsApi";

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
  const [isProfessionalModalOpen, setIsProfessionalModalOpen] = useState(false);
  const [editingProfessional, setEditingProfessional] = useState<Professional | null>(null);
  const [isEditModeProfessional, setIsEditModeProfessional] = useState(false);
  const [professionals, setProfessionals] = useState<Professional[]>(initialProfessionals || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setProfessionals(initialProfessionals || []);
  }, [initialProfessionals]);

  // Handler para abrir o modal de novo profissional
  const handleAddProfessional = () => {
    setEditingProfessional(null);
    setIsEditModeProfessional(false);
    setIsProfessionalModalOpen(true);
  };

  // Handler para abrir o modal de edição (opcional, se quiser editar)
  const handleEditProfessional = (professional: Professional) => {
    setEditingProfessional(professional);
    setIsEditModeProfessional(true);
    setIsProfessionalModalOpen(true);
  };

  // Handler que realmente salva o profissional
  const handleAddProfessionalModal = async (data: NewProfessionalData) => {
    setError(null);
    setLoading(true);
    try {
      await addProfessional({ ...data, clinicId }); // garante clinicId correto
      setIsProfessionalModalOpen(false);
      setEditingProfessional(null);
      setIsEditModeProfessional(false);
      await reloadProfessionals();
    } catch (err: any) {
      setError(err.message || "Erro ao adicionar profissional.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ProfessionalsManager
        professionals={professionals}
        onAdd={handleAddProfessional}
        onEdit={handleEditProfessional}
        onDelete={() => {}} // Implemente conforme necessário
        loading={loading}
        error={error}
        clinicId={clinicId}
      />
      {isProfessionalModalOpen && (
        <ProfessionalFormModal
          onClose={() => {
            setIsProfessionalModalOpen(false);
            setEditingProfessional(null);
            setIsEditModeProfessional(false);
          }}
          onAddProfessional={handleAddProfessionalModal}
          initialData={editingProfessional || undefined}
          isEditMode={isEditModeProfessional}
          clinicId={clinicId}
        />
      )}
    </>
  );
};

export default ProfessionalsTab;