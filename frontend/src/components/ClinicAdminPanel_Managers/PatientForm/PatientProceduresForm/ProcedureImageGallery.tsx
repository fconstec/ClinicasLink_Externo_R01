import React, { useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3001";

function getImageUrl(img: any) {
  if (typeof img === "string") {
    return img.startsWith("http") ? img : `${API_URL}${img}`;
  }
  if (img instanceof File) {
    return URL.createObjectURL(img);
  }
  if (img?.url) {
    return img.url.startsWith("http") ? img.url : `${API_URL}${img.url}`;
  }
  return "";
}

interface ProcedureImageGalleryModalProps {
  images: any[];
  startIdx?: number;
  onClose: () => void;
}

const ProcedureImageGalleryModal: React.FC<ProcedureImageGalleryModalProps> = ({
  images,
  startIdx = 0,
  onClose,
}) => {
  const [idx, setIdx] = useState(startIdx);

  function goPrev() {
    setIdx(prev => (prev === 0 ? images.length - 1 : prev - 1));
  }
  function goNext() {
    setIdx(prev => (prev === images.length - 1 ? 0 : prev + 1));
  }

  const img = images[idx];

  if (!images || images.length === 0) {
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
            className="p-2 text-[#e11d48] hover:text-[#f43f5e] transition"
            onClick={goPrev}
            disabled={images.length < 2}
            style={{ visibility: images.length > 1 ? "visible" : "hidden" }}
          >
            <ChevronLeft size={36} />
          </button>
          {img && (
            <img
              src={getImageUrl(img)}
              alt={img?.fileName || img?.name || ""}
              className="max-h-[60vh] max-w-[60vw] rounded-xl border"
              style={{ boxShadow: "0 2px 16px #0002" }}
            />
          )}
          <button
            type="button"
            aria-label="Próxima imagem"
            className="p-2 text-[#e11d48] hover:text-[#f43f5e] transition"
            onClick={goNext}
            disabled={images.length < 2}
            style={{ visibility: images.length > 1 ? "visible" : "hidden" }}
          >
            <ChevronRight size={36} />
          </button>
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-400 w-full">
          <span>{img?.fileName || img?.name || ""}</span>
          <span>
            {images.length > 1 ? `${idx + 1} / ${images.length}` : ""}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProcedureImageGalleryModal;