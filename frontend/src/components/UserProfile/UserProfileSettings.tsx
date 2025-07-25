import React from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Edit, Check, X } from 'lucide-react';
import { UserData } from './types';

interface UserProfileSettingsProps {
  userData: UserData | null;
  setUserData: React.Dispatch<React.SetStateAction<UserData | null>>;
  isEditing: boolean;
  setIsEditing: (val: boolean) => void;
  handleUpdateUserData: () => void;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

/**
 * Componente de configurações de perfil do usuário.
 * - Layout aprimorado, títulos mais destacados, cards arredondados, responsividade e acessibilidade.
 */
const UserProfileSettings: React.FC<UserProfileSettingsProps> = ({
  userData,
  isEditing,
  setIsEditing,
  handleUpdateUserData,
  handleInputChange
}) => {
  if (!userData) {
    return (
      <div className="text-center py-10 text-gray-500">
        Carregando dados do usuário...
      </div>
    );
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Meus Dados</h2>
        {!isEditing && (
          <Button
            variant="outline"
            onClick={() => setIsEditing(true)}
            className="text-[#e11d48] border-[#e11d48] hover:bg-[#e11d48] hover:text-white"
          >
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Button>
        )}
      </div>
      <div className="bg-gray-50 rounded-xl shadow p-6">
        <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { label: 'Nome completo', name: 'name', type: 'text' },
            { label: 'Email', name: 'email', type: 'email' },
            { label: 'Telefone', name: 'phone', type: 'tel' },
            { label: 'Data de nascimento', name: 'birthDate', type: 'date' },
            { label: 'Endereço', name: 'address', type: 'text' },
            { label: 'Cidade', name: 'city', type: 'text' },
            { label: 'Estado', name: 'state', type: 'text' },
            { label: 'CEP', name: 'zipCode', type: 'text' },
          ].map(({ label, name, type }) => (
            <div key={name}>
              <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
                {label}
              </label>
              {isEditing ? (
                <Input
                  id={name}
                  name={name}
                  type={type}
                  value={userData[name as keyof UserData]}
                  onChange={handleInputChange}
                  className="w-full"
                />
              ) : (
                <p className="text-gray-900">
                  {name === 'birthDate'
                    ? (userData.birthDate
                        ? new Date(userData.birthDate).toLocaleDateString('pt-BR')
                        : '')
                    : userData[name as keyof UserData]
                  }
                </p>
              )}
            </div>
          ))}
        </form>
        {isEditing && (
          <div className="mt-6 flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setIsEditing(false)}
              className="border-gray-300 text-gray-700"
            >
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button
              onClick={handleUpdateUserData}
              className="bg-[#e11d48] text-white hover:bg-[#f43f5e]"
            >
              <Check className="h-4 w-4 mr-2" />
              Salvar
            </Button>
          </div>
        )}
      </div>
      <div className="mt-10">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Segurança</h2>
        <div className="bg-gray-50 rounded-xl shadow p-6">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Alterar Senha</h3>
          <form className="space-y-4">
            <div>
              <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Senha Atual
              </label>
              <Input
                id="currentPassword"
                type="password"
                className="w-full"
                autoComplete="current-password"
              />
            </div>
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Nova Senha
              </label>
              <Input
                id="newPassword"
                type="password"
                className="w-full"
                autoComplete="new-password"
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirmar Nova Senha
              </label>
              <Input
                id="confirmPassword"
                type="password"
                className="w-full"
                autoComplete="new-password"
              />
            </div>
            <div className="mt-6">
              <Button className="bg-[#e11d48] text-white hover:bg-[#f43f5e] font-semibold">
                Alterar Senha
              </Button>
            </div>
          </form>
        </div>
      </div>
      <div className="mt-10">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Notificações</h2>
        <div className="bg-gray-50 rounded-xl shadow p-6">
          <div className="space-y-4">
            {[
              {
                label: 'Lembretes de Consulta',
                description: 'Receba lembretes sobre suas consultas agendadas',
                defaultChecked: true
              },
              {
                label: 'Promoções e Novidades',
                description: 'Receba informações sobre promoções e novidades',
                defaultChecked: false
              },
              {
                label: 'Mensagens de Clínicas',
                description: 'Receba mensagens das clínicas que você frequenta',
                defaultChecked: true
              }
            ].map((item, idx) => (
              <div className="flex items-center justify-between" key={item.label}>
                <div>
                  <p className="font-medium text-gray-900">{item.label}</p>
                  <p className="text-sm text-gray-500">{item.description}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked={item.defaultChecked} />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#e11d48]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#e11d48]" />
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default UserProfileSettings;