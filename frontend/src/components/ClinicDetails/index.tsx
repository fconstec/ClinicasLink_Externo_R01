import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Phone, Star, Calendar } from 'lucide-react';
import { Button } from '../ui/button';
import Header from '../Header';

import { ClinicGallery, GalleryModal } from './ClinicGallery';
import { ClinicTabs, TabType } from './ClinicTabs';
import { ClinicSobre } from './ClinicSobre';
import { ClinicProfissionais } from './ClinicProfissionais';
import { ClinicServicos } from './ClinicServicos';

type Professional = {
  id: string;
  name: string;
  photo?: string;
  specialty?: string | string[];
  rating?: number;
  reviewCount?: number;
};

type Service = {
  id: string;
  name: string;
  [key: string]: any;
};

type Review = {
  id: string;
  userName?: string;
  comment?: string;
  rating?: number;
};

type Clinic = {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  rating?: number | string | null;
  reviewCount?: number;
  description?: string;
  openingHours?: string | object;
  specialties?: string[];
  coverUrl?: string | null;
  galleryUrls?: string[];
  professionals?: Professional[];
  services?: Service[];
  reviews?: Review[];
};

const getImageUrl = (url?: string | null) => {
  if (!url) return undefined;
  if (/^https?:\/\//.test(url) || url.startsWith('blob:')) return url;
  const backend = import.meta.env?.VITE_BACKEND_URL || 'http://localhost:3001';
  return `${backend}${url.startsWith('/') ? url : `/${url}`}`;
};

const ClinicDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [clinic, setClinic] = useState<Clinic | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('sobre');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalIndex, setModalIndex] = useState(0);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`http://localhost:3001/api/clinic-settings/${id}`)
      .then(res => {
        if (!res.ok) throw new Error('Clínica não encontrada');
        return res.json();
      })
      .then(data => {
        setClinic({
          id: String(data.id ?? id),
          name: data.name ?? '',
          address:
            data.address ||
            [
              data.street,
              data.number,
              data.neighborhood,
              data.city,
              data.state,
              data.cep,
            ]
              .filter(Boolean)
              .join(', ') ||
            'Endereço não informado',
          phone: data.phone ?? '',
          description: data.description ?? '',
          openingHours: data.openingHours ?? '', // string ou objeto
          specialties: data.specialties ?? [],
          coverUrl: data.coverUrl ?? '',
          galleryUrls: data.galleryUrls ?? [],
          professionals: data.professionals ?? [],
          services: data.services ?? [],
          reviews: data.reviews ?? [],
          rating: data.rating ?? null,
          reviewCount: data.reviewCount ?? 0,
        });
      })
      .catch((err) => setError(err.message || 'Erro ao carregar dados'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
        <span className="text-gray-400 text-lg">Carregando clínica...</span>
      </div>
    );
  }
  if (error || !clinic) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
        <span className="text-red-500 text-lg">{error || 'Clínica não encontrada'}</span>
      </div>
    );
  }

  const whatsappNumber = clinic.phone ? clinic.phone.replace(/\D/g, '') : '';
  const whatsappLink = whatsappNumber
    ? `https://wa.me/${whatsappNumber}?text=Ol%C3%A1%2C%20gostaria%20de%20informa%C3%A7%C3%B5es!`
    : undefined;

  const images: string[] = clinic.galleryUrls ?? [];
  const coverImg = getImageUrl(clinic.coverUrl) || (images.length > 0 ? getImageUrl(images[0]) : undefined);

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <Header title={clinic.name} showBackButton={true} backUrl="/" />
      <main className="container mx-auto px-4 py-8">
        {/* Hero section */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
          <div className="h-64 bg-gray-300 relative">
            {coverImg ? (
              <img
                src={coverImg}
                alt={clinic.name}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-200">
                {/* Ícone de imagem genérica */}
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            <div className="absolute bottom-0 left-0 p-6 text-white">
              <h1 className="text-2xl font-bold">{clinic.name}</h1>
            </div>
          </div>
          {/* Galeria de Imagens */}
          <ClinicGallery
            gallery={images}
            openModal={(idx) => {
              setModalOpen(true);
              setModalIndex(idx);
            }}
          />
          <div className="p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="space-y-4">
                <div className="flex items-start">
                  <MapPin className="h-5 w-5 text-gray-500 mr-2 mt-0.5" />
                  <span className="text-gray-600">{clinic.address}</span>
                </div>
                <div className="flex items-start">
                  <Phone className="h-5 w-5 text-gray-500 mr-2 mt-0.5" />
                  <span className="text-gray-600">{clinic.phone || 'Telefone não informado'}</span>
                </div>
              </div>
              <div className="mt-6 md:mt-0 flex flex-col sm:flex-row gap-4">
                {whatsappLink && (
                  <a
                    href={whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto flex items-center justify-center bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded transition font-medium"
                    style={{ minWidth: 180 }}
                    title="Enviar WhatsApp"
                  >
                    {/* SVG WhatsApp */}
                    <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M.057 24l1.687-6.163a11.928 11.928 0 0 1-1.587-5.945C.16 5.358 5.522 0 12.021 0c3.191 0 6.187 1.24 8.438 3.489a11.822 11.822 0 0 1 3.48 8.409c-.003 6.497-5.365 11.857-11.863 11.857a11.9 11.9 0 0 1-5.93-1.588L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.367 1.593 5.448.003 9.886-4.431 9.889-9.877.002-5.462-4.415-9.89-9.881-9.893C6.105 2.014 1.67 6.448 1.667 11.911c-.002 2.09.594 3.688 1.588 5.366l-.999 3.648 3.398-.732zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.767.967-.941 1.164-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.149-.669-1.611-.916-2.206-.242-.579-.487-.5-.669-.51-.173-.008-.372-.01-.571-.01-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.363.709.306 1.262.489 1.694.626.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                    </svg>
                    WhatsApp
                  </a>
                )}
                <Link to={`/agendar/${clinic.id}`}>
                  <Button className="w-full sm:w-auto bg-[#e11d48] text-white hover:bg-[#f43f5e]">
                    <Calendar className="h-4 w-4 mr-2" />
                    Agendar Consulta
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
        {/* Modal da galeria */}
        <GalleryModal
          gallery={images}
          modalOpen={modalOpen}
          modalIndex={modalIndex}
          setModalOpen={setModalOpen}
          setModalIndex={setModalIndex}
        />
        {/* Conteúdo das abas */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <ClinicTabs activeTab={activeTab} setActiveTab={setActiveTab} />
          <div className="p-6">
            {activeTab === 'sobre' && (
              <ClinicSobre
                description={clinic.description}
                specialties={clinic.specialties}
                openingHours={clinic.openingHours}
              />
            )}
            {activeTab === 'profissionais' && (
              <ClinicProfissionais 
                clinicId={clinic.id}
                professionals={clinic.professionals ?? []}
              />
            )}
            {activeTab === 'servicos' && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Serviços</h2>
                <ClinicServicos
                  clinicId={clinic.id}
                  services={clinic.services ?? []}
                />
              </div>
            )}
            {activeTab === 'avaliacoes' && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Avaliações</h2>
                <div className="flex items-center mb-2">
                  <Star className="h-5 w-5 text-yellow-400 mr-1" />
                  <span className="font-medium">{clinic.rating ?? '--'}</span>
                  <span className="text-sm ml-1">({clinic.reviewCount ?? 0} avaliações)</span>
                </div>
                {clinic.reviews && clinic.reviews.length > 0 ? (
                  <ul>
                    {clinic.reviews.map((rev: any, idx: number) => (
                      <li key={rev.id || idx}>
                        <div className="font-semibold">{rev.userName || 'Anônimo'}</div>
                        <div>{rev.comment || 'Sem comentário'}</div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <span className="text-gray-500">Nenhuma avaliação cadastrada.</span>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ClinicDetails;