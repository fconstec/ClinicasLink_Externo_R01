import React, { useState, ChangeEvent } from "react";
import { Input } from "../../ui/input";
import { Button } from "../../ui/button";

const ChangePasswordCard: React.FC = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleChangePassword = () => {
    setSuccessMessage(null);
    setErrorMessage(null);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setErrorMessage("Preencha todos os campos de senha.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMessage("Nova senha e confirmação não conferem.");
      return;
    }
    // Aqui deve entrar a chamada para a API real para alterar a senha.
    setSuccessMessage("Funcionalidade de alterar senha a ser implementada com API.");
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const card = "bg-white rounded-xl shadow-md border border-gray-100 p-8";
  const sectionTitle = "text-xl font-bold text-gray-800 mb-6 border-b border-gray-200 pb-3";
  const label = "block text-sm font-medium text-gray-700 mb-1.5";
  const inputBase = `
    w-full border border-gray-300 rounded-lg px-3 py-2
    focus:outline-none focus:border-[#e11d48] focus:ring-2 focus:ring-[#f43f5e]
    text-sm bg-white transition
    placeholder:text-gray-400
    shadow-sm hover:shadow-md
  `;

  // Botão primário igual aos outros cards, no canto direito do card
  const primaryButton = "bg-[#e11d48] hover:bg-[#f43f5e] text-white font-medium rounded-lg px-4 py-2 text-sm transition-colors";

  return (
    <div className={card}>
      <h2 className={sectionTitle}>Alterar Senha</h2>
      {successMessage && (
        <div className="p-2 mb-3 text-green-800 bg-green-50 border border-green-200 rounded">
          {successMessage}
        </div>
      )}
      {errorMessage && (
        <div className="p-2 mb-3 text-red-800 bg-red-50 border border-red-200 rounded">
          {errorMessage}
        </div>
      )}
      <div className="space-y-5 max-w-md">
        <div>
          <label className={label}>Senha Atual</label>
          <Input
            type="password"
            value={currentPassword}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setCurrentPassword(e.target.value)}
            autoComplete="current-password"
            className={inputBase}
            placeholder="Digite sua senha atual"
          />
        </div>
        <div>
          <label className={label}>Nova Senha</label>
          <Input
            type="password"
            value={newPassword}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setNewPassword(e.target.value)}
            autoComplete="new-password"
            className={inputBase}
            placeholder="Digite a nova senha"
          />
        </div>
        <div>
          <label className={label}>Confirmar Nova Senha</label>
          <Input
            type="password"
            value={confirmPassword}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
            className={inputBase}
            placeholder="Confirme a nova senha"
          />
        </div>
      </div>
      {/* Botão alinhado ao canto direito do card, fora da max-w-md */}
      <div className="flex justify-end mt-6">
        <Button type="button" className={primaryButton} onClick={handleChangePassword}>
          Alterar Senha
        </Button>
      </div>
    </div>
  );
};

export default ChangePasswordCard;