import { API_BASE_URL, fileUrl } from "./apiBase";
import type { Patient, Procedure } from "../components/ClinicAdminPanel_Managers/types";

function norm(u: string) {
  return u.replace(/([^:]\/)\/+/g, "$1");
}

function mapPatient(raw: any): Patient {
  return {
    id: Number(raw.id),
    name: String(raw.name ?? ""),
    birthDate: raw.birthDate ?? "",
    phone: raw.phone ?? "",
    email: raw.email ?? "",
    address: raw.address ?? "",
    photo: raw.photo ?? null,
    images: raw.images ?? [],
    procedures: raw.procedures ?? [],
    evolutions: raw.evolutions ?? [],
    anamnesis: raw.anamnesis ?? raw.anamnese,
    tcle: raw.tcle,
    appointments: raw.appointments ?? [],
  };
}

let patientsBasePath: "/api/patients" | "/patients" | null = null;
let resolving = false;

async function resolvePatientsBase(): Promise<string> {
  if (patientsBasePath) return patientsBasePath;
  if (resolving) {
    return new Promise(resolve => {
      const iv = setInterval(() => {
        if (patientsBasePath) {
          clearInterval(iv);
          resolve(patientsBasePath);
        }
      }, 40);
    });
  }
  resolving = true;
  try {
    const head = await fetch(norm(`${API_BASE_URL}/api/patients`), { method: "HEAD" });
    if (head.status !== 404) {
      patientsBasePath = "/api/patients";
      resolving = false;
      return patientsBasePath;
    }
  } catch { /* ignore */ }
  patientsBasePath = "/patients";
  resolving = false;
  return patientsBasePath;
}

type AddOrUpdatePayload = {
  name: string;
  birthDate?: string;
  phone?: string;
  email?: string;
  address?: string;
  photo?: string | null;
  clinicId: string;
};

// Helper: normaliza valores de `photo` antes de enviar ao backend.
// - converte Supabase public URL em path relativo (ex: "patients/123/x.jpg")
// - remove API_BASE_URL prefix (ex: "/uploads/..." -> "uploads/...")
// - se for string vazia retorna undefined (para não sobrescrever no backend)
function normalizePhotoForSave(photo?: string | null): string | undefined {
  if (photo === undefined || photo === null) return undefined;
  const p = String(photo).trim();
  if (!p) return undefined;

  // 1) Detecta Supabase public URL com padrão /storage/v1/object/public/{bucket}/{path}
  const supabaseMatch = p.match(/\/storage\/v1\/object\/public\/[^\/]+\/(.+)$/i);
  if (supabaseMatch && supabaseMatch[1]) {
    return decodeURIComponent(supabaseMatch[1]);
  }

  // 2) Se começa com API_BASE_URL, remover o prefixo para obter o path relativo
  if (API_BASE_URL && p.startsWith(API_BASE_URL)) {
    const stripped = p.replace(new RegExp('^' + API_BASE_URL.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + '/?'), "");
    return stripped || undefined;
  }

  // 3) Se for URL (qualquer host) -> extrair a parte após hostname
  const urlMatch = p.match(/^https?:\/\/[^\/]+\/(.+)$/i);
  if (urlMatch && urlMatch[1]) {
    return decodeURIComponent(urlMatch[1]);
  }

  // 4) Caso já seja um path relativo aceitável (ex: avatars/patients/...), retorna tal como está
  return p;
}

export async function fetchPatients(clinicId?: string, search?: string, signal?: AbortSignal): Promise<Patient[]> {
  const base = await resolvePatientsBase();
  const url = new URL(norm(`${API_BASE_URL}${base}`));
  if (clinicId) url.searchParams.set("clinicId", clinicId);
  if (search) {
    url.searchParams.set("search", search);
    url.searchParams.set("q", search);
    url.searchParams.set("name", search);
  }
  const res = await fetch(url.toString(), { signal });
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`Erro ao buscar pacientes: ${res.status} ${res.statusText}${txt ? " - " + txt : ""}`);
  }
  const data = await res.json();
  return Array.isArray(data) ? data.map(mapPatient) : [];
}

export async function addPatient(payload: AddOrUpdatePayload): Promise<Patient> {
  // normaliza photo antes de enviar
  const out = { ...payload } as any;
  const normalized = normalizePhotoForSave(out.photo);
  if (normalized === undefined) {
    delete out.photo;
  } else {
    out.photo = normalized;
  }

  const base = await resolvePatientsBase();
  const res = await fetch(norm(`${API_BASE_URL}${base}`), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(out),
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`Erro ao adicionar paciente: ${res.status} ${res.statusText}${txt ? " - " + txt : ""}`);
  }
  return mapPatient(await res.json());
}

