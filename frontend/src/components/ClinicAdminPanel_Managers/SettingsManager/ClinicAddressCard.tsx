import React, { useState, useEffect, ChangeEvent } from "react";
import { Input } from "../../ui/input";
import { Button } from "../../ui/button";
import { MapPin } from "lucide-react";
import GoogleMapLocationSelector from "./GoogleMapLocationSelector";
import { ClinicInfoData } from "../types";
import { fetchClinicSettings, updateClinicAddress, updateClinicMapLocation } from "../../../api";

interface ClinicAddressCardProps {
  clinicId: string;
}

function parseLatLng(val: unknown): number | null {
  if (val === null || val === undefined) return null;
  const num = typeof val === "string" ? Number(val) : val;
  return typeof num === "number" && !isNaN(num) ? num : null;
}

const defaultCenter = { lat: -23.55052, lng: -46.633308 };

// Aceita snake_case e camelCase do backend, mas sem erro de tipagem
function getMarkerLatLng(info: ClinicInfoData | null): { lat: number; lng: number } | null {
  if (!info) return null;
  // Usa "as any" para evitar erro de tipagem se vier camelCase
  const latMap = parseLatLng((info as any).latitude_map ?? (info as any).latitudeMap);
  const lngMap = parseLatLng((info as any).longitude_map ?? (info as any).longitudeMap);
  if (latMap !== null && lngMap !== null) return { lat: latMap, lng: lngMap };
  const latAddr = parseLatLng((info as any).latitude_address ?? (info as any).latitudeAddress);
  const lngAddr = parseLatLng((info as any).longitude_address ?? (info as any).longitudeAddress);
  if (latAddr !== null && lngAddr !== null) return { lat: latAddr, lng: lngAddr };
  return null;
}

