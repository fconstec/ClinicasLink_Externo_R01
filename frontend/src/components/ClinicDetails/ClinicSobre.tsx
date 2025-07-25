import React from 'react';
import { ClinicHorario } from './ClinicHorario';

export function ClinicSobre({ description, specialties, openingHours }: {
  description?: string;
  specialties?: string[];
  openingHours?: any;
}) {
  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Sobre a Clínica</h2>
      <p className="text-gray-600 mb-6 break-words max-w-3xl">{description || "Sem descrição informada."}</p>
      {specialties && specialties.length > 0 && (
        <>
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Especialidades</h3>
          <div className="flex flex-wrap gap-2 mb-6">
            {specialties.map((specialty, index) => (
              <span 
                key={index}
                className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm"
              >
                {specialty}
              </span>
            ))}
          </div>
        </>
      )}
      <h3 className="text-lg font-semibold text-gray-800 mb-3">Horário de Funcionamento</h3>
      <ClinicHorario openingHours={openingHours} />
    </div>
  );
}