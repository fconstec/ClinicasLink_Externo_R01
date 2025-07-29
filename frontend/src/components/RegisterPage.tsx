import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Building2 } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import Header from './Header';
import { API_BASE_URL } from '../api/apiBase';

const CLINIC_ID = 1; // Troque para o ID real da clínica ou torne dinâmico!

const RegisterPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const navigate = useNavigate();

  // Validação básica aprimorada
  const validateForm = () => {
    if (!name.trim()) {
      alert('Preencha o nome completo.');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      alert('Digite um e-mail válido.');
      return false;
    }
    if (!phone.trim()) {
      alert('Preencha o telefone.');
      return false;
    }
    if (password.length < 6) {
      alert('A senha deve ter pelo menos 6 caracteres.');
      return false;
    }
    if (password !== confirmPassword) {
      alert('As senhas não coincidem!');
      return false;
    }
    if (!acceptTerms) {
      alert('Você precisa aceitar os termos de uso e política de privacidade.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch(`${API_BASE_URL}/patients`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          phone,
          password, // só envie se backend aceita, senão remova
          clinicId: CLINIC_ID, // OBRIGATÓRIO para backend aceitar!
        }),
      });

      if (!response.ok) {
        if (response.status === 409) {
          setError('Este e-mail já está cadastrado.');
        } else {
          setError('Erro ao cadastrar usuário. Tente novamente.');
        }
        setSubmitting(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 1000);
    } catch (err) {
      setError('Erro ao cadastrar. Tente novamente.');
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <Header title="Cadastro" showBackButton={true} backUrl="/" />
      <div className="max-w-md mx-auto mt-8 px-4 pb-12">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-center mb-6">
            <div className="flex justify-center mb-4">
              <Building2 className="h-12 w-12 text-[#0ea5e9]" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              <span className="text-[#0ea5e9]">Clínicas</span>
              <span className="text-[#e11d48]">Link</span>
            </h1>
            <p className="text-gray-600 mt-2">Crie sua conta para agendar consultas</p>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Nome completo
                </label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Seu nome completo"
                  required
                  className="w-full"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  required
                  className="w-full"
                />
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Telefone
                </label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(00) 00000-0000"
                  required
                  className="w-full"
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Senha
                </label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full"
                />
              </div>
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirme sua senha
                </label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full"
                />
              </div>
              <div className="flex items-center">
                <input
                  id="accept-terms"
                  name="accept-terms"
                  type="checkbox"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className="h-4 w-4 text-[#e11d48] focus:ring-[#e11d48] border-gray-300 rounded"
                  required
                  aria-label="Aceitar Termos de Uso e Política de Privacidade"
                />
                <label htmlFor="accept-terms" className="ml-2 block text-sm text-gray-700">
                  Eu aceito os{' '}
                  <Link to="/termos" className="text-[#e11d48] hover:text-[#f43f5e]">
                    Termos de Uso
                  </Link>{' '}
                  e{' '}
                  <Link to="/privacidade" className="text-[#e11d48] hover:text-[#f43f5e]">
                    Política de Privacidade
                  </Link>
                </label>
              </div>
              {error && <div className="text-red-500 text-sm text-center">{error}</div>}
              {success && <div className="text-green-600 text-sm text-center">Cadastro realizado com sucesso! Redirecionando...</div>}
              <Button
                type="submit"
                className="w-full bg-[#e11d48] text-white py-2 px-4 rounded-md hover:bg-[#f43f5e] transition-colors"
                disabled={submitting}
              >
                {submitting ? 'Cadastrando...' : 'Cadastrar'}
              </Button>
            </div>
          </form>
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Já tem uma conta?{' '}
              <Link to="/login" className="text-[#e11d48] hover:text-[#f43f5e] font-medium">
                Faça login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;