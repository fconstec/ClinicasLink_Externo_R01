import React, { useState, useEffect, useCallback } from 'react';
import { PlusCircle, Edit, Trash2, Search as SearchIcon } from 'lucide-react';
import { Appointment, Service, Professional, Patient } from './types';
import AppointmentsFormModal from '../modals/AppointmentsFormModal';
import type { SubmittedFormData } from '../ScheduleForm/types';

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:3001";

function getClinicId(): string {
  const id = localStorage.getItem("clinic_id");
  if (!id) throw new Error("clinic_id não encontrado no localStorage.");
  return id;
}

function appointmentToFormData(a: Appointment): SubmittedFormData {
  return {
    id: a.id,
    patientId:
      a.patientId === null || a.patientId === undefined
        ? undefined
        : Number(a.patientId),
    patientName: a.patientName || a.patient_name || "",
    patientPhone: a.patientPhone || "",
    professionalId: Number(a.professionalId ?? a.professional_id),
    serviceId: Number(a.serviceId ?? a.service_id),
    service: a.service || a.service_name || "",
    date: a.date,
    time: a.time,
    endTime: a.endTime, // <- ESSENCIAL!
    status: a.status,
  };
}

interface AppointmentsManagerProps {
  services: Service[];
  professionals: Professional[];
}

