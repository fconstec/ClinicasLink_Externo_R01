import { Appointment } from '../components/ClinicAdminPanel_Managers/types';
import { API_BASE_URL } from './apiBase';

export async function fetchAppointments(clinicId?: string): Promise<Appointment[]> {
  const url = clinicId
    ? `${API_BASE_URL}/appointments?clinicId=${clinicId}`
    : `${API_BASE_URL}/appointments`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Erro ao buscar agendamentos: ${res.statusText}`);
  const raw = await res.json();
  if (!Array.isArray(raw)) return [];
  return raw
    .map((ap: any) => {
      const idNum = Number(ap.id);
      const profNum = Number(ap.professionalId ?? ap.professional_id);
      const servNum = Number(ap.serviceId ?? ap.service_id);
      if (isNaN(idNum) || isNaN(profNum)) return null;
      return {
        id: idNum,
        patientId: ap.patientId ? Number(ap.patientId) : undefined,
        patientName: ap.patientName ?? ap.patient_name,
        patientPhone: ap.patientPhone ?? ap.patient_phone,
        serviceId: isNaN(servNum) ? undefined : servNum,
        service: ap.service ?? ap.service_name,
        service_name: ap.service_name,
        professionalId: profNum,
        professional_name: ap.professional_name,
        date: String(ap.date),
        time: String(ap.time),
        status: ap.status,
        notes: ap.notes,
        created_at: ap.created_at,
        updated_at: ap.updated_at,
        startUTC: ap.startUTC,
      } as Appointment;
    })
    .filter((x): x is Appointment => x !== null);
}

export async function createAppointment(appointment: Omit<Appointment, 'id'>, clinicId: string): Promise<Appointment> {
  const url = `${API_BASE_URL}/appointments?clinicId=${clinicId}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(appointment),
  });
  if (!res.ok) throw new Error(`Erro ao criar agendamento: ${res.statusText}`);
  return res.json();
}