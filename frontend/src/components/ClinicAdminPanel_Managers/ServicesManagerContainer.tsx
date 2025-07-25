import React, { useEffect, useState } from 'react';
import ServicesManager from './ServicesManager';
import ServiceFormModal from '../modals/ServiceFormModal';
import {
  fetchServices,
  addService,
  updateService,
  deleteService,
} from '@/api';
import type { Service, NewServiceData } from './types';

function getClinicId(): string {
  const id = localStorage.getItem('clinic_id');
  if (!id) throw new Error('ID da clínica não encontrado. Faça login novamente.');
  return id;
}

const ServicesManagerContainer: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | undefined>(undefined);

  useEffect(() => {
    const clinicId = getClinicId();
    fetchServices(clinicId)
      .then(data => {
        setServices(data);
        setLoading(false);
      })
      .catch(() => {
        setError('Erro ao buscar serviços.');
        setLoading(false);
      });
  }, []);

  // Correto: apenas seta o serviço e abre o modal
  const handleAdd = () => {
    setEditingService(undefined);
    setModalOpen(true);
  };

  const handleEdit = (service: Service) => {
    setEditingService(service);
    setModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    const clinicId = getClinicId();
    if (!window.confirm('Deseja realmente excluir este serviço?')) return;
    try {
      await deleteService(id, clinicId);
      setServices(prev => prev.filter(s => s.id !== id));
    } catch {
      alert('Erro ao excluir serviço.');
    }
  };

  const handleSave = async (data: NewServiceData) => {
    const clinicId = getClinicId();
    try {
      if (editingService) {
        const updated = await updateService(editingService.id, { ...data, clinicId });
        setServices(prev => prev.map(s => (s.id === updated.id ? updated : s)));
        alert('Serviço atualizado com sucesso!');
      } else {
        const created = await addService({ ...data, clinicId });
        setServices(prev => [...prev, created]);
        alert('Serviço adicionado com sucesso!');
      }
    } catch {
      alert('Erro ao salvar serviço.');
    } finally {
      setModalOpen(false);
    }
  };

  if (loading) return <div className="p-4 text-center">Carregando serviços...</div>;
  if (error) return <div className="p-4 text-center text-red-600">{error}</div>;

  return (
    <>
      <ServiceFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        initialData={editingService}
      />
      <ServicesManager
        services={services}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </>
  );
};

export default ServicesManagerContainer;