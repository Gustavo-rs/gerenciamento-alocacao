import { useState, useEffect } from 'react';
import { Plus, Eye, PencilSimple, Trash, FloppyDisk, X, Buildings, Calendar, Users } from 'phosphor-react';
import type { Sala, FormSala, Horario, FormHorario, DiaSemana, Periodo, AlocacaoPrincipal, Turma, FormTurma } from '../types';

// Labels para exibição
const diasLabels: Record<DiaSemana, string> = {
  'SEGUNDA': 'Segunda-feira',
  'TERCA': 'Terça-feira',
  'QUARTA': 'Quarta-feira',
  'QUINTA': 'Quinta-feira',
  'SEXTA': 'Sexta-feira',
  'SABADO': 'Sábado'
};

const periodosLabels: Record<Periodo, string> = {
  'MATUTINO': 'Matutino',
  'VESPERTINO': 'Vespertino',
  'NOTURNO': 'Noturno'
};

interface FormAlocacao {
  nome: string;
  descricao: string;
}

interface AlocacoesManagerProps {
  onSelectAlocacao?: (alocacao: AlocacaoPrincipal) => void;
}

export default function AlocacoesManager({ onSelectAlocacao }: AlocacoesManagerProps) {
  const [alocacoes, setAlocacoes] = useState<AlocacaoPrincipal[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingAlocacao, setEditingAlocacao] = useState<AlocacaoPrincipal | null>(null);
  
  // Formulário de alocação
  const [formData, setFormData] = useState<FormAlocacao>({
    nome: '',
    descricao: ''
  });

  // Estados para modais
  const [showSalaModal, setShowSalaModal] = useState(false);
  const [selectedAlocacaoId, setSelectedAlocacaoId] = useState<string | null>(null);
  const [showHorarioModal, setShowHorarioModal] = useState(false);
  const [showTurmaModal, setShowTurmaModal] = useState(false);
  const [selectedHorarioId, setSelectedHorarioId] = useState<string | null>(null);

  // Estados para formulários
  const [salaForm, setSalaForm] = useState<FormSala>({
    nome: '',
    capacidade_total: 0,
    localizacao: '',
    status: 'ATIVA',
    cadeiras_moveis: 0,
    cadeiras_especiais: 0,
  });

  const [horarioForm, setHorarioForm] = useState<FormHorario>({
    dia_semana: 'SEGUNDA',
    periodo: 'MATUTINO'
  });

  const [turmaForm, setTurmaForm] = useState<FormTurma>({
    nome: '',
    alunos: 0,
    duracao_min: 0,
    esp_necessarias: 0
  });

  // Carregar alocações da API
  useEffect(() => {
    loadAlocacoes();
  }, []);

  const loadAlocacoes = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/alocacoes');
      const data = await response.json();
      
      if (data.success) {
        // Converter formato do backend para frontend
        const alocacoesConvertidas = data.data.map((item: {
          id: string;
          nome: string;
          descricao: string;
          salas?: Array<{ sala: Sala }>;
          horarios?: Array<{
            id: string;
            alocacao_id: string;
            dia_semana: DiaSemana;
            periodo: Periodo;
            turmas?: Array<{ turma: Turma }>;
            created_at: string;
          }>;
          created_at: string;
        }) => ({
          id: item.id,
          nome: item.nome,
          descricao: item.descricao,
          salas: item.salas?.map((as) => as.sala) || [],
          horarios: item.horarios?.map((h) => ({
            id: h.id,
            alocacao_id: h.alocacao_id,
            dia_semana: h.dia_semana,
            periodo: h.periodo,
            turmas: h.turmas?.map((ht) => ht.turma) || [],
            created_at: h.created_at
          })) || [],
          created_at: item.created_at
        }));
        
        setAlocacoes(alocacoesConvertidas);
      }
    } catch (error) {
      console.error('Erro ao carregar alocações:', error);
      setAlocacoes([]); // Fallback para array vazio em caso de erro
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAlocacao = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    try {
      let response;
      
      if (editingAlocacao) {
        // Atualizar alocação existente
        response = await fetch(`http://localhost:3001/api/alocacoes/${editingAlocacao.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
      } else {
        // Criar nova alocação
        response = await fetch('http://localhost:3001/api/alocacoes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
      }

      const data = await response.json();
      
      if (data.success) {
        // Recarregar lista
        await loadAlocacoes();
        
        // Reset form
        setFormData({ nome: '', descricao: '' });
        setShowForm(false);
        setEditingAlocacao(null);
        
        alert('Alocação salva com sucesso!');
      } else {
        alert(data.error || 'Erro ao salvar alocação');
      }
    } catch (error) {
      console.error('Erro ao salvar alocação:', error);
      alert('Erro ao salvar alocação');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (alocacao: AlocacaoPrincipal) => {
    setEditingAlocacao(alocacao);
    setFormData({
      nome: alocacao.nome,
      descricao: alocacao.descricao
    });
    setShowForm(true);
  };

  const handleDelete = async (alocacao: AlocacaoPrincipal) => {
    if (window.confirm('Tem certeza que deseja excluir esta alocação?')) {
      setLoading(true);
      try {
        const response = await fetch(`http://localhost:3001/api/alocacoes/${alocacao.id}`, {
          method: 'DELETE'
        });
        
        const data = await response.json();
        
        if (data.success) {
          await loadAlocacoes();
          alert('Alocação excluída com sucesso!');
        } else {
          alert(data.error || 'Erro ao excluir alocação');
        }
      } catch (error) {
        console.error('Erro ao excluir alocação:', error);
        alert('Erro ao excluir alocação');
      } finally {
        setLoading(false);
      }
    }
  };


  const handleRemoveSala = async (alocacao: AlocacaoPrincipal, sala: Sala) => {
    if (window.confirm(`Remover ${sala.nome} desta alocação?`)) {
      setLoading(true);
      try {
        const response = await fetch(`http://localhost:3001/api/alocacoes/${alocacao.id}/salas/${sala.id}`, {
          method: 'DELETE'
        });
        
        const data = await response.json();
        
        if (data.success) {
          await loadAlocacoes();
          alert('Sala removida com sucesso!');
        } else {
          alert(data.error || 'Erro ao remover sala');
        }
      } catch (error) {
        console.error('Erro ao remover sala:', error);
        alert('Erro ao remover sala');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleCreateSala = async () => {
    if (!salaForm.nome || salaForm.capacidade_total <= 0) {
      alert('Preencha o nome e capacidade da sala');
      return;
    }

    if (!selectedAlocacaoId) {
      alert('Erro: Alocação não selecionada');
      return;
    }

    setLoading(true);
    try {
      // Gerar ID único para a sala
      const id_sala = `S${Date.now()}`;
      
      // 1. Criar a sala primeiro
      const salaResponse = await fetch('http://localhost:3001/api/salas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...salaForm,
          id_sala: id_sala
        })
      });

      const salaData = await salaResponse.json();
      
      if (!salaData.success) {
        alert(salaData.error || 'Erro ao criar sala');
        return;
      }

      // 2. Adicionar a sala à alocação
      const alocacaoResponse = await fetch(`http://localhost:3001/api/alocacoes/${selectedAlocacaoId}/salas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sala_id: salaData.data.id })
      });

      const alocacaoData = await alocacaoResponse.json();
      
      if (alocacaoData.success) {
        // Recarregar lista
        await loadAlocacoes();
        
        // Reset form e fechar modal
        setSalaForm({
          nome: '',
          capacidade_total: 0,
          localizacao: '',
          status: 'ATIVA',
          cadeiras_moveis: 0,
          cadeiras_especiais: 0,
        });
        setShowSalaModal(false);
        setSelectedAlocacaoId(null);
        
        alert('Sala criada e adicionada à alocação com sucesso!');
      } else {
        alert(alocacaoData.error || 'Erro ao adicionar sala à alocação');
      }
    } catch (error) {
      console.error('Erro ao criar sala:', error);
      alert('Erro ao criar sala');
    } finally {
      setLoading(false);
    }
  };

  // Funções para gerenciar horários
  const handleCreateHorario = async () => {
    if (!selectedAlocacaoId) {
      alert('Erro: Alocação não selecionada');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`http://localhost:3001/api/alocacoes/${selectedAlocacaoId}/horarios`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(horarioForm)
      });

      const data = await response.json();
      
      if (data.success) {
        await loadAlocacoes();
        setHorarioForm({ dia_semana: 'SEGUNDA', periodo: 'MATUTINO' });
        setShowHorarioModal(false);
        setSelectedAlocacaoId(null);
        alert('Horário criado com sucesso!');
      } else {
        alert(data.error || 'Erro ao criar horário');
      }
    } catch (error) {
      console.error('Erro ao criar horário:', error);
      alert('Erro ao criar horário');
    } finally {
      setLoading(false);
    }
  };


  // Funções para gerenciar turmas nos horários
  const handleCreateTurma = async () => {
    if (!turmaForm.nome || turmaForm.alunos <= 0) {
      alert('Preencha o nome e número de alunos da turma');
      return;
    }

    if (!selectedHorarioId) {
      alert('Erro: Horário não selecionado');
      return;
    }

    setLoading(true);
    try {
      // Gerar ID único para a turma
      const id_turma = `T${Date.now()}`;
      
      // 1. Criar a turma primeiro
      const turmaResponse = await fetch('http://localhost:3001/api/turmas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...turmaForm,
          id_turma: id_turma
        })
      });

      const turmaData = await turmaResponse.json();
      
      if (!turmaData.success) {
        alert(turmaData.error || 'Erro ao criar turma');
        return;
      }

      // 2. Adicionar a turma ao horário
      const horarioResponse = await fetch(`http://localhost:3001/api/horarios/${selectedHorarioId}/turmas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ turma_id: turmaData.data.id })
      });

      const horarioData = await horarioResponse.json();
      
      if (horarioData.success) {
        await loadAlocacoes();
        setTurmaForm({ nome: '', alunos: 0, duracao_min: 0, esp_necessarias: 0 });
        setShowTurmaModal(false);
        setSelectedHorarioId(null);
        alert('Turma criada e adicionada ao horário com sucesso!');
      } else {
        alert(horarioData.error || 'Erro ao adicionar turma ao horário');
      }
    } catch (error) {
      console.error('Erro ao criar turma:', error);
      alert('Erro ao criar turma');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveTurma = async (horario: Horario, turma: Turma) => {
    if (window.confirm(`Remover ${turma.nome} deste horário?`)) {
      setLoading(true);
      try {
        const response = await fetch(`http://localhost:3001/api/horarios/${horario.id}/turmas/${turma.id}`, {
          method: 'DELETE'
        });
        
        const data = await response.json();
        
        if (data.success) {
          await loadAlocacoes();
          alert('Turma removida com sucesso!');
        } else {
          alert(data.error || 'Erro ao remover turma');
        }
      } catch (error) {
        console.error('Erro ao remover turma:', error);
        alert('Erro ao remover turma');
      } finally {
        setLoading(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Carregando...</span>
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      {/* Header */}
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Gerenciar Alocações</h1>
          <p className="text-base" style={{ color: 'var(--text-secondary)', lineHeight: '1.5' }}>
            Crie e organize alocações de salas. Cada alocação pode conter múltiplas salas e posteriormente será usada para distribuir turmas.
          </p>
        </div>
        <div className="flex-1">
        <button 
          onClick={() => setShowForm(true)}
          className="btn btn-primary"
          disabled={loading}
        >
          <Plus size={16} style={{ marginRight: '6px' }} />
          Nova Alocação
        </button>
        </div>
      </div>

      {/* Formulário de Alocação */}
      {showForm && (
        <div className="card shadow-lg border-0">
          <div className="card-header bg-gradient-to-r from-blue-600 to-blue-700 text-white">
            <h2 className="card-title text-white flex items-center gap-2">
              {editingAlocacao ? (
                <>
                  <PencilSimple size={20} />
                  Editar Alocação
                </>
              ) : (
                <>
                  <Plus size={20} />
                  Nova Alocação
                </>
              )}
            </h2>
          </div>
          <div className="card-content" style={{ padding: 'var(--spacing-6)' }}>
            <form onSubmit={handleSubmitAlocacao} className="form">
              <div className="grid gap-6">
                <div className="form-group">
                  <label className="label text-base font-semibold">Nome da Alocação *</label>
                  <input
                    type="text"
                    value={formData.nome}
                    onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                    className="input input-lg"
                    placeholder="Ex: Alocação Engenharia 2025.1, Turmas Matutinas"
                    required
                    disabled={loading}
                  />
                  <span className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                    Escolha um nome descritivo que identifique claramente esta alocação
                  </span>
                </div>
                
                <div className="form-group">
                  <label className="label text-base font-semibold">Descrição *</label>
                  <textarea
                    value={formData.descricao}
                    onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
                    className="textarea"
                    rows={4}
                    placeholder="Descreva o objetivo desta alocação, período letivo, cursos envolvidos, etc."
                    required
                    disabled={loading}
                  />
                  <span className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                    Explique o contexto e objetivo desta alocação para facilitar o gerenciamento
                  </span>
                </div>

                <div className="flex gap-4 pt-4 border-t">
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    <FloppyDisk size={16} style={{ marginRight: '6px' }} />
                    {loading ? 'Salvando...' : (editingAlocacao ? 'Atualizar' : 'Criar')} Alocação
                  </button>
                  <button 
                    type="button" 
                    onClick={() => {
                      setShowForm(false);
                      setEditingAlocacao(null);
                      setFormData({ nome: '', descricao: '' });
                    }}
                    className="btn btn-secondary"
                    disabled={loading}
                  >
                    <X size={16} style={{ marginRight: '6px' }} />
                    Cancelar
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lista de Alocações */}
      <div className="grid gap-4">
        {alocacoes.length === 0 ? (
          <div className="card border-2 border-dashed border-gray-300">
            <div className="card-content text-center" style={{ padding: 'var(--spacing-8)' }}>
              <div className="mb-6">
                <Buildings size={64} color="var(--text-secondary)" style={{ marginBottom: 'var(--spacing-4)' }} />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Nenhuma alocação criada ainda</h3>
              <p className="text-base mb-6" style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                As alocações organizam suas salas em grupos para facilitar a distribuição de turmas.<br />
                Comece criando sua primeira alocação e adicionando salas a ela.
              </p>
              <button 
                onClick={() => setShowForm(true)}
                className="btn btn-primary"
                disabled={loading}
              >
                <Plus size={16} style={{ marginRight: '6px' }} />
                Criar Primeira Alocação
              </button>
            </div>
          </div>
        ) : (
          alocacoes.map((alocacao) => (
            <div key={alocacao.id} className="card shadow-sm hover:shadow-md transition-shadow">
              <div className="card-content" style={{ padding: 'var(--spacing-6)' }}>
                <div style={{ position: 'relative' }}>
                  {/* Header da Alocação */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-900">{alocacao.nome}</h3>
                        <span className="badge badge-info" style={{ marginLeft: 'var(--spacing-2)' }}>
                          {alocacao.salas.length} {alocacao.salas.length === 1 ? 'sala' : 'salas'}
                        </span>
                        <span className="badge badge-secondary" style={{ marginLeft: 'var(--spacing-2)' }}>
                          {alocacao.horarios.length} {alocacao.horarios.length === 1 ? 'horário' : 'horários'}
                        </span>
                      </div>
                      
                      <p className="text-sm mb-0" style={{ color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                        {alocacao.descricao}
                      </p>
                    </div>
                    
                    {/* Botões de ação no header */}
                    <div className="flex gap-2 ml-4">
                      {onSelectAlocacao && (
                        <button
                          onClick={() => onSelectAlocacao(alocacao)}
                          className="btn btn-sm btn-primary"
                          title="Visualizar detalhes"
                          disabled={loading}
                        >
                          <Eye size={14} />
                        </button>
                      )}
                      <div>
                        <button
                          onClick={() => handleEdit(alocacao)}
                          className="btn btn-sm btn-secondary"
                          style={{ marginRight: 'var(--spacing-2)' }}
                          title="Editar alocação"
                          disabled={loading}
                        >
                          <PencilSimple size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(alocacao)}
                          className="btn btn-sm btn-danger"
                          title="Excluir alocação"
                          disabled={loading}
                        >
                          <Trash size={14} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Salas da Alocação */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-semibold flex items-center gap-2">
                        <Buildings size={18} />
                        Salas da Alocação
                      </h4>
                      <button
                        onClick={() => {
                          setSelectedAlocacaoId(alocacao.id);
                          setShowSalaModal(true);
                        }}
                        className="btn btn-sm btn-primary"
                        disabled={loading}
                        title="Adicionar nova sala"
                      >
                        <Plus size={14} style={{ marginRight: '6px' }} />
                        Adicionar Sala
                      </button>
                    </div>
                    
                    {alocacao.salas.length === 0 ? (
                      <div className="text-center py-8 border-2 border-dashed rounded-lg" style={{ borderColor: 'var(--border-color)' }}>
                        <Buildings size={32} color="var(--text-secondary)" style={{ marginBottom: '12px' }} />
                        <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                          Nenhuma sala adicionada
                        </p>
                        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                          Clique em "Adicionar Sala" para começar
                        </p>
                      </div>
                    ) : (
                      <div className="grid gap-3 mb-4">
                        {alocacao.salas.map(sala => (
                          <div key={sala.id} className="card">
                            <div className="card-content" style={{ padding: 'var(--spacing-4)' }}>
                              <div className="flex items-start justify-between">
                                <div style={{ flex: 1 }}>
                                  <div className="flex items-center" style={{ gap: 'var(--spacing-2)', marginBottom: 'var(--spacing-2)' }}>
                                    <h5 className="font-semibold">{sala.nome}</h5>
                                    
                                  </div>
                                  
                                  <p className="text-sm" style={{ color: 'var(--text-secondary)', marginBottom: 'var(--spacing-2)' }}>
                                    {sala.localizacao || 'Localização não informada'}
                                  </p>
                                  
                                  <div className="flex" style={{ gap: 'var(--spacing-2)', flexWrap: 'wrap' }}>
                                  <span className="badge badge-info">
                                      {sala.capacidade_total} lugares
                                    </span>
                                    {sala.cadeiras_especiais > 0 && (
                                      <span className="badge badge-warning">
                                        {sala.cadeiras_especiais} especiais
                                      </span>
                                    )}
                                    {sala.cadeiras_moveis > 0 && (
                                      <span className="badge badge-secondary">
                                        {sala.cadeiras_moveis} móveis
                                      </span>
                                    )}
                                    <span className={`badge ${sala.status === 'ATIVA' ? 'badge-success' : 'badge-warning'}`}>
                                      {sala.status}
                                    </span>
                                  </div>
                                </div>
                                
                                 <div className="flex" style={{ flexDirection: 'column', gap: 'var(--spacing-2)', alignItems: 'center' }}>
                                   <button 
                                     className="btn btn-sm btn-secondary"
                                     disabled={loading}
                                     title="Editar sala"
                                   >
                                     <PencilSimple size={14} />
                                   </button>
                                  <button
                                    onClick={() => handleRemoveSala(alocacao, sala)}
                                    className="btn btn-sm btn-danger"
                                    disabled={loading}
                                    title="Remover sala"
                                  >
                                    <Trash size={14} />
                                  </button>
                                 </div>
                                </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                  </div>

                  {/* Horários da Alocação */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-semibold flex items-center" style={{ gap: 'var(--spacing-2)' }}>
                        <Calendar size={18} />
                        Horários da Alocação
                      </h4>
                      <button
                        onClick={() => {
                          setSelectedAlocacaoId(alocacao.id);
                          setShowHorarioModal(true);
                        }}
                        className="btn btn-sm btn-primary"
                        disabled={loading}
                        title="Adicionar novo horário"
                      >
                        <Plus size={14} style={{ marginRight: '6px' }} />
                        Adicionar Horário
                      </button>
                    </div>
                    
                    {alocacao.horarios.length === 0 ? (
                      <div className="text-center py-8 border-2 border-dashed rounded-lg" style={{ borderColor: 'var(--border-color)' }}>
                        <Calendar size={32} color="var(--text-secondary)" style={{ marginBottom: '12px' }} />
                        <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                          Nenhum horário definido
                        </p>
                        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                          Adicione horários para organizar as turmas por dia e período
                        </p>
                      </div>
                    ) : (
                      <div className="grid gap-3">
                        {alocacao.horarios.map(horario => (
                          <div key={horario.id} className="card">
                            <div className="card-content" style={{ padding: 'var(--spacing-4)' }}>
                              <div className="flex items-start justify-between">
                                <div style={{ flex: 1 }}>
                                  <div className="flex items-center" style={{ gap: 'var(--spacing-2)', marginBottom: 'var(--spacing-2)' }}>
                                    <h5 className="font-semibold">{diasLabels[horario.dia_semana]}</h5>
                                    <span className="badge badge-primary">
                                      {periodosLabels[horario.periodo]}
                                    </span>
                                    <span className="badge badge-info">
                                      {horario.turmas.length} {horario.turmas.length === 1 ? 'turma' : 'turmas'}
                                    </span>
                                  </div>
                                  
                                  {/* Turmas do Horário */}
                                  {horario.turmas.length > 0 && (
                                    <div style={{ marginBottom: 'var(--spacing-3)' }}>
                                      <div className="grid gap-2">
                                        {horario.turmas.map(turma => (
                                           <div key={turma.id} className="flex items-center justify-between" style={{ backgroundColor: '#f8f9fa', padding: 'var(--spacing-3)', borderRadius: '4px' }}>
                                             <div style={{ flex: 1 }}>
                                               <div className="flex items-center" style={{ gap: 'var(--spacing-2)', marginBottom: 'var(--spacing-2)' }}>
                                                 <span className="font-semibold text-sm">{turma.nome}</span>
                                               </div>
                                               
                                               <div className="flex" style={{ gap: 'var(--spacing-2)', flexWrap: 'wrap' }}>
                                                 <span className="badge badge-info">
                                                   {turma.alunos} alunos
                                                 </span>
                                                 {turma.duracao_min > 0 && (
                                                   <span className="badge badge-success">
                                                     {turma.duracao_min}min
                                                   </span>
                                                 )}
                                                 {turma.esp_necessarias > 0 && (
                                                   <span className="badge badge-warning">
                                                     {turma.esp_necessarias} especiais
                                                   </span>
                                                 )}
                                               </div>
                                             </div>
                                             <div>
                                            <button
                                              onClick={() => handleRemoveTurma(horario, turma)}
                                              className="btn btn-xs btn-danger"
                                              disabled={loading}
                                              title="Remover turma"
                                            >
                                              <Trash size={12} style={{ margin: '8px' }} />
                                            </button>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                  
                                   {/* Botão para adicionar turma */}
                                   <div className="pt-3 border-t border-gray-200 mt-3">
                                     <button
                                       onClick={() => {
                                         setSelectedHorarioId(horario.id);
                                         setShowTurmaModal(true);
                                       }}
                                       className="btn btn-sm btn-outline-primary w-full flex items-center justify-center gap-2"
                                       disabled={loading}
                                     >
                                       <Users size={16} />
                                       Adicionar Nova Turma
                                     </button>
                                   </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}


                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal para Adicionar Sala */}
      {showSalaModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="card-header bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg">
              <h2 className="card-title text-white flex items-center gap-2 text-xl">
                <Buildings size={24} />
                Adicionar Nova Sala
              </h2>
            </div>
            
            <div className="p-6">
              <form className="form">
                {/* Linha 1: Nome e Capacidade */}
                <div className="form-row">
                  <div className="form-group">
                    <label className="label">Nome da Sala *</label>
                    <input
                      type="text"
                      value={salaForm.nome}
                      onChange={(e) => setSalaForm(prev => ({ ...prev, nome: e.target.value }))}
                      className="input"
                      placeholder="Ex: Sala A1, Laboratório"
                      required
                      disabled={loading}
                    />
                  </div>
                  <div className="form-group">
                    <label className="label">Capacidade Total *</label>
                    <input
                      type="number"
                      value={salaForm.capacidade_total}
                      onChange={(e) => setSalaForm(prev => ({ ...prev, capacidade_total: Number(e.target.value) }))}
                      className="input"
                      min="1"
                      placeholder="30"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>
                
                {/* Linha 2: Localização */}
                <div className="form-group">
                  <label className="label">Localização</label>
                  <input
                    type="text"
                    value={salaForm.localizacao}
                    onChange={(e) => setSalaForm(prev => ({ ...prev, localizacao: e.target.value }))}
                    className="input"
                    placeholder="Ex: Bloco A - 2º andar"
                    disabled={loading}
                  />
                </div>
                
                {/* Linha 3: Cadeiras Especiais e Móveis */}
                <div className="form-row">
                  <div className="form-group">
                    <label className="label">Cadeiras Especiais</label>
                    <input
                      type="number"
                      value={salaForm.cadeiras_especiais}
                      onChange={(e) => setSalaForm(prev => ({ ...prev, cadeiras_especiais: Number(e.target.value) }))}
                      className="input"
                      min="0"
                      placeholder="0"
                      disabled={loading}
                    />
                    <small className="form-text">Para alunos com necessidades especiais</small>
                  </div>
                  <div className="form-group">
                    <label className="label">Cadeiras Móveis</label>
                    <input
                      type="number"
                      value={salaForm.cadeiras_moveis}
                      onChange={(e) => setSalaForm(prev => ({ ...prev, cadeiras_moveis: Number(e.target.value) }))}
                      className="input"
                      min="0"
                      placeholder="0"
                      disabled={loading}
                    />
                    <small className="form-text">Cadeiras que podem ser remanejadas</small>
                  </div>
                </div>
                
                {/* Botões */}
                <div className="flex gap-4 pt-6 border-t border-gray-200">
                  <button 
                    type="button"
                    onClick={handleCreateSala}
                    className="btn btn-primary flex-1" 
                    disabled={loading}
                  >
                    <FloppyDisk size={16} style={{ marginRight: '6px' }} />
                    {loading ? 'Criando...' : 'Criar Sala'}
                  </button>
                  <button 
                    type="button"
                    onClick={() => {
                      setShowSalaModal(false);
                      setSelectedAlocacaoId(null);
                      setSalaForm({
                        nome: '',
                        capacidade_total: 0,
                        localizacao: '',
                        status: 'ATIVA',
                        cadeiras_moveis: 0,
                        cadeiras_especiais: 0,
                      });
                    }}
                    className="btn btn-secondary"
                    disabled={loading}
                  >
                    <X size={16} style={{ marginRight: '6px' }} />
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal para Adicionar Horário */}
      {showHorarioModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4">
            <div className="card-header bg-gradient-to-r from-green-600 to-green-700 text-white rounded-t-lg">
              <h2 className="card-title text-white flex items-center gap-2 text-xl">
                <Calendar size={24} />
                Adicionar Novo Horário
              </h2>
            </div>
            
            <div className="p-6">
              <form className="form">
                <div className="form-row">
                  <div className="form-group">
                    <label className="label">Dia da Semana *</label>
                    <select
                      value={horarioForm.dia_semana}
                      onChange={(e) => setHorarioForm(prev => ({ ...prev, dia_semana: e.target.value as DiaSemana }))}
                      className="input"
                      required
                      disabled={loading}
                    >
                      <option value="SEGUNDA">Segunda-feira</option>
                      <option value="TERCA">Terça-feira</option>
                      <option value="QUARTA">Quarta-feira</option>
                      <option value="QUINTA">Quinta-feira</option>
                      <option value="SEXTA">Sexta-feira</option>
                      <option value="SABADO">Sábado</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="label">Período *</label>
                    <select
                      value={horarioForm.periodo}
                      onChange={(e) => setHorarioForm(prev => ({ ...prev, periodo: e.target.value as Periodo }))}
                      className="input"
                      required
                      disabled={loading}
                    >
                      <option value="MATUTINO">Matutino</option>
                      <option value="VESPERTINO">Vespertino</option>
                      <option value="NOTURNO">Noturno</option>
                    </select>
                  </div>
                </div>
                
                <div className="flex gap-4 pt-6 border-t border-gray-200">
                  <button 
                    type="button"
                    onClick={handleCreateHorario}
                    className="btn btn-primary flex-1" 
                    disabled={loading}
                  >
                    <FloppyDisk size={16} style={{ marginRight: '6px' }} />
                    {loading ? 'Criando...' : 'Criar Horário'}
                  </button>
                  <button 
                    type="button"
                    onClick={() => {
                      setShowHorarioModal(false);
                      setSelectedAlocacaoId(null);
                      setHorarioForm({ dia_semana: 'SEGUNDA', periodo: 'MATUTINO' });
                    }}
                    className="btn btn-secondary"
                    disabled={loading}
                  >
                    <X size={16} style={{ marginRight: '6px' }} />
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal para Adicionar Turma */}
      {showTurmaModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4">
            <div className="card-header bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-t-lg">
              <h2 className="card-title text-white flex items-center gap-2 text-xl">
                <Users size={24} />
                Adicionar Nova Turma
              </h2>
            </div>
            
            <div className="p-6">
              <form className="form">
                <div className="form-row">
                  <div className="form-group">
                    <label className="label">Nome da Turma *</label>
                    <input
                      type="text"
                      value={turmaForm.nome}
                      onChange={(e) => setTurmaForm(prev => ({ ...prev, nome: e.target.value }))}
                      className="input"
                      placeholder="Ex: Engenharia Civil 3A"
                      required
                      disabled={loading}
                    />
                  </div>
                  <div className="form-group">
                    <label className="label">Número de Alunos *</label>
                    <input
                      type="number"
                      value={turmaForm.alunos}
                      onChange={(e) => setTurmaForm(prev => ({ ...prev, alunos: Number(e.target.value) }))}
                      className="input"
                      min="1"
                      placeholder="30"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label className="label">Duração (minutos)</label>
                    <input
                      type="number"
                      value={turmaForm.duracao_min}
                      onChange={(e) => setTurmaForm(prev => ({ ...prev, duracao_min: Number(e.target.value) }))}
                      className="input"
                      min="0"
                      placeholder="60"
                      disabled={loading}
                    />
                  </div>
                  <div className="form-group">
                    <label className="label">Necessidades Especiais</label>
                    <input
                      type="number"
                      value={turmaForm.esp_necessarias}
                      onChange={(e) => setTurmaForm(prev => ({ ...prev, esp_necessarias: Number(e.target.value) }))}
                      className="input"
                      min="0"
                      placeholder="0"
                      disabled={loading}
                    />
                    <small className="form-text">Alunos com necessidades especiais</small>
                  </div>
                </div>
                
                <div className="flex gap-4 pt-6 border-t border-gray-200">
                  <button 
                    type="button"
                    onClick={handleCreateTurma}
                    className="btn btn-primary flex-1" 
                    disabled={loading}
                  >
                    <FloppyDisk size={16} style={{ marginRight: '6px' }} />
                    {loading ? 'Criando...' : 'Criar Turma'}
                  </button>
                  <button 
                    type="button"
                    onClick={() => {
                      setShowTurmaModal(false);
                      setSelectedHorarioId(null);
                      setTurmaForm({ nome: '', alunos: 0, duracao_min: 0, esp_necessarias: 0 });
                    }}
                    className="btn btn-secondary"
                    disabled={loading}
                  >
                    <X size={16} style={{ marginRight: '6px' }} />
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
