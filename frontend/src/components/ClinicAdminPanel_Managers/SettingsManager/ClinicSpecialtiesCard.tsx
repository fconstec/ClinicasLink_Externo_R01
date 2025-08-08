import React, { useState, useEffect } from "react";
import SpecialtiesSelector from "./SpecialtiesSelector";
import { ClinicInfoData } from "../types";
import { fetchClinicSettings, updateClinicSpecialties } from "../../../api";
import { FaUserMd } from "react-icons/fa";

interface ClinicSpecialtiesCardProps {
  clinicId: string;
}

const ClinicSpecialtiesCard: React.FC<ClinicSpecialtiesCardProps> = ({
  clinicId,
}) => {
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [customSpecialties, setCustomSpecialties] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!clinicId) return;
    setLoading(true);
    fetchClinicSettings(clinicId)
      .then((data: ClinicInfoData) => {
        setSpecialties(data.specialties ?? []);
        setCustomSpecialties(data.customSpecialties ?? []);
      })
      .catch(() => setErrorMessage("Erro ao carregar especialidades."))
      .finally(() => setLoading(false));
  }, [clinicId]);

  const handleSelectorChange = (newSpecialties: string[], newCustomSpecialties: string[]) => {
    setSpecialties(newSpecialties);
    setCustomSpecialties(newCustomSpecialties);
    setSuccessMessage(null);
    setErrorMessage(null);
  };

  const handleSave = async () => {
    setSaving(true);
    setSuccessMessage(null);
    setErrorMessage(null);
    try {
      await updateClinicSpecialties(clinicId, {
        specialties,
        customSpecialties,
      });
      setSuccessMessage("Especialidades salvas com sucesso!");
    } catch (err) {
      setErrorMessage("Erro ao salvar especialidades.");
    }
    setSaving(false);
  };

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-100 p-8">
      <h2 className="text-xl font-bold mb-6 border-b pb-3 flex items-center gap-2">
        {FaUserMd && <FaUserMd className="text-[#e11d48]" />} Especialidades da Clínica
      </h2>
      {successMessage && (
        <div className="p-2 mb-3 text-green-800 bg-green-50 border border-green-200 rounded">
          {successMessage}
        </div>
      )}
      {errorMessage && (
        <div className="p-2 mb-3 text-red-800 bg-red-50 border border-red-200 rounded">
          {errorMessage}
        </div>
      )}
      <p className="text-gray-500 text-sm mb-4">
        Selecione ou adicione especialidades oferecidas pela clínica. Elas serão usadas para busca na plataforma.
      </p>
      <SpecialtiesSelector
        selectedSpecialties={specialties}
        customSpecialties={customSpecialties}
        onChange={handleSelectorChange}
      />
      <div className="flex justify-end mt-6">
        <button
          type="button"
          onClick={handleSave}
          className="bg-[#e11d48] text-white hover:bg-[#f43f5e] flex items-center px-4 py-2 rounded-lg text-sm font-medium"
          disabled={saving || loading}
        >
          {saving || loading ? "Salvando..." : "Salvar Especialidades"}
        </button>
      </div>
    </div>
  );
};

export default ClinicSpecialtiesCard;