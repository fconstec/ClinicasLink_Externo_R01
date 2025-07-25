import { ClinicInfoData } from '../components/ClinicAdminPanel_Managers/types';
import { API_BASE_URL } from './apiBase';

// Busca todas as informações da clínica (ajustado para backend flatten)
export async function fetchClinicSettings(clinicId: string): Promise<any> {
  const url = `${API_BASE_URL}/clinic-settings/${clinicId}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Erro ao buscar configurações da clínica: ${res.statusText}`);
  const data = await res.json();
  // Aceita qualquer objeto válido com id (flatten)
  if (!data || typeof data !== 'object' || !data.id) {
    throw new Error("Dados da clínica não encontrados.");
  }
  return data;
}

// Atualiza informações básicas da clínica
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
  const res = await fetch(`${API_BASE_URL}/clinic-settings/${clinicId}/basic-info`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Erro ao atualizar informações básicas");
  return await res.json();
}

// Atualiza endereço (incluindo latitude_address e longitude_address quando fornecidos)
export async function updateClinicAddress(
  clinicId: string,
  data: Partial<ClinicInfoData>
) {
  // Espera receber latitude_address/longitude_address, não latitude/longitude do mapa!
  const res = await fetch(`${API_BASE_URL}/clinic-settings/${clinicId}/address`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Erro ao atualizar endereço");
  return await res.json();
}

// Atualiza posição manual do mapa (latitude_map/longitude_map)
export async function updateClinicMapLocation(
  clinicId: string,
  latLng: { lat: number, lng: number }
) {
  const res = await fetch(`${API_BASE_URL}/clinic-settings/${clinicId}/map-location`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      latitude_map: latLng.lat,
      longitude_map: latLng.lng,
    }),
  });
  if (!res.ok) throw new Error("Erro ao atualizar localização do mapa");
  return await res.json();
}

// Atualiza horários de funcionamento
export async function updateClinicOpeningHours(
  clinicId: string,
  data: { openingHours: string }
) {
  const res = await fetch(`${API_BASE_URL}/clinic-settings/${clinicId}/opening-hours`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Erro ao atualizar horários de funcionamento");
  return await res.json();
}

// Atualiza especialidades
export async function updateClinicSpecialties(
  clinicId: string,
  data: { specialties: string[]; customSpecialties: string[] }
) {
  const res = await fetch(`${API_BASE_URL}/clinic-settings/${clinicId}/specialties`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Erro ao atualizar especialidades");
  return await res.json();
}

/**
 * Atualiza imagens da clínica (capa e galeria).
 * PATCH em /clinic-settings/:clinicId/images
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
    formData.append('coverImage', coverImageFile);
  }
  if (galleryImageFiles && galleryImageFiles.length > 0) {
    for (const file of galleryImageFiles) {
      formData.append('galleryImages', file);
    }
  }

  const res = await fetch(`${API_BASE_URL}/clinic-settings/${clinicId}/images`, {
    method: 'PATCH',
    body: formData,
  });
  if (!res.ok) throw new Error(`Erro ao atualizar imagens: ${res.statusText}`);
  const updated = await res.json();
  const info = updated?.info ?? updated;
  if (!info || typeof info !== 'object' || !info.id) {
    throw new Error("Resposta inválida do backend após salvar imagens.");
  }
  return info;
}