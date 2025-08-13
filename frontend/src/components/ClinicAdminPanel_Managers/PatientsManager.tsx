import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Plus, Search, Edit, Trash2, BookOpenCheck, ActivitySquare, Eye } from 'lucide-react';
import type { Patient } from './types';
import PatientMainDataForm, { PatientMainData } from './PatientForm/PatientMainDataForm';
import PatientAnamneseTcleForm from './PatientForm/PatientAnamneseTcleForm';
import { PatientProceduresForm } from './PatientForm/PatientProceduresForm';
import {
  fetchPatientProcedures,
  addPatient,
  updatePatient,
} from '../../api';
import { API_BASE_URL, fileUrl } from '../../api/apiBase';

function getClinicId(): string {
  const id = localStorage.getItem("clinic_id");
  if (!id) throw new Error("clinic_id não encontrado no localStorage.");
  return id;
}

function getPhotoUrl(photo?: string | null): string | undefined {
  if (!photo) return undefined;
  return fileUrl(photo);
}

function patientToForm(patient: Patient): Partial<PatientMainData> {
  return {
    name: patient.name,
    birthDate: patient.birthDate,
    phone: patient.phone || '',
    email: patient.email,
    address: patient.address || '',
    photo: patient.photo ?? undefined,
  };
}

export interface PatientsManagerProps {
  patients: Patient[];
  setPatients: React.Dispatch<React.SetStateAction<Patient[]>>;
  onDeletePatient: (id: number) => void;
  onShowMainData: (patient: Patient) => void;
  onShowProcedures: (patient: Patient) => void;
  onShowAnamneseTcle: (patient: Patient) => void;
  getPatientFullData?: (patient: Patient) => Promise<{
    patient: any,
    anamnesis?: any,
    tcle?: any,
    procedures?: any,
    appointments?: any
  }>;
  onShowFullView?: (patient: Patient) => void;
}

