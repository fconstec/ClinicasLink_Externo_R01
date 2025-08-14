import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from "react-router-dom";
import HeaderPrivate from '@/components/HeaderPrivate';
import SideMenu from './SideMenu';
import DashboardTab from './DashboardTab';
import CalendarTab from './CalendarTab';
import AppointmentsTab from './AppointmentsTab';
import PatientsTab from './PatientsTab';
import ProfessionalsTab from './ProfessionalsTab';
import ServicesTab from './ServicesTab';
import StockTab from './StockTab';
import SettingsTab from './SettingsTab';
import {
  fetchProfessionals,
  fetchServices,
  fetchAppointments,
  fetchPatients,
  fetchStock,
  addService,
  updateService,
  deleteService,
  addStockItem,
  updateStockItem,
  deleteStockItem
} from '@/api';
import type {
  Professional,
  Appointment,
  Service,
  Patient,
  StockItem,
  NewServiceData,
  NewStockItemData
} from '@/components/ClinicAdminPanel_Managers/types';

const DEFAULT_CLINIC_NAME = "Minha Clínica";

const ClinicAdminPanel: React.FC = () => {
  const { id: clinicIdParam } = useParams<{ id: string }>();
  const clinicId = clinicIdParam ? Number(clinicIdParam) : 0;

  const [activeTab, setActiveTab] = useState('dashboard');
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const navigate = useNavigate();

  // Recarrega profissionais
  const reloadProfessionals = async () => {
    if (!clinicIdParam) return;
    try {
      const result = await fetchProfessionals(clinicIdParam);
      setProfessionals(result);
    } catch {
      setProfessionals([]);
    }
  };

  // Recarrega serviços
  const reloadServices = async () => {
    if (!clinicIdParam) return;
    try {
      const result = await fetchServices(clinicIdParam);
      setServices(result);
    } catch {
      setServices([]);
    }
  };

  // Recarrega estoque
  const reloadStock = async () => {
    if (!clinicIdParam) return;
    try {
      const result = await fetchStock(clinicIdParam);
      setStockItems(result);
    } catch {
      setStockItems([]);
    }
  };

  // Serviços (API)
  const handleAddService = async (data: NewServiceData & { clinicId: number }) => {
    return await addService({ ...data, clinicId: data.clinicId });
  };

  const handleUpdateService = async (id: number, data: NewServiceData & { clinicId: number }) => {
    return await updateService(id, { ...data, clinicId: data.clinicId });
  };

  const handleDeleteService = async (id: number, clinicId: number) => {
    return await deleteService(id, clinicId);
  };

  // Estoque (API)
  const handleAddStockItem = async (data: NewStockItemData & { clinicId: number }) => {
    return await addStockItem({ ...data, clinicId: data.clinicId });
  };

  const handleUpdateStockItem = async (id: number, data: NewStockItemData & { clinicId: number }) => {
    return await updateStockItem(id, { ...data, clinicId: data.clinicId });
  };

  const handleDeleteStockItem = async (id: number, clinicId: number) => {
    return await deleteStockItem(id, clinicId);
  };

  useEffect(() => {
    if (!clinicIdParam) return;
    reloadProfessionals();
    reloadServices();
    fetchAppointments(clinicIdParam).then(setAppointments).catch(() => setAppointments([]));
    fetchPatients(clinicIdParam).then(setPatients).catch(() => setPatients([]));
    reloadStock();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clinicIdParam]);

  if (!clinicId) {
    return <div>Clínica não encontrada. ID inválido na URL.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <HeaderPrivate showBackButton />
      <div className="pt-16 sm:pt-20">
        <SideMenu
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          clinicName={DEFAULT_CLINIC_NAME}
          onLogout={() => navigate('/')}
        />
        <div className="flex-1 p-4 sm:p-6 ml-0 md:ml-64">
          {activeTab === 'dashboard' && (
            <DashboardTab
              appointments={appointments}
              professionals={professionals}
              services={services}
            />
          )}
            {activeTab === 'calendar' && (
              <CalendarTab
                professionals={professionals}
                services={services}
              />
            )}
          {activeTab === 'appointments' && (
            <AppointmentsTab
              professionals={professionals}
              services={services}
            />
          )}
          {activeTab === 'patients' && <PatientsTab />}
          {activeTab === 'professionals' && (
            <ProfessionalsTab
              professionals={professionals}
              clinicId={clinicId}
              reloadProfessionals={reloadProfessionals}
            />
          )}
          {activeTab === 'services' && (
            <ServicesTab
              services={services}
              clinicId={clinicId}
              reloadServices={reloadServices}
              addService={handleAddService}
              updateService={handleUpdateService}
              deleteService={handleDeleteService}
            />
          )}
          {activeTab === 'stock' && (
            <StockTab
              stockItems={stockItems}
              clinicId={clinicId}
              reloadStock={reloadStock}
              addStockItem={handleAddStockItem}
              updateStockItem={handleUpdateStockItem}
              deleteStockItem={handleDeleteStockItem}
            />
          )}
          {activeTab === 'settings' && <SettingsTab />}
        </div>
      </div>
    </div>
  );
};

export default ClinicAdminPanel;