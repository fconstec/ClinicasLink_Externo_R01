import { useState, useCallback } from "react";
import type { Service } from "../../components/ClinicAdminPanel_Managers/types";
import { API_BASE_URL } from "../../components/api/apiBase";

export function useServices() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchServices = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/services`);
      if (!res.ok) throw new Error("Erro ao buscar serviços");
      const data = await res.json();
      setServices(
        Array.isArray(data)
          ? data.map((s: any) => ({
              ...s,
              id: Number(s.id),
              name: String(s.name),
              value: String(s.value ?? "0"),
            }))
          : []
      );
    } catch {
      setServices([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return { services, setServices, loading, fetchServices };
}