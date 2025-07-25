import React from 'react';

export type TabType = 'sobre' | 'profissionais' | 'servicos' | 'avaliacoes';

type ClinicTabsProps = {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  onlySobreTab?: boolean;
};

export function ClinicTabs({ activeTab, setActiveTab, onlySobreTab = false }: ClinicTabsProps) {
  const tabs: TabType[] = onlySobreTab
    ? ['sobre']
    : ['sobre', 'profissionais', 'servicos', 'avaliacoes'];
  return (
    <div className="border-b border-gray-200">
      <nav className="flex -mb-px">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`py-4 px-6 text-sm font-medium ${
              activeTab === tab
                ? 'border-b-2 border-[#e11d48] text-[#e11d48]'
                : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            type="button"
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </nav>
    </div>
  );
}