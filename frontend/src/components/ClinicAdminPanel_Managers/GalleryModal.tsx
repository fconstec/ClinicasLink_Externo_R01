import React, { useEffect } from "react";

export interface GalleryModalProps {
  galleryImages: string[];
  galleryModalOpen: boolean;
  galleryModalIndex: number;
  setGalleryModalOpen: (open: boolean) => void;
  setGalleryModalIndex: (index: number) => void;
  onRemoveImage?: (urlOrIndex: string | number) => void;
}

const GalleryModal: React.FC<GalleryModalProps> = ({
  galleryImages,
  galleryModalOpen,
  galleryModalIndex,
  setGalleryModalOpen,
  setGalleryModalIndex,
  onRemoveImage,
}) => {
  // Fechar ao apertar ESC
  useEffect(() => {
    if (!galleryModalOpen) return;
    const handleKeydown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setGalleryModalOpen(false);
      if (e.key === "ArrowLeft") setGalleryModalIndex((galleryModalIndex - 1 + galleryImages.length) % galleryImages.length);
      if (e.key === "ArrowRight") setGalleryModalIndex((galleryModalIndex + 1) % galleryImages.length);
    };
    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
    // eslint-disable-next-line
  }, [galleryModalOpen, galleryModalIndex, galleryImages.length]);

  if (!galleryImages.length || !galleryModalOpen) return null;
  const currentImg = galleryImages[galleryModalIndex] || galleryImages[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      <button
        className="absolute top-6 right-8 text-white bg-black/60 rounded-full p-2 hover:bg-black"
        onClick={() => setGalleryModalOpen(false)}
        aria-label="Fechar"
      >
        X
      </button>
      <button
        className="absolute left-2 md:left-14 top-1/2 -translate-y-1/2 p-2 text-white bg-black/30 rounded-full hover:bg-black"
        onClick={() => setGalleryModalIndex((galleryModalIndex - 1 + galleryImages.length) % galleryImages.length)}
        aria-label="Imagem anterior"
      >
        {"<"}
      </button>
      <img
        src={currentImg}
        alt={`Imagem ampliada ${galleryModalIndex + 1}`}
        className="max-h-[90vh] max-w-[90vw] rounded-lg shadow-lg object-contain"
      />
      <button
        className="absolute right-2 md:right-14 top-1/2 -translate-y-1/2 p-2 text-white bg-black/30 rounded-full hover:bg-black"
        onClick={() => setGalleryModalIndex((galleryModalIndex + 1) % galleryImages.length)}
        aria-label="Próxima imagem"
      >
        {">"}
      </button>
      {onRemoveImage && (
        <button
          className="absolute bottom-8 right-8 bg-red-600 text-white px-3 py-1 rounded-full text-xs shadow hover:bg-red-700 transition"
          onClick={() => onRemoveImage(currentImg)}
          aria-label="Remover imagem"
        >
          Remover imagem
        </button>
      )}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
        {galleryImages.map((img, idx) => (
          <button
            key={img}
            className={`w-3 h-3 rounded-full border-2 ${idx === galleryModalIndex ? 'border-white bg-white' : 'border-gray-300 bg-gray-400'}`}
            onClick={() => setGalleryModalIndex(idx)}
            aria-label={`Ir para imagem ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default GalleryModal;