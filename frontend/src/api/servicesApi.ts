import { Service, NewServiceData } from '../components/ClinicAdminPanel_Managers/types';
import { API_BASE_URL } from './apiBase';

export async function fetchServices(clinicId?: string): Promise<Service[]> {
  const url = clinicId
    ? `${API_BASE_URL}/services?clinicId=${clinicId}`
    : `${API_BASE_URL}/services`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Erro ao buscar serviços: ${res.statusText}`);
  const data = await res.json();
  return Array.isArray(data)
    ? data.map((s: any) => ({
        id: Number(s.id),
        name: String(s.name),
        duration: String(s.duration),
        value: String(s.value),
        description: s.description ?? undefined,
      }))
    : [];
}

export async function addService(
  data: NewServiceData & { clinicId: string }
): Promise<Service> {
  const res = await fetch(`${API_BASE_URL}/services`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || 'Erro ao adicionar serviço.');
  }
  return await res.json();
}

export async function updateService(
  id: number,
  data: Omit<Service, 'id'> & { clinicId: string }
): Promise<Service> {
  const res = await fetch(`${API_BASE_URL}/services/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Erro ao atualizar serviço: ${res.statusText}`);
  return await res.json();
}

export async function deleteService(id: number, clinicId: string): Promise<void> {
  const res = await fetch(
    `${API_BASE_URL}/services/${id}?clinicId=${clinicId}`,
    { method: 'DELETE' }
  );
  if (!res.ok) throw new Error(`Erro ao deletar serviço: ${res.statusText}`);
}