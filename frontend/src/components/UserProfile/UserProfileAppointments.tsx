import React from 'react';
import { Calendar, MapPin } from 'lucide-react';
import { Button } from '../ui/button';
import { useNavigate } from 'react-router-dom';

// Tipagem exportada para reuso se necessário em outros componentes
export interface Appointment {
  id: number;
  clinicName: string;
  clinicAddress: string;
  professionalName: string;
  service: string;
  date: string;   // formato: 'YYYY-MM-DD'
  time: string;   // formato: 'HH:mm'
  status: string; // 'scheduled' | 'completed'
  price: string;
}

interface UserProfileAppointmentsProps {
  appointments: Appointment[];
  handleCancelAppointment: (id: number) => void;
  loading?: boolean;
  error?: string | null;
  onReload?: () => void;
}

/**
 * Componente de exibição dos agendamentos do usuário.
 * Divide em duas listas: próximos e históricos.
 * O layout tem espaçamentos maiores, cartões mais suaves e responsividade aprimorada.
 */
const UserProfileAppointments: React.FC<UserProfileAppointmentsProps> = ({
  appointments,
  handleCancelAppointment,
  loading = false,
  error = null,
  onReload,
}) => {
  const navigate = useNavigate();
  const scheduled = appointments.filter(a => a.status === 'scheduled');
  const completed = appointments.filter(a => a.status === 'completed');

  if (loading) {
    return (
      <div className="py-12 flex items-center justify-center">
        <span className="text-gray-500">Carregando agendamentos...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-12 flex flex-col items-center justify-center">
        <span className="text-red-500 mb-2">{error}</span>
        {onReload && (
          <Button onClick={onReload}>Tentar novamente</Button>
        )}
      </div>
    );
  }

  return (
    <section>
      <h2 className="text-2xl font-bold text-gray-900 mb-8">Meus Agendamentos</h2>
      <div className="space-y-10">
        {/* Próximos Agendamentos */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Próximos Agendamentos</h3>
          <div className="space-y-4">
            {scheduled.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-3">Você não tem agendamentos futuros.</p>
                <Button 
                  className="mt-2 bg-[#e11d48] text-white font-semibold hover:bg-[#f43f5e]"
                  onClick={() => navigate('/')}
                >
                  Agendar Consulta
                </Button>
              </div>
            )}
            {scheduled.map(appointment => (
              <div
                key={appointment.id}
                className="bg-gray-50 border border-gray-200 rounded-xl p-5 flex flex-col md:flex-row md:items-center md:justify-between shadow-sm transition hover:shadow-md"
              >
                <div>
                  <h4 className="font-semibold text-gray-900">{appointment.clinicName}</h4>
                  <p className="text-gray-600">{appointment.service} com {appointment.professionalName}</p>
                  <div className="flex items-center mt-2 text-sm text-gray-500">
                    <Calendar className="h-4 w-4 mr-1" />
                    {new Date(appointment.date).toLocaleDateString('pt-BR')} às {appointment.time}
                  </div>
                  <div className="flex items-center mt-1 text-sm text-gray-500">
                    <MapPin className="h-4 w-4 mr-1" />
                    {appointment.clinicAddress}
                  </div>
                </div>
                <div className="mt-4 md:mt-0 flex flex-col md:items-end">
                  <span className="font-semibold text-gray-900 mb-2">{appointment.price}</span>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="text-[#e11d48] border-[#e11d48] hover:bg-[#e11d48] hover:text-white"
                      onClick={() => navigate(`/reagendar/${appointment.id}`)}
                    >
                      Reagendar
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="text-gray-700 border-gray-300 hover:bg-gray-100"
                      onClick={() => handleCancelAppointment(appointment.id)}
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Histórico de Agendamentos */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Histórico de Agendamentos</h3>
          <div className="space-y-4">
            {completed.length === 0 && (
              <div className="text-center py-10">
                <p className="text-gray-500">Você não tem histórico de agendamentos.</p>
              </div>
            )}
            {completed.map(appointment => (
              <div
                key={appointment.id}
                className="bg-gray-50 border border-gray-200 rounded-xl p-5 flex flex-col md:flex-row md:items-center md:justify-between shadow-sm transition hover:shadow-md"
              >
                <div>
                  <h4 className="font-semibold text-gray-900">{appointment.clinicName}</h4>
                  <p className="text-gray-600">{appointment.service} com {appointment.professionalName}</p>
                  <div className="flex items-center mt-2 text-sm text-gray-500">
                    <Calendar className="h-4 w-4 mr-1" />
                    {new Date(appointment.date).toLocaleDateString('pt-BR')} às {appointment.time}
                  </div>
                  <div className="flex items-center mt-1 text-sm text-gray-500">
                    <MapPin className="h-4 w-4 mr-1" />
                    {appointment.clinicAddress}
                  </div>
                </div>
                <div className="mt-4 md:mt-0">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="text-[#e11d48] border-[#e11d48] hover:bg-[#e11d48] hover:text-white"
                    onClick={() => navigate(`/avaliar/${appointment.id}`)}
                  >
                    Avaliar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default UserProfileAppointments;