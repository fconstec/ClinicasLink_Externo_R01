//
import React, { useState, useEffect } from 'react';
import { useParams } from "react-router-dom";
import Header from '../Header';
import UserProfileSidebar, { ActiveTab } from './UserProfileSidebar';
import UserProfileAppointments from './UserProfileAppointments';
import UserProfilePayments from './UserProfilePayments';
import UserProfileReviews from './UserProfileReviews';
import UserProfileSettings from './UserProfileSettings';
import { UserData } from './types';
import { Appointment } from './UserProfileAppointments';

// Tipagem exemplo para pagamentos e avaliações
interface Payment {
  id: number;
  clinicName: string;
  service: string;
  date: string;
  amount: string;
  method: string;
  status: string;
}
interface Review {
  id: number;
  clinicName: string;
  professionalName: string;
  service: string;
  date: string;
  rating: number;
  comment: string;
}

const UserProfile: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const [activeTab, setActiveTab] = useState<ActiveTab>('appointments');
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dados vindos da API
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loadingAppointments, setLoadingAppointments] = useState(true);
  const [errorAppointments, setErrorAppointments] = useState<string | null>(null);

  const [payments, setPayments] = useState<Payment[]>([]);
  const [loadingPayments, setLoadingPayments] = useState(true);
  const [errorPayments, setErrorPayments] = useState<string | null>(null);

  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [errorReviews, setErrorReviews] = useState<string | null>(null);

  // Carrega dados do perfil do backend
  useEffect(() => {
    setLoading(true);
    setError(null);

    if (!id) {
      setLoading(false);
      setError("ID do paciente não informado");
      return;
    }

    fetch(`http://localhost:3001/api/patients/${id}`)
      .then(res => {
        if (!res.ok) throw new Error('Erro ao buscar perfil');
        return res.json();
      })
      .then((data) => {
        setUserData({
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || '',
          birthDate: data.birthDate || '',
          address: data.address || '',
          city: data.city || '',
          state: data.state || '',
          zipCode: data.zipCode || ''
        });
      })
      .catch(() => setError('Erro ao carregar perfil do usuário'))
      .finally(() => setLoading(false));
  }, [id]);

  // Carrega agendamentos do backend
  useEffect(() => {
    setLoadingAppointments(true);
    setErrorAppointments(null);
    if (!id) return;
    fetch(`http://localhost:3001/api/appointments?patientId=${id}`)
      .then(res => {
        if (!res.ok) throw new Error('Erro ao buscar agendamentos');
        return res.json();
      })
      .then(setAppointments)
      .catch(() => setErrorAppointments('Erro ao carregar agendamentos'))
      .finally(() => setLoadingAppointments(false));
  }, [id]);

  // Carrega pagamentos do backend
  useEffect(() => {
    setLoadingPayments(true);
    setErrorPayments(null);
    if (!id) return;
    fetch(`http://localhost:3001/api/payments?patientId=${id}`)
      .then(res => {
        if (!res.ok) throw new Error('Erro ao buscar pagamentos');
        return res.json();
      })
      .then(setPayments)
      .catch(() => setErrorPayments('Erro ao carregar pagamentos'))
      .finally(() => setLoadingPayments(false));
  }, [id]);

  // Carrega avaliações do backend
  useEffect(() => {
    setLoadingReviews(true);
    setErrorReviews(null);
    if (!id) return;
    fetch(`http://localhost:3001/api/reviews?patientId=${id}`)
      .then(res => {
        if (!res.ok) throw new Error('Erro ao buscar avaliações');
        return res.json();
      })
      .then(setReviews)
      .catch(() => setErrorReviews('Erro ao carregar avaliações'))
      .finally(() => setLoadingReviews(false));
  }, [id]);

  // Atualiza dados do perfil no backend
  const handleUpdateUserData = () => {
    if (!userData || !id) return;
    setLoading(true);
    setError(null);
    fetch(`http://localhost:3001/api/patients/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    })
      .then(res => {
        if (!res.ok) throw new Error('Erro ao atualizar perfil');
        return res.json();
      })
      .then((data) => {
        setUserData({
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || '',
          birthDate: data.birthDate || '',
          address: data.address || '',
          city: data.city || '',
          state: data.state || '',
          zipCode: data.zipCode || ''
        });
        setIsEditing(false);
      })
      .catch(() => setError('Erro ao atualizar perfil'))
      .finally(() => setLoading(false));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserData(prev => prev ? { ...prev, [name]: value } : prev);
  };

  const handleCancelAppointment = (id: number) => {
    // Aqui você pode fazer uma chamada DELETE ou PATCH na API para cancelar
    alert('Agendamento cancelado com sucesso!');
    // Depois, recarregue os agendamentos:
    // setLoadingAppointments(true);
    // fetch(...).then(...);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-gray-100 via-white to-gray-50">
        <span className="text-lg text-gray-600">Carregando perfil...</span>
      </div>
    );
  }

  if (error || !userData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-gray-100 via-white to-gray-50">
        <span className="text-lg text-red-500">{error || "Erro ao carregar perfil."}</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-tr from-gray-100 via-white to-gray-50 pt-20">
      <Header title="Meu Perfil" showBackButton backUrl="/login-paciente" />
      <main className="container mx-auto px-2 md:px-4 py-8">
        <section className="flex flex-col md:flex-row gap-8">
          <UserProfileSidebar
            userData={userData}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
          <div className="flex-1 bg-white rounded-2xl shadow-lg p-6 md:p-10 min-h-[480px]">
            {activeTab === 'appointments' && (
              <UserProfileAppointments
                appointments={appointments}
                loading={loadingAppointments}
                error={errorAppointments}
                handleCancelAppointment={handleCancelAppointment}
              />
            )}
            {activeTab === 'payments' && (
              <UserProfilePayments
                payments={payments}
                loading={loadingPayments}
                error={errorPayments}
              />
            )}
            {activeTab === 'reviews' && (
              <UserProfileReviews
                reviews={reviews}
                loading={loadingReviews}
                error={errorReviews}
              />
            )}
            {activeTab === 'settings' && (
              <UserProfileSettings
                userData={userData}
                setUserData={setUserData}
                isEditing={isEditing}
                setIsEditing={setIsEditing}
                handleUpdateUserData={handleUpdateUserData}
                handleInputChange={handleInputChange}
              />
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default UserProfile;