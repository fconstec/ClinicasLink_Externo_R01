import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { PlusCircle, Edit, Trash2, Search as SearchIcon } from 'lucide-react';
import { Appointment, Service, Professional, Patient } from './types';
import AppointmentsFormModal from '../modals/AppointmentsFormModal';
import type { SubmittedFormData } from '../ScheduleForm/types';
import {
  ensureNormalizedAppointments,
  ensureNormalizedAppointment,
} from '@/api/normalizers/appointmentsNormalizer';

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:3001";

/* =========================================================
   Tipos locais
   ========================================================= */
type EnrichedAppointment = Appointment & { utcDateTime?: Date };

/* =========================================================
   Utilidades
   ========================================================= */
function getClinicId(): string {
  const id = localStorage.getItem("clinic_id");
  if (!id) throw new Error("clinic_id não encontrado no localStorage.");
  return id;
}

async function extractErrorMessage(res: Response, fallback = 'Erro desconhecido'): Promise<string> {
  try {
    const j = await res.json();
    if (j && j.message) return j.message;
  } catch {}
  return res.statusText || fallback;
}

function enrichAppointment(a: Appointment): EnrichedAppointment {
  if (a.date && a.time) {
    const timePart = a.time.length === 5 ? a.time : a.time.slice(0, 5);
    const iso = `${a.date}T${timePart}:00`;
    const d = new Date(iso);
    if (!isNaN(d.getTime())) {
      return { ...a, utcDateTime: d };
    }
  }
  return a;
}
function enrichAppointments(arr: Appointment[]) {
  return arr.map(enrichAppointment);
}

