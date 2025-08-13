import React, { useState, useEffect } from "react";
import Header from "../Header";
import Footer from "../Footer";
import { useNavigate } from "react-router-dom";
import SearchBar from "./SearchBar";
import FeaturedClinicsCarousel from "./FeaturedClinicsCarousel";
import NewClinicsCarousel from "./NewClinicsCarousel";
import HowItWorksSection from "./HowItWorksSection";
import { Clinic } from "./types";
import "../../styles/carousel.css";
import { API_BASE_URL } from "../../api/apiBase";

const HomePage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [location, setLocation] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(null);

  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loadingClinics, setLoadingClinics] = useState(true);
  const [clinicsError, setClinicsError] = useState<string | null>(null);

  const navigate = useNavigate();

  async function loadClinics() {
    setLoadingClinics(true);
    setClinicsError(null);

    // Endpoints candidato (padrão: /api/clinics)
    const primary = `${API_BASE_URL}/api/clinics`;
    const fallback = `${API_BASE_URL}/clinics`;

    try {
      let res = await fetch(primary);
      if (res.status === 404) {
        // tenta fallback somente se 404
        res = await fetch(fallback);
      }

      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(`HTTP ${res.status} ${res.statusText} ${txt}`);
      }

      const data = await res.json();
      setClinics(Array.isArray(data) ? data : []);
    } catch (e: any) {
      console.error("[HomePage] Erro ao carregar clínicas:", e);
      setClinics([]);
      setClinicsError("Não foi possível carregar as clínicas.");
    } finally {
      setLoadingClinics(false);
    }
  }

  // Carrega as clínicas para os carrosséis ao montar
  useEffect(() => {
    let cancelled = false;
    (async () => {
      await loadClinics();
      if (cancelled) return;
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleClinicClick = (clinicId: number) => {
    navigate(`/clinica/${clinicId}`);
  };

  // Redireciona para página de busca
  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchTerm) params.append("searchTerm", searchTerm);
    if (location) params.append("location", location);
    if (selectedSpecialty) params.append("specialty", selectedSpecialty);
    navigate(`/buscar?${params.toString()}`);
  };

  const featuredClinics = clinics.slice(0, 15);
  const newClinics = [...clinics]
    .sort((a, b) => (b.created_at || "").localeCompare(a.created_at || ""))
    .slice(0, 15);

  return (
    <div className="min-h-screen bg-gray-50 pt-24">
      <Header />
      <SearchBar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        location={location}
        setLocation={setLocation}
        setSelectedSpecialty={setSelectedSpecialty}
        onSearch={handleSearch}
        loading={false}
      />

      {clinicsError && (
        <div className="mx-auto max-w-5xl px-4 mb-4">
          <div className="rounded-md bg-red-50 border border-red-200 text-red-700 text-sm p-3 flex justify-between items-start">
            <span>{clinicsError}</span>
            <button
              onClick={loadClinics}
              className="text-red-600 underline hover:text-red-800"
            >
              Tentar novamente
            </button>
          </div>
        </div>
      )}

      <FeaturedClinicsCarousel
        clinics={featuredClinics}
        loading={loadingClinics}
        onClinicClick={handleClinicClick}
      />
      <NewClinicsCarousel
        clinics={newClinics}
        loading={loadingClinics}
        onClinicClick={handleClinicClick}
      />
      <HowItWorksSection />
      <Footer />
    </div>
  );
};

export default HomePage;