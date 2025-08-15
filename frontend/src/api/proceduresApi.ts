import { API_BASE_URL } from "./apiBase";
import type { Procedure } from "../components/ClinicAdminPanel_Managers/types";

/**
 * Função util para montar URL base + path, sem duplicar barras.
 */
function base() {
  return (API_BASE_URL || "").replace(/\/+$/, "");
}

function joinPath(...parts: (string | number | undefined)[]) {
  return (
    "/" +
    parts
      .filter(p => p !== undefined && p !== null && String(p).length > 0)
      .map(p => String(p).replace(/^\/+|\/+$/g, ""))
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
  const qs = u.search ? u.search : "";
  // Remonta mantendo host original retirado
  return url + qs;
}

async function doJson<T>(input: RequestInfo, init: RequestInit): Promise<T> {
  const res = await fetch(input, init);
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`${init.method || "GET"} ${input} -> ${res.status} ${res.statusText} ${text.slice(0, 300)}`);
  }
  return (await res.json()) as T;
}

/* ------------------------------------------------------------------ */
/* Tipos                                                              */
/* ------------------------------------------------------------------ */

export interface CreateProcedurePayload {
  date: string | null;
  description: string;
  professional: string;
  value: string;
  clinicId: string;
  // Adicione campos extras se necessários
}

export interface UpdateProcedurePayload extends CreateProcedurePayload {
  // Caso mudanças específicas
}

interface ProcedureResponse extends Procedure {} // Ajuste se resposta difere

/* ------------------------------------------------------------------ */
/* Rota de criação com fallback                                       */
/* ------------------------------------------------------------------ */

/**
 * Tenta múltiplas rotas até alguma funcionar (não retornar 404).
 * Após identificar a correta nos logs, simplifique e mantenha só ela.
 */
export async function addPatientProcedure(
  patientId: number,
  data: CreateProcedurePayload
): Promise<ProcedureResponse> {
  const attempts: {
    label: string;
    url: string;
    method: string;
    body: any;
  }[] = [];

  // Candidatos comuns (ajuste conforme seu backend real):
  // 1. /api/patients/:id/procedures (prefixo api)
  attempts.push({
    label: "api-nested",
    url: base() + joinPath("api", "patients", patientId, "procedures"),
    method: "POST",
    body: data, // clinicId incluído no JSON
  });

  // 2. /patients/:id/procedures (sem prefixo)
  attempts.push({
    label: "nested",
    url: base() + joinPath("patients", patientId, "procedures"),
    method: "POST",
    body: data,
  });

  // 3. /api/procedures (patientId no body)
  attempts.push({
    label: "api-flat",
    url: base() + joinPath("api", "procedures"),
    method: "POST",
    body: { patientId, ...data },
  });

  // 4. /procedures (flat, sem /api)
  attempts.push({
    label: "flat",
    url: base() + joinPath("procedures"),
    method: "POST",
    body: { patientId, ...data },
  });

  const errors: string[] = [];

  for (const attempt of attempts) {
    try {
      const res = await fetch(
        withQuery(attempt.url, {
          // Algumas APIs preferem clinicId em query; mantemos redundante por segurança
          clinicId: data.clinicId,
        }),
        {
          method: attempt.method,
            headers: { "Content-Type": "application/json" },
          body: JSON.stringify(attempt.body),
        }
      );

      if (res.status === 404) {
        errors.push(`[${attempt.label}] 404 ${attempt.url}`);
        continue;
      }
      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        errors.push(
          `[${attempt.label}] ${res.status} ${res.statusText} ${attempt.url} :: ${txt.slice(
            0,
            150
          )}`
        );
        continue;
      }
      const json = await res.json();
      console.info(
        `[addPatientProcedure] SUCESSO via rota '${attempt.label}': ${attempt.url}`
      );
      return json;
    } catch (e: any) {
      errors.push(`[${attempt.label}] EXCEPTION ${attempt.url} :: ${e.message}`);
    }
  }

  console.error(
    "[addPatientProcedure] Todas as tentativas falharam:\n" +
      errors.join("\n")
  );
  throw new Error("Nenhuma rota de criação de procedimento funcionou.");
}

/* ------------------------------------------------------------------ */
/* Update com fallback (se ainda não sabe a rota real)                */
/* ------------------------------------------------------------------ */
export async function updatePatientProcedure(
  procedureId: number,
  data: UpdateProcedurePayload
): Promise<ProcedureResponse> {
  const attempts = [
    {
      label: "api-flat",
      url: base() + joinPath("api", "patients", "procedures", procedureId),
      body: data,
    },
    {
      label: "flat",
      url: base() + joinPath("patients", "procedures", procedureId),
      body: data,
    },
    {
      label: "api-generic",
      url: base() + joinPath("api", "procedures", procedureId),
      body: { ...data },
    },
    {
      label: "generic",
      url: base() + joinPath("procedures", procedureId),
      body: { ...data },
    },
  ];

  const errors: string[] = [];
  for (const a of attempts) {
    try {
      const res = await fetch(
        withQuery(a.url, { clinicId: data.clinicId }),
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(a.body),
        }
      );
      if (res.status === 404) {
        errors.push(`[update ${a.label}] 404 ${a.url}`);
        continue;
      }
      if (!res.ok) {
        const t = await res.text().catch(() => "");
        errors.push(
          `[update ${a.label}] ${res.status} ${res.statusText} ${a.url} :: ${t.slice(
            0,
            120
          )}`
        );
        continue;
      }
      const json = await res.json();
      console.info(
        `[updatePatientProcedure] SUCESSO via rota '${a.label}': ${a.url}`
      );
      return json;
    } catch (e: any) {
      errors.push(`[update ${a.label}] EXCEPTION ${a.url} :: ${e.message}`);
    }
  }
  console.error(
    "[updatePatientProcedure] Falhou em todas as tentativas:\n" +
      errors.join("\n")
  );
  throw new Error("Nenhuma rota de update funcionou.");
}

