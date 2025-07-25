import React from "react";
import type { Appointment } from "../ClinicAdminPanel_Managers/types";

interface StatusFieldProps {
  status: Appointment["status"];
  setStatus: (status: Appointment["status"]) => void;
}

export default function StatusField({
  status,
  setStatus,
}: StatusFieldProps) {
  return (
    <div>
      <label className="block text-xs text-[#344055] font-medium mb-1">Status*</label>
      <select
        value={status}
        onChange={(e) =>
          setStatus(e.target.value as Appointment["status"])
        }
        className="border border-[#e5e8ee] rounded-xl px-3 py-1 text-sm w-full"
        required
      >
        <option value="pending">Pendente</option>
        <option value="confirmed">Confirmado</option>
        <option value="completed">Concluído</option>
        <option value="cancelled">Cancelado</option>
      </select>
    </div>
  );
}