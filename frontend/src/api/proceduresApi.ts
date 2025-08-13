import { API_BASE_URL } from "./apiBase";
import type { Procedure } from "../components/ClinicAdminPanel_Managers/types";

// Observação:
// A função fetchPatientProcedures foi removida daqui para evitar conflito de export
// (agora ela vive exclusivamente em patientsApi.ts).
// Este módulo fica apenas com operações de CRUD e mídia de procedimentos.

function buildUrl(path: string, params?: Record<string, string | number | undefined>) {
  const url = new URL(`${API_BASE_URL.replace(/\/+$/, "")}${path}`);
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
    });
  }
  return url.toString();
}

// Criar procedimento (JSON puro, sem imagens)
export async function addPatientProcedure(
  patientId: number,
  data: Omit<Procedure, "id"> & { clinicId: string }
): Promise<Procedure> {
  const res = await fetch(buildUrl(`/patients/${patientId}/procedures`, { clinicId: data.clinicId }), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Erro ao criar procedimento: ${res.status} ${res.statusText}${detail ? " – " + detail : ""}`);
  }
  return await res.json();
}

// Atualizar procedimento (JSON puro, sem imagens)
export async function updatePatientProcedure(
  procedureId: number,
  data: Omit<Procedure, "id"> & { clinicId: string }
): Promise<Procedure> {
  const res = await fetch(buildUrl(`/patients/procedures/${procedureId}`, { clinicId: data.clinicId }), {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Erro ao atualizar procedimento: ${res.status} ${res.statusText}${detail ? " – " + detail : ""}`);
  }
  return await res.json();
}

// Deletar procedimento
export async function deletePatientProcedure(
  procedureId: number,
  clinicId: string
): Promise<void> {
  const res = await fetch(buildUrl(`/patients/procedures/${procedureId}`, { clinicId }), {
    method: "DELETE",
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Erro ao deletar procedimento: ${res.status} ${res.statusText}${detail ? " – " + detail : ""}`);
  }
}

// Upload de imagem individual para procedimento
export async function uploadProcedureImage(
  patientId: number,
  procedureId: number,
  file: File,
  clinicId: string
) {
  const formData = new FormData();
  formData.append("procedureImage", file);
  formData.append("clinicId", clinicId);

  const res = await fetch(
    buildUrl(`/patients/${patientId}/procedures/${procedureId}/upload-image`),
    { method: "POST", body: formData }
  );
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Erro ao enviar imagem: ${res.status} ${res.statusText}${detail ? " – " + detail : ""}`);
  }
  return await res.json();
}

// Deletar imagem de procedimento
export async function deleteProcedureImage(
  procedureId: number,
  imageId: number,
  clinicId: string
) {
  const res = await fetch(
    buildUrl(`/patients/procedures/${procedureId}/images/${imageId}`, { clinicId }),
    { method: "DELETE" }
  );
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Erro ao deletar imagem: ${res.status} ${res.statusText}${detail ? " – " + detail : ""}`);
  }
}