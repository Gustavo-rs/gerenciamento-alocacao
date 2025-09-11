import { useState, useEffect } from 'react';
import { AppProvider } from './context/AppContext';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import ProjetoDetalhes from './components/ProjetoDetalhes';
import ProjetosManager from './components/ProjetosManager';
import ResultadosView from './components/ResultadosView';
import type { ProjetoAlocacao } from './types';

interface AppContentProps {
  activeTab: string;
}

function AppContent({ activeTab }: AppContentProps) {
  const [selectedProjeto, setSelectedProjeto] = useState<ProjetoAlocacao | null>(null);

  // Limpar projeto selecionado quando mudar de aba
  useEffect(() => {
    setSelectedProjeto(null);
  }, [activeTab]);

  const renderContent = () => {
    // Se um projeto está selecionado, mostrar os detalhes
    if (selectedProjeto) {
      return (
        <ProjetoDetalhes 
          projeto={selectedProjeto}
          onBack={() => setSelectedProjeto(null)}
        />
      );
    }

    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      
      case 'projetos':
        return (
          <ProjetosManager 
            onEditProjeto={() => {}}
            onShowForm={() => {}}
            onSelectProjeto={setSelectedProjeto}
          />
        );
      
      case 'resultados':
        return <ResultadosView />;
      
      default:
        return <Dashboard />;
    }
  };

  return renderContent();
}

function App() {
  return (
    <AppProvider>
      <Layout>
        {(activeTab) => <AppContent activeTab={activeTab} />}
      </Layout>
    </AppProvider>
  );
}

export default App;