const PatientsManager: React.FC<PatientsManagerProps> = ({
  patients,
  setPatients,
  onDeletePatient,
  onShowMainData,
  onShowProcedures,
  onShowAnamneseTcle,
  getPatientFullData,
  onShowFullView,
}) => {
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [showAnamneseTcleModal, setShowAnamneseTcleModal] = useState<Patient | null>(null);
  const [showProceduresModal, setShowProceduresModal] = useState<Patient | null>(null);

  const filteredPatients = patients.filter((patient) =>
    (patient.name + ' ' + (patient.phone || '') + ' ' + (patient.email || ''))
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const handleAddPatient = () => {
    setSelectedPatient(null);
    setModalMode('add');
    setShowModal(true);
  };

  const handleShowEditModal = (patient: Patient) => {
    setSelectedPatient(patient);
    setModalMode('edit');
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedPatient(null);
  };

  const handleSavePatient = async (formData: PatientMainData) => {
    const clinicId = getClinicId();
    try {
      if (modalMode === 'edit' && selectedPatient) {
        const updated = await updatePatient(selectedPatient.id, {
          ...formData,
          clinicId,
        });
        setPatients(prev =>
          prev.map(p => (p.id === updated.id ? { ...p, ...updated } : p))
        );
      } else {
        const newPatient = await addPatient({
          ...formData,
          clinicId,
        });
        setPatients(prev => [...prev, newPatient]);
      }
      handleCloseModal();
    } catch {
      alert('Erro ao salvar paciente.');
    }
  };

  const handleShowFullView = async (patient: Patient) => {
    if (onShowFullView) onShowFullView(patient);
  };

  const handleSaveAnamneseTcle = async (formData: { anamnesis: string; tcle: string; patientId: number }) => {
    const clinicId = getClinicId();
    try {
      // Endpoint de atualização combinado (ajuste nome se no backend for outro)
      const url = new URL(`${API_BASE_URL}/patients/${formData.patientId}/anamnese-tcle`);
      url.searchParams.set("clinicId", clinicId);

      const res = await fetch(url.toString(), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error();

      setPatients(prev =>
        prev.map(p =>
          p.id === formData.patientId
            ? { ...p, anamnesis: formData.anamnesis, tcle: formData.tcle }
            : p
        )
      );
      setShowAnamneseTcleModal(null);
    } catch {
      alert("Erro ao salvar Anamnese e TCLE do paciente.");
    }
  };

  const handleSaveProcedures = async (_procedures: any[]) => {
    if (!showProceduresModal) return;
    const patientId = showProceduresModal.id;
    const clinicId = getClinicId();
    try {
      const updatedProcedures = await fetchPatientProcedures(patientId, clinicId);
      setPatients(prev =>
        prev.map(p => (p.id === patientId ? { ...p, procedures: updatedProcedures } : p))
      );
      setShowProceduresModal(null);
    } catch {
      alert("Erro ao salvar procedimentos do paciente.");
    }
  };

  const addButtonClasses = "bg-[#e11d48] text-white hover:bg-[#f43f5e] flex items-center px-4 py-2 rounded text-sm font-medium transition-colors";
  const professionalId = 1;

  return (
    <div className="space-y-6">
      {showModal && (
        <PatientMainDataForm
          patient={modalMode === 'edit' && selectedPatient ? patientToForm(selectedPatient) : undefined}
          onSave={handleSavePatient}
          onCancel={handleCloseModal}
        />
      )}

      {showAnamneseTcleModal && (
        <PatientAnamneseTcleForm
          patientId={showAnamneseTcleModal.id}
          professionalId={professionalId}
          patientName={showAnamneseTcleModal.name}
          anamnesis={showAnamneseTcleModal.anamnesis}
          tcle={showAnamneseTcleModal.tcle}
          patientPhotoUrl={getPhotoUrl(showAnamneseTcleModal.photo)}
          onSave={handleSaveAnamneseTcle}
          onCancel={() => setShowAnamneseTcleModal(null)}
        />
      )}

      {showProceduresModal && (
        <PatientProceduresForm
          patientId={showProceduresModal.id}
          procedures={showProceduresModal.procedures}
          onSave={handleSaveProcedures}
          onCancel={() => setShowProceduresModal(null)}
        />
      )}

      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Pacientes</h2>
        <div className="flex flex-col md:flex-row gap-3 items-center">
          <div className="relative w-full md:w-72">
            <input
              type="text"
              placeholder="Buscar paciente..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full border border-gray-300 rounded-md pl-10 pr-3 py-2 focus:outline-none focus:border-[#e11d48] text-sm"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          </div>
          <Button
            type="button"
            className={addButtonClasses}
            onClick={handleAddPatient}
          >
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Paciente
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data Nasc.</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Telefone</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredPatients.length > 0 ? (
              filteredPatients.map((patient) => (
                <tr key={patient.id} className="hover:bg-gray-50/70">
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {patient.photo && (
                        <img
                          src={getPhotoUrl(patient.photo)}
                          alt="Foto"
                          className="w-8 h-8 rounded-full object-cover border border-gray-200 mr-2"
                        />
                      )}
                      <span className="text-sm font-medium text-gray-900">{patient.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    {patient.birthDate ? new Date(patient.birthDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : <span className="text-gray-400">—</span>}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    {patient.phone || <span className="text-gray-400">—</span>}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    {patient.email || <span className="text-gray-400">—</span>}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => handleShowEditModal(patient)}
                        className="p-2 rounded hover:bg-blue-50 text-blue-600 hover:text-blue-800 transition"
                        title="Editar Dados Cadastrais"
                        aria-label="Editar Dados Cadastrais"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setShowAnamneseTcleModal(patient)}
                        className="p-2 rounded hover:bg-amber-50 text-amber-600 hover:text-amber-800 transition"
                        title="Anamnese e TCLE"
                        aria-label="Anamnese e TCLE"
                      >
                        <ActivitySquare className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setShowProceduresModal(patient)}
                        className="p-2 rounded hover:bg-sky-50 text-sky-600 hover:text-sky-800 transition"
                        title="Registros de Procedimentos"
                        aria-label="Registros de Procedimentos"
                      >
                        <BookOpenCheck className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleShowFullView(patient)}
                        className="p-2 rounded hover:bg-green-50 text-green-600 hover:text-green-800 transition"
                        title="Visualizar ficha completa"
                        aria-label="Visualizar ficha completa"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onDeletePatient(patient.id)}
                        className="p-2 rounded hover:bg-red-50 text-red-600 hover:text-red-800 transition"
                        title="Excluir Paciente"
                        aria-label="Excluir Paciente"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="text-center text-gray-400 py-8 text-sm">
                  Nenhum paciente encontrado.
                  {search && <span className="block text-xs">Ajuste os termos da sua busca.</span>}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PatientsManager;