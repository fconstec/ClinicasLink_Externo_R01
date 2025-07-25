import React from "react";

interface Professional {
  id: number;
  name: string;
}

interface ProfessionalFieldProps {
  professionalId: number | "";
  setProfessionalId: (id: number) => void;
  professionals: Professional[];
}

export default function ProfessionalField({
  professionalId,
  setProfessionalId,
  professionals,
}: ProfessionalFieldProps) {
  return (
    <div className="flex-1">
      <label className="block text-xs text-[#344055] font-medium mb-1">Profissional*</label>
      <select
        value={professionalId}
        onChange={(e) => setProfessionalId(Number(e.target.value))}
        className="border border-[#e5e8ee] rounded-xl px-3 py-1 text-sm w-full"
        required
      >
        <option value="">Selecione</option>
        {professionals.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>
    </div>
  );
}