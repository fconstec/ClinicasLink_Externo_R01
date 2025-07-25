import React from 'react';
import { Link } from 'react-router-dom';
import { Star, ChevronRight } from 'lucide-react';
import { Button } from '../ui/button';

// Caminho para avatar genérico (ajuste conforme sua estrutura)
const DEFAULT_AVATAR = '/default-avatar.png';

const getImageUrl = (url?: string) => {
  if (!url) return DEFAULT_AVATAR;
  if (/^https?:\/\//.test(url) || url.startsWith('blob:')) return url;
  if (url.startsWith('data:image')) return url;
  if (/^[A-Za-z0-9+/=]+$/.test(url) && url.length > 100) {
    return `data:image/png;base64,${url}`;
  }
  return `http://localhost:3001${url.startsWith('/') ? url : `/${url}`}`;
};

export function ClinicProfissionais({ clinicId, professionals }: {
  clinicId: string;
  professionals: any[];
}) {
  if (!professionals?.length) {
    return <div className="text-gray-500 mb-4">Nenhum profissional cadastrado.</div>;
  }
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {professionals.map((professional: any) => (
        <div key={professional.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="p-4">
            <div className="flex items-center">
              <img 
                src={getImageUrl(professional.photo)}
                alt={professional.name}
                className="w-16 h-16 rounded-full object-cover mr-4"
                loading="lazy"
                onError={e => { 
                  e.currentTarget.onerror = null; 
                  e.currentTarget.src = DEFAULT_AVATAR; 
                }}
              />
              <div>
                <h3 className="font-medium text-gray-900">{professional.name}</h3>
                <p className="text-sm text-gray-500">
                  {Array.isArray(professional.specialty)
                    ? professional.specialty[0] || ''
                    : professional.specialty || ''}
                </p>
              </div>
            </div>
            {professional.rating !== undefined && (
              <div className="mt-4 flex items-center">
                <Star className="h-4 w-4 text-yellow-400 mr-1" />
                <span className="text-sm font-medium">{professional.rating}</span>
                <span className="text-xs text-gray-500 ml-1">
                  ({professional.reviewCount ?? 0} avaliações)
                </span>
              </div>
            )}
            <div className="mt-4 flex justify-between">
              <Link to={`/agendar/${clinicId}?professional=${professional.id}`}>
                <Button className="bg-[#e11d48] text-white hover:bg-[#f43f5e] text-sm">
                  Agendar
                </Button>
              </Link>
              <Link to={`/profissional/${professional.id}`} className="text-[#e11d48] hover:text-[#f43f5e] text-sm flex items-center">
                Ver perfil
                <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}