import { AppProvider } from './context/AppContext';
import { ToastProvider } from './components/Toast';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import ResultadosView from './components/ResultadosView';
import AlocacoesManager from './components/AlocacoesManager';

interface AppContentProps {
  activeTab: string;
}

function AppContent({ activeTab }: AppContentProps) {
  const renderContent = () => {
     switch (activeTab) {
       case 'dashboard':
         return <Dashboard />;
       
       case 'alocacoes':
         return <AlocacoesManager />;
       
       case 'resultados':
         return <ResultadosView />;
       
       default:
         return <AlocacoesManager />;
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