import React, { useState, useEffect, ChangeEvent } from "react";
import { Button } from "../../ui/button";
import { Image as ImageIcon, Upload, X } from "lucide-react";
import { fetchClinicSettings, updateClinicImages } from "../../../api";
import { ClinicInfoData } from "../types";
import { fileUrl } from "../../../api/apiBase";

const MAX_GALLERY_IMAGES = 6;

interface ClinicImagesCardProps {
  clinicId: string;
  openGalleryModal: (idx: number, images: string[]) => void;
}

type GalleryImageObj = {
  url: string;
  file?: File;
  isNew: boolean;
};

const ClinicImagesCard: React.FC<ClinicImagesCardProps> = ({
  clinicId,
  openGalleryModal,
}) => {
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null);
  const [removeCoverImageFlag, setRemoveCoverImageFlag] = useState(false); // (ainda não enviado ao backend)

  const [galleryImages, setGalleryImages] = useState<GalleryImageObj[]>([]);
  const [galleryUrlsToRemove, setGalleryUrlsToRemove] = useState<string[]>([]);

  const [savingImages, setSavingImages] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Carregar imagens iniciais
  useEffect(() => {
    if (!clinicId) return;
    fetchClinicSettings(clinicId).then((data: ClinicInfoData) => {
      setCoverImageUrl(data.coverUrl ?? null);
      setGalleryImages(
        (data.galleryUrls ?? []).map((url: string) => ({
          url,
          isNew: false,
        }))
      );
      setGalleryUrlsToRemove([]);
    });
  }, [clinicId]);

  /**
   * Normaliza URL para exibição:
   * - blob:/data:/http(s) não-localhost => retorna como está
   * - http(s) localhost => substitui host usando fileUrl()
   * - caminhos relativos ou nomes => fileUrl()
   */
  const getDisplayImageUrl = (raw: string | null): string | null => {
    if (!raw) return null;

    if (/^(blob:|data:|https?:)/i.test(raw)) {
      try {
        const u = new URL(raw);
        if (u.host.includes("localhost")) {
          return fileUrl(u.pathname + u.search);
        }
        return raw;
      } catch {
        return raw;
      }
    }
    return fileUrl(raw);
  };

  const handleClinicCoverChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setCoverImageFile(file);
      setCoverImageUrl(URL.createObjectURL(file)); // preview local
      setRemoveCoverImageFlag(false);
    }
  };

  const handleRemoveExistingCoverImage = () => {
    setCoverImageFile(null);
    setCoverImageUrl(null);
    setRemoveCoverImageFlag(true); // atualmente não enviado; manter comportamento anterior
  };

  // Adicionar imagens na galeria respeitando limite
  const handleClinicGalleryAdd = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const currentTotal =
        galleryImages.filter((img) => !galleryUrlsToRemove.includes(img.url)).length;

      if (currentTotal + files.length > MAX_GALLERY_IMAGES) {
        alert(`Você pode ter no máximo ${MAX_GALLERY_IMAGES} imagens na galeria.`);
        const slotsAvailable = MAX_GALLERY_IMAGES - currentTotal;
        if (slotsAvailable > 0) {
          const slice = files.slice(0, slotsAvailable);
          setGalleryImages((prev) => [
            ...prev,
            ...slice.map((file) => ({
              url: URL.createObjectURL(file),
              file,
              isNew: true,
            })),
          ]);
        }
      } else {
        setGalleryImages((prev) => [
          ...prev,
            ...files.map((file) => ({
              url: URL.createObjectURL(file),
              file,
              isNew: true,
            })),
        ]);
      }
      // Permitir selecionar novamente os mesmos arquivos
      e.target.value = "";
    }
  };

  // Remover imagem da galeria (marca para remoção se existia no servidor)
  const handleClinicGalleryRemove = (urlOrIndex: string | number) => {
    if (typeof urlOrIndex === "string") {
      setGalleryImages((prev) => prev.filter((img) => img.url !== urlOrIndex));
      const img = galleryImages.find((img) => img.url === urlOrIndex);
      if (img && !img.isNew) {
        setGalleryUrlsToRemove((prev) => [...prev, urlOrIndex]);
      }
    } else {
      setGalleryImages((prev) => prev.filter((_, idx) => idx !== urlOrIndex));
    }
  };

  // Salvar (capa + galeria)
  const handleSaveImages = async () => {
    setSavingImages(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      const existingGalleryUrls = galleryImages
        .filter((img) => !img.isNew)
        .filter((img) => !galleryUrlsToRemove.includes(img.url))
        .map((img) => img.url);

      const newGalleryImageFiles = galleryImages
        .filter((img) => img.isNew)
        .map((img) => img.file!)
        .filter(Boolean);

      await updateClinicImages(clinicId, {
        coverImageFile,
        galleryImageFiles: newGalleryImageFiles,
        existingGalleryUrlsJSON: JSON.stringify(existingGalleryUrls),
        galleryUrlsToRemoveJSON: JSON.stringify(galleryUrlsToRemove),
        galleryUrls: galleryImages.map((img) => img.url),
        // removeCoverImage removido para evitar erro de tipo (Opção 1)
      });

      setCoverImageFile(null);
      setGalleryUrlsToRemove([]);
      setSuccessMessage("Imagens salvas com sucesso!");
    } catch (err) {
      console.error("Erro ao salvar imagens:", err);
      setErrorMessage("Erro ao salvar imagens.");
      setSavingImages(false);
      return;
    }

    // Recarregar dados após salvar
    try {
      const data: any = await fetchClinicSettings(clinicId);
      setCoverImageUrl(data.coverUrl ?? null);
      setGalleryImages(
        (data.galleryUrls ?? []).map((url: string) => ({
          url,
          isNew: false,
        }))
      );
    } catch (err) {
      console.error("Erro ao atualizar imagens após salvar:", err);
    } finally {
      setSavingImages(false);
    }
  };

  const galleryImageUrls = galleryImages.map((img) => img.url);

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-100 p-8">
      <h2 className="text-xl font-bold text-gray-800 mb-6 border-b border-gray-200 pb-3">
        Imagens da Clínica
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

      <div className="flex flex-col md:flex-row gap-10">
        {/* Capa */}
        <div className="flex-1 min-w-[230px]">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Imagem de Capa
          </label>
          <div className="relative w-full aspect-[16/9] border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center overflow-hidden bg-gray-100 group transition-shadow duration-200 hover:shadow-lg">
            {coverImageUrl && getDisplayImageUrl(coverImageUrl) ? (
              <img
                src={getDisplayImageUrl(coverImageUrl)!}
                alt="Capa da Clínica"
                className="w-full h-full object-cover"
              />
            ) : (
              <ImageIcon className="h-16 w-16 text-gray-300" />
            )}
            <label
              htmlFor="clinic-cover-upload"
              className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-xl"
            >
              <span className="flex flex-col items-center text-white">
                <Upload className="h-7 w-7 mb-1" />
                <span className="text-sm font-medium">Alterar Capa</span>
              </span>
              <input
                id="clinic-cover-upload"
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={handleClinicCoverChange}
              />
            </label>
          </div>
          {coverImageUrl && (
            <button
              className="inline-flex items-center gap-1 px-3 py-1.5 mt-2 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-700 text-xs font-medium"
              onClick={handleRemoveExistingCoverImage}
              type="button"
            >
              <X className="h-4 w-4" /> Remover Capa
            </button>
          )}
          <p className="text-xs text-gray-400 mt-2">
            Recomendado: 1200x675px. PNG/JPG até 2MB.
          </p>
        </div>

        {/* Galeria */}
        <div className="flex-1 min-w-[230px]">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Galeria de Imagens{" "}
            <span className="font-normal text-gray-500">
              ({galleryImageUrls.length}/{MAX_GALLERY_IMAGES})
            </span>
          </label>
          <div className="flex flex-wrap gap-3">
            {galleryImageUrls.map((imgUrl, idx) => (
              <div key={`gallery-${idx}`} className="relative group w-24 h-24">
                <img
                  src={getDisplayImageUrl(imgUrl)!}
                  alt={`Imagem da Galeria ${idx + 1}`}
                  className="w-24 h-24 object-cover rounded-xl border shadow cursor-pointer"
                  onClick={() => openGalleryModal(idx, galleryImageUrls)}
                />
                <button
                  type="button"
                  className="absolute top-1 right-1 bg-rose-600 text-white rounded-full p-0.5 hover:bg-rose-700 transition"
                  onClick={() => handleClinicGalleryRemove(imgUrl)}
                  aria-label="Remover imagem da galeria"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
            {galleryImageUrls.length < MAX_GALLERY_IMAGES && (
              <label className="w-24 h-24 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 cursor-pointer hover:border-[#e11d48] hover:text-[#e11d48] transition-colors text-gray-400">
                <Upload className="h-7 w-7 mb-1" />
                <span className="text-xs font-medium text-center">
                  Adicionar
                </span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="sr-only"
                  onChange={handleClinicGalleryAdd}
                />
              </label>
            )}
          </div>
          <p className="text-xs text-gray-400 mt-2">
            Máximo de {MAX_GALLERY_IMAGES} imagens. PNG/JPG até 2MB cada.
          </p>
        </div>
      </div>

      <div className="flex gap-2 justify-end mt-8">
        <Button
          type="button"
          className="bg-[#e11d48] text-white hover:bg-[#f43f5e] flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          onClick={handleSaveImages}
          disabled={savingImages}
        >
          {savingImages ? "Salvando imagens..." : "Salvar Imagens"}
        </Button>
      </div>
    </div>
  );
};

export default ClinicImagesCard;