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

const HomePage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [location, setLocation] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(null);

  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loadingClinics, setLoadingClinics] = useState(true);

  const navigate = useNavigate();

  // Carrega as clínicas para os carrosséis ao montar
  useEffect(() => {
    setLoadingClinics(true);
    fetch("http://localhost:3001/api/clinics")
      .then(res => res.json())
      .then(data => setClinics(Array.isArray(data) ? data : []))
      .catch(() => setClinics([]))
      .finally(() => setLoadingClinics(false));
  }, []);

  const handleClinicClick = (clinicId: number) => {
    navigate(`/clinica/${clinicId}`);
  };

  // Agora o handleSearch só redireciona para a página de busca com query params
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