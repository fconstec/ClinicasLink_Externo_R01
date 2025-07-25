import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

interface HeaderPrivateProps {
  title?: string;
  showBackButton?: boolean;
  backUrl?: string;
}

const HeaderPrivate: React.FC<HeaderPrivateProps> = ({
  title = "ClínicasLink",
  showBackButton = true,
  backUrl = ""
}) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (backUrl) {
      navigate(backUrl);
    } else {
      navigate(-1);
    }
  };

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-white shadow-md py-4">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <div className="flex items-center">
          {showBackButton && (
            <button
              onClick={handleBack}
              className="mr-4 text-gray-600 hover:text-[#e11d48] focus:outline-none"
              title="Voltar"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
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
        <div />
      </div>
    </header>
  );
};

export default HeaderPrivate;