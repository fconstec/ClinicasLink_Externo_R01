import { Procedure } from '../components/ClinicAdminPanel_Managers/types';
import { API_BASE_URL } from './apiBase';

// Buscar procedimentos do paciente
export async function fetchPatientProcedures(
  patientId: number,
  clinicId?: string
): Promise<Procedure[]> {
  const url = clinicId
    ? `${API_BASE_URL}/patients/${patientId}/procedures?clinicId=${clinicId}`
    : `${API_BASE_URL}/patients/${patientId}/procedures`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Erro ao buscar procedimentos: ${res.statusText}`);
  const data = await res.json();
  return Array.isArray(data)
    ? data.map((p: any) => ({
        id: Number(p.id),
        date: String(p.date),
        description: String(p.description),
        professional: String(p.professional),
        value: String(p.value),
        images: p.images ?? [],
      }))
    : [];
}

// Criar procedimento (JSON puro, sem imagens)
export async function addPatientProcedure(
  patientId: number,
  data: Omit<Procedure, 'id'> & { clinicId: string }
): Promise<Procedure> {
  const res = await fetch(`${API_BASE_URL}/patients/${patientId}/procedures`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`Erro ao criar procedimento: ${res.statusText} – ${detail}`);
  }
  return await res.json();
}

// Atualizar procedimento (JSON puro, sem imagens)
export async function updatePatientProcedure(
  procedureId: number,
  data: Omit<Procedure, 'id'> & { clinicId: string }
): Promise<Procedure> {
  const res = await fetch(`${API_BASE_URL}/patients/procedures/${procedureId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`Erro ao atualizar procedimento: ${res.statusText}${detail ? ' – ' + detail : ''}`);
  }
  return await res.json();
}

// Deletar procedimento
export async function deletePatientProcedure(
  procedureId: number,
  clinicId: string
): Promise<void> {
  const res = await fetch(
    `${API_BASE_URL}/patients/procedures/${procedureId}?clinicId=${clinicId}`,
    { method: 'DELETE' }
  );
  if (!res.ok) throw new Error(`Erro ao deletar procedimento: ${res.statusText}`);
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
    `${API_BASE_URL}/patients/${patientId}/procedures/${procedureId}/upload-image`,
    { method: "POST", body: formData }
  );
  if (!res.ok) throw new Error("Erro ao enviar imagem");
  return await res.json();
}

// Deletar imagem de procedimento
export async function deleteProcedureImage(
  procedureId: number,
  imageId: number,
  clinicId: string
) {
  const res = await fetch(
    `${API_BASE_URL}/patients/procedures/${procedureId}/images/${imageId}?clinicId=${clinicId}`,
    { method: "DELETE" }
  );
  if (!res.ok) throw new Error("Erro ao deletar imagem");
}