import React from 'react';
import { Button } from '../ui/button';
import { Clock, ChevronLeft, ChevronRight } from 'lucide-react';

const StepProfessionalService = ({
  clinic,
  selectedProfessional,
  setSelectedProfessional,
  selectedService,
  setSelectedService,
  handleNextStep,
  handlePreviousStep,
  currentStep,
}: any) => {
  // Proteção caso os dados venham indefinidos da API
  const professionals = clinic?.professionals || [];
  const services = clinic?.services || [];

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Selecione o Profissional e o Serviço</h2>
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Profissional
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {professionals.map((professional: any) => (
              <div
                key={professional.id}
                onClick={() => setSelectedProfessional(professional.id)}
                className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                  selectedProfessional === professional.id 
                    ? 'border-[#e11d48] bg-[#e11d48]/5' 
                    : 'border-gray-200 hover:border-[#e11d48]'
                }`}
              >
                <div className="flex items-center">
                  <img 
                    src={professional.photo} 
                    alt={professional.name} 
                    className="w-12 h-12 rounded-full object-cover mr-4"
                  />
                  <div>
                    <h3 className="font-medium text-gray-900">{professional.name}</h3>
                    <p className="text-sm text-gray-500">{professional.specialty}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Serviço
          </label>
          <div className="space-y-3">
            {services.map((service: any) => (
              <div
                key={service.id}
                onClick={() => setSelectedService(service.id)}
                className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                  selectedService === service.id 
                    ? 'border-[#e11d48] bg-[#e11d48]/5' 
                    : 'border-gray-200 hover:border-[#e11d48]'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-gray-900">{service.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">{service.description}</p>
                    <div className="flex items-center mt-2 text-sm text-gray-500">
                      <Clock className="h-4 w-4 mr-1" />
                      <span>{service.duration}</span>
                    </div>
                  </div>
                  <span className="font-semibold text-gray-900">{service.price}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-8 flex justify-between">
        <Button 
          variant="outline"
          onClick={handlePreviousStep}
          className="border-gray-300 text-gray-700"
          disabled={currentStep === 0}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <Button 
          onClick={handleNextStep}
          disabled={!selectedProfessional || !selectedService}
          className="bg-[#e11d48] text-white hover:bg-[#f43f5e]"
        >
          Próximo
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};

export default StepProfessionalService;