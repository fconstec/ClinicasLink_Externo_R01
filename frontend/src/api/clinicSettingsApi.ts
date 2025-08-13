import { buildApiUrl, defaultJsonHeaders } from "./apiPrefix";
import type { ClinicInfoData } from "../components/ClinicAdminPanel_Managers/types";

/**
 * Helper para montar erros consistentes.
 */
async function parseOrThrow<T = any>(res: Response, context: string): Promise<T> {
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(
      `[clinicSettingsApi] ${context}: ${res.status} ${res.statusText}${
        txt ? " – " + txt.slice(0, 400) : ""
      }`
    );
  }
  return res
    .json()
    .catch(() => {
      throw new Error(`[clinicSettingsApi] ${context}: resposta JSON inválida`);
    });
}

/**
 * Verifica se o objeto possui um id válido.
 */
function checkId<T extends { id?: any }>(obj: T, context: string): T {
  if (!obj || typeof obj !== "object" || obj.id == null) {
    throw new Error(`[clinicSettingsApi] ${context}: objeto sem id válido na resposta`);
  }
  return obj;
}

/**
 * Busca configurações completas da clínica.
 * Ajuste o tipo de retorno conforme a estrutura real do backend.
 */
export async function fetchClinicSettings(clinicId: string): Promise<ClinicInfoData | any> {
  const url = await buildApiUrl(`clinic-settings/${clinicId}`);
  const data = await parseOrThrow<any>(await fetch(url), "fetchClinicSettings");
  // O backend pode devolver o objeto direto ou aninhado (info).
  const obj = data?.info ?? data;
  checkId(obj, "fetchClinicSettings");
  return obj;
}

/**
 * Atualiza informações básicas (nome, email, etc).
 */
export async function updateClinicBasicInfo(
  clinicId: string,
  data: Partial<{
    name: string;
    email: string;
    phone: string;
    website: string;
    description: string;
  }>
) {
  const url = await buildApiUrl(`clinic-settings/${clinicId}/basic-info`);
  const res = await fetch(url, {
    method: "PATCH",
    headers: defaultJsonHeaders(),
    body: JSON.stringify(data),
  });
  const json = await parseOrThrow<any>(res, "updateClinicBasicInfo");
  return json?.info ?? json;
}

/**
 * Atualiza endereço da clínica (usa latitude_address / longitude_address).
 */
export async function updateClinicAddress(
  clinicId: string,
  data: Partial<ClinicInfoData>
) {
  const url = await buildApiUrl(`clinic-settings/${clinicId}/address`);
  const res = await fetch(url, {
    method: "PATCH",
    headers: defaultJsonHeaders(),
    body: JSON.stringify(data),
  });
  const json = await parseOrThrow<any>(res, "updateClinicAddress");
  return json?.info ?? json;
}

/**
 * Atualiza posição manual do mapa (latitude_map / longitude_map).
 */
export async function updateClinicMapLocation(
  clinicId: string,
  latLng: { lat: number; lng: number }
) {
  const url = await buildApiUrl(`clinic-settings/${clinicId}/map-location`);
  const res = await fetch(url, {
    method: "PATCH",
    headers: defaultJsonHeaders(),
    body: JSON.stringify({
      latitude_map: latLng.lat,
      longitude_map: latLng.lng,
    }),
  });
  const json = await parseOrThrow<any>(res, "updateClinicMapLocation");
  return json?.info ?? json;
}

/**
 * Atualiza horários de funcionamento (openingHours: string serializada, ex.: JSON).
 */
export async function updateClinicOpeningHours(
  clinicId: string,
  data: { openingHours: string }
) {
  const url = await buildApiUrl(`clinic-settings/${clinicId}/opening-hours`);
  const res = await fetch(url, {
    method: "PATCH",
    headers: defaultJsonHeaders(),
    body: JSON.stringify(data),
  });
  const json = await parseOrThrow<any>(res, "updateClinicOpeningHours");
  return json?.info ?? json;
}

/**
 * Atualiza especialidades (lista padrão + customizadas).
 */
export async function updateClinicSpecialties(
  clinicId: string,
  data: { specialties: string[]; customSpecialties: string[] }
) {
  const url = await buildApiUrl(`clinic-settings/${clinicId}/specialties`);
  const res = await fetch(url, {
    method: "PATCH",
    headers: defaultJsonHeaders(),
    body: JSON.stringify(data),
  });
  const json = await parseOrThrow<any>(res, "updateClinicSpecialties");
  return json?.info ?? json;
}

/**
 * Atualiza imagens (capa + galeria).
 * Envia:
 *  - coverImage (File opcional)
 *  - galleryImages[] (arquivos novos)
 *  - existingGalleryUrls (JSON string)
 *  - galleryUrlsToRemove (JSON string)
 *  - galleryUrls (string[] em JSON)
 */
export async function updateClinicImages(
  clinicId: string,
  {
    coverImageFile,
    galleryImageFiles,
    existingGalleryUrlsJSON,
    galleryUrlsToRemoveJSON,
    galleryUrls,
  }: {
    coverImageFile?: File | null;
    galleryImageFiles?: File[];
    existingGalleryUrlsJSON?: string;
    galleryUrlsToRemoveJSON?: string;
    galleryUrls?: string[];
  }
): Promise<any> {
  const formData = new FormData();

  if (existingGalleryUrlsJSON !== undefined) {
    formData.append("existingGalleryUrls", existingGalleryUrlsJSON);
  }
  if (galleryUrlsToRemoveJSON !== undefined) {
    formData.append("galleryUrlsToRemove", galleryUrlsToRemoveJSON);
  }
  if (Array.isArray(galleryUrls)) {
    formData.append("galleryUrls", JSON.stringify(galleryUrls));
  }
  if (coverImageFile) {
    formData.append("coverImage", coverImageFile);
  }
  if (galleryImageFiles?.length) {
    for (const file of galleryImageFiles) {
      formData.append("galleryImages", file);
    }
  }

  const url = await buildApiUrl(`clinic-settings/${clinicId}/images`);
  const res = await fetch(url, {
    method: "PATCH",
    body: formData,
  });
  const json = await parseOrThrow<any>(res, "updateClinicImages");
  const info = json?.info ?? json;
  checkId(info, "updateClinicImages");
  return info;
}

/* -----------------------------------------------------------
   OPCIONAIS (descomente se o backend tiver esses endpoints)
----------------------------------------------------------- */

/**
 * Remove uma imagem específica da galeria (se existir endpoint).
 */
// export async function deleteClinicGalleryImage(clinicId: string, imageId: string) {
//   const url = await buildApiUrl(`clinic-settings/${clinicId}/images/${imageId}`);
//   const res = await fetch(url, { method: "DELETE" });
//   await parseOrThrow(res, "deleteClinicGalleryImage");
// }

/**
 * Atualiza múltiplos blocos de dados de uma vez (caso crie endpoint multi-patch).
 * Exemplo de payload: { basicInfo: {...}, address: {...}, specialties: {...} }
 */
// export async function batchUpdateClinicSettings(
//   clinicId: string,
//   payload: Record<string, any>
// ) {
//   const url = await buildApiUrl(`clinic-settings/${clinicId}/batch`);
//   const res = await fetch(url, {
//     method: "PATCH",
//     headers: defaultJsonHeaders(),
//     body: JSON.stringify(payload),
//   });
//   return await parseOrThrow(res, "batchUpdateClinicSettings");
// }