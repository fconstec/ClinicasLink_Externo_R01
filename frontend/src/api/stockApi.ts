import { StockItem, NewStockItemData } from '../components/ClinicAdminPanel_Managers/types';
import { API_BASE_URL } from './apiBase';

export async function fetchStock(clinicId?: string): Promise<StockItem[]> {
  const url = clinicId
    ? `${API_BASE_URL}/stock?clinic_id=${clinicId}`
    : `${API_BASE_URL}/stock`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Erro ao buscar estoque: ${res.statusText}`);
  const data = await res.json();
  return Array.isArray(data)
    ? data.map((item: any) => ({
        id: Number(item.id),
        name: String(item.name),
        category: String(item.category),
        quantity: Number(item.quantity),
        minQuantity: Number(item.minQuantity),
        unit: String(item.unit),
        updatedAt: String(item.updatedAt),
        validity: item.validity ?? undefined,
        clinic_id: item.clinic_id !== undefined ? Number(item.clinic_id) : undefined,
      }))
    : [];
}

export async function addStockItem(
  data: NewStockItemData & { clinicId: string }
): Promise<StockItem> {
  const { clinicId, ...rest } = data;
  const dataToSend = { ...rest, clinic_id: Number(clinicId) };
  const res = await fetch(`${API_BASE_URL}/stock`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dataToSend),
  });
  if (!res.ok) throw new Error(`Erro ao adicionar item de estoque: ${res.statusText}`);
  return await res.json();
}

export async function updateStockItem(
  id: number,
  data: NewStockItemData & { clinicId: string }
): Promise<StockItem> {
  const { clinicId, ...rest } = data;
  const dataToSend = { ...rest, clinic_id: Number(clinicId) };
  const res = await fetch(`${API_BASE_URL}/stock/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dataToSend),
  });
  if (!res.ok) throw new Error(`Erro ao atualizar item de estoque: ${res.statusText}`);
  return await res.json();
}

export async function deleteStockItem(id: number, clinicId: string): Promise<void> {
  const res = await fetch(
    `${API_BASE_URL}/stock/${id}`,
    {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clinic_id: Number(clinicId) }),
    }
  );
  if (!res.ok) throw new Error(`Erro ao deletar item de estoque: ${res.statusText}`);
}