/* ------------------------------------------------------------------ */
/* Delete (padrões mais simples)                                      */
/* ------------------------------------------------------------------ */
export async function deletePatientProcedure(
  procedureId: number,
  clinicId: string
): Promise<void> {
  const candidates = [
    base() + joinPath("api", "patients", "procedures", procedureId),
    base() + joinPath("patients", "procedures", procedureId),
    base() + joinPath("api", "procedures", procedureId),
    base() + joinPath("procedures", procedureId),
  ];
  const errors: string[] = [];
  for (const url of candidates) {
    try {
      const res = await fetch(withQuery(url, { clinicId }), {
        method: "DELETE",
      });
      if (res.status === 404) {
        errors.push(`[del] 404 ${url}`);
        continue;
      }
      if (!res.ok) {
        const t = await res.text().catch(() => "");
        errors.push(
          `[del] ${res.status} ${res.statusText} ${url} :: ${t.slice(0, 120)}`
        );
        continue;
      }
      console.info(`[deletePatientProcedure] SUCESSO em ${url}`);
      return;
    } catch (e: any) {
      errors.push(`[del] EXCEPTION ${url} :: ${e.message}`);
    }
  }
  console.error(
    "[deletePatientProcedure] Falhou:\n" + errors.join("\n")
  );
  throw new Error("Nenhuma rota de delete funcionou.");
}

/* ------------------------------------------------------------------ */
/* Upload de imagem                                                   */
/* ------------------------------------------------------------------ */
export async function uploadProcedureImage(
  patientId: number,
  procedureId: number,
  file: File,
  clinicId: string
) {
  const formData = new FormData();
  formData.append("procedureImage", file);
  formData.append("clinicId", clinicId);

  // Tentar com e sem /api
  const urls = [
    base() +
      joinPath("api", "patients", patientId, "procedures", procedureId, "upload-image"),
    base() +
      joinPath("patients", patientId, "procedures", procedureId, "upload-image"),
  ];

  const errors: string[] = [];
  for (const url of urls) {
    try {
      const res = await fetch(url, { method: "POST", body: formData });
      if (res.status === 404) {
        errors.push(`[upload] 404 ${url}`);
        continue;
      }
      if (!res.ok) {
        const t = await res.text().catch(() => "");
        errors.push(
          `[upload] ${res.status} ${res.statusText} ${url} :: ${t.slice(
            0,
            140
          )}`
        );
        continue;
      }
      const json = await res.json();
      console.info(`[uploadProcedureImage] SUCESSO em ${url}`);
      return json;
    } catch (e: any) {
      errors.push(`[upload] EXCEPTION ${url} :: ${e.message}`);
    }
  }
  console.error(
    "[uploadProcedureImage] Falhou:\n" + errors.join("\n")
  );
  throw new Error("Nenhuma rota de upload de imagem funcionou.");
}

/* ------------------------------------------------------------------ */
/* Delete imagem                                                      */
/* ------------------------------------------------------------------ */
export async function deleteProcedureImage(
  procedureId: number,
  imageId: number,
  clinicId: string
) {
  const urls = [
    base() +
      joinPath("api", "patients", "procedures", procedureId, "images", imageId),
    base() +
      joinPath("patients", "procedures", procedureId, "images", imageId),
    base() + joinPath("api", "procedures", procedureId, "images", imageId),
    base() + joinPath("procedures", procedureId, "images", imageId),
  ];
  const errors: string[] = [];
  for (const url of urls) {
    try {
      const res = await fetch(withQuery(url, { clinicId }), {
        method: "DELETE",
      });
      if (res.status === 404) {
        errors.push(`[del-img] 404 ${url}`);
        continue;
      }
      if (!res.ok) {
        const t = await res.text().catch(() => "");
        errors.push(
          `[del-img] ${res.status} ${res.statusText} ${url} :: ${t.slice(
            0,
            140
          )}`
        );
        continue;
      }
      console.info(`[deleteProcedureImage] SUCESSO em ${url}`);
      return;
    } catch (e: any) {
      errors.push(`[del-img] EXCEPTION ${url} :: ${e.message}`);
    }
  }
  console.error(
    "[deleteProcedureImage] Falhou:\n" + errors.join("\n")
  );
  throw new Error("Nenhuma rota de delete de imagem funcionou.");
}