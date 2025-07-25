import React from 'react';
import { Star } from 'lucide-react';
import { Button } from '../ui/button';

// Exportando para reuso se necessário
export interface Review {
  id: number;
  clinicName: string;
  professionalName: string;
  service: string;
  date: string;
  rating: number;
  comment: string;
}

export interface UserProfileReviewsProps {
  reviews: Review[];
  loading?: boolean;
  error?: string | null;
}

/**
 * Lista de avaliações do usuário, com layout aprimorado e feedback amigável.
 */
const UserProfileReviews: React.FC<UserProfileReviewsProps> = ({
  reviews,
  loading = false,
  error = null
}) => {
  if (loading) {
    return (
      <div className="py-12 text-center text-gray-500">Carregando avaliações...</div>
    );
  }
  if (error) {
    return (
      <div className="py-12 text-center text-red-500">{error}</div>
    );
  }

  return (
    <section>
      <h2 className="text-2xl font-bold text-gray-900 mb-8">Minhas Avaliações</h2>
      <div className="space-y-8">
        {reviews.length === 0 && (
          <div className="text-center py-10 text-gray-500">
            Você ainda não fez nenhuma avaliação.
          </div>
        )}
        {reviews.map((review) => (
          <div key={review.id} className="bg-gray-50 border border-gray-200 rounded-xl p-6 shadow-sm transition hover:shadow-md">
            <div className="flex items-center justify-between mb-3 flex-wrap gap-4">
              <div>
                <h3 className="font-semibold text-gray-900">{review.clinicName}</h3>
                <p className="text-gray-600">{review.service} com {review.professionalName}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {new Date(review.date).toLocaleDateString('pt-BR')}
                </p>
              </div>
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                    fill={i < review.rating ? 'currentColor' : 'none'}
                    aria-label={i < review.rating ? 'cheia' : 'vazia'}
                  />
                ))}
              </div>
            </div>
            <p className="text-gray-700 leading-relaxed">{review.comment}</p>
            <div className="mt-4 flex justify-end">
              <Button
                variant="outline"
                size="sm"
                className="text-[#e11d48] border-[#e11d48] hover:bg-[#e11d48] hover:text-white transition"
                onClick={() => window.location.href = `/editar-avaliacao/${review.id}`}
              >
                Editar Avaliação
              </Button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default UserProfileReviews;