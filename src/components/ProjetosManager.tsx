import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import type { ProjetoAlocacao, FormProjetoAlocacao } from '../types';
import { Plus, FolderOpen, Eye, PencilSimple, Trash, FloppyDisk, X, CheckCircle, Clock, Gear } from 'phosphor-react';
import ErrorMessage from './ErrorMessage';
import { SkeletonProjetosList } from './Skeleton';

interface ProjetosManagerProps {
  onEditProjeto: (projeto: ProjetoAlocacao | null) => void;
  onShowForm: (show: boolean) => void;
  onSelectProjeto: (projeto: ProjetoAlocacao) => void;
}

export default function ProjetosManager({ onEditProjeto, onShowForm, onSelectProjeto }: ProjetosManagerProps) {
  const { state, createProjeto, updateProjeto, deleteProjeto, loadProjetos } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [editingProjeto, setEditingProjeto] = useState<ProjetoAlocacao | null>(null);

  // Carregar dados quando o componente monta
  useEffect(() => {
    loadProjetos();
  }, []); // SEM DEPENDÊNCIAS - roda apenas UMA VEZ
  
  const [formData, setFormData] = useState<FormProjetoAlocacao>({
    nome: '',
    descricao: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const projetoData = {
      ...formData,
      id_projeto: editingProjeto?.id_projeto || `alocacao_${Date.now()}`,
      data_criacao: editingProjeto?.data_criacao || new Date().toISOString(),
      status: 'CONFIGURACAO' as const,
      salas: editingProjeto?.salas || [],
      turmas: editingProjeto?.turmas || [],
    };

    let success = false;
    
    if (editingProjeto && editingProjeto.id) {
      success = await updateProjeto(editingProjeto.id, projetoData);
    } else {
      success = await createProjeto(projetoData);
    }

    if (success) {
      // Reset form
      setFormData({ nome: '', descricao: '' });
      setShowForm(false);
      setEditingProjeto(null);
      // Reload projetos para pegar dados atualizados
      await loadProjetos();
    } else {
      alert('Erro ao salvar projeto. Tente novamente.');
    }
  };

  const handleEdit = (projeto: ProjetoAlocacao) => {
    setEditingProjeto(projeto);
    setFormData({
      nome: projeto.nome,
      descricao: projeto.descricao,
    });
    setShowForm(true);
  };

  const handleDelete = async (projeto: ProjetoAlocacao) => {
    if (window.confirm('Tem certeza que deseja excluir este projeto? Todos os dados serão perdidos.')) {
      if (projeto.id) {
        const success = await deleteProjeto(projeto.id);
        if (success) {
          await loadProjetos();
        } else {
          alert('Erro ao excluir projeto. Tente novamente.');
        }
      }
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      CONFIGURACAO: 'badge-warning',
      PRONTO: 'badge-info',
      PROCESSANDO: 'badge-warning',
      ALOCADO: 'badge-success',
      CONCLUIDO: 'badge-success'
    };
    
    const config = {
      CONFIGURACAO: { label: 'Configuração', icon: <Gear size={10} style={{ marginRight: '4px' }} /> },
      PRONTO: { label: 'Pronto', icon: <Clock size={10} style={{ marginRight: '4px' }} /> },
      PROCESSANDO: { label: 'Processando', icon: <Clock size={10} style={{ marginRight: '4px' }} /> },
      ALOCADO: { label: 'Alocado', icon: <CheckCircle size={10} style={{ marginRight: '4px' }} /> },
      CONCLUIDO: { label: 'Concluído', icon: <CheckCircle size={10} style={{ marginRight: '4px' }} /> }
    };

    const statusConfig = config[status as keyof typeof config];

    return (
      <span className={`badge ${badges[status as keyof typeof badges]}`}>
        {statusConfig?.icon}
        {statusConfig?.label || status}
      </span>
    );
  };

  return (
    <div className="grid gap-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold">Alocações</h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Crie e gerencie alocações com suas salas e turmas específicas
          </p>
        </div>
        <button 
          onClick={() => setShowForm(true)}
          className="btn btn-primary"
        >
          <Plus size={16} style={{ marginRight: '6px' }} />
          Nova Alocação
        </button>
      </div>

      {/* Formulário */}
      {showForm && (
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">
              {editingProjeto ? 'Editar Alocação' : 'Nova Alocação'}
            </h2>
          </div>
          <div className="card-content">
            <form onSubmit={handleSubmit} className="form">
              <div className="form-group">
                <label className="label">Nome da Alocação *</label>
                <input
                  type="text"
                  value={formData.nome}
                  onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                  className="input"
                  placeholder="Ex: Alocação Matutino - Bloco A"
                  required
                />
              </div>
              <div className="form-group">
                <label className="label">Descrição *</label>
                <textarea
                  value={formData.descricao}
                  onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
                  className="textarea"
                  rows={3}
                  placeholder="Descreva o contexto e objetivo desta alocação"
                  required
                />
              </div>
              <div className="flex gap-4">
                <button type="submit" className="btn btn-primary">
                  <FloppyDisk size={16} style={{ marginRight: '6px' }} />
                  {editingProjeto ? 'Atualizar' : 'Criar'} Alocação
                </button>
                <button 
                  type="button" 
                  onClick={() => {
                    setShowForm(false);
                    setEditingProjeto(null);
                    setFormData({ nome: '', descricao: '' });
                  }}
                  className="btn btn-secondary"
                >
                  <X size={16} style={{ marginRight: '6px' }} />
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lista de Projetos */}
      <div className="grid gap-4">
        {state.loading ? (
          <SkeletonProjetosList />
        ) : state.error ? (
          <ErrorMessage 
            message={state.error} 
            onRetry={loadProjetos}
          />
        ) : state.projetos.length === 0 ? (
          <div className="card">
            <div className="card-content text-center" style={{ padding: 'var(--spacing-8)' }}>
              <FolderOpen size={48} color="var(--text-secondary)" style={{ marginBottom: 'var(--spacing-4)' }} />
            <h3 className="text-lg font-semibold mb-4">Nenhuma alocação encontrada</h3>
            <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
              Crie sua primeira alocação para começar
            </p>
              <button 
                onClick={() => setShowForm(true)}
                className="btn btn-primary"
              >
                <Plus size={16} style={{ marginRight: '6px' }} />
                Criar Primeira Alocação
              </button>
            </div>
          </div>
        ) : (
          state.projetos.map((projeto) => (
            <div key={projeto.id_projeto} className="card">
              <div className="card-content">
                <div style={{ position: 'relative' }}>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold">{projeto.nome}</h3>
                    {getStatusBadge(projeto.status)}
                  </div>
                  
                  <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
                    {projeto.descricao}
                  </p>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                        Salas
                      </span>
                      <p className="font-semibold">{projeto.salas.length}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                        Turmas
                      </span>
                      <p className="font-semibold">{projeto.turmas.length}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                        Total Alunos
                      </span>
                      <p className="font-semibold">
                        {projeto.turmas.reduce((acc, t) => acc + t.alunos, 0)}
                      </p>
                    </div>
                  </div>

                  <div style={{ 
                    position: 'absolute', 
                    top: '0', 
                    right: '0', 
                    display: 'flex', 
                    gap: '6px' 
                  }}>
                    <button
                      onClick={() => onSelectProjeto(projeto)}
                      className="btn btn-sm btn-primary"
                      title="Abrir alocação"
                    >
                      <Eye size={14} />
                    </button>
                    <button
                      onClick={() => handleEdit(projeto)}
                      className="btn btn-sm btn-secondary"
                      title="Editar alocação"
                    >
                      <PencilSimple size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(projeto)}
                      className="btn btn-sm btn-danger"
                      title="Excluir alocação"
                    >
                      <Trash size={14} />
                    </button>
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
