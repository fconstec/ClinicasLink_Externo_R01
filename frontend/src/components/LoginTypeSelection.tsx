import React from 'react';
import { Link } from 'react-router-dom';
import Header from './Header';

const LoginTypeSelection: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <Header title="Escolha o tipo de login" showBackButton={true} backUrl="/" />
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <h2 className="text-2xl font-bold mb-8">Como deseja acessar?</h2>
        <div className="space-y-4 w-full max-w-xs">
          <Link
            to="/login-paciente"
            className="block w-full text-center bg-[#0ea5e9] text-white px-6 py-3 rounded-md hover:bg-[#38bdf8] transition-colors font-medium"
          >
            Perfil do Paciente
          </Link>
          <Link
            to="/login-clinica"
            className="block w-full text-center bg-[#e11d48] text-white px-6 py-3 rounded-md hover:bg-[#f43f5e] transition-colors font-medium"
          >
            Perfil da Clínica
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginTypeSelection;