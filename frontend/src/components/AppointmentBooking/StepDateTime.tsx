import React from 'react';
import { Button } from '../ui/button';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

const StepDateTime = ({
  clinic,
  selectedDate,
  setSelectedDate,
  selectedTime,
  setSelectedTime,
  handleNextStep,
  handlePreviousStep,
}: any) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' });
  };

  // Proteção caso os dados venham da API e estejam indefinidos
  const availableDates = clinic?.availableDates || [];
  const availableTimes = clinic?.availableTimes || {};

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Selecione a Data e Horário</h2>
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Data
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {availableDates.map((date: string) => (
              <div
                key={date}
                onClick={() => setSelectedDate(date)}
                className={`border rounded-lg p-3 text-center cursor-pointer transition-colors ${
                  selectedDate === date 
                    ? 'border-[#e11d48] bg-[#e11d48]/5' 
                    : 'border-gray-200 hover:border-[#e11d48]'
                }`}
              >
                <p className="font-medium text-gray-900">{formatDate(date).split(',')[0]}</p>
                <p className="text-sm text-gray-500">{formatDate(date).split(',')[1]}</p>
              </div>
            ))}
          </div>
        </div>
        {selectedDate && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Horário
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {availableTimes[selectedDate as keyof typeof availableTimes]?.map((time: string) => (
                <div
                  key={time}
                  onClick={() => setSelectedTime(time)}
                  className={`border rounded-lg p-3 text-center cursor-pointer transition-colors ${
                    selectedTime === time 
                      ? 'border-[#e11d48] bg-[#e11d48]/5' 
                      : 'border-gray-200 hover:border-[#e11d48]'
                  }`}
                >
                  <p className="font-medium text-gray-900">{time}</p>
                </div>
              ))}
            </div>
          </div>
        )}
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
          onClick={handleNextStep}
          disabled={!selectedDate || !selectedTime}
          className="bg-[#e11d48] text-white hover:bg-[#f43f5e]"
        >
          Próximo
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};

export default StepDateTime;