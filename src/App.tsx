import { useState, useEffect } from 'react';
import { AppProvider } from './context/AppContext';
import { ToastProvider } from './components/Toast';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import ProjetoDetalhes from './components/ProjetoDetalhes';
import ProjetosManager from './components/ProjetosManager';
import ResultadosView from './components/ResultadosView';
import AlocacoesManager from './components/AlocacoesManager';
import SalasManager from './components/SalasManager';
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
       
       case 'alocacoes':
         return <AlocacoesManager />;
       
       case 'salas':
         return <SalasManager />;
       
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
    <ToastProvider>
      <AppProvider>
        <Layout>
          {(activeTab) => <AppContent activeTab={activeTab} />}
        </Layout>
      </AppProvider>
    </ToastProvider>
  );
}

export default App;