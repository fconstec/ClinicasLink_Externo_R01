import React, { useState } from 'react';
import { 
  Search, 
  MapPin, 
  Filter, 
  ChevronDown, 
  X,
  Check
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import Header from './Header';

interface AdvancedSearchProps {}

const AdvancedSearch: React.FC<AdvancedSearchProps> = () => {
  // Estados para os filtros
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [filtersOpen, setFiltersOpen] = useState<boolean>(false);
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);
  const [selectedInsurances, setSelectedInsurances] = useState<string[]>([]);
  const [selectedAvailability, setSelectedAvailability] = useState<string>('');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500]);
  const [rating, setRating] = useState<number>(0);
  
  // Dados simulados para os filtros
  const specialties = [
    'Fisioterapia', 'Odontologia', 'Nutrição', 'Psicologia', 
    'Dermatologia', 'Ortopedia', 'Cardiologia', 'Pediatria',
    'Ginecologia', 'Oftalmologia', 'Acupuntura', 'Fonoaudiologia'
  ];
  
  const insurances = [
    'Unimed', 'Bradesco Saúde', 'SulAmérica', 'Amil', 
    'NotreDame Intermédica', 'Porto Seguro', 'Hapvida', 'Golden Cross',
    'Cassi', 'Mediservice', 'Particular'
  ];
  
  const availabilityOptions = [
    'Qualquer horário',
    'Hoje',
    'Amanhã',
    'Esta semana',
    'Próxima semana',
    'Fim de semana'
  ];
  
  // Função para alternar a seleção de especialidades
  const toggleSpecialty = (specialty: string) => {
    if (selectedSpecialties.includes(specialty)) {
      setSelectedSpecialties(selectedSpecialties.filter(s => s !== specialty));
    } else {
      setSelectedSpecialties([...selectedSpecialties, specialty]);
    }
  };
  
  // Função para alternar a seleção de convênios
  const toggleInsurance = (insurance: string) => {
    if (selectedInsurances.includes(insurance)) {
      setSelectedInsurances(selectedInsurances.filter(i => i !== insurance));
    } else {
      setSelectedInsurances([...selectedInsurances, insurance]);
    }
  };
  
  // Função para limpar todos os filtros
  const clearFilters = () => {
    setSelectedSpecialties([]);
    setSelectedInsurances([]);
    setSelectedAvailability('');
    setPriceRange([0, 500]);
    setRating(0);
  };
  
  // Função para aplicar os filtros e buscar resultados
  const applyFilters = () => {
    console.log('Aplicando filtros:', {
      searchTerm,
      location,
      selectedSpecialties,
      selectedInsurances,
      selectedAvailability,
      priceRange,
      rating
    });
    
    // Aqui seria feita a integração com o backend para buscar os resultados filtrados
    
    // Fechar o painel de filtros
    setFiltersOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Busca Avançada" showBackButton={true} backUrl="/" />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Barra de busca principal */}
          <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <Input
                  type="text"
                  placeholder="Buscar por tratamento, especialidade ou clínica"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <div className="flex-1 relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <Input
                  type="text"
                  placeholder="Localização (cidade, bairro, CEP)"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Button 
                onClick={() => setFiltersOpen(!filtersOpen)}
                variant="outline"
                className="flex items-center"
              >
                <Filter className="mr-2" size={18} />
                Filtros
                <ChevronDown className={`ml-2 transition-transform ${filtersOpen ? 'rotate-180' : ''}`} size={16} />
              </Button>
              
              <Button 
                type="submit" 
                className="bg-[#e11d48] text-white hover:bg-[#f43f5e]"
              >
                Buscar
              </Button>
            </div>
            
            {/* Painel de filtros avançados */}
            {filtersOpen && (
              <div className="mt-6 border-t border-gray-200 pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Filtro de Especialidades */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-3">Especialidades</h3>
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                      {specialties.map((specialty) => (
                        <div 
                          key={specialty}
                          className="flex items-center"
                        >
                          <button
                            onClick={() => toggleSpecialty(specialty)}
                            className={`w-5 h-5 rounded border flex items-center justify-center mr-2 ${
                              selectedSpecialties.includes(specialty)
                                ? 'bg-[#e11d48] border-[#e11d48]'
                                : 'border-gray-300'
                            }`}
                          >
                            {selectedSpecialties.includes(specialty) && (
                              <Check className="h-3 w-3 text-white" />
                            )}
                          </button>
                          <span className="text-sm text-gray-700">{specialty}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Filtro de Convênios */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-3">Convênios</h3>
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                      {insurances.map((insurance) => (
                        <div 
                          key={insurance}
                          className="flex items-center"
                        >
                          <button
                            onClick={() => toggleInsurance(insurance)}
                            className={`w-5 h-5 rounded border flex items-center justify-center mr-2 ${
                              selectedInsurances.includes(insurance)
                                ? 'bg-[#e11d48] border-[#e11d48]'
                                : 'border-gray-300'
                            }`}
                          >
                            {selectedInsurances.includes(insurance) && (
                              <Check className="h-3 w-3 text-white" />
                            )}
                          </button>
                          <span className="text-sm text-gray-700">{insurance}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Filtro de Disponibilidade */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-3">Disponibilidade</h3>
                    <div className="space-y-2">
                      {availabilityOptions.map((option) => (
                        <div 
                          key={option}
                          className="flex items-center"
                        >
                          <button
                            onClick={() => setSelectedAvailability(option)}
                            className={`w-5 h-5 rounded-full border flex items-center justify-center mr-2 ${
                              selectedAvailability === option
                                ? 'bg-[#e11d48] border-[#e11d48]'
                                : 'border-gray-300'
                            }`}
                          >
                            {selectedAvailability === option && (
                              <div className="h-2 w-2 rounded-full bg-white" />
                            )}
                          </button>
                          <span className="text-sm text-gray-700">{option}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Filtro de Preço */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-3">
                      Faixa de Preço: R$ {priceRange[0]} - R$ {priceRange[1]}
                    </h3>
                    <div className="px-2">
                      <input
                        type="range"
                        min="0"
                        max="500"
                        step="10"
                        value={priceRange[1]}
                        onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                  </div>
                  
                  {/* Filtro de Avaliação */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-3">Avaliação Mínima</h3>
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => setRating(star)}
                          className="text-gray-300 hover:text-yellow-400"
                        >
                          <svg
                            className={`h-6 w-6 ${star <= rating ? 'text-yellow-400' : ''}`}
                            fill={star <= rating ? 'currentColor' : 'none'}
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                            />
                          </svg>
                        </button>
                       ))}
                      <span className="ml-2 text-sm text-gray-700">
                        {rating > 0 ? `${rating} estrelas ou mais` : 'Qualquer avaliação'}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 flex justify-between">
                  <Button 
                    variant="outline"
                    onClick={clearFilters}
                    className="text-gray-700"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Limpar Filtros
                  </Button>
                  
                  <Button 
                    onClick={applyFilters}
                    className="bg-[#e11d48] text-white hover:bg-[#f43f5e]"
                  >
                    Aplicar Filtros
                  </Button>
                </div>
              </div>
            )}
          </div>
          
          {/* Aqui seriam exibidos os resultados da busca */}
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">Nenhum resultado encontrado</h3>
            <p className="text-gray-500">
              Tente ajustar seus filtros ou buscar por outros termos.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdvancedSearch;
