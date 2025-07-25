import React, { useState } from "react";
import ClinicCard from "../ClinicCard";
import { ChevronLeftCircle, ChevronRightCircle } from "lucide-react";
import { Clinic } from "./types";

const CAROUSEL_VISIBLE = 4;
const ITEM_WIDTH = 340;

interface Props {
  clinics: Clinic[];
  loading: boolean;
  onClinicClick: (id: number) => void;
  searchMode?: boolean;
  searchTerm?: string;
}

const FeaturedClinicsCarousel: React.FC<Props> = ({
  clinics,
  loading,
  onClinicClick,
  searchMode = false,
  searchTerm = "",
}) => {
  const [carouselIndex, setCarouselIndex] = useState(0);

  const handlePrev = () => setCarouselIndex((prev) => Math.max(prev - 1, 0));
  const handleNext = () =>
    setCarouselIndex((prev) =>
      Math.min(prev + 1, Math.max(clinics.length - CAROUSEL_VISIBLE, 0))
    );

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {searchMode
              ? searchTerm
                ? `Resultados da busca para "${searchTerm}"`
                : "Resultados da busca"
              : "Clínicas em Destaque"}
          </h2>
        </div>
        {loading ? (
          <div className="text-center py-8 text-gray-400">
            {searchMode ? "Buscando clínicas..." : "Carregando clínicas..."}
          </div>
        ) : clinics.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            {searchMode
              ? searchTerm
                ? <>Nenhuma clínica encontrada para "{searchTerm}".</>
                : "Nenhuma clínica encontrada."
              : "Nenhuma clínica em destaque no momento."}
          </div>
        ) : (
          <div className="relative carousel-container" style={{ minHeight: 320 }}>
            <button
              className="carousel-arrow carousel-arrow--left"
              style={{ opacity: carouselIndex === 0 ? 0.2 : undefined }}
              onClick={handlePrev}
              disabled={carouselIndex === 0}
              aria-label="Ver anteriores"
            >
              <ChevronLeftCircle />
            </button>
            <div className="overflow-hidden px-2">
              <div
                className="carousel-track"
                style={{
                  width: `${clinics.length * ITEM_WIDTH}px`,
                  transform: `translateX(-${carouselIndex * ITEM_WIDTH}px)`,
                }}
              >
                {clinics.map((clinic) => (
                  <div
                    key={clinic.id}
                    className="min-w-[320px] max-w-md flex-shrink-0 pr-6"
                    style={{ width: 320, minHeight: 320 }}
                  >
                    <ClinicCard clinic={clinic} onClick={onClinicClick} />
                  </div>
                ))}
              </div>
            </div>
            <button
              className="carousel-arrow carousel-arrow--right"
              style={{
                opacity: carouselIndex >= clinics.length - CAROUSEL_VISIBLE ? 0.2 : undefined,
              }}
              onClick={handleNext}
              disabled={carouselIndex >= clinics.length - CAROUSEL_VISIBLE}
              aria-label="Ver próximos"
            >
              <ChevronRightCircle />
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedClinicsCarousel;