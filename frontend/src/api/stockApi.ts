import { buildApiUrl, defaultJsonHeaders } from "./apiPrefix";
import type { StockItem, NewStockItemData } from "../components/ClinicAdminPanel_Managers/types";

function mapStockItem(raw: any): StockItem {
  // Se seu StockItem possuir clinicId?: number no types.ts, preencha:
  const clinicId =
    raw.clinic_id != null
      ? Number(raw.clinic_id)
      : raw.clinicId != null
        ? Number(raw.clinicId)
        : undefined;

  return {
    id: Number(raw.id),
    name: String(raw.name ?? "").trim(),
    category: raw.category != null ? String(raw.category) : "",
    quantity: Number(raw.quantity ?? 0),
    minQuantity:
      raw.minQuantity != null
        ? Number(raw.minQuantity)
        : raw.min_quantity != null
          ? Number(raw.min_quantity)
          : 0,
    unit: raw.unit != null ? String(raw.unit) : "",
    updatedAt: raw.updatedAt
      ? String(raw.updatedAt)
      : raw.updated_at
        ? String(raw.updated_at)
        : "",
    validity: raw.validity ?? raw.expirationDate ?? raw.expiration_date ?? undefined,
    // Só inclua se adicionou clinicId no tipo:
    ...(clinicId !== undefined ? { clinicId } : {}),
  } as StockItem;
}

async function parseOrThrow<T = any>(res: Response, context: string): Promise<T> {
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(
      `[stockApi] ${context}: ${res.status} ${res.statusText}${txt ? " – " + txt.slice(0, 300) : ""}`
    );
  }
  return res.json().catch(() => ({} as T));
}

export async function fetchStock(clinicId?: string): Promise<StockItem[]> {
  const url = await buildApiUrl(
    "stock",
    clinicId ? { clinicId, clinic_id: clinicId } : undefined,
    { forceApi: true } // mantenha se ainda precisa forçar /api
  );
  const res = await fetch(url);
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(
      `[stockApi] fetchStock: ${res.status} ${res.statusText}${txt ? " – " + txt.slice(0, 300) : ""}`
    );
  }
  const data = await res.json();
  return Array.isArray(data) ? data.map(mapStockItem) : [];
}

export async function addStockItem(
  data: NewStockItemData & { clinicId: string }
): Promise<StockItem> {
  const url = await buildApiUrl("stock", undefined, { forceApi: true });
  const payload = { ...data, clinic_id: Number(data.clinicId) };
  const res = await fetch(url, {
    method: "POST",
    headers: defaultJsonHeaders(),
    body: JSON.stringify(payload),
  });
  const json = await parseOrThrow(res, "addStockItem");
  return mapStockItem(json);
}

export async function updateStockItem(
  id: number,
  data: Partial<NewStockItemData> & { clinicId: string }
): Promise<StockItem> {
  const url = await buildApiUrl(`stock/${id}`, undefined, { forceApi: true });
  const payload = { ...data, clinic_id: Number(data.clinicId) };
  const res = await fetch(url, {
    method: "PUT",
    headers: defaultJsonHeaders(),
    body: JSON.stringify(payload),
  });
  const json = await parseOrThrow(res, "updateStockItem");
  return mapStockItem(json);
}

export async function deleteStockItem(id: number, clinicId: string): Promise<void> {
  const url = await buildApiUrl(
    `stock/${id}`,
    { clinicId, clinic_id: clinicId },
    { forceApi: true }
  );
  const res = await fetch(url, { method: "DELETE" });
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(
      `[stockApi] deleteStockItem: ${res.status} ${res.statusText}${txt ? " – " + txt.slice(0, 300) : ""}`
    );
  }
}