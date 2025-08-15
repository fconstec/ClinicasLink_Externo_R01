import { API_BASE_URL } from "./apiBase";
import type { Procedure } from "../components/ClinicAdminPanel_Managers/types";

/**
 * Utilidades
 */
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
  const u = new URL(url, "http://dummy");
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") {
      u.searchParams.set(k, String(v));
    }
  });
  const qs = u.search || "";
  return url + qs;
}
async function parseMaybeJson(res: Response) {
  const text = await res.text().catch(() => "");
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export interface CreateProcedurePayload {
  date: string | null;
  description: string;
  professional: string;
  value: string;
  clinicId: string;
}

export interface UpdateProcedurePayload extends CreateProcedurePayload {}

type ProcedureResponse = Procedure; // Ajustar se seu backend retornar shape diferente

/**
 * CRIAR procedimento
 * Rota confirmada (ajuste se seu backend divergir):
 * POST /api/patients/:patientId/procedures
 */
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

  if (!res.ok) {
    const body = await parseMaybeJson(res);
    console.error("[addPatientProcedure] FAIL", res.status, body);
    throw new Error(
      `Erro ao criar procedimento (${res.status}): ${
        typeof body === "string" ? body.slice(0, 300) : JSON.stringify(body).slice(0, 300)
      }`
    );
  }
  const json = await res.json();
  console.info("[addPatientProcedure] SUCESSO", json);
  return json;
}

/**
 * ATUALIZAR procedimento (se necessário)
 * PUT /api/patients/procedures/:procedureId
 * Descomente e use no hook se quiser persistir edições.
 */
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

  if (!res.ok) {
    const body = await parseMaybeJson(res);
    console.error("[updatePatientProcedure] FAIL", res.status, body);
    throw new Error(
      `Erro ao atualizar procedimento (${res.status}): ${
        typeof body === "string" ? body.slice(0, 300) : JSON.stringify(body).slice(0, 300)
      }`
    );
  }
  const json = await res.json();
  console.info("[updatePatientProcedure] SUCESSO", json);
  return json;
}

/**
 * DELETAR procedimento
 * DELETE /api/patients/procedures/:procedureId?clinicId=...
 */
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
    const body = await parseMaybeJson(res);
    console.error("[deletePatientProcedure] FAIL", res.status, body);
    throw new Error(
      `Erro ao deletar procedimento (${res.status}): ${
        typeof body === "string" ? body.slice(0, 300) : JSON.stringify(body).slice(0, 300)
      }`
    );
  }
  console.info("[deletePatientProcedure] SUCESSO", procedureId);
}

/**
 * UPLOAD de imagem
 * POST /api/patients/:patientId/procedures/:procedureId/upload-image
 * – Tenta vários nomes de campo para descobrir o esperado pelo backend.
 * Assim que descobrir qual funciona, fixe apenas aquele para otimizar.
 */
export async function uploadProcedureImage(
  patientId: number,
  procedureId: number,
  file: File,
  clinicId: string
) {
  const baseUrl = withQuery(
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

  const fieldCandidates = ["procedureImage", "image", "file", "photo", "picture"];
  const errors: string[] = [];

  for (const fieldName of fieldCandidates) {
    const formData = new FormData();
    formData.append(fieldName, file);
    formData.append("clinicId", clinicId);

    try {
      const res = await fetch(baseUrl, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        errors.push(`[${fieldName}] ${res.status} ${res.statusText} :: ${text.slice(0, 200)}`);
        // 404/500/400/422 tentamos próximo
        continue;
      }

      console.info(
        `[uploadProcedureImage] SUCESSO usando campo '${fieldName}'`
      );
      const json = await res.json();
      return json;
    } catch (e: any) {
      errors.push(`[${fieldName}] EXCEPTION :: ${e.message}`);
    }
  }

  console.error("[uploadProcedureImage] Falhou em todos os campos:\n" + errors.join("\n"));
  throw new Error("Nenhum campo multipart aceito pelo backend.");
}

/**
 * DELETAR imagem
 * DELETE /api/patients/procedures/:procedureId/images/:imageId?clinicId=...
 */
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
    const body = await parseMaybeJson(res);
    console.error("[deleteProcedureImage] FAIL", res.status, body);
    throw new Error(
      `Erro ao deletar imagem (${res.status}): ${
        typeof body === "string" ? body.slice(0, 300) : JSON.stringify(body).slice(0, 300)
      }`
    );
  }
  console.info("[deleteProcedureImage] SUCESSO", imageId);
}