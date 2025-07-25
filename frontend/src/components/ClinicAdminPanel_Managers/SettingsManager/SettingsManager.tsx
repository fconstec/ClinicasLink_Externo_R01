import React, { useState } from "react";
import ClinicImagesCard from "./ClinicImagesCard";
import ClinicBasicInfoCard from "./ClinicBasicInfoCard";
import ClinicSpecialtiesCard from "./ClinicSpecialtiesCard";
import ClinicOpeningHoursCard from "./ClinicOpeningHoursCard";
import ClinicAddressCard from "./ClinicAddressCard";
import ChangePasswordCard from "./ChangePasswordCard";
import GalleryModal from "../GalleryModal";
import { useParams } from "react-router-dom";

const SettingsManager: React.FC = () => {
  const { id: clinicIdParam } = useParams<{ id: string }>();
  const clinicId = clinicIdParam ? String(clinicIdParam) : "";

  // Estado das imagens da galeria do modal
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [galleryModalOpen, setGalleryModalOpen] = useState(false);
  const [galleryModalIndex, setGalleryModalIndex] = useState(0);

  // Função chamada pelo ClinicImagesCard
  const openGalleryModal = (index: number, images: string[]) => {
    setGalleryImages(images);
    setGalleryModalIndex(index);
    setGalleryModalOpen(true);
  };

  // Função para fechar o modal, pode ser passada ao ClinicImagesCard se quiser forçar fechar ao salvar.
  const closeGalleryModal = () => setGalleryModalOpen(false);

  if (!clinicId) {
    return (
      <div className="p-8 text-center text-gray-500">
        ID da clínica não encontrado.
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto py-10 space-y-10">
      <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3 mb-1">
        Configurações da Clínica
      </h1>

      <ClinicImagesCard 
        clinicId={clinicId}
        openGalleryModal={openGalleryModal}
        // closeGalleryModal={closeGalleryModal} // Descomente se quiser passar
      />

      <div className="space-y-8">
        <ClinicBasicInfoCard clinicId={clinicId} />
        <ClinicSpecialtiesCard clinicId={clinicId} />
        <ClinicOpeningHoursCard clinicId={clinicId} />
        <ClinicAddressCard clinicId={clinicId} />
      </div>

      <ChangePasswordCard />

      <GalleryModal
        galleryImages={galleryImages}
        galleryModalOpen={galleryModalOpen}
        galleryModalIndex={galleryModalIndex}
        setGalleryModalOpen={setGalleryModalOpen}
        setGalleryModalIndex={setGalleryModalIndex}
      />
    </div>
  );
};

export default SettingsManager;