import React, { useRef } from "react";
import { Trash2, Plus, ZoomIn } from "lucide-react";

export interface ProcedureDraft {
  id: number;
  date: string;
  description: string;
  professional: string;
  value: string;
  images: (File | { id: number; url: string; fileName?: string })[];
}

interface ProcedureRowProps {
  procedure: ProcedureDraft;
  onChange: (update: Partial<ProcedureDraft>) => void;
  onRemove: () => void;
  onAddImage: (file: File) => void;
  onRemoveImage: (img: any) => void;
  onViewImage: (imgIdx: number) => void;
}

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3001";

function getImageUrl(img: any) {
  if (typeof img === "string") {
    return img.startsWith("http") ? img : `${API_URL}${img}`;
  }
  if (img instanceof File) {
    return URL.createObjectURL(img);
  }
  if (img.url) {
    return img.url.startsWith("http") ? img.url : `${API_URL}${img.url}`;
  }
  return "";
}

const ProcedureRow: React.FC<ProcedureRowProps> = ({
  procedure,
  onChange,
  onRemove,
  onAddImage,
  onRemoveImage,
  onViewImage,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  function handleFieldChange(field: keyof ProcedureDraft, value: string) {
    onChange({ [field]: value });
  }

  const normalizedDate =
    !procedure.date || procedure.date === "null" ? "" : procedure.date;

  function handleImageInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      onAddImage(file);
    }
    e.target.value = "";
  }

  return (
    <div className="w-full border border-[#e5e8ee] rounded-xl p-3 bg-gray-50">
      <div className="grid grid-cols-[100px_120px_70px_40px] gap-2 items-center w-full mb-1">
        <div>
          <input
            type="date"
            value={normalizedDate}
            onChange={e => handleFieldChange("date", e.target.value)}
            className="border border-[#e5e8ee] rounded-xl px-2 py-1 text-xs bg-white w-full"
            max={new Date().toISOString().slice(0, 10)}
            placeholder="Data"
            aria-label="Data"
          />
        </div>
        <div>
          <input
            type="text"
            value={procedure.professional ?? ""}
            onChange={e => handleFieldChange("professional", e.target.value)}
            className="border border-[#e5e8ee] rounded-xl px-2 py-1 text-xs bg-white w-full"
            placeholder="Profissional"
            aria-label="Profissional"
          />
        </div>
        <div>
          <input
            type="text"
            value={procedure.value ?? ""}
            onChange={e => handleFieldChange("value", e.target.value)}
            className="border border-[#e5e8ee] rounded-xl px-2 py-1 text-xs bg-white w-full"
            placeholder="R$"
            aria-label="Valor"
          />
        </div>
        <div className="flex flex-row items-center justify-end">
          <button
            type="button"
            className="text-red-600 flex items-center justify-center p-1"
            onClick={onRemove}
            title="Remover"
            aria-label="Remover procedimento"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div>
        <textarea
          value={procedure.description ?? ""}
          onChange={e => handleFieldChange("description", e.target.value)}
          className="border border-[#e5e8ee] rounded-xl px-2 py-1 text-xs w-full resize-none focus:border-[#e11d48] bg-white"
          style={{ minHeight: 36, maxHeight: 120, overflowY: "auto" }}
          placeholder="Descreva o procedimento realizado"
          rows={2}
          aria-label="Procedimento realizado"
        />
      </div>
      {/* Galeria embutida */}
      <div className="flex gap-1 mt-2 flex-wrap">
        {(procedure.images || []).map((img: any, i: number) => (
          <div key={img.id || img.name || i} className="relative flex flex-col items-center group cursor-pointer">
            <img
              src={getImageUrl(img)}
              alt={img.fileName || img.name || ""}
              className="w-14 h-14 object-cover rounded-xl border border-[#e5e8ee] mb-1 shadow transition hover:scale-105"
              onClick={() => onViewImage(i)}
            />
            <button
              type="button"
              className="absolute -top-1.5 -right-1.5 bg-white rounded-full text-gray-400 opacity-0 group-hover:opacity-100 hover:text-[#e11d48] shadow p-0.5 transition"
              onClick={() => onRemoveImage(img)}
              aria-label="Remover"
            >
              <Trash2 className="h-3 w-3" />
            </button>
            <button
              type="button"
              className="absolute bottom-1 right-1 bg-white rounded-full opacity-80 group-hover:opacity-100 p-0.5 shadow"
              title="Ampliar"
              onClick={() => onViewImage(i)}
            >
              <ZoomIn className="w-3 h-3 text-[#e11d48]" />
            </button>
          </div>
        ))}
        <button
          type="button"
          className="flex items-center justify-center w-14 h-14 rounded-xl border-2 border-dashed border-[#c8d1e1] bg-[#f7f9fb] hover:bg-[#e5e8ee] text-[#e11d48] transition"
          onClick={() => fileInputRef.current?.click()}
          title="Adicionar imagem"
        >
          <Plus className="w-5 h-5" />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={handleImageInputChange}
        />
      </div>
    </div>
  );
};

export default ProcedureRow;