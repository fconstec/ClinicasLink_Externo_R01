import { API_BASE_URL } from "./apiBase";
import type { Procedure } from "../components/ClinicAdminPanel_Managers/types";

/* -------------------------------------------------------------
 * Utilidades
 * ----------------------------------------------------------- */
function base() {
  return (API_BASE_URL || "").replace(/\/+$/, "");
}
function joinPath(...parts: (string | number)[]) {
  return (
    "/" +
    parts
      .map(p => String(p).trim())
      .filter(p => p.length > 0)
      .map(p => p.replace(/^\/+|\/+$/g, ""))
      .join("/")
  );
}
function withQuery(url: string, params?: Record<string, string | number | undefined | null>) {
  if (!params) return url;
  const u = new URL(url, "http://dummy.local");
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") u.searchParams.set(k, String(v));
  });
  return url + u.search;
}
async function readBody(res: Response) {
  const txt = await res.text().catch(() => "");
  try {
    return JSON.parse(txt);
  } catch {
    return txt;
  }
}
function short(v: any, max = 300) {
  const s = typeof v === "string" ? v : JSON.stringify(v);
  return s.length > max ? s.slice(0, max) + "..." : s;
}
async function ensureOk<T = any>(res: Response, ctx: string): Promise<T> {
  if (!res.ok) {
    const body = await readBody(res);
    console.error(`[${ctx}] FAIL`, res.status, body);
    throw new Error(`${ctx} (${res.status}): ${short(body)}`);
  }
  return (await res.json()) as T;
}

/* -------------------------------------------------------------
 * Tipos de payload
 * ----------------------------------------------------------- */
export interface CreateProcedurePayload {
  date: string | null;
  description: string;
  professional: string;
  value: string;
  clinicId: string;
}
export interface UpdateProcedurePayload extends CreateProcedurePayload {}

type ProcedureResponse = Procedure;

/* Tipos auxiliares para imagens (opcional) */
export interface ProcedureImageStored {
  id: number;
  procedure_id?: number;
  url: string;
  fileName?: string | null;
  filename?: string | null; // caso direto do banco sem map
  created_at?: string;
}
export interface UploadImageResponse {
  uploaded?: ProcedureImageStored;
  images?: ProcedureImageStored[];
}

/* -------------------------------------------------------------
 * Criar procedimento
 * ----------------------------------------------------------- */
export async function addPatientProcedure(
  patientId: number,
  data: CreateProcedurePayload
): Promise<ProcedureResponse> {
  const url = withQuery(
    base() + joinPath("api", "patients", patientId, "procedures"),
    { clinicId: data.clinicId }
  );
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return ensureOk<ProcedureResponse>(res, "Erro ao criar procedimento");
}

/* -------------------------------------------------------------
 * Atualizar procedimento
 * ----------------------------------------------------------- */
export async function updatePatientProcedure(
  procedureId: number,
  data: UpdateProcedurePayload
): Promise<ProcedureResponse> {
  const url = withQuery(
    base() + joinPath("api", "patients", "procedures", procedureId),
    { clinicId: data.clinicId }
  );
  const res = await fetch(url, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return ensureOk<ProcedureResponse>(res, "Erro ao atualizar procedimento");
}

/* -------------------------------------------------------------
 * Deletar procedimento
 * ----------------------------------------------------------- */
export async function deletePatientProcedure(
  procedureId: number,
  clinicId: string
): Promise<void> {
  const url = withQuery(
    base() + joinPath("api", "patients", "procedures", procedureId),
    { clinicId }
  );
  const res = await fetch(url, { method: "DELETE" });
  if (!res.ok) {
    const body = await readBody(res);
    console.error("[deletePatientProcedure] FAIL", res.status, body);
    throw new Error(
      `Erro ao deletar procedimento (${res.status}): ${short(body)}`
    );
  }
  console.info("[deletePatientProcedure] OK", procedureId);
}

/* -------------------------------------------------------------
 * Upload de imagem (versão simples e final)
 * ----------------------------------------------------------- */
export async function uploadProcedureImage(
  patientId: number,
  procedureId: number,
  file: File,
  clinicId: string
): Promise<UploadImageResponse> {
  const url = withQuery(
    base() +
      joinPath(
        "api",
        "patients",
        patientId,
        "procedures",
        procedureId,
        "upload-image"
      ),
    { clinicId }
  );

  const formData = new FormData();
  formData.append("procedureImage", file); // campo esperado pelo backend
  formData.append("clinicId", clinicId);

  const res = await fetch(url, { method: "POST", body: formData });

  // Leitura custom porque queremos mostrar rapidamente a mensagem do backend
  if (!res.ok) {
    const body = await readBody(res);
    console.error("[uploadProcedureImage] FAIL", res.status, body);
    throw new Error(
      `Erro ao enviar imagem (${res.status}): ${short(body)}`
    );
  }

  const json = (await res.json()) as UploadImageResponse;
  console.info("[uploadProcedureImage] OK", json);
  return json;
}

/* -------------------------------------------------------------
 * Deletar imagem
 * ----------------------------------------------------------- */
export async function deleteProcedureImage(
  procedureId: number,
  imageId: number,
  clinicId: string
) {
  const url = withQuery(
    base() +
      joinPath(
        "api",
        "patients",
        "procedures",
        procedureId,
        "images",
        imageId
      ),
    { clinicId }
  );
  const res = await fetch(url, { method: "DELETE" });
  if (!res.ok) {
    const body = await readBody(res);
    console.error("[deleteProcedureImage] FAIL", res.status, body);
    throw new Error(
      `Erro ao deletar imagem (${res.status}): ${short(body)}`
    );
  }
  console.info("[deleteProcedureImage] OK", imageId);
}