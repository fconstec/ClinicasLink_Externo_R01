import React from "react";
import type { Service } from "./types";

interface ServiceFieldProps {
  serviceId: number | "";
  setServiceId: (id: number) => void;
  services: Service[];
}

export default function ServiceField({
  serviceId,
  setServiceId,
  services,
}: ServiceFieldProps) {
  return (
    <div className="flex-1">
      <label className="block text-xs text-[#344055] font-medium mb-1">Serviço*</label>
      <select
        value={serviceId}
        onChange={(e) => setServiceId(Number(e.target.value))}
        className="border border-[#e5e8ee] rounded-xl px-3 py-1 text-sm w-full"
        required
      >
        <option value="">Selecione</option>
        {services.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name} (R$ {s.value})
          </option>
        ))}
      </select>
    </div>
  );
}