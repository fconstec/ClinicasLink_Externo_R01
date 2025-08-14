// Este é o hook canônico de agendamentos. Não duplicar em outras pastas.
import { useCallback, useEffect, useState } from "react";
import type { Appointment } from "@/components/ClinicAdminPanel_Managers/types";
import {
  fetchAppointments as apiFetchAppointments,
  createAppointment as apiCreateAppointment,
  updateAppointment as apiUpdateAppointment,
  deleteAppointment as apiDeleteAppointment,
  CreateAppointmentPayload,
  UpdateAppointmentPayload,
} from "@/api/appointmentsApi";

interface UseAppointmentsOptions {
  autoLoad?: boolean;
  clinicId?: string;
}

export interface UseAppointmentsResult {
  appointments: Appointment[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  /**
   * Alias de refresh para manter compatibilidade com código legado que chama fetchAppointments()
   */
  fetchAppointments: () => Promise<void>;
  create: (p: CreateAppointmentPayload) => Promise<Appointment>;
  update: (id: number | string, p: UpdateAppointmentPayload) => Promise<Appointment>;
  remove: (id: number | string) => Promise<void>;
}

/**
 * Obtém clinicId explícito ou do localStorage; lança erro se não existir.
 */
function getClinicIdOrThrow(explicit?: string): string {
  if (explicit && explicit.trim().length > 0) return explicit;
  const fromStorage = localStorage.getItem("clinic_id");
  if (!fromStorage) throw new Error("clinic_id não encontrado no localStorage.");
  return fromStorage;
}

export function useAppointments(options: UseAppointmentsOptions = {}): UseAppointmentsResult {
  const { autoLoad = true, clinicId } = options;

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState<boolean>(!!autoLoad);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // apiFetchAppointments aceita clinicId opcional
      const data = await apiFetchAppointments(clinicId);
      setAppointments(data);
    } catch (e: any) {
      setError(e?.message || "Erro ao carregar agendamentos.");
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  }, [clinicId]);

  useEffect(() => {
    if (autoLoad) {
      void load();
    }
  }, [autoLoad, load]);

  const create = useCallback(
    async (p: CreateAppointmentPayload) => {
      const cid = getClinicIdOrThrow(clinicId);
      const created = await apiCreateAppointment(p, cid);
      setAppointments(prev => [created, ...prev]);
      return created;
    },
    [clinicId]
  );

  const update = useCallback(
    async (id: number | string, p: UpdateAppointmentPayload) => {
      const cid = getClinicIdOrThrow(clinicId);
      const numericId = typeof id === "string" ? Number(id) : id;
      if (Number.isNaN(numericId)) throw new Error("ID inválido para update.");
      const updated = await apiUpdateAppointment(numericId, cid, p);
      setAppointments(prev =>
        prev.map(a => (a.id === numericId ? updated : a))
      );
      return updated;
    },
    [clinicId]
  );

  const remove = useCallback(
    async (id: number | string) => {
      const cid = getClinicIdOrThrow(clinicId);
      const numericId = typeof id === "string" ? Number(id) : id;
      if (Number.isNaN(numericId)) throw new Error("ID inválido para delete.");
      await apiDeleteAppointment(numericId, cid);
      setAppointments(prev => prev.filter(a => a.id !== numericId));
    },
    [clinicId]
  );

  return {
    appointments,
    loading,
    error,
    refresh: load,
    fetchAppointments: load, // alias de compatibilidade
    create,
    update,
    remove,
  };
}