const ClinicAddressCard: React.FC<ClinicAddressCardProps> = ({ clinicId }) => {
  const [clinicInfo, setClinicInfo] = useState<ClinicInfoData | null>(null);
  const [form, setForm] = useState({
    street: "",
    number: "",
    neighborhood: "",
    city: "",
    state: "",
    cep: "",
  });

  // O valor do marcador no mapa é gerenciado separadamente e só é atualizado
  // ao carregar a tela ou ao salvar o endereço/mapa.
  const [mapLatLng, setMapLatLng] = useState<{ lat: number; lng: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingAddress, setSavingAddress] = useState(false);
  const [savingMap, setSavingMap] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!clinicId) return;
    setLoading(true);
    fetchClinicSettings(clinicId)
      .then((data: any) => {
        const info = data.info ?? data;
        setClinicInfo(info);
        setForm({
          street: info.street ?? "",
          number: info.number ?? "",
          neighborhood: info.neighborhood ?? "",
          city: info.city ?? "",
          state: info.state ?? "",
          cep: info.cep ?? "",
        });
        // Só atualiza o marcador ao carregar a tela!
        setMapLatLng(getMarkerLatLng(info));
      })
      .catch(() => setErrorMessage("Erro ao carregar dados do endereço."))
      .finally(() => setLoading(false));
  }, [clinicId]);

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setSuccessMessage(null);
    setErrorMessage(null);
  };

  const handleSaveAddress = async () => {
    setSavingAddress(true);
    setSuccessMessage(null);
    setErrorMessage(null);
    try {
      await updateClinicAddress(clinicId, { ...form });
      const updatedRaw = await fetchClinicSettings(clinicId);
      const updated = updatedRaw.info ?? updatedRaw;
      setClinicInfo(updated);
      setForm({
        street: updated.street ?? "",
        number: updated.number ?? "",
        neighborhood: updated.neighborhood ?? "",
        city: updated.city ?? "",
        state: updated.state ?? "",
        cep: updated.cep ?? "",
      });
      // Só atualiza o marcador após salvar o endereço!
      setMapLatLng(getMarkerLatLng(updated));
      setSuccessMessage("Endereço salvo com sucesso! O marcador do mapa foi atualizado.");
    } catch {
      setErrorMessage("Erro ao salvar endereço.");
    }
    setSavingAddress(false);
  };

  const handleSaveMapPosition = async () => {
    setSavingMap(true);
    setSuccessMessage(null);
    setErrorMessage(null);
    try {
      if (mapLatLng) {
        await updateClinicMapLocation(clinicId, mapLatLng);
        const updatedRaw = await fetchClinicSettings(clinicId);
        const updated = updatedRaw.info ?? updatedRaw;
        setClinicInfo(updated);
        // Só atualiza o marcador após salvar o mapa!
        setMapLatLng(getMarkerLatLng(updated));
        setSuccessMessage("Localização no mapa salva com sucesso!");
      }
    } catch {
      setErrorMessage("Erro ao salvar localização no mapa.");
    }
    setSavingMap(false);
  };

  // Apenas altera o estado do marcador. Não sobrescreve pelo endereço!
  const handleMarkerChange = (latLng: { lat: number; lng: number } | null) => {
    if (
      latLng &&
      parseLatLng(latLng.lat) !== null &&
      parseLatLng(latLng.lng) !== null
    ) {
      setMapLatLng({ lat: Number(latLng.lat), lng: Number(latLng.lng) });
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-md border border-gray-100 p-8">
        <h2 className="text-xl font-bold mb-6 border-b pb-3 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-[#e11d48]" /> Endereço da Clínica
        </h2>
        <div>Carregando...</div>
      </div>
    );
  }

  // Usa sempre o estado local para o marcador!
  const markerLatLng = mapLatLng ?? defaultCenter;

  // LOG DE DEPURAÇÃO
  console.log("DEBUG markerLatLng:", markerLatLng, "clinicInfo:", clinicInfo);

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-100 p-8">
      <h2 className="text-xl font-bold mb-6 border-b pb-3 flex items-center gap-2">
        <MapPin className="w-5 h-5 text-[#e11d48]" /> Endereço da Clínica
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
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1.5">CEP</label>
          <Input
            type="text"
            value={form.cep}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              handleChange("cep", e.target.value)
            }
            placeholder="CEP"
            maxLength={9}
            autoComplete="postal-code"
          />
        </div>
        <div className="md:col-span-7">
          <label className="block text-sm font-medium mb-1.5">Rua</label>
          <Input
            type="text"
            value={form.street}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              handleChange("street", e.target.value)
            }
            placeholder="Rua"
            autoComplete="address-line1"
          />
        </div>
        <div className="md:col-span-3">
          <label className="block text-sm font-medium mb-1.5">Número</label>
          <Input
            type="text"
            value={form.number}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              handleChange("number", e.target.value)
            }
            placeholder="Número"
            autoComplete="address-line2"
          />
        </div>
        <div className="md:col-span-5">
          <label className="block text-sm font-medium mb-1.5">Cidade</label>
          <Input
            type="text"
            value={form.city}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              handleChange("city", e.target.value)
            }
            placeholder="Cidade"
            autoComplete="address-level2"
          />
        </div>
        <div className="md:col-span-4">
          <label className="block text-sm font-medium mb-1.5">Bairro</label>
          <Input
            type="text"
            value={form.neighborhood}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              handleChange("neighborhood", e.target.value)
            }
            placeholder="Bairro"
            autoComplete="address-level3"
          />
        </div>
        <div className="md:col-span-1">
          <label className="block text-sm font-medium mb-1.5">UF</label>
          <Input
            type="text"
            value={form.state}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              handleChange("state", e.target.value)
            }
            placeholder="UF"
            maxLength={2}
            autoComplete="address-level1"
          />
        </div>
        <div className="md:col-span-2 flex items-end">
          <Button
            onClick={handleSaveAddress}
            disabled={savingAddress || loading}
            className="w-full bg-[#e11d48] text-white hover:bg-[#f43f5e] flex items-center px-4 py-2 rounded-lg text-sm font-medium"
          >
            {savingAddress ? "Salvando..." : "Salvar Endereço"}
          </Button>
        </div>
      </div>
      {(form.street && form.number && form.city && form.state) && (
        <div className="my-8">
          <label className="block text-sm font-medium mb-1.5">
            Localização no mapa <span className="text-xs text-gray-400">(ajuste se necessário)</span>
          </label>
          <GoogleMapLocationSelector
            value={markerLatLng}
            onChange={handleMarkerChange}
          />
          <p className="text-xs text-gray-400 mt-2">
            O sistema sugere a localização automaticamente, mas você pode arrastar o marcador para corrigir a posição da clínica, se necessário.<br />
            O marcador ficará sempre na posição do último salvamento (endereço ou mapa).
          </p>
        </div>
      )}
      <div className="flex flex-row gap-3 justify-end mt-6">
        <Button
          onClick={handleSaveMapPosition}
          disabled={savingMap || loading || !mapLatLng}
          className="bg-[#2563eb] text-white hover:bg-[#3b82f6] flex items-center px-4 py-2 rounded-lg text-sm font-medium"
        >
          {savingMap ? "Salvando..." : "Salvar Posição no Mapa"}
        </Button>
      </div>
    </div>
  );
};

export default ClinicAddressCard;