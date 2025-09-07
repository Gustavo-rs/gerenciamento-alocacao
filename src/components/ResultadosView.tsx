import { useApp } from '../context/AppContext';
import { Calendar, Target, Trash, Eye } from 'phosphor-react';

export default function ResultadosView() {
  const { state, dispatch } = useApp();

  const handleDelete = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este resultado de alocação?')) {
      dispatch({ type: 'DELETE_RESULTADO_ALOCACAO', payload: id });
    }
  };

  const formatScore = (score: number) => {
    return Math.round(score);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'var(--success-color)';
    if (score >= 60) return 'var(--warning-color)';
    return 'var(--danger-color)';
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'Data não disponível';
    return new Date(dateString).toLocaleString('pt-BR');
  };

  return (
    <div className="grid gap-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold">Resultados de Alocação</h1>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          Visualize os resultados das alocações inteligentes executadas
        </p>
      </div>

      {/* Lista de Resultados */}
      {state.resultados_alocacao.length === 0 ? (
        <div className="card">
          <div className="card-content text-center" style={{ padding: 'var(--spacing-8)' }}>
            <Calendar size={48} color="var(--text-secondary)" style={{ marginBottom: 'var(--spacing-4)' }} />
            <h3 className="text-lg font-semibold mb-4">Nenhum resultado encontrado</h3>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Execute a alocação inteligente em um projeto para ver os resultados aqui
            </p>
          </div>
        </div>
      ) : (
        <div className="grid gap-4">
          {state.resultados_alocacao.map((resultado) => {
            const projeto = state.projetos.find(p => p.id_projeto === resultado.projeto_id);
            
            return (
              <div key={resultado.id} className="card">
                <div className="card-header">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="card-title">
                        <Target size={20} style={{ marginRight: '8px' }} />
                        {projeto?.nome || 'Projeto não encontrado'}
                      </h3>
                      <p className="card-description">
                        Alocação gerada em {formatDate(resultado.data_geracao || resultado.created_at)}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                          Score de Otimização
                        </p>
                        <p 
                          className="text-xl font-bold"
                          style={{ color: getScoreColor(resultado.score_otimizacao) }}
                        >
                          {formatScore(resultado.score_otimizacao)}%
                        </p>
                      </div>
                      <button
                        onClick={() => handleDelete(resultado.id)}
                        className="btn btn-xs btn-danger"
                        title="Excluir resultado"
                      >
                        <Trash size={12} />
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="card-content">
                  {/* Parâmetros Utilizados */}
                  <div className="mb-6">
                    <h4 className="font-semibold mb-2">Parâmetros de Otimização:</h4>
                    <div className="flex flex-wrap gap-2">
                      {(resultado.parametros_usados?.priorizar_capacidade || resultado.priorizar_capacidade) && (
                        <span className="badge badge-info">Capacidade</span>
                      )}
                      {(resultado.parametros_usados?.priorizar_especiais || resultado.priorizar_especiais) && (
                        <span className="badge badge-info">Cadeiras Especiais</span>
                      )}
                      {(resultado.parametros_usados?.priorizar_proximidade || resultado.priorizar_proximidade) && (
                        <span className="badge badge-info">Proximidade</span>
                      )}
                    </div>
                  </div>

                  {/* Alocações */}
                  <div>
                    <h4 className="font-semibold mb-4">Alocações Realizadas ({resultado.alocacoes?.length || 0}):</h4>
                    <div className="grid gap-3">
                      {resultado.alocacoes && resultado.alocacoes.length > 0 ? resultado.alocacoes.map((alocacao) => (
                        <div key={alocacao.id} className="card" style={{ border: '1px solid var(--border-color)' }}>
                          <div className="card-content">
                            <div className="flex justify-between items-start">
                              <div style={{ flex: 1 }}>
                                <div className="flex items-center gap-4 mb-2">
                                  <h5 className="font-semibold">{alocacao.turma.nome}</h5>
                                  <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                                    →
                                  </span>
                                  <h5 className="font-semibold">{alocacao.sala.nome}</h5>
                                </div>
                                
                                <div className="grid grid-cols-3 gap-4 text-sm">
                                  <div>
                                    <span style={{ color: 'var(--text-secondary)' }}>Alunos: </span>
                                    <strong>{alocacao.turma.alunos}</strong>
                                  </div>
                                  <div>
                                    <span style={{ color: 'var(--text-secondary)' }}>Capacidade: </span>
                                    <strong>{alocacao.sala.capacidade_total}</strong>
                                  </div>
                                  <div>
                                    <span style={{ color: 'var(--text-secondary)' }}>Especiais: </span>
                                    <strong>{alocacao.turma.esp_necessarias}/{alocacao.sala.cadeiras_especiais}</strong>
                                  </div>
                                </div>

                                {alocacao.observacoes && (
                                  <div className="mt-2">
                                    <span className="badge badge-warning text-xs">
                                      ⚠️ {alocacao.observacoes}
                                    </span>
                                  </div>
                                )}
                              </div>
                              
                              <div className="text-center ml-4">
                                <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                                  Compatibilidade
                                </span>
                                <p 
                                  className="text-lg font-bold"
                                  style={{ color: getScoreColor(alocacao.compatibilidade_score) }}
                                >
                                  {formatScore(alocacao.compatibilidade_score)}%
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )) : (
                        <p className="text-sm text-center" style={{ color: 'var(--text-secondary)', padding: 'var(--spacing-4)' }}>
                          Nenhuma alocação encontrada
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
