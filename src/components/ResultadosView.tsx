import { useApp } from '../context/AppContext';
import { Calendar, Target, Download, Eye, Clock } from 'phosphor-react';

export default function ResultadosView() {
  const { state, dispatch } = useApp();

  const handleViewDetails = (resultado: any) => {
    // Aqui poderia abrir um modal com detalhes completos
    console.log('Ver detalhes do resultado:', resultado);
  };

  const handleExportResult = (resultado: any) => {
    // Exportar resultado como JSON ou CSV
    const dataStr = JSON.stringify(resultado, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `alocacao_${resultado.id}_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
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
            const projeto = state.projetos.find(p => p.id === resultado.projeto_id);
            
            return (
              <div key={resultado.id} className="card">
                <div className="card-header">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="card-title">
                        <Target size={20} style={{ marginRight: '8px' }} />
                        Resultado de Alocação
                      </h3>
                      <p className="card-description">
                        <strong>{projeto?.nome || 'Projeto não encontrado'}</strong>
                      </p>
                      <p className="card-description text-xs flex items-center gap-1">
                        <Clock size={14} />
                        Gerado em {formatDate(resultado.data_geracao || resultado.created_at)}
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
                      
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleViewDetails(resultado)}
                          className="btn btn-sm btn-secondary"
                          title="Ver detalhes completos"
                        >
                          <Eye size={14} />
                          Detalhes
                        </button>
                        <button
                          onClick={() => handleExportResult(resultado)}
                          className="btn btn-sm btn-primary"
                          title="Exportar resultado"
                        >
                          <Download size={14} />
                          Exportar
                        </button>
                      </div>
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

                  {/* Análise de Viabilidade */}
                  {resultado.analise_detalhada && (
                    <div className="mb-6">
                      <h4 className="font-semibold mb-3">Análise de Viabilidade:</h4>
                      
                      {/* Status da Viabilidade */}
                      <div className="flex items-center gap-3 mb-4">
                        <span className="text-sm font-medium">Status:</span>
                        <span className={`badge ${
                          resultado.analise_detalhada.viabilidade === 'alta' ? 'badge-success' :
                          resultado.analise_detalhada.viabilidade === 'media' ? 'badge-warning' : 'badge-danger'
                        }`}>
                          {resultado.analise_detalhada.viabilidade === 'alta' ? '✅ Alta Viabilidade' :
                           resultado.analise_detalhada.viabilidade === 'media' ? '⚠️ Viabilidade Média' : '❌ Baixa Viabilidade'}
                        </span>
                        <span className="text-sm text-gray-600">
                          ({resultado.analise_detalhada.total_turmas} turmas, {resultado.analise_detalhada.total_salas} salas ativas)
                        </span>
                      </div>

                      {/* Problemas Críticos */}
                      {resultado.analise_detalhada.problemas_criticos && resultado.analise_detalhada.problemas_criticos.length > 0 && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                          <h5 className="font-semibold text-red-800 mb-2">🚨 Problemas Críticos ({resultado.analise_detalhada.problemas_criticos.length}):</h5>
                          {resultado.analise_detalhada.problemas_criticos.map((problema, idx) => (
                            <div key={idx} className="mb-3 last:mb-0">
                              <p className="font-medium text-red-700">{problema.resumo}</p>
                              {problema.detalhes && problema.detalhes.length > 0 && (
                                <ul className="mt-1 ml-4 space-y-1">
                                  {problema.detalhes.map((detalhe, detIdx) => (
                                    <li key={detIdx} className="text-sm text-red-600">• {detalhe}</li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Avisos */}
                      {resultado.analise_detalhada.avisos && resultado.analise_detalhada.avisos.length > 0 && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                          <h5 className="font-semibold text-yellow-800 mb-2">⚠️ Avisos ({resultado.analise_detalhada.avisos.length}):</h5>
                          <ul className="space-y-1">
                            {resultado.analise_detalhada.avisos.map((aviso, idx) => (
                              <li key={idx} className="text-sm text-yellow-700">• {aviso}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Caso sem problemas */}
                      {(!resultado.analise_detalhada.problemas_criticos || resultado.analise_detalhada.problemas_criticos.length === 0) &&
                       (!resultado.analise_detalhada.avisos || resultado.analise_detalhada.avisos.length === 0) && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                          <p className="text-green-800">✅ Nenhum problema identificado! Todas as alocações são viáveis.</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Estatísticas Resumidas */}
                  <div className="mb-6">
                    <h4 className="font-semibold mb-3">Estatísticas do Resultado:</h4>
                    <div className="grid grid-cols-4 gap-4 text-center">
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-2xl font-bold text-blue-600">{resultado.alocacoes?.length || 0}</p>
                        <p className="text-sm text-gray-600">Alocações</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-2xl font-bold" style={{ color: getScoreColor(resultado.score_otimizacao) }}>
                          {formatScore(resultado.score_otimizacao)}%
                        </p>
                        <p className="text-sm text-gray-600">Score Geral</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-2xl font-bold text-green-600">
                          {resultado.alocacoes?.filter(a => a.compatibilidade_score >= 80).length || 0}
                        </p>
                        <p className="text-sm text-gray-600">Alta Qualidade</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-2xl font-bold text-purple-600">
                          {resultado.acuracia_modelo || 0}%
                        </p>
                        <p className="text-sm text-gray-600">Precisão IA</p>
                      </div>
                    </div>
                  </div>

                  {/* Alocações Detalhadas */}
                  <div>
                    <h4 className="font-semibold mb-4">Alocações Detalhadas ({resultado.alocacoes?.length || 0}):</h4>
                    <div className="space-y-3">
                      {resultado.alocacoes && resultado.alocacoes.length > 0 ? resultado.alocacoes.map((alocacao, index) => (
                        <div key={alocacao.id || index} className="card" style={{ border: '1px solid var(--border-color)', backgroundColor: '#fafafa' }}>
                          <div className="card-content">
                            <div className="flex justify-between items-start">
                              <div style={{ flex: 1 }}>
                                <div className="flex items-center gap-3 mb-3">
                                  <span className="badge badge-primary text-xs">#{index + 1}</span>
                                  <h5 className="font-semibold text-blue-700">{alocacao.turma.nome}</h5>
                                  <span className="text-lg" style={{ color: 'var(--text-secondary)' }}>→</span>
                                  <h5 className="font-semibold text-green-700">{alocacao.sala.nome}</h5>
                                </div>
                                
                                <div className="grid grid-cols-4 gap-3 text-sm mb-2">
                                  <div className="bg-white p-2 rounded">
                                    <span className="text-gray-500">Alunos:</span>
                                    <strong className="block text-blue-600">{alocacao.turma.alunos}</strong>
                                  </div>
                                  <div className="bg-white p-2 rounded">
                                    <span className="text-gray-500">Capacidade:</span>
                                    <strong className="block text-green-600">{alocacao.sala.capacidade_total}</strong>
                                  </div>
                                  <div className="bg-white p-2 rounded">
                                    <span className="text-gray-500">Ocupação:</span>
                                    <strong className="block text-orange-600">
                                      {Math.round((alocacao.turma.alunos / alocacao.sala.capacidade_total) * 100)}%
                                    </strong>
                                  </div>
                                  <div className="bg-white p-2 rounded">
                                    <span className="text-gray-500">Especiais:</span>
                                    <strong className="block text-purple-600">
                                      {alocacao.turma.esp_necessarias}/{alocacao.sala.cadeiras_especiais}
                                    </strong>
                                  </div>
                                </div>

                                {alocacao.observacoes && (
                                  <div className="mt-2">
                                    <span className="badge badge-info text-xs">
                                      💡 {alocacao.observacoes}
                                    </span>
                                  </div>
                                )}
                              </div>
                              
                              <div className="text-center ml-4 min-w-[80px]">
                                <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                                  Score
                                </span>
                                <p 
                                  className="text-xl font-bold"
                                  style={{ color: getScoreColor(alocacao.compatibilidade_score) }}
                                >
                                  {formatScore(alocacao.compatibilidade_score)}%
                                </p>
                                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                                  <div 
                                    className="h-2 rounded-full" 
                                    style={{ 
                                      width: `${alocacao.compatibilidade_score}%`,
                                      backgroundColor: getScoreColor(alocacao.compatibilidade_score)
                                    }}
                                  ></div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )) : (
                        <div className="bg-gray-50 rounded-lg p-8 text-center">
                          <Target size={48} className="text-gray-400 mx-auto mb-4" />
                          <h5 className="font-semibold text-gray-700 mb-2">Nenhuma Alocação Realizada</h5>
                          <p className="text-gray-600 mb-4">
                            O algoritmo não conseguiu gerar alocações viáveis para este projeto.
                          </p>
                          {resultado.analise_detalhada && resultado.analise_detalhada.problemas_criticos && resultado.analise_detalhada.problemas_criticos.length > 0 ? (
                            <div className="bg-red-100 border border-red-300 rounded-lg p-4 text-left">
                              <p className="font-medium text-red-800 mb-2">🔍 Principais motivos:</p>
                              <ul className="space-y-1">
                                {resultado.analise_detalhada.problemas_criticos.slice(0, 3).map((problema, idx) => (
                                  <li key={idx} className="text-sm text-red-700">
                                    • {problema.resumo}
                                  </li>
                                ))}
                              </ul>
                              {resultado.analise_detalhada.problemas_criticos.length > 3 && (
                                <p className="text-xs text-red-600 mt-2">
                                  E mais {resultado.analise_detalhada.problemas_criticos.length - 3} problema(s)...
                                </p>
                              )}
                            </div>
                          ) : (
                            <div className="bg-blue-100 border border-blue-300 rounded-lg p-4">
                              <p className="text-sm text-blue-800">
                                💡 <strong>Sugestões:</strong> Verifique se as salas têm capacidade e recursos suficientes para as turmas, 
                                ou considere ajustar os parâmetros de alocação.
                              </p>
                            </div>
                          )}
                        </div>
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
