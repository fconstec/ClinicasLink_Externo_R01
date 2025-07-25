import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import { Input } from './ui/input';
import { Button } from './ui/button';

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3001";

const LoginClinica: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const resp = await fetch(`${API_URL}/api/clinics/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!resp.ok) throw new Error('Credenciais inválidas');
      const clinic = await resp.json();
      localStorage.setItem('clinic_id', String(clinic.id));
      navigate(`/admin/${clinic.id}`);
    } catch (err: any) {
      alert(err.message || 'Erro ao autenticar clínica');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <Header title="Login Clínica" showBackButton={true} backUrl="/login" />
      <div className="max-w-md mx-auto mt-10 px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-6 text-center">Entrar como Clínica</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="email@clinic.com"
                className="w-full"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-1">Senha</label>
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
              className="w-full bg-[#e11d48] text-white py-2 rounded hover:bg-[#f43f5e]"
            >
              Entrar
            </Button>
          </form>

          {/* Botão para acessar diretamente o painel da clínica 1 */}
          <div className="mt-6 text-center">
            <Button
              variant="outline"
              onClick={() => navigate('/admin/1')}
              className="text-gray-700 border-gray-300 hover:bg-gray-100"
            >
              Ir para o Painel da Clínica 1
            </Button>
          </div>

          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              Clínica ainda não cadastrada?{' '}
              <Button variant="link" onClick={() => navigate('/cadastro-clinica')}>
                Cadastre sua clínica
              </Button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginClinica;
