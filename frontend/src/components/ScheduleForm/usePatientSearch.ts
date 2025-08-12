import { useState, useEffect } from "react";
import type { PatientSearchResult } from "./types";
import { API_BASE_URL } from "../../api/apiBase";

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
      return () => {
        controller.abort();
        if (timer) clearTimeout(timer);
      };
    }

    setLoadingPatients(true);
    setShowPatientDropdown(true);

    timer = setTimeout(async () => {
      try {
        const url = new URL(API_PATIENTS);
        url.searchParams.set("clinicId", String(clinicId));
        // compatibilidade com o backend: envie os três nomes de parâmetro
        url.searchParams.set("search", q);
        url.searchParams.set("q", q);
        url.searchParams.set("name", q);

        const res = await fetch(url.toString(), { signal: controller.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = (await res.json()) as unknown;
        setPatientOptions(Array.isArray(data) ? data : []);
      } catch (err: any) {
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

  return { patientOptions, loadingPatients, showPatientDropdown, setShowPatientDropdown };
}