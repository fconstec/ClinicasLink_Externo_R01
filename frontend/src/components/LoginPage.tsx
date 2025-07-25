import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Building2 } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import Header from './Header';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Aqui seria implementada a lógica de autenticação
    console.log('Login com:', email, password);
    // Redirecionar após login bem-sucedido
    navigate('/area-usuario');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Login" showBackButton={true} backUrl="/" />

      <div className="max-w-md mx-auto mt-10 px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-center mb-6">
            <div className="flex justify-center mb-4">
              <Building2 className="h-12 w-12 text-[#0ea5e9]" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              <span className="text-[#0ea5e9]">Clínicas</span>
              <span className="text-[#e11d48]">Link</span>
            </h1>
            <p className="text-gray-600 mt-2">Entre na sua conta para continuar</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
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

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-[#e11d48] focus:ring-[#e11d48] border-gray-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                    Lembrar de mim
                  </label>
                </div>

                <div className="flex flex-col items-end space-y-1 text-sm">
                  <Link to="/esqueci-senha" className="text-[#e11d48] hover:text-[#f43f5e]">
                    Esqueceu sua senha?
                  </Link>
                  <Link to="/admin" className="text-[#e11d48] hover:text-[#f43f5e]">
                    Acessar Painel Administrativo
                  </Link>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-[#e11d48] text-white py-2 px-4 rounded-md hover:bg-[#f43f5e] transition-colors"
              >
                Entrar
              </Button>

              {/* Novo botão para acessar diretamente o Painel da Clínica 1 */}
              <Button
                type="button"
                variant="outline"
                className="w-full mt-2"
                onClick={() => navigate('/admin/1')}
              >
                Acessar Clínica 1
              </Button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Não tem uma conta?{' '}
              <Link to="/cadastro" className="text-[#e11d48] hover:text-[#f43f5e] font-medium">
                Cadastre-se
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
