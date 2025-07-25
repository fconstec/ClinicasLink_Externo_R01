import React from "react";
import { Search, Clock, Star } from "lucide-react";

const HowItWorksSection: React.FC = () => (
  <section className="py-12">
    <div className="container mx-auto px-4">
      <h2 className="text-2xl font-bold text-gray-900 text-center mb-12">Como Funciona</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="text-center">
          <div className="bg-[#0ea5e9] text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 shadow">
            <Search className="h-6 w-6" aria-hidden="true" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Busque</h3>
          <p className="text-gray-600">Encontre clínicas e profissionais de saúde próximos a você</p>
        </div>
        <div className="text-center">
          <div className="bg-[#0ea5e9] text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 shadow">
            <Clock className="h-6 w-6" aria-hidden="true" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Agende</h3>
          <p className="text-gray-600">Marque consultas e procedimentos em horários convenientes</p>
        </div>
        <div className="text-center">
          <div className="bg-[#0ea5e9] text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 shadow">
            <Star className="h-6 w-6" aria-hidden="true" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Avalie</h3>
          <p className="text-gray-600">Compartilhe sua experiência e ajude outros pacientes</p>
        </div>
      </div>
    </div>
  </section>
);

export default HowItWorksSection;