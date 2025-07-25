import React, { useRef, useState, useEffect } from "react";
import {
  Search,
  MapPin,
  Stethoscope,
  Smile,
  Brain,
  Activity,
  Sparkles,
  Apple,
  FlaskConical,
  Syringe,
  Leaf,
  Briefcase,
  X,
} from "lucide-react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

const categoriesList = [
  { name: "Clínica Médica", specialty: "Clínica Médica", icon: <Stethoscope size={22} />, color: "bg-blue-50 text-blue-600" },
  { name: "Clínica Odontológica", specialty: "Odontologia", icon: <Smile size={22} />, color: "bg-cyan-50 text-cyan-600" },
  { name: "Clínica de Psicologia", specialty: "Psicologia", icon: <Brain size={22} />, color: "bg-purple-50 text-purple-600" },
  { name: "Clínica de Fisioterapia", specialty: "Fisioterapia", icon: <Activity size={22} />, color: "bg-green-50 text-green-600" },
  { name: "Clínica de Estética", specialty: "Estética", icon: <Sparkles size={22} />, color: "bg-pink-50 text-pink-600" },
  { name: "Clínica de Nutrição", specialty: "Nutrição", icon: <Apple size={22} />, color: "bg-red-50 text-red-600" },
  { name: "Clínica de Diagnóstico", specialty: "Diagnóstico", icon: <FlaskConical size={22} />, color: "bg-amber-50 text-amber-600" },
  { name: "Clínica de Vacinação", specialty: "Vacinação", icon: <Syringe size={22} />, color: "bg-teal-50 text-teal-600" },
  { name: "Clínica de Terapias Integrativas", specialty: "Terapias Integrativas", icon: <Leaf size={22} />, color: "bg-emerald-50 text-emerald-600" },
  { name: "Clínica de Medicina do Trabalho", specialty: "Medicina do Trabalho", icon: <Briefcase size={22} />, color: "bg-indigo-50 text-indigo-600" },
];

interface Props {
  searchTerm: string;
  setSearchTerm: (x: string) => void;
  location: string;
  setLocation: (x: string) => void;
  setSelectedSpecialty: (x: string | null) => void;
  onSearch: () => void;
  loading?: boolean;
}

const SearchBar: React.FC<Props> = ({
  searchTerm,
  setSearchTerm,
  location,
  setLocation,
  setSelectedSpecialty,
  onSearch,
  loading,
}) => {
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Preenche o campo localização com "Sua localização" ao montar
  useEffect(() => {
    if (!location) {
      setLocation("Sua localização");
    }
    // Só preenche se estiver vazio, para não sobrescrever se o usuário já digitou algo.
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (
        !target.closest(".search-container") &&
        !target.closest(".category-menu")
      ) {
        setShowCategoryMenu(false);
      }
    };
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") setShowCategoryMenu(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setSelectedCategory(null);
    setSelectedSpecialty(null);
  };

  const isCategorySelected = selectedCategory !== null && searchTerm === selectedCategory;

  const handleClearCategory = () => {
    setSearchTerm("");
    setSelectedCategory(null);
    setSelectedSpecialty(null);
    searchInputRef.current?.focus();
  };

  return (
    <section className="bg-gradient-to-r from-[#0ea5e9] to-[#e11d48] text-white py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Encontre os melhores profissionais de saúde perto de você
          </h1>
          <p className="text-lg mb-8">
            Agende consultas, leia avaliações e encontre o tratamento ideal para você
          </p>
          <form
            onSubmit={e => {
              e.preventDefault();
              onSearch();
            }}
            className="bg-white rounded-xl shadow-lg p-2 md:p-4 border border-gray-100"
            aria-label="Formulário de busca de clínicas"
          >
            <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
              <div className="flex-1 relative search-container">
                <span className="absolute left-2 top-1/2 -translate-y-1/2 flex items-center justify-center w-10 h-10 bg-gray-100 rounded-full shadow-sm">
                  <Search className="text-[#0ea5e9]" size={20} aria-hidden="true" />
                </span>
                <Input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Especialidades ou clínicas"
                  value={searchTerm}
                  aria-label="Pesquisar por tratamento, especialidade ou clínica"
                  onChange={handleInputChange}
                  className={
                    "pl-12 pr-10 h-12 text-base rounded-xl bg-gray-50 border border-gray-200 shadow focus:ring-2 focus:ring-[#0ea5e9] placeholder:text-gray-400 focus:placeholder-gray-300 transition " +
                    (isCategorySelected ? "text-gray-800 font-medium" : "text-gray-400")
                  }
                  onClick={() => setShowCategoryMenu(true)}
                  autoComplete="off"
                  style={{ paddingRight: isCategorySelected ? 40 : undefined }}
                />
                {isCategorySelected && (
                  <button
                    type="button"
                    onClick={handleClearCategory}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-gray-200 hover:bg-gray-300 rounded-full p-1 transition"
                    aria-label="Limpar seleção de categoria"
                  >
                    <X className="w-5 h-5 text-gray-600" />
                  </button>
                )}
                {showCategoryMenu && (
                  <div
                    className="category-menu absolute z-20 w-full mt-2 rounded-xl shadow-2xl border border-gray-100 bg-white animate-fadeIn"
                  >
                    <div className="py-2">
                      <div className="px-4 pb-2">
                        <span className="text-xs uppercase tracking-widest text-gray-400">
                          Categorias populares
                        </span>
                      </div>
                      <div className="flex flex-col max-h-56 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
                        {categoriesList.length > 0 ? (
                          categoriesList.map((category, index) => (
                            <button
                              key={index}
                              className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 focus:bg-gray-100 transition rounded-lg text-left font-medium"
                              type="button"
                              tabIndex={0}
                              aria-label={`Selecionar categoria ${category.name}`}
                              style={{ color: "#1f2937" }}
                              onClick={e => {
                                e.preventDefault();
                                e.stopPropagation();
                                setSearchTerm(category.name);
                                setSelectedCategory(category.name);
                                setSelectedSpecialty(category.specialty);
                                searchInputRef.current?.focus();
                              }}
                            >
                              <span
                                className={`w-8 h-8 rounded-full ${category.color} flex items-center justify-center text-lg`}
                              >
                                {category.icon}
                              </span>
                              <span className="font-medium text-base">{category.name}</span>
                            </button>
                          ))
                        ) : (
                          <div className="px-4 py-4 text-gray-400 text-center">
                            Nenhuma categoria encontrada
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex-1 relative">
                <span className="absolute left-2 top-1/2 -translate-y-1/2 flex items-center justify-center w-10 h-10 bg-gray-100 rounded-full shadow-sm">
                  <MapPin className="text-[#e11d48]" size={20} aria-hidden="true" />
                </span>
                <Input
                  type="text"
                  placeholder='Sua localização'
                  value={location}
                  aria-label="Pesquisar por localização"
                  onChange={e => setLocation(e.target.value)}
                  className="pl-12 pr-4 h-12 text-base rounded-xl bg-gray-50 border border-gray-200 shadow text-gray-400 focus:ring-2 focus:ring-[#e11d48] placeholder:text-gray-400 focus:placeholder-gray-300 transition"
                  autoComplete="off"
                />
              </div>
              <Button
                type="submit"
                className="w-full md:w-auto h-12 px-8 rounded-xl bg-[#e11d48] text-white hover:bg-[#f43f5e] text-base shadow-lg transition"
                aria-label="Buscar clínicas"
                disabled={loading}
              >
                {loading ? "Buscando..." : "Buscar"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default SearchBar;