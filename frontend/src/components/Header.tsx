import React from 'react';
import { Link, useLocation } from 'react-router-dom';

interface HeaderProps {
  title?: string;
  showBackButton?: boolean;
  backUrl?: string;
}

const Header: React.FC<HeaderProps> = ({
  title = "ClínicasLink",
  showBackButton = false,
  backUrl = "/"
}) => {
  const location = useLocation();

  // Corrigido: Esconde as ações se showBackButton está ativo OU se está nas rotas já previstas
  const hideActions =
    showBackButton ||
    [
      "/login",
      "/login-paciente",
      "/login-clinica",
      "/area-usuario",
      "/admin",
      "/perfil"
    ].includes(location.pathname);

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-white shadow-md py-4">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <div className="flex items-center">
          {showBackButton && (
            <Link to={backUrl} className="mr-4 text-gray-600 hover:text-[#e11d48]">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
          )}
          <Link to="/" className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#0ea5e9]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <span className="ml-2 text-xl font-bold">
              <span className="text-[#0ea5e9]">Clínicas</span>
              <span className="text-[#e11d48]">Link</span>
            </span>
          </Link>
        </div>
        <div className="flex items-center">
          {!hideActions && (
            <>
              <Link to="/login" className="px-4 py-2 text-gray-600 hover:text-[#e11d48]">
                Login
              </Link>
              <Link to="/cadastro-clinica" className="bg-[#e11d48] text-white px-4 py-2 rounded-full hover:bg-[#f43f5e] transition-colors ml-2 font-medium shadow-sm">
                Cadastre sua Clínica
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;