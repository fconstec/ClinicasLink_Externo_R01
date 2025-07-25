import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  CreditCard, 
  Calendar, 
  User, 
  FileText,
  Check,
  ChevronLeft,
  ChevronRight,
  Lock
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import Header from './Header';

interface PaymentSystemProps {
  mode?: 'checkout' | 'confirmation' | 'history';
}

const PaymentSystem: React.FC<PaymentSystemProps> = ({ mode = 'checkout' }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // Estados para o pagamento
  const [paymentMethod, setPaymentMethod] = useState<string>('credit');
  const [cardNumber, setCardNumber] = useState<string>('');
  const [cardName, setCardName] = useState<string>('');
  const [cardExpiry, setCardExpiry] = useState<string>('');
  const [cardCvv, setCardCvv] = useState<string>('');
  const [installments, setInstallments] = useState<string>('1');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isPaymentComplete, setIsPaymentComplete] = useState<boolean>(false);
  
  // Dados simulados do agendamento
  const appointmentData = {
    id: id || '1',
    clinicName: 'Clínica Fisioterapia Movimento',
    clinicAddress: 'Av. Paulista, 1000, São Paulo - SP',
    professionalName: 'Dr. João Silva',
    professionalSpecialty: 'Fisioterapia Ortopédica',
    service: 'Avaliação Fisioterapêutica',
    date: '2025-06-01',
    time: '09:00',
    price: 'R$ 150,00',
    priceValue: 150.0
  };
  
  // Dados simulados do histórico de pagamentos
  const paymentHistory = [
    {
      id: '1',
      appointmentId: '1',
      clinicName: 'Clínica Fisioterapia Movimento',
      service: 'Avaliação Fisioterapêutica',
      date: '2025-05-20',
      paymentDate: '2025-05-15',
      amount: 'R$ 150,00',
      method: 'Cartão de Crédito',
      status: 'paid',
      receipt: '/receipts/receipt-1.pdf'
    },
    {
      id: '2',
      appointmentId: '2',
      clinicName: 'Odonto Saúde Integral',
      service: 'Consulta Odontológica',
      date: '2025-05-25',
      paymentDate: '2025-05-20',
      amount: 'R$ 200,00',
      method: 'PIX',
      status: 'paid',
      receipt: '/receipts/receipt-2.pdf'
    },
    {
      id: '3',
      appointmentId: '4',
      clinicName: 'Clínica Fisioterapia Movimento',
      service: 'Sessão de Fisioterapia',
      date: '2025-06-08',
      paymentDate: null,
      amount: 'R$ 120,00',
      method: 'Pendente',
      status: 'pending',
      receipt: null
    }
  ];
  
  // Função para formatar número do cartão
  const formatCardNumber = (value: string) => {
    const digits = value.replace(/\D/g, '');
    const groups = [];
    
    for (let i = 0; i < digits.length && i < 16; i += 4) {
      groups.push(digits.slice(i, i + 4));
    }
    
    return groups.join(' ');
  };
  
  // Função para formatar data de validade
  const formatCardExpiry = (value: string) => {
    const digits = value.replace(/\D/g, '');
    
    if (digits.length <= 2) {
      return digits;
    }
    
    return `${digits.slice(0, 2)}/${digits.slice(2, 4)}`;
  };
  
  // Função para processar o pagamento
  const processPayment = () => {
    // Validação básica
    if (paymentMethod === 'credit') {
      if (!cardNumber || cardNumber.replace(/\s/g, '').length !== 16) {
        alert('Por favor, insira um número de cartão válido.');
        return;
      }
      
      if (!cardName) {
        alert('Por favor, insira o nome no cartão.');
        return;
      }
      
      if (!cardExpiry || cardExpiry.length !== 5) {
        alert('Por favor, insira uma data de validade válida (MM/AA).');
        return;
      }
      
      if (!cardCvv || cardCvv.length !== 3) {
        alert('Por favor, insira um código de segurança válido.');
        return;
      }
    }
    
    setIsProcessing(true);
    
    // Simulação de processamento de pagamento
    setTimeout(() => {
      console.log('Pagamento processado:', {
        appointmentId: id,
        method: paymentMethod,
        cardNumber: cardNumber ? `**** **** **** ${cardNumber.slice(-4)}` : null,
        installments: paymentMethod === 'credit' ? installments : null
      });
      
      setIsProcessing(false);
      setIsPaymentComplete(true);
    }, 2000);
  };
  
  // Componente para o checkout
  const Checkout = () => (
    <div className="max-w-3xl mx-auto">
      {/* Resumo do agendamento */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Resumo do Agendamento</h2>
        
        <div className="space-y-3">
          <div className="flex items-start">
            <Calendar className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
            <div>
              <p className="text-sm text-gray-500">Data e Horário</p>
              <p className="font-medium text-gray-900">
                {new Date(appointmentData.date).toLocaleDateString('pt-BR')} às {appointmentData.time}
              </p>
            </div>
          </div>
          
          <div className="flex items-start">
            <User className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
            <div>
              <p className="text-sm text-gray-500">Profissional</p>
              <p className="font-medium text-gray-900">{appointmentData.professionalName}</p>
              <p className="text-sm text-gray-500">{appointmentData.professionalSpecialty}</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <FileText className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
            <div>
              <p className="text-sm text-gray-500">Serviço</p>
              <p className="font-medium text-gray-900">{appointmentData.service}</p>
              <p className="text-sm text-gray-500">{appointmentData.clinicName}</p>
            </div>
          </div>
          
          <div className="border-t border-gray-200 pt-3 mt-3">
            <div className="flex justify-between items-center">
              <p className="font-medium text-gray-900">Valor Total</p>
              <p className="font-semibold text-gray-900">{appointmentData.price}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Formulário de pagamento */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Forma de Pagamento</h2>
        
        <div className="space-y-6">
          {/* Seleção de método de pagamento */}
          <div className="space-y-3">
            <div 
              onClick={() => setPaymentMethod('credit')}
              className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                paymentMethod === 'credit' 
                  ? 'border-[#e11d48] bg-[#e11d48]/5' 
                  : 'border-gray-200 hover:border-[#e11d48]'
              }`}
            >
              <div className="flex items-center">
                <CreditCard className="h-5 w-5 text-gray-500 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">Cartão de Crédito</p>
                  <p className="text-sm text-gray-500">Pague em até 12x</p>
                </div>
              </div>
            </div>
            
            <div 
              onClick={() => setPaymentMethod('pix')}
              className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                paymentMethod === 'pix' 
                  ? 'border-[#e11d48] bg-[#e11d48]/5' 
                  : 'border-gray-200 hover:border-[#e11d48]'
              }`}
            >
              <div className="flex items-center">
                <svg className="h-5 w-5 text-gray-500 mr-3" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <div>
                  <p className="font-medium text-gray-900">PIX</p>
                  <p className="text-sm text-gray-500">Pagamento instantâneo</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Formulário de cartão de crédito */}
          {paymentMethod === 'credit' && (
            <div className="space-y-4">
              <div>
                <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-1">
                  Número do Cartão
                </label>
                <Input
                  id="cardNumber"
                  type="text"
                  value={cardNumber}
                  onChange={(e ) => setCardNumber(formatCardNumber(e.target.value))}
                  placeholder="0000 0000 0000 0000"
                  maxLength={19}
                  className="w-full"
                />
              </div>
              
              <div>
                <label htmlFor="cardName" className="block text-sm font-medium text-gray-700 mb-1">
                  Nome no Cartão
                </label>
                <Input
                  id="cardName"
                  type="text"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value.toUpperCase())}
                  placeholder="NOME COMO ESTÁ NO CARTÃO"
                  className="w-full"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="cardExpiry" className="block text-sm font-medium text-gray-700 mb-1">
                    Validade (MM/AA)
                  </label>
                  <Input
                    id="cardExpiry"
                    type="text"
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(formatCardExpiry(e.target.value))}
                    placeholder="MM/AA"
                    maxLength={5}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label htmlFor="cardCvv" className="block text-sm font-medium text-gray-700 mb-1">
                    Código de Segurança
                  </label>
                  <Input
                    id="cardCvv"
                    type="text"
                    value={cardCvv}
                    onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 3))}
                    placeholder="CVV"
                    maxLength={3}
                    className="w-full"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="installments" className="block text-sm font-medium text-gray-700 mb-1">
                  Parcelamento
                </label>
                <select
                  id="installments"
                  value={installments}
                  onChange={(e) => setInstallments(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#e11d48]"
                >
                  <option value="1">À vista - R$ {appointmentData.priceValue.toFixed(2)}</option>
                  <option value="2">2x de R$ {(appointmentData.priceValue / 2).toFixed(2)}</option>
                  <option value="3">3x de R$ {(appointmentData.priceValue / 3).toFixed(2)}</option>
                  <option value="6">6x de R$ {(appointmentData.priceValue / 6).toFixed(2)}</option>
                  <option value="12">12x de R$ {(appointmentData.priceValue / 12).toFixed(2)}</option>
                </select>
              </div>
            </div>
          )}
          
          {/* QR Code PIX */}
          {paymentMethod === 'pix' && (
            <div className="text-center">
              <div className="bg-gray-100 p-6 rounded-lg inline-block mb-4">
                <svg className="h-48 w-48 mx-auto" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Simulação de QR Code */}
                  <rect width="100" height="100" fill="white"/>
                  <rect x="10" y="10" width="80" height="80" fill="black"/>
                  <rect x="20" y="20" width="60" height="60" fill="white"/>
                  <rect x="30" y="30" width="40" height="40" fill="black"/>
                  <rect x="40" y="40" width="20" height="20" fill="white"/>
                </svg>
              </div>
              
              <p className="text-sm text-gray-600 mb-4">
                Escaneie o QR Code acima com o aplicativo do seu banco ou copie o código PIX abaixo.
              </p>
              
              <div className="flex items-center justify-center mb-4">
                <input
                  type="text"
                  value="00020126580014br.gov.bcb.pix0136a629532e-7693-4846-b028-f142082d7b0752040000530398654041.005802BR5925CLINICASLINK PAGAMENTOS6009SAO PAULO62070503***63041D3D"
                  readOnly
                  className="bg-gray-100 border border-gray-300 rounded-l-md py-2 px-3 text-sm w-64 truncate"
                />
                <button
                  onClick={( ) => {
                    navigator.clipboard.writeText("00020126580014br.gov.bcb.pix0136a629532e-7693-4846-b028-f142082d7b0752040000530398654041.005802BR5925CLINICASLINK PAGAMENTOS6009SAO PAULO62070503***63041D3D");
                    alert('Código PIX copiado!');
                  }}
                  className="bg-[#e11d48] text-white py-2 px-3 rounded-r-md text-sm hover:bg-[#f43f5e]"
                >
                  Copiar
                </button>
              </div>
              
              <p className="text-sm text-gray-500">
                O pagamento será confirmado automaticamente em até 5 minutos após a transferência.
              </p>
            </div>
          )}
          
          <div className="flex items-center justify-center text-sm text-gray-500 mt-4">
            <Lock className="h-4 w-4 mr-1" />
            <span>Pagamento seguro e criptografado</span>
          </div>
        </div>
      </div>
      
      <div className="mt-6 flex justify-between">
        <Button 
          variant="outline"
          onClick={() => window.history.back()}
          className="border-gray-300 text-gray-700"
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <Button 
          onClick={processPayment}
          disabled={isProcessing}
          className="bg-[#e11d48] text-white hover:bg-[#f43f5e]"
        >
          {isProcessing ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processando...
            </span>
           ) : (
            <span className="flex items-center">
              Finalizar Pagamento
              <ChevronRight className="h-4 w-4 ml-2" />
            </span>
          )}
        </Button>
      </div>
    </div>
  );
  
  // Componente para a confirmação de pagamento
  const PaymentConfirmation = () => (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8 text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-6">
        <Check className="h-8 w-8 text-green-600" />
      </div>
      
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Pagamento Confirmado!</h2>
      <p className="text-gray-600 mb-8">
        Seu pagamento foi processado com sucesso e sua consulta está confirmada.
      </p>
      
      <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left">
        <h3 className="text-lg font-medium text-gray-800 mb-4">Detalhes da Consulta</h3>
        
        <div className="space-y-3">
          <div className="flex items-start">
            <Calendar className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
            <div>
              <p className="text-sm text-gray-500">Data e Horário</p>
              <p className="font-medium text-gray-900">
                {new Date(appointmentData.date).toLocaleDateString('pt-BR')} às {appointmentData.time}
              </p>
            </div>
          </div>
          
          <div className="flex items-start">
            <User className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
            <div>
              <p className="text-sm text-gray-500">Profissional</p>
              <p className="font-medium text-gray-900">{appointmentData.professionalName}</p>
              <p className="text-sm text-gray-500">{appointmentData.professionalSpecialty}</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <FileText className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
            <div>
              <p className="text-sm text-gray-500">Serviço</p>
              <p className="font-medium text-gray-900">{appointmentData.service}</p>
              <p className="text-sm text-gray-500">{appointmentData.clinicName}</p>
              <p className="text-sm text-gray-500">{appointmentData.clinicAddress}</p>
            </div>
          </div>
          
          <div className="border-t border-gray-200 pt-3 mt-3">
            <div className="flex justify-between items-center">
              <p className="font-medium text-gray-900">Valor Pago</p>
              <p className="font-semibold text-gray-900">{appointmentData.price}</p>
            </div>
            <div className="flex justify-between items-center mt-1">
              <p className="text-sm text-gray-500">Forma de Pagamento</p>
              <p className="text-sm text-gray-500">
                {paymentMethod === 'credit' 
                  ? `Cartão de Crédito (${installments}x)` 
                  : 'PIX'}
              </p>
            </div>
          </div>
        </div>
      </div>
      
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
          Ir para Meus Agendamentos
        </Button>
      </div>
    </div>
  );
  
  // Componente para o histórico de pagamentos
  const PaymentHistory = () => (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Histórico de Pagamentos</h2>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Clínica/Serviço
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Data
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Valor
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Método
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Recibo
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paymentHistory.map((payment) => (
              <tr key={payment.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{payment.clinicName}</div>
                  <div className="text-sm text-gray-500">{payment.service}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {new Date(payment.date).toLocaleDateString('pt-BR')}
                  </div>
                  <div className="text-xs text-gray-500">
                    {payment.paymentDate 
                      ? `Pago em ${new Date(payment.paymentDate).toLocaleDateString('pt-BR')}` 
                      : 'Pendente'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{payment.amount}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{payment.method}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    payment.status === 'paid' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {payment.status === 'paid' ? 'Pago' : 'Pendente'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {payment.receipt ? (
                    <a 
                      href={payment.receipt} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-[#e11d48] hover:text-[#f43f5e] text-sm"
                    >
                      Ver Recibo
                    </a>
                  ) : (
                    <span className="text-gray-400 text-sm">Indisponível</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        title={
          mode === 'checkout' 
            ? 'Pagamento' 
            : mode === 'confirmation' 
              ? 'Confirmação de Pagamento' 
              : 'Histórico de Pagamentos'
        } 
        showBackButton={true} 
        backUrl={mode === 'history' ? '/perfil' : '/'}
      />
      
      <main className="container mx-auto px-4 py-8">
        {mode === 'checkout' && !isPaymentComplete && <Checkout />}
        {(mode === 'confirmation' || isPaymentComplete) && <PaymentConfirmation />}
        {mode === 'history' && <PaymentHistory />}
      </main>
    </div>
  );
};

export default PaymentSystem;
