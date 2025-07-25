import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Send, 
  Paperclip, 
  Image, 
  Smile, 
  ChevronLeft,
  Phone,
  Video,
  MoreVertical,
  Clock,
  Check,
  CheckCheck
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import Header from './Header';

// Definindo tipos mais específicos
type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read';
type MessageSender = 'user' | 'clinic';
type AttachmentType = 'image' | 'document';

interface Attachment {
  type: AttachmentType;
  url: string;
  name?: string;
}

interface Message {
  id: string;
  sender: MessageSender;
  content: string;
  timestamp: string;
  status: MessageStatus;
  attachment?: Attachment;
}

interface Chat {
  id: string;
  clinicId: string;
  clinicName: string;
  clinicLogo: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  isOnline: boolean;
  messages: Message[];
}

interface ChatSystemProps {
  mode?: 'list' | 'conversation';
}

const ChatSystem: React.FC<ChatSystemProps> = ({ mode = 'list' }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Estados para o chat
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [newMessage, setNewMessage] = useState<string>('');
  const [isAttaching, setIsAttaching] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Dados simulados de chats
  const mockChats: Chat[] = [
    {
      id: '1',
      clinicId: '1',
      clinicName: 'Clínica Fisioterapia Movimento',
      clinicLogo: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?q=80&w=2068&auto=format&fit=crop',
      lastMessage: 'Olá Ana, tudo bem? Confirmo sua consulta para amanhã às 9h.',
      lastMessageTime: '2025-05-28T14:30:00',
      unreadCount: 2,
      isOnline: true,
      messages: [
        {
          id: '101',
          sender: 'user',
          content: 'Olá, gostaria de confirmar minha consulta para amanhã.',
          timestamp: '2025-05-28T14:20:00',
          status: 'read'
        },
        {
          id: '102',
          sender: 'clinic',
          content: 'Olá Ana, tudo bem? Confirmo sua consulta para amanhã às 9h.',
          timestamp: '2025-05-28T14:30:00',
          status: 'read'
        }
      ]
    },
    {
      id: '2',
      clinicId: '2',
      clinicName: 'Odonto Saúde Integral',
      clinicLogo: 'https://images.unsplash.com/photo-1629909615184-74f495363b67?q=80&w=2069&auto=format&fit=crop',
      lastMessage: 'Enviamos os resultados dos seus exames. Por favor, confira.',
      lastMessageTime: '2025-05-27T10:15:00',
      unreadCount: 1,
      isOnline: false,
      messages: [
        {
          id: '201',
          sender: 'clinic',
          content: 'Olá Ana, seus exames estão prontos.',
          timestamp: '2025-05-27T10:00:00',
          status: 'read'
        },
        {
          id: '202',
          sender: 'clinic',
          content: 'Enviamos os resultados dos seus exames. Por favor, confira.',
          timestamp: '2025-05-27T10:15:00',
          status: 'delivered',
          attachment: {
            type: 'document',
            url: '/documents/exame.pdf',
            name: 'Resultado Exame.pdf'
          }
        }
      ]
    },
    {
      id: '3',
      clinicId: '3',
      clinicName: 'Centro de Harmonização Facial',
      clinicLogo: 'https://images.unsplash.com/photo-1629909615758-1f11c12c5eaa?q=80&w=2069&auto=format&fit=crop',
      lastMessage: 'Obrigado pelo seu feedback! Estamos felizes em ajudar.',
      lastMessageTime: '2025-05-25T16:45:00',
      unreadCount: 0,
      isOnline: true,
      messages: [
        {
          id: '301',
          sender: 'user',
          content: 'Gostaria de agradecer pelo excelente atendimento!',
          timestamp: '2025-05-25T16:30:00',
          status: 'read'
        },
        {
          id: '302',
          sender: 'clinic',
          content: 'Obrigado pelo seu feedback! Estamos felizes em ajudar.',
          timestamp: '2025-05-25T16:45:00',
          status: 'read'
        }
      ]
    }
  ];
  
  // Efeito para carregar os chats
  useEffect(( ) => {
    // Aqui seria feita a integração com o backend para buscar os chats
    setChats(mockChats);
    
    // Se estiver no modo de conversa e tiver um ID, carregar o chat específico
    if (mode === 'conversation' && id) {
      const chat = mockChats.find(chat => chat.id === id);
      if (chat) {
        setActiveChat(chat);
      }
    }
  }, [mode, id]);
  
  // Efeito para rolar para o final da conversa quando novas mensagens são adicionadas
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeChat?.messages]);
  
  // Função para enviar uma nova mensagem
  const sendMessage = () => {
    if (!newMessage.trim() && !isAttaching) return;
    
    if (activeChat) {
      const newMsg: Message = {
        id: `msg-${Date.now()}`,
        sender: 'user',
        content: newMessage,
        timestamp: new Date().toISOString(),
        status: 'sending'
      };
      
      // Atualizar o chat ativo com a nova mensagem
      const updatedChat: Chat = {
        ...activeChat,
        messages: [...activeChat.messages, newMsg],
        lastMessage: newMessage,
        lastMessageTime: newMsg.timestamp
      };
      
      setActiveChat(updatedChat);
      
      // Atualizar a lista de chats
      setChats(chats.map(chat => 
        chat.id === activeChat.id ? updatedChat : chat
      ));
      
      // Limpar o campo de mensagem
      setNewMessage('');
      
      // Simular resposta da clínica após 2 segundos
      setTimeout(() => {
        // Atualizar o status da mensagem enviada para "entregue"
        const updatedMessages = updatedChat.messages.map(msg => 
          msg.id === newMsg.id ? { ...msg, status: 'delivered' as MessageStatus } : msg
        );
        
        // Adicionar resposta da clínica
        const clinicResponse: Message = {
          id: `msg-${Date.now()}`,
          sender: 'clinic',
          content: 'Recebemos sua mensagem. Em breve retornaremos com mais informações.',
          timestamp: new Date().toISOString(),
          status: 'sent'
        };
        
        const finalChat: Chat = {
          ...updatedChat,
          messages: [...updatedMessages, clinicResponse],
          lastMessage: clinicResponse.content,
          lastMessageTime: clinicResponse.timestamp
        };
        
        setActiveChat(finalChat);
        
        // Atualizar a lista de chats
        setChats(chats.map(chat => 
          chat.id === activeChat.id ? finalChat : chat
        ));
      }, 2000);
    }
  };
  
  // Função para formatar a data/hora da mensagem
  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };
  
  // Função para formatar a data da última mensagem na lista de chats
  const formatLastMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Ontem';
    } else if (diffDays < 7) {
      return date.toLocaleDateString('pt-BR', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    }
  };
  
  // Filtrar chats com base na pesquisa
  const filteredChats = chats.filter(chat => 
    chat.clinicName.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Componente para o ícone de status da mensagem
  const MessageStatus = ({ status }: { status: string }) => {
    switch (status) {
      case 'sending':
        return <Clock className="h-3 w-3 text-gray-400" />;
      case 'sent':
        return <Check className="h-3 w-3 text-gray-400" />;
      case 'delivered':
        return <CheckCheck className="h-3 w-3 text-gray-400" />;
      case 'read':
        return <CheckCheck className="h-3 w-3 text-[#e11d48]" />;
      default:
        return null;
    }
  };
  
  // Resto do componente permanece igual...
  
  // Componente para a lista de chats
  const ChatList = () => (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="relative">
          <Input
            type="text"
            placeholder="Pesquisar conversas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
          <svg
            className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>
      
      <div className="space-y-4">
        {filteredChats.length > 0 ? (
          filteredChats.map((chat ) => (
            <div
              key={chat.id}
              onClick={() => navigate(`/chat/${chat.id}`)}
              className="bg-white rounded-lg shadow-md p-4 cursor-pointer hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center">
                <div className="relative">
                  <img
                    src={chat.clinicLogo}
                    alt={chat.clinicName}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  {chat.isOnline && (
                    <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-green-400 ring-2 ring-white"></span>
                  )}
                </div>
                
                <div className="ml-4 flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-gray-900">{chat.clinicName}</h3>
                    <p className="text-xs text-gray-500">{formatLastMessageTime(chat.lastMessageTime)}</p>
                  </div>
                  <p className="text-sm text-gray-500 line-clamp-1 mt-1">{chat.lastMessage}</p>
                </div>
                
                {chat.unreadCount > 0 && (
                  <div className="ml-2">
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#e11d48] text-white text-xs">
                      {chat.unreadCount}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <svg
              className="h-12 w-12 text-gray-300 mx-auto mb-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-1">Nenhuma conversa encontrada</h3>
            <p className="text-gray-500">
              {searchQuery
                ? `Nenhuma conversa corresponde à pesquisa "${searchQuery}".`
                : 'Você ainda não iniciou nenhuma conversa.'}
            </p>
          </div>
         )}
      </div>
    </div>
  );
  
  // Componente para a conversa ativa
  const Conversation = () => {
    if (!activeChat) {
      return (
        <div className="h-full flex items-center justify-center">
          <p className="text-gray-500">Selecione uma conversa para começar</p>
        </div>
      );
    }
    
    return (
      <div className="flex flex-col h-full">
        {/* Cabeçalho da conversa */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/chat')}
                className="mr-2 md:hidden text-gray-600 hover:text-gray-900"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <div className="relative">
                <img
                  src={activeChat.clinicLogo}
                  alt={activeChat.clinicName}
                  className="w-10 h-10 rounded-full object-cover"
                />
                {activeChat.isOnline && (
                  <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-400 ring-2 ring-white"></span>
                )}
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-gray-900">{activeChat.clinicName}</h3>
                <p className="text-xs text-gray-500">
                  {activeChat.isOnline ? 'Online' : 'Offline'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button className="p-1 rounded-full text-gray-600 hover:text-gray-900 hover:bg-gray-100">
                <Phone className="h-5 w-5" />
              </button>
              <button className="p-1 rounded-full text-gray-600 hover:text-gray-900 hover:bg-gray-100">
                <Video className="h-5 w-5" />
              </button>
              <button className="p-1 rounded-full text-gray-600 hover:text-gray-900 hover:bg-gray-100">
                <MoreVertical className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
        
        {/* Mensagens */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
          <div className="space-y-4">
            {activeChat.messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[75%] rounded-lg p-3 ${
                    message.sender === 'user'
                      ? 'bg-[#e11d48] text-white'
                      : 'bg-white border border-gray-200'
                  }`}
                >
                  {message.content && (
                    <p className={`text-sm ${message.sender === 'user' ? 'text-white' : 'text-gray-800'}`}>
                      {message.content}
                    </p>
                  )}
                  
                  {message.attachment && (
                    <div className="mt-2">
                      {message.attachment.type === 'image' ? (
                        <img
                          src={message.attachment.url}
                          alt="Attachment"
                          className="rounded-md max-w-full"
                        />
                      ) : (
                        <a
                          href={message.attachment.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`flex items-center p-2 rounded-md ${
                            message.sender === 'user'
                              ? 'bg-white/10 text-white'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          <svg
                            className={`h-5 w-5 mr-2 ${
                              message.sender === 'user' ? 'text-white' : 'text-gray-500'
                            }`}
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                            />
                          </svg>
                          <span className="text-sm truncate">
                            {message.attachment.name || 'Documento'}
                          </span>
                        </a>
                       )}
                    </div>
                  )}
                  
                  <div
                    className={`flex items-center justify-end mt-1 text-xs ${
                      message.sender === 'user' ? 'text-white/70' : 'text-gray-500'
                    }`}
                  >
                    <span>{formatMessageTime(message.timestamp)}</span>
                    {message.sender === 'user' && (
                      <span className="ml-1">
                        <MessageStatus status={message.status} />
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>
        
        {/* Campo de entrada de mensagem */}
        <div className="bg-white border-t border-gray-200 p-4">
          <div className="flex items-center">
            <button
              onClick={() => setIsAttaching(!isAttaching)}
              className="p-2 rounded-full text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              <Paperclip className="h-5 w-5" />
            </button>
            
            {isAttaching && (
              <div className="flex space-x-2 ml-2">
                <button className="p-2 rounded-full text-gray-600 hover:text-gray-900 hover:bg-gray-100">
                  <Image className="h-5 w-5" />
                </button>
              </div>
            )}
            
            <div className="flex-1 mx-2">
              <Input
                type="text"
                placeholder="Digite sua mensagem..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                className="w-full"
              />
            </div>
            
            <button
              onClick={sendMessage}
              disabled={!newMessage.trim() && !isAttaching}
              className={`p-2 rounded-full ${
                newMessage.trim() || isAttaching
                  ? 'text-[#e11d48] hover:bg-[#e11d48]/10'
                  : 'text-gray-400'
              }`}
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        title={mode === 'list' ? 'Mensagens' : activeChat?.clinicName || 'Conversa'} 
        showBackButton={true} 
        backUrl={mode === 'list' ? '/perfil' : '/chat'}
      />
      
      <main className="container mx-auto px-4 py-8">
        {mode === 'list' ? (
          <ChatList />
        ) : (
          <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md overflow-hidden h-[calc(100vh-12rem)]">
            <Conversation />
          </div>
        )}
      </main>
    </div>
  );
};

export default ChatSystem;
