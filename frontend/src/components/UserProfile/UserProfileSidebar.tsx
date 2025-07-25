import React from 'react';
import {
  Calendar,
  Settings,
  CreditCard,
  LogOut,
  Star
} from 'lucide-react';

export type ActiveTab = 'appointments' | 'payments' | 'reviews' | 'settings';

interface UserProfileSidebarProps {
  userData: {
    name: string;
    email: string;
  };
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
}

const sidebarItems = [
  {
    key: 'appointments',
    label: 'Agendamentos',
    icon: Calendar
  },
  {
    key: 'payments',
    label: 'Pagamentos',
    icon: CreditCard
  },
  {
    key: 'reviews',
    label: 'Avaliações',
    icon: Star
  },
  {
    key: 'settings',
    label: 'Configurações',
    icon: Settings
  }
];

const UserProfileSidebar: React.FC<UserProfileSidebarProps> = ({
  userData,
  activeTab,
  setActiveTab
}) => (
  <aside className="w-full md:w-72 bg-white rounded-2xl shadow-lg p-6 flex-shrink-0">
    <div className="flex items-center mb-8">
      <div className="w-14 h-14 rounded-full bg-[#e11d48] flex items-center justify-center text-white text-3xl font-bold shadow-md">
        {userData.name.charAt(0)}
      </div>
      <div className="ml-4">
        <p className="font-semibold text-lg text-gray-800">{userData.name}</p>
        <p className="text-sm text-gray-500">{userData.email}</p>
      </div>
    </div>
    <nav className="space-y-2">
      {sidebarItems.map(item => (
        <button
          key={item.key}
          type="button"
          onClick={() => setActiveTab(item.key as ActiveTab)}
          className={`flex items-center w-full px-4 py-2.5 rounded-lg font-medium transition-colors ${
            activeTab === item.key
              ? 'bg-[#e11d48] text-white shadow'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <item.icon className="h-5 w-5 mr-3" />
          {item.label}
        </button>
      ))}
      <button
        type="button"
        onClick={() => window.location.href = '/logout'}
        className="flex items-center w-full px-4 py-2.5 rounded-lg text-gray-700 hover:bg-gray-100 font-medium mt-4 transition-colors"
      >
        <LogOut className="h-5 w-5 mr-3" />
        Sair
      </button>
    </nav>
  </aside>
);

export default UserProfileSidebar;