import { useState, useEffect } from 'react';
import { Brain, Clock, Users, Buildings, TrendUp, Eye, X, Warning, Student, Wheelchair, CheckCircle, Info } from 'phosphor-react';
import { useToast } from './Toast';
import LoadingSpinner from './LoadingSpinner';

interface ResultadoHorario {
  id: string;
  score_otimizacao: number;
  acuracia_modelo: number;
  total_turmas?: number;
  turmas_alocadas?: number;
  turmas_sobrando?: number;
  data_geracao: string;
  analise_detalhada: any;
  debug_info: any;
  turmas_nao_alocadas?: any[];
  horario: {
    id: string;
    dia_semana: string;
    periodo: string;
  };
  alocacoes: {
    id: string;
    compatibilidade_score: number;
    observacoes: string;
    sala: {
      id: string;
      nome: string;
      capacidade_total: number;
      cadeiras_especiais: number;
    };
    turma: {
      id: string;
      nome: string;
      alunos: number;
      esp_necessarias: number;
    };
  }[];
}

interface ResultadosAlocacaoInteligenteProps {
  alocacaoId: string;
  nomeAlocacao: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function ResultadosAlocacaoInteligenteAmigavel({ 
  alocacaoId, 
  nomeAlocacao, 
  isOpen, 
  onClose 
}: ResultadosAlocacaoInteligenteProps) {
  const [resultados, setResultados] = useState<ResultadoHorario[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedHorario, setExpandedHorario] = useState<string | null>(null);
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (isOpen && alocacaoId) {
      loadResultados();
    }
  }, [isOpen, alocacaoId]);

  const loadResultados = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:3001/api/alocacao-inteligente/${alocacaoId}/resultados`);
      const data = await response.json();
      
      if (data.success) {
        const resultadosFormatted = data.data.map((resultado: any) => ({
          ...resultado,
          analise_detalhada: JSON.parse(resultado.analise_detalhada || '{}'),
          debug_info: JSON.parse(resultado.debug_info || '{}'),
          turmas_nao_alocadas: JSON.parse(resultado.turmas_nao_alocadas || '[]')
        }));
        setResultados(resultadosFormatted);
      } else {
        toast.error('Erro', 'Erro ao carregar resultados');
      }
    } catch (error) {
      console.error('Erro ao carregar resultados:', error);
      toast.error('Erro', 'Erro ao carregar resultados');
    } finally {
      setLoading(false);
    }
  };

  const formatarDiaSemana = (dia: string) => {
    const dias: { [key: string]: string } = {
      'SEGUNDA': 'Segunda-feira',
      'TERCA': 'Terça-feira',
      'QUARTA': 'Quarta-feira',
      'QUINTA': 'Quinta-feira',
      'SEXTA': 'Sexta-feira',
      'SABADO': 'Sábado',
      'DOMINGO': 'Domingo'
    };
    return dias[dia] || dia;
  };

  const formatarPeriodo = (periodo: string) => {
    const periodos: { [key: string]: string } = {
      'MATUTINO': 'Manhã',
      'VESPERTINO': 'Tarde',
      'NOTURNO': 'Noite'
    };
    return periodos[periodo] || periodo;
  };

  const calcularScoreGeral = () => {
    if (resultados.length === 0) return 0;
    return Math.round(
      resultados.reduce((acc, r) => acc + r.score_otimizacao, 0) / resultados.length
    );
  };

  const calcularTotalAlocacoes = () => {
    return resultados.reduce((acc, r) => acc + r.alocacoes.length, 0);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#10b981'; // Verde
    if (score >= 60) return '#f59e0b'; // Amarelo
    return '#ef4444'; // Vermelho
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excelente';
    if (score >= 60) return 'Bom';
    return 'Atenção';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 80) return <CheckCircle size={16} style={{ color: '#10b981' }} />;
    if (score >= 60) return <Warning size={16} style={{ color: '#f59e0b' }} />;
    return <Warning size={16} style={{ color: '#ef4444' }} />;
  };

  const formatarObservacoes = (observacoes: string) => {
    const ocupacaoMatch = observacoes.match(/Ocupacao: ([\d.]+%)/);
    const especiaisMatch = observacoes.match(/Especiais: (\d+)\/(\d+)/);
    const moveisMatch = observacoes.match(/\+(\d+) moveis \(([^)]+)\)/);
    
    const info = {
      ocupacao: ocupacaoMatch ? ocupacaoMatch[1] : null,
      especiais: especiaisMatch ? `${especiaisMatch[1]}/${especiaisMatch[2]}` : null,
      moveis: moveisMatch ? moveisMatch[1] : null,
      moveisOrigem: moveisMatch ? moveisMatch[2] : null
    };

    return info;
  };

  if (!isOpen) return null;

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        padding: '1rem'
      }}
    >
      <div 
        style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          width: '95vw',
          maxWidth: '1200px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Header */}
        <div 
          style={{
            padding: '1.5rem',
            borderBottom: '1px solid #e5e7eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div 
              style={{
                padding: '8px',
                borderRadius: '8px',
                backgroundColor: '#10b98120',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Brain size={24} style={{ color: '#10b981' }} />
            </div>
            <div>
              <h2 style={{ 
                fontSize: '1.25rem', 
                fontWeight: '600', 
                margin: 0,
                color: '#111827'
              }}>
                Resultados da Alocação Inteligente
              </h2>
              <p style={{ 
                fontSize: '0.875rem',
                color: '#6b7280',
                margin: '2px 0 0 0'
              }}>
                {nomeAlocacao}
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button 
              onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
              style={{
                padding: '6px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                backgroundColor: showTechnicalDetails ? '#f3f4f6' : 'white',
                color: '#374151',
                cursor: 'pointer',
                fontSize: '0.75rem',
                fontWeight: '500',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <Info size={14} />
              {showTechnicalDetails ? 'Ocultar' : 'Mostrar'} Detalhes
            </button>
            <button 
              onClick={onClose}
              style={{
                padding: '8px',
                border: 'none',
                borderRadius: '6px',
                backgroundColor: '#f3f4f6',
                color: '#6b7280',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s'
              }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div 
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '1.5rem'
          }}
        >
          {loading ? (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              padding: '3rem' 
            }}>
              <LoadingSpinner />
            </div>
          ) : (
            <>
              {/* Resumo Geral - Versão Amigável */}
              <div style={{ 
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '1.5rem',
                marginBottom: '1.5rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1rem' }}>
                  <TrendUp size={24} style={{ color: '#3b82f6' }} />
                  <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: '600', color: '#1e293b' }}>
                    Resumo da Alocação
                  </h3>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#3b82f6' }}>
                      {resultados.length}
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                      Horários Processados
                    </div>
                  </div>
                  
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>
                      {calcularTotalAlocacoes()}
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                      Turmas Alocadas
                    </div>
                  </div>
                  
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ 
                      fontSize: '2rem', 
                      fontWeight: 'bold', 
                      color: getScoreColor(calcularScoreGeral())
                    }}>
                      {calcularScoreGeral()}%
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                      Qualidade Geral
                    </div>
                    <div style={{ 
                      fontSize: '0.75rem', 
                      color: getScoreColor(calcularScoreGeral()),
                      fontWeight: '500',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px',
                      marginTop: '4px'
                    }}>
                      {getScoreIcon(calcularScoreGeral())}
                      {getScoreLabel(calcularScoreGeral())}
                    </div>
                  </div>
                </div>
              </div>

              {/* Resultados por Horário */}
              {resultados.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem' }}>
                  <Brain size={48} style={{ color: '#9ca3af', margin: '0 auto 16px' }} />
                  <p style={{ color: '#6b7280' }}>
                    Nenhum resultado encontrado. Execute a alocação inteligente primeiro.
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {resultados.map((resultado) => (
                    <div key={resultado.id} style={{
                      border: '1px solid #e5e7eb',
                      borderRadius: '12px',
                      overflow: 'hidden'
                    }}>
                      <div 
                        style={{
                          padding: '1rem',
                          backgroundColor: '#f9fafb',
                          borderBottom: '1px solid #e5e7eb',
                          cursor: 'pointer'
                        }}
                        onClick={() => setExpandedHorario(
                          expandedHorario === resultado.id ? null : resultado.id
                        )}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <Clock size={20} style={{ color: '#3b82f6' }} />
                            <div>
                              <h3 style={{ 
                                margin: 0, 
                                fontSize: '1rem', 
                                fontWeight: '600',
                                color: '#111827'
                              }}>
                                {formatarDiaSemana(resultado.horario.dia_semana)} - {formatarPeriodo(resultado.horario.periodo)}
                              </h3>
                              <p style={{ 
                                margin: '4px 0 0 0', 
                                fontSize: '0.875rem', 
                                color: '#6b7280' 
                              }}>
                                {resultado.analise_detalhada?.erro ? (
                                  <span style={{ color: '#ef4444', fontWeight: '500' }}>
                                    ❌ Falha no processamento
                                  </span>
                                ) : (
                                  <>
                                    {resultado.alocacoes.length} de {resultado.total_turmas || resultado.alocacoes.length} turmas alocadas
                                    {resultado.turmas_sobrando && resultado.turmas_sobrando > 0 && (
                                      <span style={{ color: '#f59e0b', fontWeight: '500' }}>
                                        {' • '}{resultado.turmas_sobrando} não alocada{resultado.turmas_sobrando > 1 ? 's' : ''}
                                      </span>
                                    )}
                                  </>
                                )}
                              </p>
                            </div>
                          </div>
                          <button style={{
                            padding: '6px 12px',
                            border: '1px solid #d1d5db',
                            borderRadius: '6px',
                            backgroundColor: 'white',
                            color: '#374151',
                            cursor: 'pointer',
                            fontSize: '0.75rem',
                            fontWeight: '500',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}>
                            <Eye size={14} />
                            {expandedHorario === resultado.id ? 'Ocultar' : 'Ver'}
                          </button>
                        </div>
                      </div>

                      {expandedHorario === resultado.id && (
                        <div style={{ padding: '1.5rem' }}>
                          {resultado.analise_detalhada?.erro ? (
                            <div style={{
                              backgroundColor: '#fef2f2',
                              border: '1px solid #fecaca',
                              borderRadius: '8px',
                              padding: '1rem'
                            }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem' }}>
                                <Warning size={20} style={{ color: '#dc2626' }} />
                                <h4 style={{ margin: 0, color: '#dc2626', fontSize: '1rem', fontWeight: '600' }}>
                                  Erro no Processamento
                                </h4>
                              </div>
                              <p style={{ margin: 0, color: '#991b1b', fontSize: '0.875rem' }}>
                                {resultado.analise_detalhada.detalhes}
                              </p>
                            </div>
                          ) : (
                            <>
                              {/* Alocações - Versão Amigável */}
                              {resultado.alocacoes.length > 0 && (
                                <div style={{ marginBottom: '1.5rem' }}>
                                  <h4 style={{ 
                                    margin: '0 0 1rem 0', 
                                    fontSize: '1rem', 
                                    fontWeight: '600',
                                    color: '#111827'
                                  }}>
                                    Alocações Realizadas
                                  </h4>
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    {resultado.alocacoes.map((alocacao) => {
                                      const info = formatarObservacoes(alocacao.observacoes);
                                      return (
                                        <div key={alocacao.id} style={{
                                          backgroundColor: '#f8fafc',
                                          border: '1px solid #e2e8f0',
                                          borderRadius: '8px',
                                          padding: '1rem'
                                        }}>
                                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                              <Users size={16} style={{ color: '#3b82f6' }} />
                                              <span style={{ fontWeight: '600', color: '#111827' }}>
                                                {alocacao.turma.nome}
                                              </span>
                                            </div>
                                            <div style={{ 
                                              display: 'flex', 
                                              alignItems: 'center', 
                                              gap: '4px',
                                              color: getScoreColor(alocacao.compatibilidade_score)
                                            }}>
                                              {getScoreIcon(alocacao.compatibilidade_score)}
                                              <span style={{ fontWeight: '600' }}>
                                                {alocacao.compatibilidade_score}%
                                              </span>
                                            </div>
                                          </div>
                                          
                                          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                                            <div style={{ flex: 1 }}>
                                              <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                                                {alocacao.turma.alunos} alunos
                                                {alocacao.turma.esp_necessarias > 0 && (
                                                  <span style={{ marginLeft: '8px' }}>
                                                    • {alocacao.turma.esp_necessarias} especiais
                                                  </span>
                                                )}
                                              </div>
                                            </div>
                                            <div style={{ fontSize: '1.25rem', color: '#9ca3af' }}>→</div>
                                            <div style={{ flex: 1 }}>
                                              <div style={{ fontWeight: '500', color: '#111827' }}>
                                                {alocacao.sala.nome}
                                              </div>
                                              <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                                                Capacidade: {alocacao.sala.capacidade_total}
                                                {alocacao.sala.cadeiras_especiais > 0 && (
                                                  <span style={{ marginLeft: '8px' }}>
                                                    • {alocacao.sala.cadeiras_especiais} especiais
                                                  </span>
                                                )}
                                              </div>
                                            </div>
                                          </div>

                                          {/* Informações úteis extraídas das observações */}
                                          {(info.ocupacao || info.especiais || info.moveis) && (
                                            <div style={{ 
                                              display: 'flex', 
                                              gap: '1rem', 
                                              fontSize: '0.75rem',
                                              color: '#6b7280'
                                            }}>
                                              {info.ocupacao && (
                                                <span style={{ 
                                                  backgroundColor: '#e0f2fe',
                                                  color: '#0277bd',
                                                  padding: '2px 6px',
                                                  borderRadius: '4px'
                                                }}>
                                                  Ocupação: {info.ocupacao}
                                                </span>
                                              )}
                                              {info.especiais && (
                                                <span style={{ 
                                                  backgroundColor: '#f3e8ff',
                                                  color: '#7c3aed',
                                                  padding: '2px 6px',
                                                  borderRadius: '4px'
                                                }}>
                                                  Especiais: {info.especiais}
                                                </span>
                                              )}
                                              {info.moveis && (
                                                <span style={{ 
                                                  backgroundColor: '#fef3c7',
                                                  color: '#d97706',
                                                  padding: '2px 6px',
                                                  borderRadius: '4px'
                                                }}>
                                                  +{info.moveis} móveis {info.moveisOrigem && `(${info.moveisOrigem})`}
                                                </span>
                                              )}
                                            </div>
                                          )}
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}

                              {/* Turmas Não Alocadas - Versão Amigável */}
                              {resultado.turmas_nao_alocadas && resultado.turmas_nao_alocadas.length > 0 && (
                                <div style={{
                                  backgroundColor: '#fffbeb',
                                  border: '1px solid #fed7aa',
                                  borderRadius: '8px',
                                  padding: '1rem'
                                }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.75rem' }}>
                                    <Warning size={18} style={{ color: '#d97706' }} />
                                    <h4 style={{ 
                                      margin: 0, 
                                      color: '#d97706', 
                                      fontSize: '0.875rem', 
                                      fontWeight: '600' 
                                    }}>
                                      {resultado.turmas_nao_alocadas.length} Turma{resultado.turmas_nao_alocadas.length > 1 ? 's' : ''} Não Alocada{resultado.turmas_nao_alocadas.length > 1 ? 's' : ''}
                                    </h4>
                                  </div>
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    {resultado.turmas_nao_alocadas.map((turma: any, index: number) => (
                                      <div key={index} style={{
                                        backgroundColor: 'white',
                                        border: '1px solid #fed7aa',
                                        borderRadius: '6px',
                                        padding: '0.75rem'
                                      }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.25rem' }}>
                                          <Users size={14} style={{ color: '#d97706' }} />
                                          <span style={{ fontWeight: '500', color: '#92400e' }}>
                                            {turma.nome}
                                          </span>
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: '#92400e', marginLeft: '22px' }}>
                                          {turma.alunos} alunos
                                          {turma.esp_necessarias > 0 && (
                                            <span style={{ marginLeft: '8px' }}>
                                              • {turma.esp_necessarias} especiais
                                            </span>
                                          )}
                                        </div>
                                        <div style={{ 
                                          fontSize: '0.75rem', 
                                          color: '#a16207',
                                          marginTop: '0.25rem',
                                          marginLeft: '22px',
                                          fontStyle: 'italic'
                                        }}>
                                          {turma.motivo}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Detalhes Técnicos - Só se solicitado */}
                              {showTechnicalDetails && (
                                <div style={{ 
                                  marginTop: '1.5rem',
                                  backgroundColor: '#f8fafc',
                                  border: '1px solid #e2e8f0',
                                  borderRadius: '8px',
                                  padding: '1rem'
                                }}>
                                  <h4 style={{ 
                                    margin: '0 0 0.75rem 0', 
                                    fontSize: '0.875rem', 
                                    fontWeight: '600',
                                    color: '#374151'
                                  }}>
                                    Detalhes Técnicos
                                  </h4>
                                  
                                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', marginBottom: '1rem' }}>
                                    <div style={{ fontSize: '0.75rem' }}>
                                      <span style={{ color: '#6b7280' }}>Acurácia do Modelo:</span>
                                      <span style={{ fontWeight: '500', marginLeft: '4px' }}>
                                        {resultado.acuracia_modelo}%
                                      </span>
                                    </div>
                                    <div style={{ fontSize: '0.75rem' }}>
                                      <span style={{ color: '#6b7280' }}>Data de Geração:</span>
                                      <span style={{ fontWeight: '500', marginLeft: '4px' }}>
                                        {new Date(resultado.data_geracao).toLocaleString('pt-BR')}
                                      </span>
                                    </div>
                                  </div>

                                  {resultado.alocacoes.some(a => a.observacoes) && (
                                    <div>
                                      <div style={{ fontSize: '0.75rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                                        Observações Técnicas:
                                      </div>
                                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                        {resultado.alocacoes
                                          .filter(a => a.observacoes)
                                          .map((alocacao) => (
                                            <div key={alocacao.id} style={{
                                              fontSize: '0.75rem',
                                              backgroundColor: '#e0f2fe',
                                              color: '#0277bd',
                                              padding: '0.5rem',
                                              borderRadius: '4px',
                                              fontFamily: 'monospace'
                                            }}>
                                              <span style={{ fontWeight: '500' }}>{alocacao.turma.nome}:</span> {alocacao.observacoes}
                                            </div>
                                          ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div 
          style={{
            padding: '1rem 1.5rem',
            borderTop: '1px solid #e5e7eb',
            display: 'flex',
            justifyContent: 'flex-end'
          }}
        >
          <button 
            onClick={onClose}
            style={{
              padding: '0.5rem 1rem',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              backgroundColor: 'white',
              color: '#374151',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: '500',
              transition: 'all 0.2s'
            }}
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
