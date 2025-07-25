import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Calendar, 
  MessageSquare, 
  AlertCircle, 
  Info,
  Check,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Button } from './ui/button';
import Header from './Header';

interface Notification {
  id: string;
  type: 'appointment' | 'message' | 'alert' | 'info';
  title: string;
  message: string;
  date: string;
  read: boolean;
  actionUrl?: string;
  actionText?: string;
}

interface NotificationSystemProps {
  standalone?: boolean;
}

const NotificationSystem: React.FC<NotificationSystemProps> = ({ standalone = true }) => {
  // Estado para as notificações
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  
  // Constantes para paginação
  const itemsPerPage = 5;
  
  // Dados simulados de notificações
  const mockNotifications: Notification[] = [
    {
      id: '1',
      type: 'appointment',
      title: 'Lembrete de Consulta',
      message: 'Sua consulta com Dr. João Silva na Clínica Fisioterapia Movimento está agendada para amanhã às 09:00.',
      date: '2025-05-28T14:30:00',
      read: false,
      actionUrl: '/agendar/1',
      actionText: 'Ver Detalhes'
    },
    {
      id: '2',
      type: 'message',
      title: 'Nova Mensagem',
      message: 'Você recebeu uma nova mensagem da Clínica Odonto Saúde Integral sobre sua consulta.',
      date: '2025-05-27T10:15:00',
      read: true,
      actionUrl: '/chat/2',
      actionText: 'Responder'
    },
    {
      id: '3',
      type: 'alert',
      title: 'Consulta Cancelada',
      message: 'Sua consulta de Avaliação Facial no Centro de Harmonização Facial foi cancelada pela clínica.',
      date: '2025-05-26T16:45:00',
      read: false,
      actionUrl: '/reagendar/3',
      actionText: 'Reagendar'
    },
    {
      id: '4',
      type: 'info',
      title: 'Promoção Especial',
      message: 'A Clínica Fisioterapia Movimento está com 20% de desconto em sessões de Pilates durante este mês.',
      date: '2025-05-25T09:00:00',
      read: true,
      actionUrl: '/clinica/1',
      actionText: 'Ver Clínica'
    },
    {
      id: '5',
      type: 'appointment',
      title: 'Consulta Confirmada',
      message: 'Sua consulta de Sessão de Fisioterapia foi confirmada para 08/06/2025 às 09:00.',
      date: '2025-05-24T11:20:00',
      read: true,
      actionUrl: '/agendar/4',
      actionText: 'Ver Detalhes'
    },
    {
      id: '6',
      type: 'message',
      title: 'Nova Mensagem',
      message: 'Dr. João Silva enviou uma mensagem sobre seu tratamento.',
      date: '2025-05-23T15:30:00',
      read: false,
      actionUrl: '/chat/1',
      actionText: 'Responder'
    },
    {
      id: '7',
      type: 'info',
      title: 'Avaliação Solicitada',
      message: 'Compartilhe sua experiência sobre a consulta com Dra. Maria Oliveira.',
      date: '2025-05-22T14:00:00',
      read: false,
      actionUrl: '/avaliar/2',
      actionText: 'Avaliar'
    }
  ];
  
  // Efeito para carregar as notificações
  useEffect(() => {
    // Aqui seria feita a integração com o backend para buscar as notificações
    setNotifications(mockNotifications);
  }, []);
  
  // Função para marcar uma notificação como lida
  const markAsRead = (id: string) => {
    setNotifications(notifications.map(notification => 
      notification.id === id ? { ...notification, read: true } : notification
    ));
  };
  
  // Função para marcar todas as notificações como lidas
  const markAllAsRead = () => {
    setNotifications(notifications.map(notification => ({ ...notification, read: true })));
  };
  
  // Função para excluir uma notificação
  const deleteNotification = (id: string) => {
    setNotifications(notifications.filter(notification => notification.id !== id));
  };
  
  // Filtrar notificações com base no filtro ativo
  const filteredNotifications = notifications.filter(notification => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'unread') return !notification.read;
    return notification.type === activeFilter;
  });
  
  // Calcular total de páginas
  const totalPages = Math.ceil(filteredNotifications.length / itemsPerPage);
  
  // Obter notificações da página atual
  const currentNotifications = filteredNotifications.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  // Contar notificações não lidas
  const unreadCount = notifications.filter(notification => !notification.read).length;
  
  // Componente para o ícone da notificação com base no tipo
  const NotificationIcon = ({ type }: { type: string }) => {
    switch (type) {
      case 'appointment':
        return <Calendar className="h-5 w-5 text-[#e11d48]" />;
      case 'message':
        return <MessageSquare className="h-5 w-5 text-blue-500" />;
      case 'alert':
        return <AlertCircle className="h-5 w-5 text-orange-500" />;
      case 'info':
        return <Info className="h-5 w-5 text-green-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };
  
  // Componente para o dropdown de notificações (usado no header)
  const NotificationDropdown = () => (
    <div className="relative">
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="relative p-1 rounded-full text-gray-600 hover:text-[#e11d48] focus:outline-none"
      >
        <Bell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-[#e11d48] ring-2 ring-white"></span>
        )}
      </button>
      
      {isDropdownOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg z-50">
          <div className="p-3 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900">Notificações</h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-[#e11d48] hover:text-[#f43f5e]"
                >
                  Marcar todas como lidas
                </button>
              )}
            </div>
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {notifications.length > 0 ? (
              notifications.slice(0, 5).map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 border-b border-gray-100 hover:bg-gray-50 ${
                    !notification.read ? 'bg-[#e11d48]/5' : ''
                  }`}
                >
                  <div className="flex">
                    <div className="flex-shrink-0 mr-3">
                      <NotificationIcon type={notification.type} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(notification.date).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">{notification.message}</p>
                      {notification.actionUrl && (
                        <a
                          href={notification.actionUrl}
                          className="text-xs text-[#e11d48] hover:text-[#f43f5e] mt-1 inline-block"
                        >
                          {notification.actionText || 'Ver Detalhes'}
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-gray-500">
                <p>Nenhuma notificação</p>
              </div>
            )}
          </div>
          
          <div className="p-2 border-t border-gray-200">
            <a
              href="/notificacoes"
              className="block w-full text-center text-xs text-[#e11d48] hover:text-[#f43f5e] py-1"
            >
              Ver todas as notificações
            </a>
          </div>
        </div>
      )}
    </div>
  );
  
  // Se não for standalone, retornar apenas o dropdown
  if (!standalone) {
    return <NotificationDropdown />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Notificações" showBackButton={true} backUrl="/perfil" />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          {/* Cabeçalho com filtros */}
          <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center mb-4 sm:mb-0">
                <h1 className="text-xl font-semibold text-gray-900">Notificações</h1>
                {unreadCount > 0 && (
                  <span className="ml-2 px-2 py-1 text-xs font-medium rounded-full bg-[#e11d48] text-white">
                    {unreadCount} não lida{unreadCount > 1 ? 's' : ''}
                  </span>
                )}
              </div>
              
              <div className="flex space-x-2">
                <Button 
                  variant={activeFilter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setActiveFilter('all');
                    setCurrentPage(1);
                  }}
                  className={activeFilter === 'all' ? 'bg-[#e11d48] text-white' : 'text-gray-700'}
                >
                  Todas
                </Button>
                <Button 
                  variant={activeFilter === 'unread' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setActiveFilter('unread');
                    setCurrentPage(1);
                  }}
                  className={activeFilter === 'unread' ? 'bg-[#e11d48] text-white' : 'text-gray-700'}
                >
                  Não lidas
                </Button>
                <Button 
                  variant={activeFilter === 'appointment' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setActiveFilter('appointment');
                    setCurrentPage(1);
                  }}
                  className={activeFilter === 'appointment' ? 'bg-[#e11d48] text-white' : 'text-gray-700'}
                >
                  Consultas
                </Button>
                <Button 
                  variant={activeFilter === 'message' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setActiveFilter('message');
                    setCurrentPage(1);
                  }}
                  className={activeFilter === 'message' ? 'bg-[#e11d48] text-white' : 'text-gray-700'}
                >
                  Mensagens
                </Button>
              </div>
            </div>
            
            {unreadCount > 0 && (
              <div className="mt-4 flex justify-end">
                <button
                  onClick={markAllAsRead}
                  className="text-sm text-[#e11d48] hover:text-[#f43f5e] flex items-center"
                >
                  <Check className="h-4 w-4 mr-1" />
                  Marcar todas como lidas
                </button>
              </div>
            )}
          </div>
          
          {/* Lista de notificações */}
          <div className="space-y-4">
            {currentNotifications.length > 0 ? (
              currentNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`bg-white rounded-lg shadow-md overflow-hidden ${
                    !notification.read ? 'border-l-4 border-[#e11d48]' : ''
                  }`}
                >
                  <div className="p-4">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 mr-3">
                        <NotificationIcon type={notification.type} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="text-base font-semibold text-gray-900">{notification.title}</h3>
                          <p className="text-xs text-gray-500">
                            {new Date(notification.date).toLocaleDateString('pt-BR', {
                              day: '2-digit',
                              month: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                        
                        <div className="mt-3 flex items-center justify-between">
                          <div className="flex space-x-2">
                            {!notification.read && (
                              <button
                                onClick={() => markAsRead(notification.id)}
                                className="text-xs text-[#e11d48] hover:text-[#f43f5e] flex items-center"
                              >
                                <Check className="h-3 w-3 mr-1" />
                                Marcar como lida
                              </button>
                            )}
                            <button
                              onClick={() => deleteNotification(notification.id)}
                              className="text-xs text-gray-500 hover:text-gray-700 flex items-center"
                            >
                              <X className="h-3 w-3 mr-1" />
                              Excluir
                            </button>
                          </div>
                          
                          {notification.actionUrl && (
                            <a
                              href={notification.actionUrl}
                              className="text-xs text-[#e11d48] hover:text-[#f43f5e] font-medium"
                            >
                              {notification.actionText || 'Ver Detalhes'}
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <Bell className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-1">Nenhuma notificação</h3>
                <p className="text-gray-500">
                  {activeFilter === 'all'
                    ? 'Você não tem notificações no momento.'
                    : `Você não tem notificações do tipo "${activeFilter}".`}
                </p>
              </div>
            )}
          </div>
          
          {/* Paginação */}
          {totalPages > 1 && (
            <div className="mt-6 flex justify-center">
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="text-gray-700"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                <span className="text-sm text-gray-700">
                  Página {currentPage} de {totalPages}
                </span>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="text-gray-700"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default NotificationSystem;
