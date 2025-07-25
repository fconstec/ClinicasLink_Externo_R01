import React from 'react';
import { Button } from '../ui/button';
import { User, FileText, Calendar, MessageSquare, Check } from 'lucide-react';

const BookingConfirmation = ({
  clinic,
  selectedProfessional,
  selectedService,
  selectedDate,
  selectedTime,
  user,
  id,
}: any) => {
  // Busca profissional e serviço pelos IDs (dados reais vindos da API)
  const professional = clinic.professionals?.find((p: any) => String(p.id) === String(selectedProfessional));
  const service = clinic.services?.find((s: any) => String(s.id) === String(selectedService));

  return (
    <div className="text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-6">
        <Check className="h-8 w-8 text-green-600" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Agendamento Confirmado!</h2>
      <p className="text-gray-600 mb-8">Seu agendamento foi realizado com sucesso.</p>
      <div className="bg-gray-50 rounded-lg p-6 text-left mb-8">
        <h3 className="text-lg font-medium text-gray-800 mb-4">Detalhes do Agendamento</h3>
        <div className="space-y-3">
          <div className="flex items-start">
            <User className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
            <div>
              <p className="text-sm text-gray-500">Profissional</p>
              <p className="font-medium text-gray-900">{professional?.name}</p>
            </div>
          </div>
          <div className="flex items-start">
            <FileText className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
            <div>
              <p className="text-sm text-gray-500">Serviço</p>
              <p className="font-medium text-gray-900">{service?.name}</p>
              <p className="text-sm text-gray-500">{service?.duration}</p>
            </div>
          </div>
          <div className="flex items-start">
            <Calendar className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
            <div>
              <p className="text-sm text-gray-500">Data e Horário</p>
              <p className="font-medium text-gray-900">
                {selectedDate ? new Date(selectedDate).toLocaleDateString('pt-BR') : '--'} às {selectedTime}
              </p>
            </div>
          </div>
          <div className="flex items-start">
            <MessageSquare className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
            <div>
              <p className="text-sm text-gray-500">Paciente</p>
              <p className="font-medium text-gray-900">{user?.name}</p>
              <p className="text-sm text-gray-500">{user?.email}</p>
            </div>
          </div>
          <div className="border-t border-gray-200 pt-3 mt-3">
            <div className="flex justify-between items-center">
              <p className="font-medium text-gray-900">Valor Total</p>
              <p className="font-semibold text-gray-900">{service?.price}</p>
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row justify-center gap-4">
        <Button 
          variant="outline"
          onClick={() => window.location.href = `/clinica/${id}`}
          className="border-gray-300 text-gray-700"
        >
          Voltar para a Clínica
        </Button>
        <Button 
          onClick={() => window.location.href = '/meus-agendamentos'}
          className="bg-[#e11d48] text-white hover:bg-[#f43f5e]"
        >
          Ver Meus Agendamentos
        </Button>
      </div>
    </div>
  );
};

export default BookingConfirmation;