import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import Header from '../Header';
import BookingProgress from './BookingProgress';
import StepLogin from './StepLogin';
import StepProfessionalService from './StepProfessionalService';
import StepDateTime from './StepDateTime';
import StepPayment from './StepPayment';
import BookingConfirmation from './BookingConfirmation';

// AUTENTICAÇÃO FALSA (troque para autenticação real depois)
function useFakeAuth() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);

  function login(email: string, password: string) {
    if (email && password) {
      setUser({ name: "Paciente Exemplo", email });
      setIsLoggedIn(true);
      return true;
    }
    return false;
  }

  function skipLogin() {
    setUser({ name: "Paciente Teste", email: "teste@teste.com" });
    setIsLoggedIn(true);
  }

  return { isLoggedIn, user, login, skipLogin };
}

const AppointmentBooking: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);

  // DADOS REAIS DA CLÍNICA VINDOS DA API
  const [clinic, setClinic] = useState<any>(null);
  const [loadingClinic, setLoadingClinic] = useState(true);
  const [errorClinic, setErrorClinic] = useState<string | null>(null);

  useEffect(() => {
    async function fetchClinic() {
      setLoadingClinic(true);
      setErrorClinic(null);
      try {
        // Sempre use endpoint relativo, o proxy do React redireciona para o backend
        const response = await fetch(`/api/clinics/${id}`);
        const contentType = response.headers.get('content-type');
        if (!response.ok || !contentType?.includes('application/json')) {
          const text = await response.text();
          throw new Error(`Erro ao buscar clínica: ${text}`);
        }
        const data = await response.json();
        setClinic(data);
      } catch (err: any) {
        setErrorClinic(err.message || 'Erro ao buscar clínica');
        setClinic(null);
      } finally {
        setLoadingClinic(false);
      }
    }
    if (id) fetchClinic();
  }, [id]);

  const { isLoggedIn, user, login, skipLogin } = useFakeAuth();

  const [currentStep, setCurrentStep] = useState(0);
  const [selectedProfessional, setSelectedProfessional] = useState<string>(queryParams.get('professional') || '');
  const [selectedService, setSelectedService] = useState<string>(queryParams.get('service') || '');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('');
  const [isBookingComplete, setIsBookingComplete] = useState<boolean>(false);

  // Login state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Navegação dos passos
  const handleNextStep = () => setCurrentStep((step) => Math.min(step + 1, 3));
  const handlePreviousStep = () => setCurrentStep((step) => Math.max(step - 1, 0));
  const handleCompleteBooking = () => {
    setIsBookingComplete(true);
    window.scrollTo(0, 0);
    // Aqui você pode enviar o agendamento para o backend!
  };

  // Loading/erro da clínica
  if (loadingClinic) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-lg text-gray-600">Carregando dados da clínica...</div>
      </div>
    );
  }
  if (errorClinic || !clinic) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-lg text-red-600">
          {errorClinic || 'Clínica não encontrada.'}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <Header
        title={`Agendar Consulta - ${clinic.name}`}
        showBackButton={true}
        backUrl={`/clinica/${id}`}
      />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-6">
          {!isBookingComplete ? (
            <>
              <BookingProgress currentStep={currentStep} />
              {currentStep === 0 && (
                <StepLogin
                  loginEmail={loginEmail}
                  setLoginEmail={setLoginEmail}
                  loginPassword={loginPassword}
                  setLoginPassword={setLoginPassword}
                  loginError={loginError}
                  setLoginError={setLoginError}
                  login={login}
                  skipLogin={skipLogin}
                  setCurrentStep={setCurrentStep}
                />
              )}
              {currentStep === 1 && (
                <StepProfessionalService
                  clinic={clinic}
                  selectedProfessional={selectedProfessional}
                  setSelectedProfessional={setSelectedProfessional}
                  selectedService={selectedService}
                  setSelectedService={setSelectedService}
                  handleNextStep={handleNextStep}
                  handlePreviousStep={handlePreviousStep}
                  currentStep={currentStep}
                />
              )}
              {currentStep === 2 && (
                <StepDateTime
                  clinic={clinic}
                  selectedDate={selectedDate}
                  setSelectedDate={setSelectedDate}
                  selectedTime={selectedTime}
                  setSelectedTime={setSelectedTime}
                  handleNextStep={handleNextStep}
                  handlePreviousStep={handlePreviousStep}
                />
              )}
              {currentStep === 3 && (
                <StepPayment
                  clinic={clinic}
                  selectedProfessional={selectedProfessional}
                  selectedService={selectedService}
                  selectedDate={selectedDate}
                  selectedTime={selectedTime}
                  user={user}
                  paymentMethod={paymentMethod}
                  setPaymentMethod={setPaymentMethod}
                  handlePreviousStep={handlePreviousStep}
                  handleCompleteBooking={handleCompleteBooking}
                />
              )}
            </>
          ) : (
            <BookingConfirmation
              clinic={clinic}
              selectedProfessional={selectedProfessional}
              selectedService={selectedService}
              selectedDate={selectedDate}
              selectedTime={selectedTime}
              user={user}
              id={id}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default AppointmentBooking;