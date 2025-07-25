import React from "react";
import ClinicCard from "../ClinicCard";
import { Clinic } from "./types";

interface Props {
  clinics: Clinic[];
  searchTerm: string;
  onClinicClick: (id: number) => void;
  loading?: boolean;
}

const SearchResults: React.FC<Props> = ({
  clinics,
  searchTerm,
  onClinicClick,
  loading = false,
}) => (
  <section className="py-8 bg-white">
    <div className="container mx-auto px-4">
      <h2 className="text-xl font-bold text-gray-900 mb-4">
        Resultados da busca
      </h2>
      {loading ? (
        <div className="text-gray-400">Buscando clínicas...</div>
      ) : clinics.length === 0 ? (
        <div className="text-gray-400">
          Nenhuma clínica encontrada
          {searchTerm ? <> para "{searchTerm}".</> : "."}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clinics.map((clinic) => (
            <ClinicCard key={clinic.id} clinic={clinic} onClick={onClinicClick} />
          ))}
        </div>
      )}
    </div>
  </section>
);

export default SearchResults;