import { useState, useEffect } from "react";
import type { PatientSearchResult } from "./types";
import { API_BASE_URL } from "@/api/apiBase";

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
    let timer: ReturnType<typeof setTimeout>;

    const q = (search || "").trim();

    if (q.length < 2 || patientId) {
      setPatientOptions([]);
      setShowPatientDropdown(false);
      return () => {
        controller.abort();
        clearTimeout(timer);
      };
    }

    setLoadingPatients(true);
    setShowPatientDropdown(true);

    timer = setTimeout(async () => {
      const buildUrl = (base: string) => {
        const url = new URL(base);
        url.searchParams.set("clinicId", String(clinicId));
        // múltiplos params por compatibilidade
        url.searchParams.set("search", q);
        url.searchParams.set("q", q);
        url.searchParams.set("name", q);
        return url.toString();
      };

      const primary = buildUrl(`${API_BASE_URL}/patients`);
      const fallback = buildUrl(`${API_BASE_URL}/api/patients`);

      let data: any[] = [];
      try {
        // 1ª tentativa (sem /api)
        let res = await fetch(primary, { signal: controller.signal });
        if (res.status === 404) {
          // tenta fallback com /api
          res = await fetch(fallback, { signal: controller.signal });
        }
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (Array.isArray(json)) data = json;
      } catch (e: any) {
        if (e?.name === "AbortError") return;
        data = [];
      } finally {
        setPatientOptions(data);
        setLoadingPatients(false);
      }
    }, 300);

    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [search, patientId, clinicId]);

  return {
    patientOptions,
    loadingPatients,
    showPatientDropdown,
    setShowPatientDropdown,
  };
}