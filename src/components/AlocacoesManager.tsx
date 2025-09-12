import { useState, useEffect } from 'react';
import { Plus, Eye, PencilSimple, Trash, FloppyDisk, X, Buildings } from 'phosphor-react';
import { useApp } from '../context/AppContext';
import type { Sala, FormSala } from '../types';

// Tipos para alocação simples
interface AlocacaoSimples {
  id: string;
  nome: string;
  descricao: string;
  salas: Sala[];
  created_at?: string;
}

interface FormAlocacao {
  nome: string;
  descricao: string;
}

interface AlocacoesManagerProps {
  onSelectAlocacao?: (alocacao: AlocacaoSimples) => void;
}

export default function AlocacoesManager({ onSelectAlocacao }: AlocacoesManagerProps) {
  const { salas } = useApp(); // Usar salas do contexto
  const [alocacoes, setAlocacoes] = useState<AlocacaoSimples[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingAlocacao, setEditingAlocacao] = useState<AlocacaoSimples | null>(null);
  
  // Formulário de alocação
  const [formData, setFormData] = useState<FormAlocacao>({
    nome: '',
    descricao: ''
  });

  // Estados para adicionar sala nova
  const [showSalaForm, setShowSalaForm] = useState<string | null>(null); // ID da alocação
  const [salaForm, setSalaForm] = useState<FormSala>({
    nome: '',
    capacidade_total: 0,
    localizacao: '',
    status: 'ATIVA',
    cadeiras_moveis: 0,
    cadeiras_especiais: 0,
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
        const alocacoesConvertidas = data.data.map((item: any) => ({
          id: item.id,
          nome: item.nome,
          descricao: item.descricao,
          salas: item.salas?.map((as: any) => as.sala) || [],
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

  const handleEdit = (alocacao: AlocacaoSimples) => {
    setEditingAlocacao(alocacao);
    setFormData({
      nome: alocacao.nome,
      descricao: alocacao.descricao
    });
    setShowForm(true);
  };

  const handleDelete = async (alocacao: AlocacaoSimples) => {
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

  const handleAddSala = async (alocacao: AlocacaoSimples, sala: Sala) => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:3001/api/alocacoes/${alocacao.id}/salas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sala_id: sala.id })
      });
      
      const data = await response.json();
      
      if (data.success) {
        await loadAlocacoes();
        alert('Sala adicionada com sucesso!');
      } else {
        alert(data.error || 'Erro ao adicionar sala');
      }
    } catch (error) {
      console.error('Erro ao adicionar sala:', error);
      alert('Erro ao adicionar sala');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveSala = async (alocacao: AlocacaoSimples, sala: Sala) => {
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

  const handleCreateSala = async (alocacaoId: string) => {
    if (!salaForm.nome || salaForm.capacidade_total <= 0) {
      alert('Preencha o nome e capacidade da sala');
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
      const alocacaoResponse = await fetch(`http://localhost:3001/api/alocacoes/${alocacaoId}/salas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sala_id: salaData.data.id })
      });

      const alocacaoData = await alocacaoResponse.json();
      
      if (alocacaoData.success) {
        // Recarregar lista
        await loadAlocacoes();
        
        // Reset form
        setSalaForm({
          nome: '',
          capacidade_total: 0,
          localizacao: '',
          status: 'ATIVA',
          cadeiras_moveis: 0,
          cadeiras_especiais: 0,
        });
        setShowSalaForm(null);
        
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
                        onClick={() => setShowSalaForm(alocacao.id)}
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

                    {/* Formulário para adicionar nova sala */}
                    {showSalaForm === alocacao.id && (
                      <div className="card" style={{ marginTop: 'var(--spacing-4)', border: '2px solid #3b82f6' }}>
                        <div className="card-header" style={{ backgroundColor: '#eff6ff', borderBottom: '1px solid #dbeafe' }}>
                          <h5 className="card-title flex items-center" style={{ gap: 'var(--spacing-2)', color: '#1e40af', margin: 0 }}>
                            <Plus size={18} />
                            Adicionar Nova Sala
                          </h5>
                        </div>
                        
                        <div className="card-content">
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
                            <div className="flex" style={{ gap: 'var(--spacing-3)', paddingTop: 'var(--spacing-4)', borderTop: '1px solid var(--border-color)' }}>
                              <button 
                                onClick={() => handleCreateSala(alocacao.id)}
                                className="btn btn-primary" 
                                disabled={loading}
                              >
                                <FloppyDisk size={16} style={{ marginRight: '6px' }} />
                                {loading ? 'Criando...' : 'Criar Sala'}
                              </button>
                              <button 
                                onClick={() => {
                                  setShowSalaForm(null);
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
                    )}

                    {/* Adicionar Salas Existentes (opcional) */}
                    {salas && salas.length > 0 && salas.filter(sala => !alocacao.salas.find(s => s.id === sala.id)).length > 0 && (
                      <div className="border-t pt-4 mt-4">
                        <div className="mb-3">
                          <h5 className="font-medium text-gray-700 mb-1">Salas Existentes Disponíveis</h5>
                          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                            Adicione salas já criadas anteriormente
                          </p>
                        </div>
                        
                        <div className="grid gap-2">
                          {salas
                            .filter(sala => !alocacao.salas.find(s => s.id === sala.id))
                            .map(sala => (
                              <div key={sala.id} className="flex items-center justify-between bg-gray-50 border border-gray-200 p-3 rounded-lg">
                                <div>
                                  <span className="font-medium text-sm">{sala.nome}</span>
                                  <div className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                                    {sala.localizacao} • {sala.capacidade_total} lugares
                                  </div>
                                </div>
                                <button
                                  onClick={() => handleAddSala(alocacao, sala)}
                                  className="btn btn-xs btn-outline-primary"
                                  disabled={loading}
                                  title="Adicionar sala existente"
                                >
                                  <Plus size={12} style={{ marginRight: '4px' }} />
                                  Adicionar
                                </button>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
