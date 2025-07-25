import { Professional, NewProfessionalData } from '../components/ClinicAdminPanel_Managers/types';
import { API_BASE_URL } from './apiBase';

export async function fetchProfessionals(clinicId?: string): Promise<Professional[]> {
  const url = clinicId
    ? `${API_BASE_URL}/professionals?clinicId=${clinicId}`
    : `${API_BASE_URL}/professionals`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Erro ao buscar profissionais: ${res.statusText}`);
  const data = await res.json();
  return Array.isArray(data)
    ? data.map((p: any) => ({
        id: Number(p.id),
        name: String(p.name),
        specialty: String(p.specialty),
        photo: String(p.photo),
        available: Boolean(p.available),
        clinic_id: Number(p.clinic_id),
        email: p.email ?? undefined,
        phone: p.phone ?? undefined,
        resume: p.resume ?? undefined,
        color: p.color ?? undefined,
      }))
    : [];
}

export async function addProfessional(data: NewProfessionalData): Promise<Professional> {
  const res = await fetch(`${API_BASE_URL}/professionals`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || 'Erro ao adicionar profissional.');
  }
  return await res.json();
}

export async function updateProfessional(
  id: number,
  data: Omit<Professional, 'id'> & { clinic_id: number }
): Promise<Professional> {
  const res = await fetch(`${API_BASE_URL}/professionals/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Erro ao atualizar profissional: ${res.statusText}`);
  return await res.json();
}

export async function deleteProfessional(id: number, clinicId: string): Promise<void> {
  const res = await fetch(
    `${API_BASE_URL}/professionals/${id}?clinicId=${clinicId}`,
    { method: 'DELETE' }
  );
  if (!res.ok) throw new Error(`Erro ao deletar profissional: ${res.statusText}`);
}