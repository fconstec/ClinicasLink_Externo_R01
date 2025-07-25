import React from 'react';
import { Clock, BadgePercent, Info } from 'lucide-react';
import { Button } from '../ui/button';
import { Link } from 'react-router-dom';

function formatPrice(price: any) {
  if (!price) return 'Consultar';
  if (typeof price === 'number')
    return price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  if (!isNaN(Number(price)))
    return Number(price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  return price;
}

export function ClinicServicos({ clinicId, services }: {
  clinicId: string;
  services: any[];
}) {
  if (!services?.length) {
    return <div className="text-gray-500 mb-4">Nenhum serviço cadastrado.</div>;
  }
  return (
    <div className="space-y-4">
      {services.map((service: any) => (
        <div key={service.id} className="border border-gray-200 rounded-xl p-5 bg-gradient-to-br from-gray-50 to-white shadow-sm hover:shadow-lg transition group">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <BadgePercent className="h-5 w-5 text-[#e11d48] group-hover:text-[#be123c] transition" />
                <h3 className="font-semibold text-gray-900 text-lg">{service.name}</h3>
              </div>
              {service.description && (
                <p className="text-sm text-gray-600 mt-1 flex items-center gap-1">
                  <Info className="h-4 w-4 text-gray-400" /> {service.description}
                </p>
              )}
              <div className="flex items-center gap-1 mt-2">
                <Clock className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-500">
                  {service.duration ? service.duration : 'Duração não informada'}
                </span>
              </div>
            </div>
            <div className="flex flex-col items-start sm:items-end justify-between min-w-[120px]">
              <span className="font-bold text-lg text-[#e11d48] group-hover:text-[#be123c] transition">
                {formatPrice(service.price)}
              </span>
              <Link to={`/agendar/${clinicId}?service=${service.id}`} className="mt-3 w-full">
                <Button className="w-full bg-[#e11d48] text-white hover:bg-[#be123c] text-sm rounded-md px-5 py-2 shadow">
                  Agendar
                </Button>
              </Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}