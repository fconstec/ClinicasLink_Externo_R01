import React from "react";
import type { Service } from "@/components/ClinicAdminPanel_Managers/types";

interface ServiceFieldProps {
  serviceId: number | "";
  setServiceId: (id: number | "") => void;
  services: Service[];
}

export default function ServiceField({
  serviceId,
  setServiceId,
  services,
}: ServiceFieldProps) {
  return (
    <div className="flex-1">
      <label className="block text-xs text-[#344055] font-medium mb-1">
        Serviço*
      </label>
      <select
        value={serviceId}
        onChange={(e) => {
          const val = e.target.value;
            // Mantém "" se nada selecionado; caso contrário converte para number
          setServiceId(val === "" ? "" : Number(val));
        }}
        className="border border-[#e5e8ee] rounded-xl px-3 py-1 text-sm w-full"
        required
      >
        <option value="">Selecione</option>
        {services.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name} {("value" in s && s.value !== undefined) ? `(R$ ${s.value})` : ""}
          </option>
        ))}
      </select>
    </div>
  );
}