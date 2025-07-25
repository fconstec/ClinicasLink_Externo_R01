import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Header from './Header';
import { Input } from './ui/input';
import { Button } from './ui/button';

const LoginPaciente: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Lógica de autenticação do paciente...
    navigate('/perfil'); // Agora navega direto para o perfil do paciente
  };

  // Função para o botão provisório
  const handleGoToPerfil = () => {
    navigate('/perfil');
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <Header title="Login Paciente" showBackButton={true} backUrl="/login" />
      <div className="max-w-md mx-auto mt-10 px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-6 text-center">Entrar como Paciente</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1">
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="seu@email.com"
                className="w-full"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-1">
                Senha
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full"
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-[#0ea5e9] text-white py-2 rounded hover:bg-[#38bdf8]"
            >
              Entrar
            </Button>
          </form>
          {/* Botão provisório */}
          <Button 
            type="button"
            onClick={handleGoToPerfil}
            className="mt-4 bg-gray-300 text-gray-700 w-full"
          >
            Ir para Perfil do Paciente (provisório)
          </Button>
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Não tem uma conta?{' '}
              <Link to="/cadastro" className="text-[#0ea5e9] hover:text-[#38bdf8] font-medium">
                Cadastre-se
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPaciente;