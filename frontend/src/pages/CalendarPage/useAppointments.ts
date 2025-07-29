import { useState, useCallback } from "react";
import type { Appointment } from "../../components/ClinicAdminPanel_Managers/types";
import { getClinicId } from "./scheduleHelpers";
import { API_BASE_URL } from "../../components/api/apiBase";

export function useAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    try {
      const clinicId = getClinicId();
      const url = `${API_BASE_URL}/appointments?clinicId=${clinicId}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(res.statusText);
      const raw = await res.json();
      if (Array.isArray(raw)) {
        const processed = raw
          .map((ap: any): Appointment | null => {
            const idNum = Number(ap.id);
            const profNum = Number(ap.professionalId ?? ap.professional_id ?? ap.professional);
            if (
              isNaN(idNum) ||
              !ap.date ||
              !ap.time ||
              isNaN(profNum)
            ) {
              return null;
            }
            return {
              id: idNum,
              patientId:
                ap.patientId != null
                  ? Number(ap.patientId)
                  : ap.patient_id != null
                  ? Number(ap.patient_id)
                  : undefined,
              patientName: String(ap.patientName || ap.patient_name || ""),
              patientPhone: ap.patientPhone || "",
              serviceId: Number(ap.serviceId ?? ap.service_id),
              service: ap.service || ap.service_name || "",
              service_name: ap.service_name || ap.service || "",
              professionalId: profNum,
              professional_name: ap.professional_name || "",
              date: String(ap.date).slice(0, 10),
              time: String(ap.time).slice(0, 5),
              endTime: ap.endTime ? String(ap.endTime).slice(0, 5) : undefined,
              status: ap.status || "pending",
            };
          })
          .filter((x): x is Appointment => x !== null && typeof x.id === "number" && x.id > 0);
        setAppointments(processed);
        // <-- Console para debug
        console.log("Appointments com endTime:", processed);
      } else {
        setAppointments([]);
      }
    } catch {
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return { appointments, setAppointments, loading, fetchAppointments };
}