import React, { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { X, Trash2 } from "lucide-react";
import { apiUrl, fileUrl } from "../../../api/apiBase"; // <<< uso centralizado da base

export interface PatientMainData {
  name: string;
  birthDate: string;
  phone: string;
  email: string;
  address: string;
  photo?: string | null;
}

const initialState: PatientMainData = {
  name: "",
  birthDate: "",
  phone: "",
  email: "",
  address: "",
  photo: undefined,
};

/**
 * Converte o valor salvo (nome, caminho relativo ou URL absoluta) para URL de exibição.
 * Regras:
 * - URL http/https -> retorna como está (fileUrl já preservaria, mas mantemos claro)
 * - /uploads/...   -> prefixa domínio (fileUrl)
 * - uploads/...    -> garante barra inicial
 * - nome simples   -> assume pasta /uploads/
 */
function getPhotoDisplayUrl(raw?: string | null): string | null {
  if (!raw) return null;
  const v = raw.trim();
  if (!v) return null;
  if (/^https?:\/\//i.test(v) || /^data:/i.test(v)) return v;

  if (v.startsWith("/uploads/")) return fileUrl(v);              // já começa com /uploads
  if (v.startsWith("uploads/")) return fileUrl("/" + v);         // adiciona barra
  if (v.startsWith("/")) return fileUrl(v);                      // qualquer path absoluto
  return fileUrl("/uploads/" + v);                               // nome simples
}

const PatientMainDataForm: React.FC<{
  patient?: Partial<PatientMainData>;
  onSave: (data: PatientMainData) => void;
  onCancel?: () => void;
}> = ({ patient, onSave, onCancel }) => {
  const [form, setForm] = useState<PatientMainData>({
    ...initialState,
    ...patient,
  });

  const [facePreview, setFacePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Atualiza form e preview quando paciente muda
  useEffect(() => {
    setForm({
      ...initialState,
      ...patient,
    });
    setFacePreview(getPhotoDisplayUrl(patient?.photo ?? null));
  }, [patient]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleFacePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("photo", file);

      const resp = await fetch(apiUrl("patients/upload-photo"), {
        method: "POST",
        body: formData,
      });

      if (!resp.ok) throw new Error(`Falha no upload: ${resp.status}`);
      const data = await resp.json();
      // Supondo que backend retorna { url: "/uploads/..." } ou nome de arquivo
      const storedValue = data.url || data.photoUrl || data.photo || "";
      setForm((prev) => ({
        ...prev,
        photo: storedValue,
      }));
      setFacePreview(getPhotoDisplayUrl(storedValue));
    } catch (err) {
      console.error("Erro ao fazer upload da foto do paciente:", err);
      alert("Erro ao fazer upload da foto.");
    } finally {
      setUploading(false);
    }
  }

  function handleRemovePhoto() {
    setForm((prev) => ({ ...prev, photo: undefined }));
    setFacePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function validateForm(f: PatientMainData) {
    if (!f.name || f.name.trim().length < 2) return "Nome deve ter pelo menos 2 letras.";
    if (!f.birthDate) return "Informe a data de nascimento.";
    if (!f.phone || f.phone.trim().length < 8) return "Informe um telefone válido.";
    if (!f.email || !/\S+@\S+\.\S+/.test(f.email)) return "Informe um e-mail válido.";
    if (!f.address || f.address.trim().length < 3) return "Preencha o endereço.";
    return null;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const payload: PatientMainData = {
      ...form,
      photo: form.photo && form.photo.trim() ? form.photo : undefined,
    };
    const msg = validateForm(payload);
    if (msg) {
      setError(msg);
      return;
    }
    onSave(payload);
  }

  function handlePhotoClick() {
    if (!uploading && fileInputRef.current) {
      fileInputRef.current.click();
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/20"
      style={{ overflowY: "auto", padding: "32px 0" }}
    >
      <form
        onSubmit={handleSubmit}
        className="relative flex flex-col w-full max-w-[350px] rounded-2xl bg-white shadow-2xl px-7 py-7 max-h-[calc(100vh-48px)] overflow-y-auto"
        style={{ fontFamily: "Inter, 'Segoe UI', Arial, sans-serif" }}
      >
        {onCancel && (
          <button
            type="button"
            className="absolute top-4 right-6 z-20 text-[#7c869b] hover:text-[#e11d48] text-2xl font-bold focus:outline-none"
            style={{ lineHeight: 1 }}
            onClick={onCancel}
            tabIndex={-1}
            aria-label="Fechar"
          >
            <X size={28} />
          </button>
        )}

        <div className="flex flex-row items-center justify-center gap-3 mb-6">
          <div
            className="relative cursor-pointer group transition"
            style={{ minWidth: "88px" }}
            onClick={handlePhotoClick}
            tabIndex={0}
            aria-label="Selecionar foto do paciente"
            title="Clique para alterar a foto"
          >
            <div className="w-24 h-24 rounded-full border-[3px] border-[#e11d48] shadow-lg overflow-hidden bg-gray-200 flex items-center justify-center transition group-hover:ring-2 group-hover:ring-[#e11d48]">
              {facePreview ? (
                <img
                  src={facePreview}
                  alt="Prévia da foto do paciente"
                  className="object-cover w-full h-full"
                  draggable={false}
                />
              ) : (
                <span className="text-gray-300 text-3xl">+</span>
              )}
              {uploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/70">
                  <span className="text-base text-[#e11d48] font-bold animate-pulse">
                    Enviando...
                  </span>
                </div>
              )}
            </div>
            <div className="absolute inset-0 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 pointer-events-none transition">
              <span
                className="text-sm text-white font-bold text-center select-none"
                style={{
                  textShadow:
                    "0 2px 8px rgba(0,0,0,0.85), 0 1px 2px rgba(0,0,0,0.6)",
                }}
              >
                Trocar imagem
              </span>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleFacePhoto}
              disabled={uploading}
              tabIndex={-1}
            />
            {facePreview && (
              <button
                type="button"
                className="absolute bottom-[-8px] right-[-8px] bg-white border border-gray-200 rounded-full p-1 shadow hover:bg-red-50 transition z-10"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemovePhoto();
                }}
                title="Remover foto"
                aria-label="Remover foto"
                tabIndex={0}
              >
                <Trash2 size={16} className="text-[#e11d48]" />
              </button>
            )}
          </div>
          <h2 className="text-[18px] font-bold text-[#e11d48] text-center ml-2">
            Dados do Paciente
          </h2>
        </div>

        <div className="flex flex-col gap-3 w-full">
          {error && (
            <div className="bg-red-100 text-red-700 rounded px-3 py-2 text-xs font-medium text-center mb-2">
              {error}
            </div>
          )}
          <div>
            <label className="block text-xs text-[#344055] font-medium mb-1">
              Nome
            </label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              className="border border-[#e5e8ee] rounded-xl px-3 py-1 text-sm w-full"
              placeholder="Nome completo"
            />
          </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block text-xs text-[#344055] font-medium mb-1">
                  Data de Nascimento
                </label>
                <input
                  type="date"
                  name="birthDate"
                  value={form.birthDate}
                  onChange={handleChange}
                  className="border border-[#e5e8ee] rounded-xl px-3 py-1 text-sm w-full"
                  max={new Date().toISOString().slice(0, 10)}
                  required
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs text-[#344055] font-medium mb-1">
                  Telefone
                </label>
                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  className="border border-[#e5e8ee] rounded-xl px-3 py-1 text-sm w-full"
                  placeholder="Telefone"
                  required
                />
              </div>
            </div>
          <div>
            <label className="block text-xs text-[#344055] font-medium mb-1">
              E-mail
            </label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              className="border border-[#e5e8ee] rounded-xl px-3 py-1 text-sm w-full"
              placeholder="E-mail"
              autoComplete="off"
              required
            />
          </div>
          <div>
            <label className="block text-xs text-[#344055] font-medium mb-1">
              Endereço
            </label>
            <input
              name="address"
              value={form.address}
              onChange={handleChange}
              className="border border-[#e5e8ee] rounded-xl px-3 py-1 text-sm w-full"
              placeholder="Endereço do paciente"
              required
            />
          </div>
        </div>

        <div className="flex gap-2 mt-6 justify-end">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              className="border border-[#bfc5d6] text-[#344055] bg-white hover:bg-[#f7f9fb] rounded-xl px-5 py-2 text-sm font-bold"
              onClick={onCancel}
            >
              Cancelar
            </Button>
          )}
          <Button
            type="submit"
            className="bg-[#e11d48] hover:bg-[#f43f5e] text-white rounded-xl px-6 py-2 text-sm font-bold shadow transition"
            disabled={uploading}
          >
            Salvar
          </Button>
        </div>
      </form>
    </div>
  );
};

export default PatientMainDataForm;