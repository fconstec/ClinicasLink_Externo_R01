import { useState, useEffect } from "react";
import type { PatientSearchResult } from "./types";

const API_BASE_URL = "http://localhost:3001";
const API_PATIENTS = `${API_BASE_URL}/api/patients`;

export function usePatientSearch(search: string, clinicId: number, patientId?: number) {
  const [patientOptions, setPatientOptions] = useState<PatientSearchResult[]>([]);
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [showPatientDropdown, setShowPatientDropdown] = useState(false);

  useEffect(() => {
    if (search.length < 2 || patientId) {
      setPatientOptions([]);
      setShowPatientDropdown(false);
      return;
    }
    setLoadingPatients(true);
    setShowPatientDropdown(true);

    const timer = setTimeout(() => {
      fetch(
        `${API_PATIENTS}?clinicId=${clinicId}&search=${encodeURIComponent(
          search
        )}`
      )
        .then((res) => {
          if (!res.ok) throw new Error("Erro ao buscar pacientes");
          return res.json();
        })
        .then((data: PatientSearchResult[]) =>
          setPatientOptions(Array.isArray(data) ? data : [])
        )
        .catch(() => setPatientOptions([]))
        .finally(() => setLoadingPatients(false));
    }, 300);

    return () => clearTimeout(timer);
  }, [search, patientId, clinicId]);

  return { patientOptions, loadingPatients, showPatientDropdown, setShowPatientDropdown };
}