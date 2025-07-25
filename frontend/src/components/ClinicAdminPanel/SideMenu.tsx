import React from 'react';
import { Building2, Users, Calendar, FileText, Settings, LogOut, Boxes, Palette } from 'lucide-react';

interface SideMenuProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  clinicName: string;
  onLogout: () => void;
}

const tabs = [
  { tab: 'dashboard', label: 'Dashboard', icon: Palette },
  { tab: 'calendar', label: 'Calendário', icon: Calendar },
  { tab: 'appointments', label: 'Agendamentos', icon: Calendar },
  { tab: 'patients', label: 'Pacientes', icon: Users },
  { tab: 'professionals', label: 'Profissionais', icon: Users },
  { tab: 'services', label: 'Serviços', icon: FileText },
  { tab: 'stock', label: 'Estoque', icon: Boxes },
  { tab: 'settings', label: 'Configurações', icon: Settings },
];

const SideMenu: React.FC<SideMenuProps> = ({ activeTab, setActiveTab, clinicName, onLogout }) => (
  <aside className="fixed top-0 left-0 h-screen w-64 bg-white shadow-lg border-r z-40 print:hidden">
    <div className="p-4 border-b border-gray-200">
      <div className="flex items-center">
        <Building2 className="h-8 w-8 text-sky-500" />
        <div className="ml-3">
          <p className="text-sm font-medium text-gray-900">{clinicName}</p>
          <p className="text-xs text-gray-500">Painel Administrativo</p>
        </div>
      </div>
    </div>
    <nav className="mt-4 space-y-1">
      {tabs.map(item => (
        <button key={item.tab} onClick={() => setActiveTab(item.tab)}
          className={`group flex items-center w-full px-4 py-3 text-left text-sm font-medium rounded-md ${activeTab === item.tab ? 'bg-rose-50 text-rose-600 border-r-4 border-rose-500' : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'}`}>
          <item.icon className={`mr-3 h-5 w-5 ${activeTab === item.tab ? 'text-rose-500' : 'text-gray-400 group-hover:text-gray-500'}`} /> {item.label}
        </button>
      ))}
      <button onClick={onLogout} className="group flex items-center w-full px-4 py-3 text-left text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50 hover:text-gray-900">
        <LogOut className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" /> Sair
      </button>
    </nav>
  </aside>
);

export default SideMenu;