export async function updatePatient(id: number, payload: AddOrUpdatePayload): Promise<Patient> {
  // normaliza photo antes de enviar; se undefined -> remove para não sobrescrever
  const out = { ...payload } as any;
  const normalized = normalizePhotoForSave(out.photo);
  if (normalized === undefined) {
    delete out.photo;
  } else {
    out.photo = normalized;
  }

  const base = await resolvePatientsBase();
  const res = await fetch(norm(`${API_BASE_URL}${base}/${id}`), {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(out),
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`Erro ao atualizar paciente: ${res.status} ${res.statusText}${txt ? " - " + txt : ""}`);
  }
  return mapPatient(await res.json());
}

export async function deletePatient(id: number, clinicId: string): Promise<void> {
  const base = await resolvePatientsBase();
  const urlObj = new URL(norm(`${API_BASE_URL}${base}/${id}`));
  urlObj.searchParams.set("clinicId", clinicId);
  const res = await fetch(urlObj.toString(), { method: "DELETE" });
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`Erro ao deletar paciente: ${res.status} ${res.statusText}${txt ? " - " + txt : ""}`);
  }
}

export async function fetchPatientProcedures(patientId: number, clinicId?: string): Promise<Procedure[]> {
  const base = await resolvePatientsBase();
  const url = new URL(norm(`${API_BASE_URL}${base}/${patientId}/procedures`));
  if (clinicId) url.searchParams.set("clinicId", clinicId);
  const res = await fetch(url.toString());
  if (!res.ok) {
    if (res.status === 404) return [];
    const txt = await res.text().catch(() => "");
    throw new Error(`Erro ao buscar procedimentos: ${res.status} ${res.statusText}${txt ? " - " + txt : ""}`);
  }
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

export interface PatientAnamnesisTcle {
  anamnesis: string | null;
  tcle: string | null;
}

export async function fetchPatientAnamnesisTcle(patientId: number, clinicId: string): Promise<PatientAnamnesisTcle> {
  const base = await resolvePatientsBase();
  const url = new URL(norm(`${API_BASE_URL}${base}/${patientId}/anamnese`));
  url.searchParams.set("clinicId", clinicId);
  const res = await fetch(url.toString());
  if (!res.ok) {
    if (res.status === 404) return { anamnesis: null, tcle: null };
    const txt = await res.text().catch(() => "");
    throw new Error(`Erro ao buscar anamnese/TCLE: ${res.status} ${res.statusText}${txt ? " - " + txt : ""}`);
  }
  const json = await res.json().catch(() => ({}));
  return {
    anamnesis: json.anamnese ?? json.anamnesis ?? null,
    tcle: json.tcle ?? null,
  };
}

/**
 * Atualiza Anamnese e TCLE. Tenta /anamnese-tcle e fallback /anamnese.
 */
export async function updatePatientAnamnesisTcle(
  patientId: number,
  clinicId: string,
  data: { anamnesis: string; tcle: string }
): Promise<void> {
  const base = await resolvePatientsBase();

  async function tryUrl(suffix: string): Promise<Response> {
    const url = new URL(norm(`${API_BASE_URL}${base}/${patientId}/${suffix}`));
    url.searchParams.set("clinicId", clinicId);
    return fetch(url.toString(), {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  }

  let res = await tryUrl("anamnese-tcle");
  if (res.status === 404) {
    res = await tryUrl("anamnese");
  }

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`Erro ao salvar Anamnese/TCLE: ${res.status} ${res.statusText}${txt ? " - " + txt : ""}`);
  }
}

export interface FullPatientData {
  patient: Patient & { photo?: string | null | undefined };
  procedures: Procedure[];
  anamnesis: string | null;
  tcle: string | null;
  appointments: any[];
}

export async function fetchFullPatientData(patient: Patient, clinicId: string): Promise<FullPatientData> {
  const [anat, procs] = await Promise.all([
    fetchPatientAnamnesisTcle(patient.id, clinicId).catch(() => ({ anamnesis: null, tcle: null })),
    fetchPatientProcedures(patient.id, clinicId).catch(() => []),
  ]);

  return {
    patient: {
      ...patient,
      photo: patient.photo ? fileUrl(patient.photo) : patient.photo,
    },
    procedures: (procs && procs.length > 0 ? procs : (patient.procedures ?? [])) as Procedure[],
    anamnesis: anat.anamnesis,
    tcle: anat.tcle,
    appointments: patient.appointments ?? [],
  };
}