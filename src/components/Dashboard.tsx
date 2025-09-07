import { useApp } from '../context/AppContext';
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

export default function Dashboard() {
  const { state } = useApp();

  // Calcular estatísticas agregadas de todos os projetos
  const todasSalas = state.projetos.flatMap(p => p.salas);
  const todasTurmas = state.projetos.flatMap(p => p.turmas);

  const stats = {
    totalAlocacoes: state.projetos.length,
    alocacoesAtivas: state.projetos.filter(p => p.status === 'configuracao' || p.status === 'pronto').length,
    totalSalas: todasSalas.length,
    salasAtivas: todasSalas.filter(s => s.status === 'ativa').length,
    totalTurmas: todasTurmas.length,
    totalAlunos: todasTurmas.reduce((acc, t) => acc + t.alunos, 0),
    capacidadeTotal: todasSalas.reduce((acc, s) => acc + s.capacidade_total, 0),
    cadeirasEspeciais: todasSalas.reduce((acc, s) => acc + s.cadeiras_especiais, 0),
    resultadosGerados: state.resultados_alocacao.length,
  };

  const projetosProblematicos = state.projetos.filter(projeto => 
    projeto.salas.length === 0 || projeto.turmas.length === 0
  );

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
            {projetosProblematicos.length === 0 ? (
              <div className="text-center" style={{ padding: 'var(--spacing-4)' }}>
                <CheckCircle size={32} color="var(--success-color)" style={{ marginBottom: 'var(--spacing-2)' }} />
                <p className="text-sm" style={{ color: 'var(--success-color)' }}>
                  Todas as alocações estão configuradas corretamente!
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {projetosProblematicos.map(projeto => (
                  <div key={projeto.id_projeto} className="alert" style={{ 
                    padding: 'var(--spacing-3)', 
                    backgroundColor: 'rgb(245 158 11 / 0.1)',
                    borderRadius: 'var(--radius)',
                    border: '1px solid rgb(245 158 11 / 0.2)'
                  }}>
                    <p className="text-sm font-medium" style={{ color: 'var(--warning-color)' }}>
                      <Warning size={14} style={{ marginRight: '4px', display: 'inline' }} />
                      {projeto.nome}
                    </p>
                    <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                      {projeto.salas.length === 0 && projeto.turmas.length === 0 
                        ? 'Alocação vazia - adicione salas e turmas'
                        : projeto.salas.length === 0 
                        ? 'Adicione salas à alocação'
                        : 'Adicione turmas à alocação'
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
              {state.projetos.map(projeto => {
                const readyForAllocation = projeto.salas.length > 0 && projeto.turmas.length > 0;
                const hasResults = state.resultados_alocacao.some(r => r.projeto_id === projeto.id_projeto);

                return (
                  <div key={projeto.id_projeto} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{projeto.nome}</p>
                      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        {projeto.salas.length} salas • {projeto.turmas.length} turmas
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
                  alocacoes: state.projetos,
                  resultados_alocacao: state.resultados_alocacao,
                  timestamp: new Date().toISOString()
                };
                
                const blob = new Blob([JSON.stringify(dados, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'alocacoes.json';
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
                  alocacoes: state.projetos,
                  resultados_alocacao: state.resultados_alocacao
                };
                navigator.clipboard.writeText(JSON.stringify(dados, null, 2));
                alert('Dados copiados para a área de transferência!');
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
