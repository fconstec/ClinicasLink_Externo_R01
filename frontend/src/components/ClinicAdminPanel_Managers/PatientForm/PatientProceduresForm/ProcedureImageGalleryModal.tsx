// (Sem mudanças substantivas – incluído para completude)
import React, { useState, useEffect } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { fileUrl } from "../../../../api/apiBase";
import { ProcedureImage } from "../../../../types/procedureDraft";

function normalizeImageUrl(img: ProcedureImage): string {
  if (!img) return "";
  if (img instanceof File) return URL.createObjectURL(img);
  const raw = img.url.trim();
  if (!raw) return "";
  if (/^(blob:|data:)/i.test(raw)) return raw;
  if (/^https?:/i.test(raw)) return raw;
  if (raw.startsWith("/uploads/") || raw.startsWith("uploads/"))
    return fileUrl(raw.startsWith("/uploads/") ? raw : "/" + raw);
  return fileUrl(raw.startsWith("/") ? raw : "/" + raw);
}
function getDisplayName(img: ProcedureImage): string {
  if (img instanceof File) return img.name;
  return img.fileName || `Imagem #${img.id}`;
}

interface ProcedureImageGalleryModalProps {
  images: ProcedureImage[];
  startIdx?: number;
  onClose: () => void;
}

const ProcedureImageGalleryModal: React.FC<ProcedureImageGalleryModalProps> = ({
  images,
  startIdx = 0,
  onClose,
}) => {
  const safe = Array.isArray(images) ? images : [];
  const [idx, setIdx] = useState(
    startIdx >= 0 && startIdx < safe.length ? startIdx : 0
  );
  useEffect(() => {
    if (idx >= safe.length) setIdx(safe.length ? safe.length - 1 : 0);
  }, [idx, safe]);

  if (!safe.length) {
    return (
      <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
        <div className="relative bg-white rounded-2xl shadow-2xl p-6 flex flex-col items-center max-w-[90vw] max-h-[90vh]">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-2xl text-[#e11d48] hover:text-[#a30b32] font-bold"
            aria-label="Fechar"
          >
            <X />
          </button>
          <div className="text-gray-400 my-10">Nenhuma imagem.</div>
        </div>
      </div>
    );
  }

  const current = safe[idx];
  const url = normalizeImageUrl(current);
  const name = getDisplayName(current);

  function prev() {
    setIdx(p => (p === 0 ? safe.length - 1 : p - 1));
  }
  function next() {
    setIdx(p => (p === safe.length - 1 ? 0 : p + 1));
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
      <div className="relative bg-white rounded-2xl shadow-2xl p-6 flex flex-col items-center max-w-[90vw] max-h-[90vh]">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-2xl text-[#e11d48] hover:text-[#a30b32] font-bold"
          aria-label="Fechar"
        >
          <X />
        </button>
        <div className="flex items-center gap-8">
          <button
            type="button"
            aria-label="Imagem anterior"
            className="p-2 text-[#e11d48] hover:text-[#f43f5e] transition disabled:opacity-30"
            onClick={prev}
            disabled={safe.length < 2}
            style={{ visibility: safe.length > 1 ? "visible" : "hidden" }}
          >
            <ChevronLeft size={36} />
          </button>
          {url && (
            <img
              src={url}
              alt={name}
              className="max-h-[60vh] max-w-[60vw] rounded-xl border object-contain bg-white"
              style={{ boxShadow: "0 2px 16px #0002" }}
            />
          )}
          <button
            type="button"
            aria-label="Próxima imagem"
            className="p-2 text-[#e11d48] hover:text-[#f43f5e] transition disabled:opacity-30"
            onClick={next}
            disabled={safe.length < 2}
            style={{ visibility: safe.length > 1 ? "visible" : "hidden" }}
          >
            <ChevronRight size={36} />
          </button>
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-400 w-full">
          <span className="truncate max-w-[60%]" title={name}>
            {name}
          </span>
          <span>{safe.length > 1 ? `${idx + 1} / ${safe.length}` : ""}</span>
        </div>
      </div>
    </div>
  );
};

export default ProcedureImageGalleryModal;