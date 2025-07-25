import React from 'react';
import { Link } from 'react-router-dom';

const AreaUsuario: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 pt-24 flex flex-col items-center justify-center">
      <h2 className="text-2xl font-bold mb-8">Bem-vindo!</h2>
      <div className="space-x-4">
        <Link
          to="/meu-perfil"
          className="bg-[#0ea5e9] text-white px-6 py-3 rounded-md hover:bg-[#38bdf8] transition-colors"
        >
          Meu Perfil
        </Link>
        <Link
          to="/perfil-clinica"
          className="bg-[#e11d48] text-white px-6 py-3 rounded-md hover:bg-[#f43f5e] transition-colors"
        >
          Perfil da Clínica
        </Link>
      </div>
    </div>
  );
};

export default AreaUsuario;