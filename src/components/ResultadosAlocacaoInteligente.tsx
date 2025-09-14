import React, { useState, useEffect } from 'react';
import { Brain, Clock, Users, Buildings, TrendUp, Eye, X } from 'phosphor-react';
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

export default function ResultadosAlocacaoInteligente({ 
  alocacaoId, 
  nomeAlocacao, 
  isOpen, 
  onClose 
}: ResultadosAlocacaoInteligenteProps) {
  const [resultados, setResultados] = useState<ResultadoHorario[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedHorario, setExpandedHorario] = useState<string | null>(null);
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
        // Parse JSON fields
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
      'MATUTINO': 'Matutino',
      'VESPERTINO': 'Vespertino',
      'NOTURNO': 'Noturno'
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
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#e5e7eb';
              e.currentTarget.style.color = '#374151';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#f3f4f6';
              e.currentTarget.style.color = '#6b7280';
            }}
          >
            <X size={20} />
          </button>
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
              {/* Estatísticas Gerais */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="stat-card">
                  <div className="stat-value">{resultados.length}</div>
                  <div className="stat-label">Horários Processados</div>
                  <Clock size={20} className="stat-icon" />
                </div>
                <div className="stat-card">
                  <div className="stat-value">{calcularTotalAlocacoes()}</div>
                  <div className="stat-label">Alocações Geradas</div>
                  <Buildings size={20} className="stat-icon" />
                </div>
                <div className="stat-card">
                  <div className="stat-value">{calcularScoreGeral()}%</div>
                  <div className="stat-label">Score Geral</div>
                  <TrendUp size={20} className="stat-icon" />
                </div>
              </div>

              {/* Resultados por Horário */}
              {resultados.length === 0 ? (
                <div className="text-center py-8">
                  <Brain size={48} style={{ color: 'var(--text-secondary)', margin: '0 auto 16px' }} />
                  <p style={{ color: 'var(--text-secondary)' }}>
                    Nenhum resultado encontrado. Execute a alocação inteligente primeiro.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {resultados.map((resultado) => (
                    <div key={resultado.id} className="card">
                      <div 
                        className="card-header cursor-pointer"
                        onClick={() => setExpandedHorario(
                          expandedHorario === resultado.id ? null : resultado.id
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Clock size={20} style={{ color: 'var(--primary-color)' }} />
                            <div>
                              <h3 className="font-semibold">
                                {formatarDiaSemana(resultado.horario.dia_semana)} - {formatarPeriodo(resultado.horario.periodo)}
                              </h3>
                              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                                {/* Verificar se houve erro */}
                                {resultado.analise_detalhada?.erro ? (
                                  <span style={{ color: 'var(--danger-color)', fontWeight: '500' }}>
                                    ❌ Falha no processamento • {resultado.total_turmas || 0} turmas não processadas
                                  </span>
                                ) : (
                                  <>
                                    {resultado.alocacoes.length} alocadas de {resultado.total_turmas || resultado.alocacoes.length} turmas • Score: {resultado.score_otimizacao}%
                                    {resultado.turmas_sobrando && resultado.turmas_sobrando > 0 && (
                                      <span style={{ color: 'var(--warning-color)', fontWeight: '500' }}>
                                        {' • '}{resultado.turmas_sobrando} turma{resultado.turmas_sobrando > 1 ? 's' : ''} não alocada{resultado.turmas_sobrando > 1 ? 's' : ''}
                                      </span>
                                    )}
                                  </>
                                )}
                              </p>
                            </div>
                          </div>
                          <button className="btn btn-sm btn-secondary">
                            <Eye size={16} />
                            {expandedHorario === resultado.id ? 'Ocultar' : 'Visualizar'}
                          </button>
                        </div>
                      </div>

                      {expandedHorario === resultado.id && (
                        <div className="card-content">
                          {/* Verificar se houve erro e mostrar detalhes */}
                          {resultado.analise_detalhada?.erro ? (
                            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded">
                              <h4 className="font-semibold mb-2" style={{ color: 'var(--danger-color)' }}>
                                ❌ Erro no Processamento
                              </h4>
                              <div className="text-sm mb-3" style={{ color: '#dc2626' }}>
                                <strong>Detalhes:</strong> {resultado.analise_detalhada.detalhes}
                              </div>
                              <div className="text-xs p-2 bg-red-100 rounded" style={{ color: '#991b1b' }}>
                                <strong>Data:</strong> {new Date(resultado.data_geracao).toLocaleString('pt-BR')}
                              </div>
                              
                              {/* Mostrar turmas que não puderam ser processadas */}
                              {resultado.turmas_nao_alocadas && resultado.turmas_nao_alocadas.length > 0 && (
                                <div className="mt-3">
                                  <div className="text-sm font-semibold mb-2" style={{ color: '#dc2626' }}>
                                    Turmas Afetadas:
                                  </div>
                                  <div className="space-y-1">
                                    {resultado.turmas_nao_alocadas.map((turma: any, index: number) => (
                                      <div key={index} className="text-xs p-2 bg-red-100 rounded">
                                        <strong>{turma.nome}</strong> - {turma.alunos} alunos, {turma.esp_necessarias} especiais
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          ) : (
                            <>
                              {/* Estatísticas do Horário */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div className="bg-gray-50 p-3 rounded">
                                  <div className="text-sm font-semibold mb-1">Acurácia do Modelo</div>
                                  <div className="text-lg font-bold" style={{ color: 'var(--primary-color)' }}>
                                    {resultado.acuracia_modelo}%
                                  </div>
                                </div>
                                <div className="bg-gray-50 p-3 rounded">
                                  <div className="text-sm font-semibold mb-1">Data de Geração</div>
                                  <div className="text-sm">
                                    {new Date(resultado.data_geracao).toLocaleString('pt-BR')}
                                  </div>
                                </div>
                              </div>
                            </>
                          )}

                          {/* Alocações - só mostrar se não houve erro */}
                          {!resultado.analise_detalhada?.erro && resultado.alocacoes.length > 0 && (
                            <div className="mb-4">
                              <h4 className="font-semibold mb-3">Alocações Geradas</h4>
                              <div className="space-y-2">
                                {resultado.alocacoes.map((alocacao) => (
                                <div key={alocacao.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                                  <div className="flex-1">
                                    <div className="font-semibold">{alocacao.turma.nome}</div>
                                    <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                                      {alocacao.turma.alunos} alunos • {alocacao.turma.esp_necessarias} cadeiras especiais
                                    </div>
                                  </div>
                                  <div className="mx-4 text-center">
                                    <div className="text-lg">→</div>
                                  </div>
                                  <div className="flex-1">
                                    <div className="font-semibold">{alocacao.sala.nome}</div>
                                    <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                                      Capacidade: {alocacao.sala.capacidade_total} • Especiais: {alocacao.sala.cadeiras_especiais}
                                    </div>
                                  </div>
                                  <div className="ml-4 text-right">
                                    <div className="font-semibold" style={{ color: 'var(--success-color)' }}>
                                      {alocacao.compatibilidade_score}%
                                    </div>
                                    <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                                      compatibilidade
                                    </div>
                                  </div>
                                </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Turmas Não Alocadas - só mostrar se não houve erro (pois já foi mostrado acima) */}
                          {!resultado.analise_detalhada?.erro && resultado.turmas_nao_alocadas && resultado.turmas_nao_alocadas.length > 0 && (
                            <div className="mb-4">
                              <h4 className="font-semibold mb-3" style={{ color: 'var(--warning-color)' }}>
                                ⚠️ Turmas Não Alocadas ({resultado.turmas_nao_alocadas.length})
                              </h4>
                              <div className="space-y-2">
                                {resultado.turmas_nao_alocadas.map((turma: any, index: number) => (
                                  <div key={index} className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                                    <div className="flex items-center justify-between">
                                      <div>
                                        <div className="font-semibold" style={{ color: 'var(--warning-color)' }}>
                                          {turma.nome}
                                        </div>
                                        <div className="text-sm" style={{ color: '#92400e' }}>
                                          {turma.alunos} alunos • {turma.esp_necessarias} cadeiras especiais
                                        </div>
                                      </div>
                                      <div className="text-xs p-2 bg-yellow-100 rounded" style={{ color: '#92400e', maxWidth: '200px' }}>
                                        <strong>Motivo:</strong> {turma.motivo}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Observações */}
                          {resultado.alocacoes.some(a => a.observacoes) && (
                            <div>
                              <h4 className="font-semibold mb-2">Observações</h4>
                              <div className="space-y-1">
                                {resultado.alocacoes
                                  .filter(a => a.observacoes)
                                  .map((alocacao) => (
                                    <div key={alocacao.id} className="text-sm p-2 bg-blue-50 rounded">
                                      <span className="font-medium">{alocacao.turma.nome}:</span> {alocacao.observacoes}
                                    </div>
                                  ))}
                              </div>
                            </div>
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
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f9fafb';
              e.currentTarget.style.borderColor = '#9ca3af';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'white';
              e.currentTarget.style.borderColor = '#d1d5db';
            }}
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
