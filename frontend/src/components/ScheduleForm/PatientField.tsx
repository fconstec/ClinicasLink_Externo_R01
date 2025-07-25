import React from "react";
import type { PatientSearchResult } from "./types";

interface PatientFieldProps {
  search: string;
  setSearch: (s: string) => void;
  patientName: string;
  setPatientName: (s: string) => void;
  patientId?: number;
  setPatientId: (id?: number) => void;
  setPatientPhone: (s: string) => void;
  isNewPatient: boolean;
  setIsNewPatient: (b: boolean) => void;
  patientOptions: PatientSearchResult[];
  loadingPatients: boolean;
  showPatientDropdown: boolean;
  setShowPatientDropdown: (show: boolean) => void;
}

export default function PatientField({
  search,
  setSearch,
  patientName,
  setPatientName,
  patientId,
  setPatientId,
  setPatientPhone,
  isNewPatient,
  setIsNewPatient,
  patientOptions,
  loadingPatients,
  showPatientDropdown,
  setShowPatientDropdown,
}: PatientFieldProps) {
  function handlePatientSelect(p: PatientSearchResult) {
    setPatientName(p.name);
    setPatientPhone(p.phone || "");
    setPatientId(p.id);
    setSearch(p.name);
    setIsNewPatient(false);
    setShowPatientDropdown(false);
  }

  function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setSearch(val);
    setPatientName(val);
    if (patientId && val !== patientName) {
      setPatientId(undefined);
      setIsNewPatient(true);
    }
    if (val.length >= 2) {
      setShowPatientDropdown(true);
    } else {
      setShowPatientDropdown(false);
    }
  }

  return (
    <div>
      <label className="block text-xs text-[#344055] font-medium mb-1">Paciente*</label>
      <div className="relative">
        <input
          value={search}
          onChange={handleSearchChange}
          onFocus={() =>
            search.length >= 2 && !patientId && setShowPatientDropdown(true)
          }
          className="border border-[#e5e8ee] rounded-xl px-3 py-1 text-sm w-full"
          placeholder="Digite para buscar..."
          required
        />
        {showPatientDropdown && (
          <ul className="absolute z-10 bg-white border w-full max-h-40 overflow-y-auto rounded-xl shadow">
            {loadingPatients ? (
              <li className="p-2 text-gray-500 text-xs">Buscando...</li>
            ) : patientOptions.length ? (
              patientOptions.map((p) => (
                <li
                  key={p.id}
                  className="p-2 hover:bg-[#f7f9fb] cursor-pointer text-xs"
                  onClick={() => handlePatientSelect(p)}
                >
                  {p.name} {p.phone && `(${p.phone})`}
                </li>
              ))
            ) : (
              !loadingPatients &&
              search.length >= 2 &&
              isNewPatient && (
                <li className="p-2 text-gray-400 text-xs">
                  "{search}" não encontrado. Cadastre o paciente primeiro na aba <b>Pacientes</b>.
                </li>
              )
            )}
          </ul>
        )}
      </div>
    </div>
  );
}