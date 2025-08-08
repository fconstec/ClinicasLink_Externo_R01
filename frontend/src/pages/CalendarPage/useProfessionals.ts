//
import { useState, useCallback } from "react";
import type { Professional } from "../../components/ClinicAdminPanel_Managers/types";
import { API_BASE_URL } from "../../api/apiBase";

export function useProfessionals() {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchProfessionals = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/professionals`);
      if (!res.ok) throw new Error("Erro ao buscar profissionais");
      const data = await res.json();
      setProfessionals(Array.isArray(data)
        ? data.map((p: any) => ({ ...p, id: Number(p.id) }))
        : []);
    } catch {
      setProfessionals([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return { professionals, setProfessionals, loading, fetchProfessionals };
}