import React from 'react';
import { MapPin, Star } from 'lucide-react';

interface Clinic {
  id: number;
  name: string;
  specialties?: string[];
  customSpecialties?: string[];
  coverImage?: string;
  rating?: number | null;
  reviews?: number;
  address?: string;
  street?: string;
  number?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  cep?: string;
}

interface ClinicCardProps {
  clinic: Clinic;
  onClick?: (id: number) => void;
}

const getImageUrl = (url?: string) => {
  if (!url || url === 'null' || url === 'undefined' || url.trim() === '') return '/placeholder-clinic.jpg';
  if (url.startsWith('http') || url.startsWith('blob:')) return url;
  return `http://localhost:3001${url.startsWith('/') ? url : '/' + url}`;
};

// Função utilitária para montar endereço sempre atualizado
const getClinicAddress = (clinic: Clinic) => {
  const addressParts = [
    clinic.street,
    clinic.number,
    clinic.neighborhood,
    clinic.city,
    clinic.state,
    clinic.cep,
  ].filter(Boolean);
  if (addressParts.length > 0) {
    return addressParts.join(', ');
  }
  // Fallback: se não houver campos separados, usa o campo address antigo
  return clinic.address || 'Endereço não informado';
};

const ClinicCard: React.FC<ClinicCardProps> = ({ clinic, onClick }) => {
  const imgSrc = getImageUrl(clinic.coverImage);

  const handleImgError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.onerror = null;
    e.currentTarget.src = '/placeholder-clinic.jpg';
  };

  return (
    <div
      className="bg-white rounded-xl shadow-md overflow-visible flex flex-col h-full cursor-pointer transition-transform hover:scale-[1.02] border border-gray-100"
      onClick={() => onClick?.(clinic.id)}
      tabIndex={0}
      aria-label={`Ver detalhes da clínica ${clinic.name}`}
      onKeyPress={e => {
        if (e.key === 'Enter') onClick?.(clinic.id);
      }}
    >
      {/* Use aspect ratio para evitar corte no hover */}
      <div className="aspect-[16/9] w-full overflow-hidden rounded-t-xl">
        <img
          src={imgSrc}
          alt={`Imagem da clínica ${clinic.name}`}
          className="w-full h-full object-cover"
          onError={handleImgError}
        />
      </div>
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="font-semibold text-gray-900 mb-1">{clinic.name}</h3>
        <p className="text-sm text-gray-500 mb-2">
          {[...(clinic.specialties || []), ...(clinic.customSpecialties || [])].join(', ') || 'Especialidade não informada'}
        </p>
        <div className="flex items-center mb-2">
          <MapPin className="h-4 w-4 text-gray-400 mr-1" aria-hidden="true" />
          <span className="text-xs text-gray-500">
            {getClinicAddress(clinic)}
          </span>
        </div>
        <div className="flex items-center justify-between mt-auto">
          <div className="flex items-center">
            <Star className="h-4 w-4 text-yellow-400 mr-1" aria-hidden="true" />
            <span className="text-sm font-medium">{clinic.rating ?? '--'}</span>
            <span className="text-sm text-gray-500 ml-1">
              {clinic.reviews ? `(${clinic.reviews})` : ''}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClinicCard;