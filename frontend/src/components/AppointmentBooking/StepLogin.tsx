import React from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Lock } from 'lucide-react';

const StepLogin = ({
  loginEmail,
  setLoginEmail,
  loginPassword,
  setLoginPassword,
  loginError,
  setLoginError,
  login,
  skipLogin,
  setCurrentStep
}: any) => (
  <div>
    <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
      <Lock className="h-5 w-5 mr-2" /> Faça login para agendar
    </h2>
    <form
      onSubmit={e => {
        e.preventDefault();
        setLoginError('');
        if (!loginEmail || !loginPassword) {
          setLoginError('Preencha todos os campos.');
          return;
        }
        if (!/^[^@]+@[^@]+\.[^@]+$/.test(loginEmail)) {
          setLoginError('Digite um e-mail válido.');
          return;
        }
        const ok = login(loginEmail, loginPassword);
        if (!ok) setLoginError('E-mail ou senha inválidos.');
        else setCurrentStep(1);
      }}
      className="space-y-4"
    >
      <div>
        <label htmlFor="loginEmail" className="block text-sm font-medium text-gray-700 mb-1">
          Email
        </label>
        <Input
          id="loginEmail"
          type="email"
          value={loginEmail}
          onChange={e => setLoginEmail(e.target.value)}
          placeholder="seu@email.com"
          required
        />
      </div>
      <div>
        <label htmlFor="loginPassword" className="block text-sm font-medium text-gray-700 mb-1">
          Senha
        </label>
        <Input
          id="loginPassword"
          type="password"
          value={loginPassword}
          onChange={e => setLoginPassword(e.target.value)}
          placeholder="••••••••"
          required
        />
      </div>
      {loginError && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded px-3 py-2 text-sm">
          {loginError}
        </div>
      )}
      <Button type="submit" className="w-full bg-[#e11d48] text-white hover:bg-[#f43f5e]">
        Entrar para agendar
      </Button>
    </form>
    <div className="mt-4 text-center text-sm text-gray-600">
      Não tem conta? <a href="/register" className="text-[#e11d48] hover:underline">Cadastre-se</a>
    </div>
    <div className="mt-6 flex flex-col items-center">
      <Button
        variant="outline"
        className="border-[#e11d48] text-[#e11d48] hover:bg-[#e11d48]/10 px-4 py-2"
        onClick={() => {
          skipLogin();
          setCurrentStep(1);
        }}
      >
        Pular login (TESTE)
      </Button>
      <span className="text-xs text-gray-400 mt-1">(Botão somente para testes)</span>
    </div>
  </div>
);

export default StepLogin;