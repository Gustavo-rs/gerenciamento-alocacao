import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import type { ProjetoAlocacao, Sala, Turma, FormSala, FormTurma, ResultadoAlocacao, AlocacaoItem } from '../types';
import { 
  ArrowLeft, 
  Plus, 
  PencilSimple, 
  Trash, 
  Buildings, 
  Users, 
  Brain,
  CheckCircle,
  XCircle,
  Wrench,
  FloppyDisk,
  X,
  Target,
  Play
} from 'phosphor-react';
import { SkeletonProjetoHeader, SkeletonItemsList, SkeletonForm } from './Skeleton';

interface ProjetoDetalhesProps {
  projeto: ProjetoAlocacao;
  onBack: () => void;
}

export default function ProjetoDetalhes({ projeto: projetoProp, onBack }: ProjetoDetalhesProps) {
  const { executarAlocacao, loadProjeto, addSalaToProjeto, removeSalaFromProjeto, addTurmaToProjeto, removeTurmaFromProjeto } = useApp();
  
  // Estado local do projeto que será atualizado em tempo real
  const [projeto, setProjeto] = useState<ProjetoAlocacao>(projetoProp);
  const [activeSection, setActiveSection] = useState<'salas' | 'turmas'>('salas');
  const [showSalaForm, setShowSalaForm] = useState(false);
  const [showTurmaForm, setShowTurmaForm] = useState(false);
  const [editingSala, setEditingSala] = useState<Sala | null>(null);
  const [editingTurma, setEditingTurma] = useState<Turma | null>(null);
  
  // Estados de loading local
  const [isLoadingOperation, setIsLoadingOperation] = useState(false);
  const [isExecutingAllocation, setIsExecutingAllocation] = useState(false);

  // Formulário de Sala
  const [salaForm, setSalaForm] = useState<FormSala>({
    nome: '',
    capacidade_total: 0,
    localizacao: '',
    status: 'ATIVA',
    cadeiras_moveis: 0,
    cadeiras_especiais: 0,
  });

  // Formulário de Turma
  const [turmaForm, setTurmaForm] = useState<FormTurma>({
    nome: '',
    alunos: 0,
    duracao_min: 60,
    esp_necessarias: 0,
  });

  // Sincronizar estado local quando o prop projeto mudar
  useEffect(() => {
    setProjeto(projetoProp);
  }, [projetoProp]);

  const handleAddSala = async () => {
    if (!projeto.id) {
      alert('Erro: ID do projeto não encontrado.');
      return;
    }

    setIsLoadingOperation(true);
    
    const novaSala = {
      id_sala: `sala_${Date.now()}`,
      ...salaForm,
      status: salaForm.status.toUpperCase(),
    };

    const projetoAtualizado = await addSalaToProjeto(projeto.id, novaSala);
    
    if (projetoAtualizado) {
      // Atualizar estado local com dados atualizados
      setProjeto(projetoAtualizado);
      setSalaForm({
        nome: '',
        capacidade_total: 0,
        localizacao: '',
        status: 'ATIVA',
        cadeiras_moveis: 0,
        cadeiras_especiais: 0,
      });
      setShowSalaForm(false);
    } else {
      alert('Erro ao adicionar sala. Tente novamente.');
    }
    
    setIsLoadingOperation(false);
  };

  const handleAddTurma = async () => {
    if (!projeto.id) {
      alert('Erro: ID do projeto não encontrado.');
      return;
    }

    const novaTurma = {
      id_turma: `turma_${Date.now()}`,
      ...turmaForm,
    };

    const projetoAtualizado = await addTurmaToProjeto(projeto.id, novaTurma);
    
    if (projetoAtualizado) {
      // Atualizar estado local com dados atualizados
      setProjeto(projetoAtualizado);
      setTurmaForm({
        nome: '',
        alunos: 0,
        duracao_min: 60,
        esp_necessarias: 0,
      });
      setShowTurmaForm(false);
    } else {
      alert('Erro ao adicionar turma. Tente novamente.');
    }
  };

  const handleDeleteSala = async (sala: Sala) => {
    if (window.confirm('Tem certeza que deseja remover esta sala do projeto?')) {
      if (!projeto.id || !sala.id) {
        alert('Erro: IDs não encontrados.');
        return;
      }

      const projetoAtualizado = await removeSalaFromProjeto(projeto.id, sala.id);
      if (projetoAtualizado) {
        // Atualizar estado local com dados atualizados
        setProjeto(projetoAtualizado);
      } else {
        alert('Erro ao remover sala. Tente novamente.');
      }
    }
  };

  const handleDeleteTurma = async (turma: Turma) => {
    if (window.confirm('Tem certeza que deseja remover esta turma do projeto?')) {
      if (!projeto.id || !turma.id) {
        alert('Erro: IDs não encontrados.');
        return;
      }

      const projetoAtualizado = await removeTurmaFromProjeto(projeto.id, turma.id);
      if (projetoAtualizado) {
        // Atualizar estado local com dados atualizados
        setProjeto(projetoAtualizado);
      } else {
        alert('Erro ao remover turma. Tente novamente.');
      }
    }
  };

  const handleExecutarAlocacao = async () => {
    if (!projeto.id) {
      alert('Erro: ID do projeto não encontrado.');
      return;
    }

    setIsExecutingAllocation(true);
    
    const success = await executarAlocacao(projeto.id);
    
    if (success) {
      alert('Alocação inteligente executada com sucesso! Verifique os resultados na aba "Resultados".');
      // Recarregar projeto específico para obter status atualizado
      const projetoAtualizado = await loadProjeto(projeto.id);
      if (projetoAtualizado) {
        setProjeto(projetoAtualizado);
      }
    } else {
      alert('Erro ao executar alocação. Verifique se o backend está rodando e tente novamente.');
    }
    
    setIsExecutingAllocation(false);
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      ATIVA: 'badge-success',
      INATIVA: 'badge-danger',
      MANUTENCAO: 'badge-warning'
    };
    
    const icons = {
      ATIVA: <CheckCircle size={16} />,
      INATIVA: <XCircle size={16} />,
      MANUTENCAO: <Wrench size={16} />
    };
    
    const labels = {
      ATIVA: 'Ativa',
      INATIVA: 'Inativa',
      MANUTENCAO: 'Manutenção'
    };

    return (
      <span className={`badge ${badges[status as keyof typeof badges]}`}>
        {icons[status as keyof typeof icons]}
        <span style={{ marginLeft: '6px' }}>
          {labels[status as keyof typeof labels] || status}
        </span>
      </span>
    );
  };

  const podeExecutarAlocacao = projeto.salas.length > 0 && projeto.turmas.length > 0;

  return (
    <div className="grid gap-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="btn btn-secondary"
        >
          <ArrowLeft size={16} style={{ marginRight: '6px' }} />
          Voltar
        </button>
        <div style={{ flex: 1 }}>
          <h1 className="text-xl font-bold">{projeto.nome}</h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            {projeto.descricao}
          </p>
        </div>
        {podeExecutarAlocacao && (
          <button
            onClick={handleExecutarAlocacao}
            disabled={isExecutingAllocation}
            className="btn btn-primary"
          >
            {isExecutingAllocation ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Executando...
              </>
            ) : (
              <>
                <Brain size={16} style={{ marginRight: '6px' }} />
                Executar Alocação Inteligente
              </>
            )}
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="card">
          <div className="card-content">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                  Salas
                </p>
                <p className="text-xl font-bold">{projeto.salas.length}</p>
              </div>
              <Buildings size={24} color="var(--primary-color)" />
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
                <p className="text-xl font-bold">{projeto.turmas.length}</p>
              </div>
              <Users size={24} color="var(--primary-color)" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-content">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                  Capacidade Total
                </p>
                <p className="text-xl font-bold">
                  {projeto.salas.reduce((acc, sala) => acc + sala.capacidade_total, 0)}
                </p>
              </div>
              <Target size={24} color="var(--primary-color)" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-content">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                  Total Alunos
                </p>
                <p className="text-xl font-bold">
                  {projeto.turmas.reduce((acc, turma) => acc + turma.alunos, 0)}
                </p>
              </div>
              <Users size={24} color="var(--success-color)" />
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveSection('salas')}
          className={`btn ${activeSection === 'salas' ? 'btn-primary' : 'btn-secondary'}`}
        >
          <Buildings size={16} style={{ marginRight: '6px' }} />
          Salas ({projeto.salas.length})
        </button>
        <button
          onClick={() => setActiveSection('turmas')}
          className={`btn ${activeSection === 'turmas' ? 'btn-primary' : 'btn-secondary'}`}
        >
          <Users size={16} style={{ marginRight: '6px' }} />
          Turmas ({projeto.turmas.length})
        </button>
      </div>

      {/* Content */}
      {activeSection === 'salas' && (
        <div className="grid gap-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Salas do Projeto</h2>
            <button
              onClick={() => setShowSalaForm(true)}
              className="btn btn-primary"
            >
              <Plus size={16} style={{ marginRight: '6px' }} />
              Adicionar Sala
            </button>
          </div>

          {showSalaForm && (
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Nova Sala</h3>
              </div>
              <div className="card-content">
                <div className="form">
                  <div className="form-row">
                    <div className="form-group">
                      <label className="label">Nome</label>
                      <input
                        type="text"
                        value={salaForm.nome}
                        onChange={(e) => setSalaForm(prev => ({ ...prev, nome: e.target.value }))}
                        className="input"
                        placeholder="Ex: Sala 1"
                      />
                    </div>
                    <div className="form-group">
                      <label className="label">Capacidade</label>
                      <input
                        type="number"
                        value={salaForm.capacidade_total}
                        onChange={(e) => setSalaForm(prev => ({ ...prev, capacidade_total: Number(e.target.value) }))}
                        className="input"
                        min="1"
                      />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="label">Localização</label>
                      <input
                        type="text"
                        value={salaForm.localizacao}
                        onChange={(e) => setSalaForm(prev => ({ ...prev, localizacao: e.target.value }))}
                        className="input"
                        placeholder="Ex: Bloco A - 2º andar"
                      />
                    </div>
                    <div className="form-group">
                      <label className="label">Cadeiras Especiais</label>
                      <input
                        type="number"
                        value={salaForm.cadeiras_especiais}
                        onChange={(e) => setSalaForm(prev => ({ ...prev, cadeiras_especiais: Number(e.target.value) }))}
                        className="input"
                        min="0"
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="label">Cadeiras Móveis</label>
                    <input
                      type="number"
                      value={salaForm.cadeiras_moveis}
                      onChange={(e) => setSalaForm(prev => ({ ...prev, cadeiras_moveis: Number(e.target.value) }))}
                      className="input"
                      min="0"
                      placeholder="Quantidade de cadeiras móveis"
                    />
                  </div>
                  <div className="flex gap-4">
                    <button onClick={handleAddSala} className="btn btn-primary">
                      <FloppyDisk size={16} style={{ marginRight: '6px' }} />
                      Adicionar
                    </button>
                    <button onClick={() => setShowSalaForm(false)} className="btn btn-secondary">
                      <X size={16} style={{ marginRight: '6px' }} />
                      Cancelar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="grid gap-4">
            {isLoadingOperation ? (
              <SkeletonItemsList />
            ) : (
              projeto.salas.map((sala) => (
                <div key={sala.id_sala} className="card">
                  <div className="card-content">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">{sala.nome}</h3>
                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                          {sala.localizacao}
                        </p>
                        <div className="flex gap-2 mt-2 flex-wrap">
                          <span className="badge badge-info">{sala.capacidade_total} lugares</span>
                          {sala.cadeiras_especiais > 0 && (
                            <span className="badge badge-warning">{sala.cadeiras_especiais} especiais</span>
                          )}
                          {sala.cadeiras_moveis > 0 && (
                            <span className="badge badge-info">{sala.cadeiras_moveis} móveis</span>
                          )}
                          {getStatusBadge(sala.status)}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleDeleteSala(sala)}
                          className="btn btn-xs btn-danger"
                          title="Remover sala"
                        >
                          <Trash size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeSection === 'turmas' && (
        <div className="grid gap-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Turmas do Projeto</h2>
            <button
              onClick={() => setShowTurmaForm(true)}
              className="btn btn-primary"
            >
              <Plus size={16} style={{ marginRight: '6px' }} />
              Adicionar Turma
            </button>
          </div>

          {showTurmaForm && (
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Nova Turma</h3>
              </div>
              <div className="card-content">
                <div className="form">
                  <div className="form-group">
                    <label className="label">Nome da Turma</label>
                    <input
                      type="text"
                      value={turmaForm.nome}
                      onChange={(e) => setTurmaForm(prev => ({ ...prev, nome: e.target.value }))}
                      className="input"
                      placeholder="Ex: Matemática 101"
                    />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="label">Número de Alunos</label>
                      <input
                        type="number"
                        value={turmaForm.alunos}
                        onChange={(e) => setTurmaForm(prev => ({ ...prev, alunos: Number(e.target.value) }))}
                        className="input"
                        min="1"
                      />
                    </div>
                    <div className="form-group">
                      <label className="label">Duração (minutos)</label>
                      <select
                        value={turmaForm.duracao_min}
                        onChange={(e) => setTurmaForm(prev => ({ ...prev, duracao_min: Number(e.target.value) }))}
                        className="select"
                      >
                        <option value={30}>30 minutos</option>
                        <option value={45}>45 minutos</option>
                        <option value={60}>1 hora</option>
                        <option value={90}>1h 30min</option>
                        <option value={120}>2 horas</option>
                        <option value={150}>2h 30min</option>
                        <option value={180}>3 horas</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="label">Cadeiras Especiais Necessárias</label>
                    <input
                      type="number"
                      value={turmaForm.esp_necessarias}
                      onChange={(e) => setTurmaForm(prev => ({ ...prev, esp_necessarias: Number(e.target.value) }))}
                      className="input"
                      min="0"
                    />
                  </div>
                  <div className="flex gap-4">
                    <button onClick={handleAddTurma} className="btn btn-primary">
                      <FloppyDisk size={16} style={{ marginRight: '6px' }} />
                      Adicionar
                    </button>
                    <button onClick={() => setShowTurmaForm(false)} className="btn btn-secondary">
                      <X size={16} style={{ marginRight: '6px' }} />
                      Cancelar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="grid gap-4">
            {isLoadingOperation ? (
              <SkeletonItemsList />
            ) : (
              projeto.turmas.map((turma) => (
                <div key={turma.id_turma} className="card">
                  <div className="card-content">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">{turma.nome}</h3>
                        <div className="flex gap-4 mt-2">
                          <span className="badge badge-info">{turma.alunos} alunos</span>
                          <span className="badge badge-info">{turma.duracao_min}min</span>
                          {turma.esp_necessarias > 0 && (
                            <span className="badge badge-warning">{turma.esp_necessarias} especiais</span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleDeleteTurma(turma)}
                          className="btn btn-xs btn-danger"
                          title="Remover turma"
                        >
                          <Trash size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