const AppointmentsManager: React.FC<AppointmentsManagerProps> = ({
  services,
  professionals,
}) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);

  const [patients, setPatients] = useState<Patient[]>([]);
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [pendingPatientSelect, setPendingPatientSelect] = useState<Patient | null>(null);

  const fetchAppointmentsInternal = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const clinicId = getClinicId();
      const res = await fetch(
        `${API_BASE_URL}/api/appointments?clinicId=${clinicId}`
      );
      if (!res.ok) throw new Error(res.statusText);
      const data: Appointment[] = await res.json();
      setAppointments(data);
    } catch (err) {
      setError('Falha ao carregar agendamentos.');
      setAppointments([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchPatients = useCallback(async () => {
    try {
      const clinicId = getClinicId();
      const res = await fetch(
        `${API_BASE_URL}/api/patients?clinicId=${clinicId}`
      );
      if (!res.ok) throw new Error(res.statusText);
      const data: Patient[] = await res.json();
      setPatients(Array.isArray(data) ? data : []);
    } catch {
      setPatients([]);
    }
  }, []);

  useEffect(() => { fetchAppointmentsInternal(); }, [fetchAppointmentsInternal]);
  useEffect(() => { fetchPatients(); }, [fetchPatients]);

  const [displayedAppointments, setDisplayedAppointments] = useState<Appointment[]>([]);
  useEffect(() => {
    const term = searchTerm.toLowerCase();
    const filtered = appointments.filter(app => {
      const nameMatch = (app.patientName || app.patient_name || '')
        .toLowerCase()
        .includes(term);
      const serviceMatch = (app.service || app.service_name || '')
        .toLowerCase()
        .includes(term);
      const profMatch = (
        app.professional_name ||
        professionals.find(p => p.id === (app.professionalId ?? app.professional_id))?.name ||
        ''
      )
        .toLowerCase()
        .includes(term);
      let dateMatch = false;
      if (app.startUTC) {
        dateMatch = new Date(app.startUTC)
          .toLocaleDateString('pt-BR')
          .includes(term);
      } else if (app.date) {
        dateMatch = app.date.includes(term);
      }
      return nameMatch || serviceMatch || profMatch || dateMatch;
    });
    setDisplayedAppointments(filtered);
  }, [searchTerm, appointments, professionals]);

  const handleAddAppointment = () => {
    setEditingAppointment(null);
    setShowAppointmentModal(true);
  };

  const handleEditAppointmentClick = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    setShowAppointmentModal(true);
  };

  const handleDeleteAppointmentClick = async (appointmentId: number) => {
    if (!window.confirm('Deseja excluir este agendamento?')) return;
    try {
      const clinicId = getClinicId();
      await fetch(
        `${API_BASE_URL}/api/appointments/${appointmentId}?clinicId=${clinicId}`,
        { method: 'DELETE' }
      );
      await fetchAppointmentsInternal();
      alert('Agendamento excluído com sucesso!');
    } catch {
      alert('Erro ao excluir agendamento.');
    }
  };

  const handleSaveAppointmentModal = async (
    data: SubmittedFormData,
    id?: string | number
  ) => {
    // Validar que endTime está presente e maior que time
    if (!data.endTime) {
      alert("Hora fim (endTime) é obrigatória.");
      throw new Error("Hora fim (endTime) é obrigatória.");
    }
    if (
      data.time &&
      data.endTime &&
      data.time === data.endTime
    ) {
      alert("Hora fim deve ser maior que a hora de início.");
      throw new Error("Hora fim deve ser maior que a hora de início.");
    }

    const serviceObj = services.find(s => s.id === Number(data.serviceId));
    if (!serviceObj) {
      throw new Error('Serviço não encontrado.');
    }
    const clinicId = getClinicId();

    // Monta explicitamente o payload, incluindo endTime SEMPRE
    const payload = {
      patientId: data.patientId,
      patientName: data.patientName,
      patientPhone: data.patientPhone,
      professionalId: Number(data.professionalId),
      serviceId: Number(data.serviceId),
      service: serviceObj.name,
      date: data.date,
      time: data.time,
      endTime: data.endTime, // <-- ESSENCIAL!
      status: data.status,
    };

    // Debug: veja no console o payload realmente enviado!
    console.log("Payload enviado:", payload);

    const method = id ? 'PUT' : 'POST';
    const url = id
      ? `${API_BASE_URL}/api/appointments/${id}?clinicId=${clinicId}`
      : `${API_BASE_URL}/api/appointments?clinicId=${clinicId}`;

    if (!id) delete (payload as any).id;
    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        let errorMsg = res.statusText;
        try {
          const data = await res.json();
          if (data && data.message) errorMsg = data.message;
        } catch {}
        throw new Error(errorMsg || 'Erro desconhecido');
      }
      setShowAppointmentModal(false);
      setEditingAppointment(null);
      await fetchAppointmentsInternal();
      // Pode adicionar um toast aqui se quiser
    } catch (err) {
      console.error("Manager: Erro ao salvar agendamento:", err);
      throw new Error(
        err instanceof Error
          ? err.message
          : 'Erro ao salvar agendamento.'
      );
    }
  };

  const handlePatientCreated = (newPatient: Patient) => {
    setPatients(prev => [...prev, newPatient]);
    setPendingPatientSelect(newPatient);
    setShowPatientModal(false);
  };

  const getProfessionalName = (pid?: number) => {
    if (pid == null) return 'N/A';
    return professionals.find(p => p.id === pid)?.name || 'Desconhecido';
  };

  const getServiceName = (app: Appointment) =>
    app.service_name || app.service || 'N/A';

  const addBtnClasses =
    'bg-[#e11d48] text-white hover:bg-[#f43f5e] flex items-center px-4 py-2 rounded text-sm font-medium transition-colors';

  if (isLoading) return <div className="p-6 text-center text-gray-500">Carregando agendamentos...</div>;
  if (error) return <div className="p-6 text-center text-red-600 bg-red-50 rounded-lg">{error}</div>;

  return (
    <div className="space-y-6 p-4 sm:p-0">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Gerenciar Agendamentos</h2>
        <div className="flex flex-col md:flex-row gap-3 items-center w-full md:w-auto">
          <div className="relative w-full md:w-96">
            <input
              type="text"
              placeholder="Buscar por paciente, serviço, data..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full border border-gray-300 rounded-md pl-10 pr-3 py-2 focus:outline-none focus:border-[#e11d48] text-sm"
            />
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          </div>
          <button
            type="button"
            className={addBtnClasses}
            onClick={handleAddAppointment}
          >
            <PlusCircle size={18} className="mr-2" />
            Novo Agendamento
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paciente</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Serviço</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Profissional</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hora</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {displayedAppointments.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center text-gray-400 py-8 text-sm">
                  Nenhum agendamento encontrado.
                  {searchTerm && <span className="block text-xs">Ajuste os termos da sua busca.</span>}
                </td>
              </tr>
            ) : (
              displayedAppointments.map(app => (
                <tr key={app.id} className="hover:bg-gray-50/70 transition-colors">
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {app.patientName || app.patient_name || 'N/A'}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                    {getServiceName(app)}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                    {app.professional_name || getProfessionalName(app.professionalId ?? app.professional_id)}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                    {app.startUTC
                      ? new Date(app.startUTC).toLocaleDateString('pt-BR')
                      : app.date || 'N/A'}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                    {app.startUTC
                      ? new Date(app.startUTC).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
                      : app.time || 'N/A'}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      app.status === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : app.status === 'confirmed'
                        ? 'bg-blue-100 text-blue-800'
                        : app.status === 'cancelled'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'}`}>
                      {app.status === 'pending'
                        ? 'Pendente'
                        : app.status === 'confirmed'
                        ? 'Confirmado'
                        : app.status === 'completed'
                        ? 'Concluído'
                        : app.status === 'cancelled'
                        ? 'Cancelado'
                        : app.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-center text-sm font-medium">
                    <button
                      onClick={() => handleEditAppointmentClick(app)}
                      className="p-2 rounded hover:bg-blue-50 text-blue-600 hover:text-blue-800 transition mr-1"
                      title="Editar Agendamento"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteAppointmentClick(app.id)}
                      className="p-2 rounded hover:bg-red-50 text-red-600 hover:text-red-800 transition"
                      title="Excluir Agendamento"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showAppointmentModal && (
        <AppointmentsFormModal
          open={showAppointmentModal}
          onClose={() => {
            setShowAppointmentModal(false);
            setEditingAppointment(null);
            setPendingPatientSelect(null);
          }}
          professionals={professionals}
          services={services}
          onSubmit={handleSaveAppointmentModal}
          onAddPatient={() => setShowPatientModal(true)}
          initialData={editingAppointment ? appointmentToFormData(editingAppointment) : undefined}
        />
      )}
    </div>
  );
};

export default AppointmentsManager;