import React, { useState, useEffect, ChangeEvent } from "react";
import { Input } from "../../ui/input";
import { Button } from "../../ui/button";
import { Globe, Phone, Mail } from "lucide-react";
import { ClinicInfoData } from "../types";
import { fetchClinicSettings, updateClinicBasicInfo } from "../../../api";

interface ClinicBasicInfoCardProps {
  clinicId: string;
}

const ClinicBasicInfoCard: React.FC<ClinicBasicInfoCardProps> = ({ clinicId }) => {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    website: "",
    description: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!clinicId) return;
    setLoading(true);
    fetchClinicSettings(clinicId)
      .then((data: ClinicInfoData) => {
        setForm({
          name: data.name ?? "",
          phone: data.phone ?? "",
          email: data.email ?? "",
          website: data.website ?? "",
          description: data.description ?? "",
        });
      })
      .catch(() => setErrorMessage("Erro ao carregar informações da clínica."))
      .finally(() => setLoading(false));
  }, [clinicId]);

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setSuccessMessage(null);
    setErrorMessage(null);
  };

  const handleSave = async () => {
    setSaving(true);
    setSuccessMessage(null);
    setErrorMessage(null);
    try {
      await updateClinicBasicInfo(clinicId, form);
      setSuccessMessage("Informações básicas salvas com sucesso!");
    } catch (err) {
      setErrorMessage("Erro ao salvar informações básicas.");
    }
    setSaving(false);
  };

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-100 p-8">
      <h2 className="text-xl font-bold mb-6 border-b pb-3">Informações da Clínica</h2>
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-1.5">
            <span className="flex items-center gap-2"><Globe className="w-4 h-4" />Nome da Clínica</span>
          </label>
          <Input type="text" value={form.name} onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange("name", e.target.value)} placeholder="Ex: Clínica Sorriso Feliz" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">
            <span className="flex items-center gap-2"><Phone className="w-4 h-4" />Telefone Principal</span>
          </label>
          <Input type="tel" value={form.phone} onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange("phone", e.target.value)} placeholder="(XX) XXXXX-XXXX" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">
            <span className="flex items-center gap-2"><Mail className="w-4 h-4" />Email de Contato</span>
          </label>
          <Input type="email" value={form.email} onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange("email", e.target.value)} placeholder="contato@suaclinica.com" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">
            <span className="flex items-center gap-2"><Globe className="w-4 h-4" />Website <span className="text-xs text-gray-400">(Opcional)</span></span>
          </label>
          <Input type="text" value={form.website} onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange("website", e.target.value)} placeholder="https://www.suaclinica.com" />
        </div>
      </div>
      <div className="mt-6">
        <label className="block text-sm font-medium mb-1.5">Descrição da Clínica</label>
        <textarea rows={4} value={form.description} onChange={(e) => handleChange("description", e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-1" placeholder="Descreva brevemente sua clínica, especialidades, etc." />
      </div>
      <div className="flex justify-end mt-6">
        <Button onClick={handleSave} disabled={saving || loading} className="bg-[#e11d48] text-white hover:bg-[#f43f5e] flex items-center px-4 py-2 rounded-lg text-sm font-medium">
          {saving ? "Salvando..." : "Salvar Informações Básicas"}
        </Button>
      </div>
    </div>
  );
};

export default ClinicBasicInfoCard;