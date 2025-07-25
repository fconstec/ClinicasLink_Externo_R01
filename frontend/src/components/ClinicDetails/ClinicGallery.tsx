import React from 'react';
import { Image as ImageIcon, X, ChevronLeft, ChevronRight as ChevronRightIcon } from 'lucide-react';

const getImageUrl = (url?: string) => {
  if (!url) return undefined;
  if (/^https?:\/\//.test(url) || url.startsWith('blob:')) return url;
  return `http://localhost:3001${url.startsWith('/') ? url : `/${url}`}`;
};

type ClinicGalleryProps = {
  gallery: string[];
  openModal: (idx: number) => void;
};

export function ClinicGallery({ gallery, openModal }: ClinicGalleryProps) {
  if (!gallery?.length) return null;
  return (
    <div className="p-4 border-b border-gray-200 bg-gray-50">
      <h2 className="text-md font-semibold text-gray-700 mb-2">Galeria da Clínica</h2>
      <div className="flex gap-2 overflow-x-auto">
        {gallery.map((img, idx) => (
          <button
            key={idx}
            type="button"
            className="focus:outline-none"
            onClick={() => openModal(idx)}
            aria-label={`Ampliar imagem da galeria ${idx + 1}`}
          >
            <img
              src={getImageUrl(img)}
              alt={`Galeria ${idx + 1}`}
              className="h-20 w-32 rounded object-cover border transition-transform hover:scale-105"
              loading="lazy"
            />
          </button>
        ))}
      </div>
    </div>
  );
}

type GalleryModalProps = {
  gallery: string[];
  modalOpen: boolean;
  modalIndex: number;
  setModalOpen: (open: boolean) => void;
  setModalIndex: (idx: number) => void;
};

export function GalleryModal({ gallery, modalOpen, modalIndex, setModalOpen, setModalIndex }: GalleryModalProps) {
  if (!gallery?.length || !modalOpen) return null;
  const currentImg = gallery[modalIndex];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      <button
        className="absolute top-6 right-8 text-white bg-black/60 rounded-full p-2 hover:bg-black"
        onClick={() => setModalOpen(false)}
        aria-label="Fechar"
      >
        <X className="h-8 w-8" />
      </button>
      <button
        className="absolute left-2 md:left-14 top-1/2 -translate-y-1/2 p-2 text-white bg-black/30 rounded-full hover:bg-black"
        onClick={() => setModalIndex(modalIndex === 0 ? gallery.length - 1 : modalIndex - 1)}
        aria-label="Imagem anterior"
      >
        <ChevronLeft className="h-10 w-10" />
      </button>
      <img
        src={getImageUrl(currentImg)}
        alt={`Imagem ampliada ${modalIndex + 1}`}
        className="max-h-[90vh] max-w-[90vw] rounded-lg shadow-lg object-contain"
      />
      <button
        className="absolute right-2 md:right-14 top-1/2 -translate-y-1/2 p-2 text-white bg-black/30 rounded-full hover:bg-black"
        onClick={() => setModalIndex(modalIndex === gallery.length - 1 ? 0 : modalIndex + 1)}
        aria-label="Próxima imagem"
      >
        <ChevronRightIcon className="h-10 w-10" />
      </button>
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
        {gallery.map((_, idx) => (
          <button
            key={idx}
            className={`w-3 h-3 rounded-full border-2 ${idx === modalIndex ? 'border-white bg-white' : 'border-gray-300 bg-gray-400'}`}
            onClick={() => setModalIndex(idx)}
            aria-label={`Ir para imagem ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}