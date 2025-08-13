import { Patient } from '../components/ClinicAdminPanel_Managers/types';
import { API_BASE_URL } from './apiBase';

function buildPatientsUrl(params: { clinicId?: string; search?: string }) {
  const base = `${API_BASE_URL}/patients`;
  const url = new URL(base);
  if (params.clinicId) url.searchParams.set('clinicId', params.clinicId);
  if (params.search) {
    url.searchParams.set('search', params.search);
    // compat extra — backend pode aceitar q ou name:
    url.searchParams.set('q', params.search);
    url.searchParams.set('name', params.search);
  }
  return url.toString();
}

export async function fetchPatients(clinicId?: string, search?: string): Promise<Patient[]> {
  const res = await fetch(buildPatientsUrl({ clinicId, search }));
  if (!res.ok) throw new Error(`Erro ao buscar pacientes: ${res.status} ${res.statusText}`);
  const data = await res.json();
  return Array.isArray(data)
    ? data.map((p: any) => ({
        id: Number(p.id),
        name: String(p.name),
        birthDate: String(p.birthDate),
        phone: p.phone ? String(p.phone) : '',
        email: p.email ? String(p.email) : '',
        address: p.address ? String(p.address) : '',
        photo: p.photo ?? null,
        images: p.images ?? [],
        procedures: p.procedures ?? [],
        evolutions: p.evolutions ?? [],
        anamnesis: p.anamnesis ?? undefined,
        tcle: p.tcle ?? undefined,
        appointments: p.appointments ?? [],
      }))
    : [];
}

export async function addPatient(
  data: Omit<Patient, 'id'> & { clinicId: string }
): Promise<Patient> {
  const res = await fetch(`${API_BASE_URL}/patients`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`Erro ao adicionar paciente: ${res.status} ${res.statusText}${detail ? ' – ' + detail : ''}`);
  }
  return await res.json();
}

export async function updatePatient(
  id: number,
  data: Omit<Patient, 'id'> & { clinicId: string }
): Promise<Patient> {
  const res = await fetch(`${API_BASE_URL}/patients/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`Erro ao atualizar paciente: ${res.status} ${res.statusText}${detail ? ' – ' + detail : ''}`);
  }
  return await res.json();
}

export async function deletePatient(id: number, clinicId: string): Promise<void> {
  const res = await fetch(
    `${API_BASE_URL}/patients/${id}?clinicId=${encodeURIComponent(clinicId)}`,
    { method: 'DELETE' }
  );
  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`Erro ao deletar paciente: ${res.status} ${res.statusText}${detail ? ' – ' + detail : ''}`);
  }
}