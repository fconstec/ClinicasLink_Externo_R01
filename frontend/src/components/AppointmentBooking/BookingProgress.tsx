import React from 'react';
import { Lock, User, Calendar, CreditCard } from 'lucide-react';

const BookingProgress = ({ currentStep }: { currentStep: number }) => (
  <div className="mb-8">
    <div className="flex items-center justify-between">
      <div className="flex flex-col items-center">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
          currentStep === 0 ? 'bg-[#e11d48] text-white' : 'bg-gray-200 text-gray-500'
        }`}>
          <Lock className="h-4 w-4" />
        </div>
        <span className="text-xs mt-1">Login</span>
      </div>
      <div className={`flex-1 h-1 mx-2 ${currentStep > 0 ? 'bg-[#e11d48]' : 'bg-gray-200'}`}></div>
      <div className="flex flex-col items-center">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
          currentStep === 1 ? 'bg-[#e11d48] text-white' : 'bg-gray-200 text-gray-500'
        }`}>
          <User className="h-4 w-4" />
        </div>
        <span className="text-xs mt-1">Serviço</span>
      </div>
      <div className={`flex-1 h-1 mx-2 ${currentStep > 1 ? 'bg-[#e11d48]' : 'bg-gray-200'}`}></div>
      <div className="flex flex-col items-center">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
          currentStep === 2 ? 'bg-[#e11d48] text-white' : 'bg-gray-200 text-gray-500'
        }`}>
          <Calendar className="h-4 w-4" />
        </div>
        <span className="text-xs mt-1">Data</span>
      </div>
      <div className={`flex-1 h-1 mx-2 ${currentStep > 2 ? 'bg-[#e11d48]' : 'bg-gray-200'}`}></div>
      <div className="flex flex-col items-center">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
          currentStep === 3 ? 'bg-[#e11d48] text-white' : 'bg-gray-200 text-gray-500'
        }`}>
          <CreditCard className="h-4 w-4" />
        </div>
        <span className="text-xs mt-1">Pagamento</span>
      </div>
    </div>
  </div>
);

export default BookingProgress;