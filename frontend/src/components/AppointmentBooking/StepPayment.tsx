import React from 'react';
import { Button } from '../ui/button';
import { User, FileText, Calendar, MessageSquare, CreditCard, Check, ChevronLeft } from 'lucide-react';

const StepPayment = ({
  clinic,
  selectedProfessional,
  selectedService,
  selectedDate,
  selectedTime,
  user,
  paymentMethod,
  setPaymentMethod,
  handlePreviousStep,
  handleCompleteBooking,
}: any) => {
  // Proteção para dados indefinidos vindos da API
  const professional = clinic?.professionals?.find((p: any) => String(p.id) === String(selectedProfessional));
  const service = clinic?.services?.find((s: any) => String(s.id) === String(selectedService));

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Pagamento e Confirmação</h2>
      <div className="bg-gray-50 rounded-lg p-6 mb-6">
        <h3 className="text-lg font-medium text-gray-800 mb-4">Resumo do Agendamento</h3>
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
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-800 mb-4">Forma de Pagamento</h3>
        <div className="space-y-3">
          <div 
            onClick={() => setPaymentMethod('credit')}
            className={`border rounded-lg p-4 cursor-pointer transition-colors ${
              paymentMethod === 'credit' 
                ? 'border-[#e11d48] bg-[#e11d48]/5' 
                : 'border-gray-200 hover:border-[#e11d48]'
            }`}
          >
            <div className="flex items-center">
              <CreditCard className="h-5 w-5 text-gray-500 mr-3" />
              <div>
                <p className="font-medium text-gray-900">Cartão de Crédito</p>
                <p className="text-sm text-gray-500">Pague em até 12x</p>
              </div>
            </div>
          </div>
          <div 
            onClick={() => setPaymentMethod('pix')}
            className={`border rounded-lg p-4 cursor-pointer transition-colors ${
              paymentMethod === 'pix' 
                ? 'border-[#e11d48] bg-[#e11d48]/5' 
                : 'border-gray-200 hover:border-[#e11d48]'
            }`}
          >
            <div className="flex items-center">
              <svg className="h-5 w-5 text-gray-500 mr-3" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <div>
                <p className="font-medium text-gray-900">PIX</p>
                <p className="text-sm text-gray-500">Pagamento instantâneo</p>
              </div>
            </div>
          </div>
          <div 
            onClick={() => setPaymentMethod('clinic')}
            className={`border rounded-lg p-4 cursor-pointer transition-colors ${
              paymentMethod === 'clinic' 
                ? 'border-[#e11d48] bg-[#e11d48]/5' 
                : 'border-gray-200 hover:border-[#e11d48]'
            }`}
          >
            <div className="flex items-center">
              <svg className="h-5 w-5 text-gray-500 mr-3" viewBox="0 0 24 24" fill="none">
                <path d="M19 5H5C3.89543 5 3 5.89543 3 7V17C3 18.1046 3.89543 19 5 19H19C20.1046 19 21 18.1046 21 17V7C21 5.89543 20.1046 5 19 5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M3 7L12 13L21 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <div>
                <p className="font-medium text-gray-900">Pagar na Clínica</p>
                <p className="text-sm text-gray-500">Dinheiro, cartão ou outros métodos</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-8 flex justify-between">
        <Button 
          variant="outline"
          onClick={handlePreviousStep}
          className="border-gray-300 text-gray-700"
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <Button 
          onClick={handleCompleteBooking}
          disabled={!paymentMethod}
          className="bg-[#e11d48] text-white hover:bg-[#f43f5e]"
        >
          Confirmar Agendamento
          <Check className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};

export default StepPayment;