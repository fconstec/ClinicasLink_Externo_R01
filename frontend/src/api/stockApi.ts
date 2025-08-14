import { buildApiUrl, defaultJsonHeaders } from "./apiPrefix";
import type { StockItem, NewStockItemData } from "../components/ClinicAdminPanel_Managers/types";

/**
 * Converte resposta crua do backend em StockItem normalizado.
 */
function mapStockItem(raw: any): StockItem {
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
    validity:
      raw.validity ??
      raw.expirationDate ??
      raw.expiration_date ??
      undefined,
    ...(clinicId !== undefined ? { clinicId } : {}),
  } as StockItem;
}

async function parseOrThrow<T = any>(res: Response, context: string): Promise<T> {
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(
      `[stockApi] ${context}: ${res.status} ${res.statusText}${
        txt ? " – " + txt.slice(0, 300) : ""
      }`
    );
  }
  return res.json().catch(() => ({} as T));
}

/**
 * Lista itens de estoque da clínica (opcional).
 */
export async function fetchStock(clinicId?: number | string): Promise<StockItem[]> {
  const cidStr = clinicId != null ? String(clinicId) : undefined;
  const url = await buildApiUrl(
    "stock",
    cidStr ? { clinicId: cidStr, clinic_id: cidStr } : undefined,
    { forceApi: true }
  );
  const res = await fetch(url);
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(
      `[stockApi] fetchStock: ${res.status} ${res.statusText}${
        txt ? " – " + txt.slice(0, 300) : ""
      }`
    );
  }
  const data = await res.json();
  return Array.isArray(data) ? data.map(mapStockItem) : [];
}

/**
 * Cria item de estoque.
 * Aceita clinicId como number ou string; sempre envia clinic_id numérico.
 */
export async function addStockItem(
  data: NewStockItemData & { clinicId: number | string }
): Promise<StockItem> {
  const url = await buildApiUrl("stock", undefined, { forceApi: true });
  const payload = {
    ...data,
    clinic_id: Number(data.clinicId),
  };
  const res = await fetch(url, {
    method: "POST",
    headers: defaultJsonHeaders(),
    body: JSON.stringify(payload),
  });
  const json = await parseOrThrow(res, "addStockItem");
  return mapStockItem(json);
}

/**
 * Atualiza item de estoque.
 */
export async function updateStockItem(
  id: number,
  data: Partial<NewStockItemData> & { clinicId: number | string }
): Promise<StockItem> {
  const url = await buildApiUrl(`stock/${id}`, undefined, { forceApi: true });
  const payload = {
    ...data,
    clinic_id: Number(data.clinicId),
  };
  const res = await fetch(url, {
    method: "PUT",
    headers: defaultJsonHeaders(),
    body: JSON.stringify(payload),
  });
  const json = await parseOrThrow(res, "updateStockItem");
  return mapStockItem(json);
}

/**
 * Exclui item de estoque. clinicId opcional (caso backend ignore).
 */
export async function deleteStockItem(
  id: number,
  clinicId?: number | string
): Promise<void> {
  const cidStr = clinicId != null ? String(clinicId) : undefined;
  const url = await buildApiUrl(
    `stock/${id}`,
    cidStr ? { clinicId: cidStr, clinic_id: cidStr } : undefined,
    { forceApi: true }
  );
  const res = await fetch(url, { method: "DELETE" });
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(
      `[stockApi] deleteStockItem: ${res.status} ${res.statusText}${
        txt ? " – " + txt.slice(0, 300) : ""
      }`
    );
  }
}