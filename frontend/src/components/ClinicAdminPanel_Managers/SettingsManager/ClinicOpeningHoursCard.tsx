import React, { useState, useEffect } from "react";
import { Button } from "../../ui/button";
import { Clock } from "lucide-react";
import OpeningHoursSelector, { defaultOpeningHours, OpeningHours } from "./OpeningHoursSelector";
import { fetchClinicSettings, updateClinicOpeningHours } from "../../../api";
import { ClinicInfoData } from "../types";

interface ClinicOpeningHoursCardProps {
  clinicId: string;
}

const ClinicOpeningHoursCard: React.FC<ClinicOpeningHoursCardProps> = ({ clinicId }) => {
  const [hours, setHours] = useState<OpeningHours>(defaultOpeningHours);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!clinicId) return;
    setLoading(true);
    fetchClinicSettings(clinicId)
      .then((data: ClinicInfoData) => {
        let parsed: OpeningHours = defaultOpeningHours;
        if (typeof data.openingHours === "object" && data.openingHours !== null) {
          parsed = data.openingHours as OpeningHours;
        } else if (typeof data.openingHours === "string" && data.openingHours.trim() !== "") {
          try {
            parsed = JSON.parse(data.openingHours) as OpeningHours;
          } catch {
            parsed = defaultOpeningHours;
          }
        }
        setHours(parsed);
      })
      .catch(() => setErrorMessage("Erro ao carregar horários."))
      .finally(() => setLoading(false));
  }, [clinicId]);

  // Sumir mensagens após 2.5s
  useEffect(() => {
    if (successMessage || errorMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
        setErrorMessage(null);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [successMessage, errorMessage]);

  const handleSave = async () => {
    setSaving(true);
    setSuccessMessage(null);
    setErrorMessage(null);
    try {
      await updateClinicOpeningHours(clinicId, { openingHours: JSON.stringify(hours) });
      setSuccessMessage("Horários salvos com sucesso!");
    } catch (err) {
      setErrorMessage("Erro ao salvar horários.");
    }
    setSaving(false);
  };

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-100 p-8">
      <h2 className="text-xl font-bold mb-6 border-b pb-3 flex items-center gap-2">
        <Clock className="w-5 h-5 text-[#e11d48]" /> Horário de Funcionamento
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
      <OpeningHoursSelector
        value={hours}
        onChange={(v: OpeningHours) => setHours(v)}
      />
      <p className="text-xs text-gray-400 mt-2">
        Defina horários diferentes para cada dia. Marque "Fechado" se não abrir.
      </p>
      <div className="flex justify-end mt-6">
        <Button
          onClick={handleSave}
          disabled={saving || loading}
          className="bg-[#e11d48] text-white hover:bg-[#f43f5e] flex items-center px-4 py-2 rounded-lg text-sm font-medium"
        >
          {saving ? "Salvando..." : "Salvar Horários"}
        </Button>
      </div>
    </div>
  );
};

export default ClinicOpeningHoursCard;