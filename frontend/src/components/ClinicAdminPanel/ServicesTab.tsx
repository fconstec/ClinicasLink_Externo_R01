import React, { useState } from "react";
import ServicesManager from '@/components/ClinicAdminPanel_Managers/ServicesManager';
import ServiceFormModal from '@/components/modals/ServiceFormModal';
import type { Service, NewServiceData } from '@/components/ClinicAdminPanel_Managers/types';

interface ServicesTabProps {
  services: Service[];
  clinicId: number;
  reloadServices: () => Promise<void>;
  addService: (data: NewServiceData & { clinicId: number }) => Promise<Service>;
  updateService: (id: number, data: NewServiceData & { clinicId: number }) => Promise<Service>;
  deleteService: (id: number, clinicId: number) => Promise<void>;
}

const ServicesTab: React.FC<ServicesTabProps> = ({
  services: initialServices,
  clinicId,
  reloadServices,
  addService,
  updateService,
  deleteService,
}) => {
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [isEditModeService, setIsEditModeService] = useState(false);
  const [services, setServices] = useState<Service[]>(initialServices || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Atualiza lista se props mudam
  React.useEffect(() => {
    setServices(initialServices || []);
  }, [initialServices]);

  // Abrir modal para adicionar
  const handleAddService = () => {
    setEditingService(null);
    setIsEditModeService(false);
    setIsServiceModalOpen(true);
  };

  // Abrir modal para editar
  const handleEditService = (service: Service) => {
    setEditingService(service);
    setIsEditModeService(true);
    setIsServiceModalOpen(true);
  };

  // Salvar (adiciona ou edita)
  const handleSaveService = async (formData: NewServiceData) => {
    setError(null);
    setLoading(true);
    try {
      if (isEditModeService && editingService) {
        await updateService(editingService.id, { ...formData, clinicId });
      } else {
        await addService({ ...formData, clinicId });
      }
      setIsServiceModalOpen(false);
      setEditingService(null);
      setIsEditModeService(false);
      await reloadServices();
    } catch (err: any) {
      setError(err.message || "Erro ao salvar serviço.");
    } finally {
      setLoading(false);
    }
  };

  // Deletar serviço
  const handleDeleteService = async (id: number) => {
    setError(null);
    setLoading(true);
    try {
      await deleteService(id, clinicId);
      await reloadServices();
    } catch (err: any) {
      setError(err.message || "Erro ao deletar serviço.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ServicesManager
        services={services}
        onAdd={handleAddService}
        onEdit={handleEditService}
        onDelete={handleDeleteService}
      />
      {isServiceModalOpen && (
        <ServiceFormModal
          open={isServiceModalOpen}
          onClose={() => {
            setIsServiceModalOpen(false);
            setEditingService(null);
            setIsEditModeService(false);
          }}
          onSave={handleSaveService}
          initialData={editingService || undefined}
        />
      )}
      {loading && <div className="text-center">Salvando...</div>}
      {error && <div className="text-center text-red-600">{error}</div>}
    </>
  );
};

export default ServicesTab;