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

/* -------------------------------------------------------------
 * Criar procedimento
 * POST /api/patients/:patientId/procedures
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
  if (!res.ok) {
    const body = await readBody(res);
    console.error("[addPatientProcedure] FAIL", res.status, body);
    throw new Error(
      `Erro ao criar procedimento (${res.status}): ${short(body)}`
    );
  }
  const json = await res.json();
  console.info("[addPatientProcedure] OK", json);
  return json;
}

/* -------------------------------------------------------------
 * Atualizar procedimento (opcional)
 * PUT /api/patients/procedures/:procedureId
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
  if (!res.ok) {
    const body = await readBody(res);
    console.error("[updatePatientProcedure] FAIL", res.status, body);
    throw new Error(
      `Erro ao atualizar procedimento (${res.status}): ${short(body)}`
    );
  }
  const json = await res.json();
  console.info("[updatePatientProcedure] OK", json);
  return json;
}

/* -------------------------------------------------------------
 * Deletar procedimento
 * DELETE /api/patients/procedures/:procedureId
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
 * Upload de imagem
 * POST /api/patients/:patientId/procedures/:procedureId/upload-image
 *
 * Estratégia:
 * 1. Tenta 'procedureImage' (campo que você já usava)
 * 2. Se o backend retornar erro indicando ausência de arquivo (400/415/422/500),
 *    tenta 'file' e depois 'image'.
 * 3. Loga qual funcionou. Depois de descobrir, você pode simplificar
 *    removendo o loop e deixando apenas o campo correto.
 * ----------------------------------------------------------- */
export async function uploadProcedureImage(
  patientId: number,
  procedureId: number,
  file: File,
  clinicId: string
) {
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

  // Ordem de tentativa
  const fieldNames = ["procedureImage", "file", "image"];
  const attemptsErrors: string[] = [];

  for (const field of fieldNames) {
    const formData = new FormData();
    formData.append(field, file);
    formData.append("clinicId", clinicId);

    try {
      const res = await fetch(url, { method: "POST", body: formData });
      if (res.ok) {
        const json = await res.json();
        console.info(`[uploadProcedureImage] OK com campo '${field}'`, json);
        return json;
      }

      const body = await readBody(res);

      // Critérios para tentar próximo campo: status típico de "campo incorreto / arquivo ausente"
      if ([400, 415, 422, 500].includes(res.status)) {
        // Tenta apenas se não for claramente outra falha (ex. auth 401/403 ou 404)
        attemptsErrors.push(
          `[${field}] ${res.status} ${res.statusText} :: ${short(body)}`
        );
        continue; // tenta próximo campo
      }

      // Se for outro status (401, 403, 404 etc.), aborta e lança direto.
      console.error("[uploadProcedureImage] Falha não recuperável", res.status, body);
      throw new Error(
        `Erro ao enviar imagem (${res.status}) com campo '${field}': ${short(body)}`
      );
    } catch (e: any) {
      attemptsErrors.push(`[${field}] EXCEPTION ${e.message}`);
      continue;
    }
  }

  console.error(
    "[uploadProcedureImage] Todos os campos falharam:\n" +
      attemptsErrors.join("\n")
  );
  throw new Error(
    "Falha ao enviar imagem. Detalhes:\n" + attemptsErrors.join("\n")
  );
}

/* -------------------------------------------------------------
 * Deletar imagem
 * DELETE /api/patients/procedures/:procedureId/images/:imageId
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