function appointmentToFormData(a: Appointment): SubmittedFormData {
  return {
    id: a.id,
    patientId: a.patientId == null ? undefined : Number(a.patientId),
    patientName: a.patientName || "",
    patientPhone: a.patientPhone || "",
    professionalId: Number(a.professionalId),
    serviceId: a.serviceId != null ? Number(a.serviceId) : 0,
    date: a.date,
    time: a.time,
    endTime: a.endTime,
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
  const [appointments, setAppointments] = useState<EnrichedAppointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<EnrichedAppointment | null>(null);

  const [patients, setPatients] = useState<Patient[]>([]);
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [pendingPatientSelect, setPendingPatientSelect] = useState<Patient | null>(null);

  const fetchAppointmentsInternal = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const clinicId = getClinicId();
      const res = await fetch(`${API_BASE_URL}/api/appointments?clinicId=${clinicId}`);
      if (!res.ok) throw new Error(res.statusText);
      const raw = await res.json();
      const normalized = ensureNormalizedAppointments(raw);
      const enriched = enrichAppointments(normalized);
      setAppointments(enriched);
    } catch (err) {
      console.error("Erro ao carregar agendamentos:", err);
      setError('Falha ao carregar agendamentos.');
      setAppointments([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchPatients = useCallback(async () => {
    try {
      const clinicId = getClinicId();
      const res = await fetch(`${API_BASE_URL}/api/patients?clinicId=${clinicId}`);
      if (!res.ok) throw new Error(res.statusText);
      const data: Patient[] = await res.json();
      setPatients(Array.isArray(data) ? data : []);
    } catch (e) {
      console.warn("Erro ao buscar pacientes:", e);
      setPatients([]);
    }
  }, []);

  useEffect(() => { fetchAppointmentsInternal(); }, [fetchAppointmentsInternal]);
  useEffect(() => { fetchPatients(); }, [fetchPatients]);

  const displayedAppointments = useMemo<EnrichedAppointment[]>(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return appointments;

    return appointments
      .filter(app => {
        const patientName = (app.patientName || "").toLowerCase();
        const serviceName = (app.serviceName || "").toLowerCase();
        const profName =
          (app.professionalName ||
            professionals.find(p => p.id === app.professionalId)?.name ||
            "").toLowerCase();

        let dateStr = "";
        if (app.utcDateTime instanceof Date && !isNaN(app.utcDateTime.getTime())) {
          dateStr = app.utcDateTime.toLocaleDateString('pt-BR').toLowerCase();
        } else if (app.date) {
          dateStr = app.date.toLowerCase();
        }

        return (
          patientName.includes(term) ||
            serviceName.includes(term) ||
            profName.includes(term) ||
            dateStr.includes(term)
        );
      })
      .sort((a, b) => {
        const da = a.utcDateTime ? a.utcDateTime.getTime() : 0;
        const db = b.utcDateTime ? b.utcDateTime.getTime() : 0;
        return da - db;
      });
  }, [searchTerm, appointments, professionals]);

  const handleAddAppointment = () => {
    setEditingAppointment(null);
    setShowAppointmentModal(true);
  };

  const handleEditAppointmentClick = (appointment: EnrichedAppointment) => {
    setEditingAppointment(appointment);
    setShowAppointmentModal(true);
  };

  const handleDeleteAppointmentClick = async (appointmentId: number) => {
    if (!window.confirm('Deseja excluir este agendamento?')) return;
    try {
      const clinicId = getClinicId();
      const res = await fetch(
        `${API_BASE_URL}/api/appointments/${appointmentId}?clinicId=${clinicId}`,
        { method: 'DELETE' }
      );
      if (!res.ok) {
        const msg = await extractErrorMessage(res, 'Erro ao excluir agendamento.');
        throw new Error(msg);
      }
      await fetchAppointmentsInternal();
      alert('Agendamento excluído com sucesso!');
    } catch (e) {
      console.error("Erro ao excluir agendamento:", e);
      alert(e instanceof Error ? e.message : 'Erro ao excluir agendamento.');
    }
  };

  function buildAppointmentPayload(data: SubmittedFormData, services: Service[]) {
    const serviceObj = services.find(s => s.id === Number(data.serviceId));
    if (!serviceObj) {
      throw new Error('Serviço não encontrado.');
    }
    return {
      patientId: data.patientId,
      patientName: data.patientName,
      patientPhone: data.patientPhone,
      professionalId: Number(data.professionalId),
      serviceId: Number(data.serviceId),
      service: serviceObj.name,
      serviceName: serviceObj.name,
      date: data.date,
      time: data.time,
      endTime: data.endTime,
      status: data.status,
    };
  }

  const handleSaveAppointmentModal = async (
    data: SubmittedFormData,
    id?: string | number
  ) => {
    if (!data.patientName?.trim()) {
      alert("Nome do paciente é obrigatório.");
      return;
    }
    if (!data.time) {
      alert("Hora inicial é obrigatória.");
      return;
    }
    if (!data.endTime) {
      alert("Hora fim (endTime) é obrigatória.");
      return;
    }
    if (data.time === data.endTime) {
      alert("Hora fim deve ser diferente (e maior) que a hora de início.");
      return;
    }

    let payload;
    try {
      payload = buildAppointmentPayload(data, services);
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Erro ao montar payload.');
      return;
    }

    const clinicId = getClinicId();
    const method = id ? 'PUT' : 'POST';
    const url = id
      ? `${API_BASE_URL}/api/appointments/${id}?clinicId=${clinicId}`
      : `${API_BASE_URL}/api/appointments?clinicId=${clinicId}`;

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const msg = await extractErrorMessage(res, 'Erro ao salvar agendamento.');
        throw new Error(msg);
      }
      await fetchAppointmentsInternal();
      setShowAppointmentModal(false);
      setEditingAppointment(null);
    } catch (err) {
      console.error("Manager: Erro ao salvar agendamento:", err);
      alert(
        err instanceof Error
          ? `Erro: ${err.message}`
          : 'Erro ao salvar agendamento.'
      );
    }
  };

  const getProfessionalName = (pid?: number) => {
    if (pid == null) return 'N/A';
    return professionals.find(p => p.id === pid)?.name || 'Desconhecido';
  };

  const getServiceName = (app: Appointment) =>
    app.serviceName || 'N/A';

  const statusBadgeClass = (status: Appointment['status']) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'pending':
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const statusLabel = (status: Appointment['status']) => {
    switch (status) {
      case 'pending': return 'Pendente';
      case 'confirmed': return 'Confirmado';
      case 'completed': return 'Concluído';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  };

  const addBtnClasses =
    'bg-[#e11d48] text-white hover:bg-[#f43f5e] flex items-center px-4 py-2 rounded text-sm font-medium transition-colors';

  if (isLoading)
    return <div className="p-6 text-center text-gray-500">Carregando agendamentos...</div>;
  if (error)
    return <div className="p-6 text-center text-red-600 bg-red-50 rounded-lg">{error}</div>;

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
                    {app.patientName || 'N/A'}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                    {getServiceName(app)}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                    {app.professionalName || getProfessionalName(app.professionalId)}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                    {app.utcDateTime
                      ? app.utcDateTime.toLocaleDateString('pt-BR')
                      : app.date || 'N/A'}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                    {app.utcDateTime
                      ? app.utcDateTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
                      : app.time || 'N/A'}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusBadgeClass(app.status)}`}
                    >
                      {statusLabel(app.status)}
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
          initialData={
            editingAppointment ? appointmentToFormData(editingAppointment) : undefined
          }
        />
      )}

      {/* Futuro: Modal de paciente se necessário */}
    </div>
  );
};

export default AppointmentsManager;