import React from 'react';
import { Link } from 'react-router-dom';
import { Star, ChevronRight } from 'lucide-react';
import { Button } from '../ui/button';

export function ClinicAvaliacoes({ clinicId, rating, reviewCount, reviews }: {
  clinicId: string;
  rating?: number | string | null;
  reviewCount?: number;
  reviews?: any[];
}) {
  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Avaliações</h2>
      <div className="mb-6 flex items-center">
        <div className="bg-gray-100 rounded-lg p-4 flex items-center mr-4">
          <span className="text-3xl font-bold text-gray-900">{rating ?? '--'}</span>
          <div className="ml-2">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  className={`h-4 w-4 ${i < Math.floor(Number(rating) || 0) ? 'text-yellow-400' : 'text-gray-300'}`} 
                  fill={i < Math.floor(Number(rating) || 0) ? 'currentColor' : 'none'}
                />
              ))}
            </div>
            <span className="text-xs text-gray-500">{reviewCount ?? 0} avaliações</span>
          </div>
        </div>
        <Link to={`/avaliar/${clinicId}`}>
          <Button className="bg-[#e11d48] text-white hover:bg-[#f43f5e]">
            Avaliar
          </Button>
        </Link>
      </div>
      <div className="space-y-6">
        {(reviews || []).map((review: any) => (
          <div key={review.id} className="border-b border-gray-200 pb-6 last:border-0 last:pb-0">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-medium text-gray-900">{review.userName}</h3>
              <span className="text-sm text-gray-500">
                {new Date(review.date).toLocaleDateString('pt-BR')}
              </span>
            </div>
            <div className="flex mb-2">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  className={`h-4 w-4 ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                  fill={i < review.rating ? 'currentColor' : 'none'}
                />
              ))}
            </div>
            <p className="text-gray-600">{review.comment}</p>
          </div>
        ))}
      </div>
      <Link to={`/avaliacoes/${clinicId}`} className="text-[#e11d48] hover:text-[#f43f5e] font-medium flex items-center mt-4">
        Ver todas as avaliações
        <ChevronRight className="h-4 w-4 ml-1" />
      </Link>
    </div>
  );
}