import { useState, useEffect } from "react";
import type { PatientSearchResult } from "./types";
import { API_BASE_URL } from "../../api/apiBase";

// Siga o mesmo padrão do restante do projeto: base (domínio) + "/api/..."
const API_PATIENTS = `${API_BASE_URL}/api/patients`;

export function usePatientSearch(
  search: string,
  clinicId: number,
  patientId?: number
) {
  const [patientOptions, setPatientOptions] = useState<PatientSearchResult[]>([]);
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [showPatientDropdown, setShowPatientDropdown] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    let timer: ReturnType<typeof setTimeout> | undefined;

    const q = (search ?? "").trim();

    if (q.length < 2 || !!patientId) {
      setPatientOptions([]);
      setShowPatientDropdown(false);
      // sempre faça cleanup para abortar qualquer requisição anterior
      return () => {
        controller.abort();
        if (timer) clearTimeout(timer);
      };
    }

    setLoadingPatients(true);
    setShowPatientDropdown(true);

    timer = setTimeout(async () => {
      try {
        // Monta URL de forma segura e envia múltiplos nomes de parâmetro
        // para compatibilidade com o backend (search, q, name).
        const url = new URL(API_PATIENTS);
        url.searchParams.set("clinicId", String(clinicId));
        url.searchParams.set("search", q);
        url.searchParams.set("q", q);
        url.searchParams.set("name", q);

        const res = await fetch(url.toString(), { signal: controller.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = (await res.json()) as PatientSearchResult[] | unknown;
        setPatientOptions(Array.isArray(data) ? data : []);
      } catch (err: any) {
        // Ignora cancelamentos durante a digitação
        if (err?.name === "AbortError" || err?.code === "ERR_CANCELED") return;
        setPatientOptions([]);
      } finally {
        setLoadingPatients(false);
      }
    }, 300);

    return () => {
      controller.abort();
      if (timer) clearTimeout(timer);
    };
  }, [search, patientId, clinicId]);

  return {
    patientOptions,
    loadingPatients,
    showPatientDropdown,
    setShowPatientDropdown,
  };
}