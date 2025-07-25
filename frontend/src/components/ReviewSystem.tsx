import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Star, 
  User,
  Send,
  ArrowLeft
} from 'lucide-react';
import { Button } from './ui/button';
import Header from './Header';

interface ReviewSystemProps {
  mode?: 'create' | 'edit';
}

const ReviewSystem: React.FC<ReviewSystemProps> = ({ mode = 'create' }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // Estados para os dados da avaliação
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState<string>('');
  const [isAnonymous, setIsAnonymous] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  
  // Dados simulados da consulta/clínica
  const appointmentData = {
    id: id || '1',
    clinicName: 'Clínica Fisioterapia Movimento',
    clinicAddress: 'Av. Paulista, 1000, São Paulo - SP',
    professionalName: 'Dr. João Silva',
    professionalSpecialty: 'Fisioterapia Ortopédica',
    service: 'Avaliação Fisioterapêutica',
    date: '2025-05-20',
    time: '09:00',
    clinicImage: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?q=80&w=2068&auto=format&fit=crop'
  };
  
  // Dados simulados da avaliação existente (para modo de edição )
  const existingReview = {
    id: '1',
    rating: 4,
    comment: 'Excelente atendimento! O Dr. João é muito atencioso e competente. Minha recuperação foi mais rápida do que eu esperava.',
    isAnonymous: false,
    createdAt: '2025-05-21'
  };
  
  // Efeito para carregar dados existentes no modo de edição
  useEffect(() => {
    if (mode === 'edit') {
      setRating(existingReview.rating);
      setComment(existingReview.comment);
      setIsAnonymous(existingReview.isAnonymous);
    }
  }, [mode]);
  
  // Função para lidar com o envio da avaliação
  const handleSubmitReview = () => {
    if (rating === 0) {
      alert('Por favor, selecione uma classificação de 1 a 5 estrelas.');
      return;
    }
    
    setIsSubmitting(true);
    
    // Aqui seria feita a integração com o backend para salvar a avaliação
    setTimeout(() => {
      console.log('Avaliação enviada:', {
        appointmentId: id,
        rating,
        comment,
        isAnonymous,
        mode
      });
      
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 1000);
  };
  
  // Componente para exibir as estrelas de avaliação
  const RatingStars = () => (
    <div className="flex">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => setRating(star)}
          onMouseEnter={() => setHoverRating(star)}
          onMouseLeave={() => setHoverRating(0)}
          className="focus:outline-none"
        >
          <Star
            className={`h-8 w-8 ${
              (hoverRating ? star <= hoverRating : star <= rating)
                ? 'text-yellow-400 fill-yellow-400'
                : 'text-gray-300'
            }`}
          />
        </button>
      ))}
    </div>
  );
  
  // Componente para a tela de confirmação após envio
  const SubmissionConfirmation = () => (
    <div className="text-center py-8">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-6">
        <Star className="h-8 w-8 text-green-600 fill-green-600" />
      </div>
      
      <h2 className="text-2xl font-bold text-gray-900 mb-2">
        {mode === 'create' ? 'Avaliação Enviada!' : 'Avaliação Atualizada!'}
      </h2>
      <p className="text-gray-600 mb-8">
        {mode === 'create' 
          ? 'Obrigado por compartilhar sua experiência. Sua avaliação ajuda outros pacientes a encontrarem os melhores profissionais.'
          : 'Sua avaliação foi atualizada com sucesso.'}
      </p>
      
      <div className="flex flex-col sm:flex-row justify-center gap-4">
        <Button 
          variant="outline"
          onClick={() => navigate(`/clinica/${appointmentData.id.split('-')[0]}`)}
          className="border-gray-300 text-gray-700"
        >
          Ver Clínica
        </Button>
        <Button 
          onClick={() => navigate('/perfil')}
          className="bg-[#e11d48] text-white hover:bg-[#f43f5e]"
        >
          Voltar ao Perfil
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        title={mode === 'create' ? 'Avaliar Consulta' : 'Editar Avaliação'} 
        showBackButton={true} 
        backUrl="/perfil"
      />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
          {!isSubmitted ? (
            <>
              {/* Informações da Consulta */}
              <div className="bg-gray-50 p-6 border-b border-gray-200">
                <div className="flex items-center">
                  <div className="w-16 h-16 rounded-lg overflow-hidden mr-4">
                    <img 
                      src={appointmentData.clinicImage} 
                      alt={appointmentData.clinicName} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">{appointmentData.clinicName}</h2>
                    <p className="text-gray-600">{appointmentData.service} com {appointmentData.professionalName}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(appointmentData.date).toLocaleDateString('pt-BR')} às {appointmentData.time}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Formulário de Avaliação */}
              <div className="p-6">
                <div className="mb-8">
                  <label className="block text-lg font-medium text-gray-900 mb-2">
                    Como você avalia sua experiência?
                  </label>
                  <RatingStars />
                  <p className="mt-2 text-sm text-gray-500">
                    {rating === 1 && 'Muito ruim'}
                    {rating === 2 && 'Ruim'}
                    {rating === 3 && 'Regular'}
                    {rating === 4 && 'Bom'}
                    {rating === 5 && 'Excelente'}
                  </p>
                </div>
                
                <div className="mb-6">
                  <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-1">
                    Compartilhe sua experiência (opcional)
                  </label>
                  <textarea
                    id="comment"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={4}
                    placeholder="Conte-nos como foi sua experiência com o profissional e a clínica..."
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#e11d48]"
                  ></textarea>
                </div>
                
                <div className="mb-8">
                  <div className="flex items-center">
                    <input
                      id="anonymous"
                      type="checkbox"
                      checked={isAnonymous}
                      onChange={(e) => setIsAnonymous(e.target.checked)}
                      className="h-4 w-4 text-[#e11d48] focus:ring-[#e11d48] border-gray-300 rounded"
                    />
                    <label htmlFor="anonymous" className="ml-2 block text-sm text-gray-700">
                      Publicar como anônimo
                    </label>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button 
                    onClick={handleSubmitReview}
                    disabled={rating === 0 || isSubmitting}
                    className="bg-[#e11d48] text-white hover:bg-[#f43f5e]"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Enviando...
                      </span>
                     ) : (
                      <span className="flex items-center">
                        <Send className="h-4 w-4 mr-2" />
                        {mode === 'create' ? 'Enviar Avaliação' : 'Atualizar Avaliação'}
                      </span>
                    )}
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="p-6">
              <SubmissionConfirmation />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ReviewSystem;
