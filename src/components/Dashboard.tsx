import { useState, useEffect } from 'react';
import { 
  Buildings, 
  Users, 
  ChartPie,
  Warning,
  CheckCircle,
  Download,
  Copy,
  Target,
  Clock,
  X
} from 'phosphor-react';
import { SkeletonDashboardStats, SkeletonDashboardSections, SkeletonDashboardExport } from './Skeleton';

interface DashboardStats {
  totalAlocacoes: number;
  alocacoesAtivas: number;
  totalSalas: number;
  salasAtivas: number;
  totalTurmas: number;
  totalAlunos: number;
  capacidadeTotal: number;
  cadeirasEspeciais: number;
  resultadosGerados: number;
}

interface AlocacaoProblematica {
  id: string;
  nome: string;
  salas: number;
  horarios: number;
}

interface AlocacaoCompatibilidade {
  id: string;
  nome: string;
  salas: number;
  horarios: number;
  temResultados: boolean;
}

interface DashboardData {
  stats: DashboardStats;
  alocacoesProblematicas: AlocacaoProblematica[];
  alocacoesCompatibilidade: AlocacaoCompatibilidade[];
}

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Carregar dados do dashboard
  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('http://localhost:3001/api/dashboard/stats');
      const data = await response.json();

      if (data.success) {
        setDashboardData(data.data);
      } else {
        setError(data.error || 'Erro ao carregar dados do dashboard');
      }
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
      setError('Erro ao conectar com o servidor');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Mostrar skeleton durante loading
  if (loading) {
    return (
      <div className="grid gap-6">
        <SkeletonDashboardStats />
        <SkeletonDashboardSections />
        <SkeletonDashboardExport />
      </div>
    );
  }

  // Mostrar erro se houver
  if (error || !dashboardData) {
    return (
      <div className="grid gap-6">
        <div className="card">
          <div className="card-content">
            <div className="text-center py-8">
              <Warning size={48} color="var(--danger-color)" style={{ marginBottom: '16px' }} />
              <h3 className="text-lg font-semibold mb-2">Erro ao carregar dados</h3>
              <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
                {error || 'Não foi possível carregar os dados do dashboard'}
              </p>
              <button 
                onClick={loadDashboardData}
                className="btn btn-primary"
              >
                Tentar novamente
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { stats, alocacoesProblematicas, alocacoesCompatibilidade } = dashboardData;

  return (
    <div className="grid gap-6">
      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-4 gap-4">
        <div className="card">
          <div className="card-content">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                  Alocações
                </p>
                <p className="text-xl font-bold">{stats.totalAlocacoes}</p>
                <p className="text-sm" style={{ color: 'var(--success-color)' }}>
                  {stats.alocacoesAtivas} ativas
                </p>
              </div>
              <Target size={32} color="var(--primary-color)" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-content">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                  Salas Totais
                </p>
                <p className="text-xl font-bold">{stats.totalSalas}</p>
                <p className="text-sm" style={{ color: 'var(--success-color)' }}>
                  {stats.salasAtivas} ativas
                </p>
              </div>
              <Buildings size={32} color="var(--primary-color)" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-content">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                  Turmas
                </p>
                <p className="text-xl font-bold">{stats.totalTurmas}</p>
                <p className="text-sm" style={{ color: 'var(--primary-color)' }}>
                  {stats.totalAlunos} alunos
                </p>
              </div>
              <Users size={32} color="var(--primary-color)" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-content">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                  Alocações
                </p>
                <p className="text-xl font-bold">{stats.resultadosGerados}</p>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  Realizadas
                </p>
              </div>
              <ChartPie size={32} color="var(--primary-color)" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Alertas e Problemas */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <Warning size={20} style={{ marginRight: '8px' }} />
              Alertas
            </h3>
            <p className="card-description">Problemas que precisam de atenção</p>
          </div>
          <div className="card-content">
            {alocacoesProblematicas.length === 0 ? (
              <div className="text-center" style={{ padding: 'var(--spacing-4)' }}>
                <CheckCircle size={32} color="var(--success-color)" style={{ marginBottom: 'var(--spacing-2)' }} />
                <p className="text-sm" style={{ color: 'var(--success-color)' }}>
                  Todas as alocações estão configuradas corretamente!
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {alocacoesProblematicas.map(alocacao => (
                  <div key={alocacao.id} className="alert" style={{ 
                    padding: 'var(--spacing-3)', 
                    backgroundColor: 'rgb(245 158 11 / 0.1)',
                    borderRadius: 'var(--radius)',
                    border: '1px solid rgb(245 158 11 / 0.2)'
                  }}>
                    <p className="text-sm font-medium" style={{ color: 'var(--warning-color)' }}>
                      <Warning size={14} style={{ marginRight: '4px', display: 'inline' }} />
                      {alocacao.nome}
                    </p>
                    <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                      {alocacao.salas === 0 && alocacao.horarios === 0 
                        ? 'Alocação vazia - adicione salas e horários'
                        : alocacao.salas === 0 
                        ? 'Adicione salas à alocação'
                        : 'Adicione horários à alocação'
                      }
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Resumo de Compatibilidade */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <Target size={20} style={{ marginRight: '8px' }} />
              Compatibilidade
            </h3>
            <p className="card-description">Status das alocações</p>
          </div>
          <div className="card-content">
            <div className="flex flex-col gap-4">
              {alocacoesCompatibilidade.map(alocacao => {
                const readyForAllocation = alocacao.salas > 0 && alocacao.horarios > 0;
                const hasResults = alocacao.temResultados;

                return (
                  <div key={alocacao.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{alocacao.nome}</p>
                      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        {alocacao.salas} salas • {alocacao.horarios} horários
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`badge ${
                        hasResults ? 'badge-success' :
                        readyForAllocation ? 'badge-warning' : 'badge-danger'
                      }`}>
                        {hasResults ? (
                          <>
                            <CheckCircle size={12} style={{ marginRight: '4px' }} />
                            Concluído
                          </>
                        ) : readyForAllocation ? (
                          <>
                            <Clock size={12} style={{ marginRight: '4px' }} />
                            Pronto
                          </>
                        ) : (
                          <>
                            <X size={12} style={{ marginRight: '4px' }} />
                            Configuração
                          </>
                        )}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Exportar Dados */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">
            <Download size={20} style={{ marginRight: '8px' }} />
            Exportar Dados
          </h3>
          <p className="card-description">Exporte os dados para enviar ao sistema Python</p>
        </div>
        <div className="card-content">
          <div className="flex gap-4">
            <button 
              className="btn btn-primary"
              onClick={() => {
                const dados = {
                  stats: stats,
                  alocacoes: alocacoesCompatibilidade,
                  problemas: alocacoesProblematicas,
                  timestamp: new Date().toISOString()
                };
                
                const blob = new Blob([JSON.stringify(dados, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `dashboard-${new Date().toISOString().split('T')[0]}.json`;
                a.click();
                URL.revokeObjectURL(url);
              }}
            >
              <Download size={16} style={{ marginRight: '6px' }} />
              Baixar JSON
            </button>
            
            <button 
              className="btn btn-secondary"
              onClick={() => {
                const dados = {
                  stats: stats,
                  alocacoes: alocacoesCompatibilidade,
                  problemas: alocacoesProblematicas
                };
                navigator.clipboard.writeText(JSON.stringify(dados, null, 2));
                alert('Dados do dashboard copiados para a área de transferência!');
              }}
            >
              <Copy size={16} style={{ marginRight: '6px' }} />
              Copiar para Clipboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
