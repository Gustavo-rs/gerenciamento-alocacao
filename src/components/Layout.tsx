import { useState } from 'react';
import type { ReactNode } from 'react';
import { ChartBar, FolderOpen, Calendar, Target, Buildings } from 'phosphor-react';

interface LayoutProps {
  children: (activeTab: string) => ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [activeTab, setActiveTab] = useState('dashboard');

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: ChartBar },
    { id: 'alocacoes', label: 'Alocações', icon: Buildings },
    { id: 'salas', label: 'Salas', icon: Buildings },
    { id: 'projetos', label: 'Projetos (Antigo)', icon: FolderOpen },
    { id: 'resultados', label: 'Resultados', icon: Calendar },
  ];

  return (
    <div>
      <header className="header">
        <div className="container">
          <div className="header-content">
            <div className="logo">
              <Target size={24} style={{ marginRight: '8px' }} />
              Sistema de Alocação
            </div>
            <nav className="nav">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
                >
                  <tab.icon size={18} style={{ marginRight: '8px' }} />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </header>

      <main className="main-content">
        <div className="container">
          {children(activeTab)}
        </div>
      </main>
    </div>
  );
}
