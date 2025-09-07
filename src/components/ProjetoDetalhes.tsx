import { useState } from 'react';
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

interface ProjetoDetalhesProps {
  projeto: ProjetoAlocacao;
  onBack: () => void;
}

export default function ProjetoDetalhes({ projeto, onBack }: ProjetoDetalhesProps) {
  const { dispatch } = useApp();
  
  const [activeSection, setActiveSection] = useState<'salas' | 'turmas'>('salas');
  const [showSalaForm, setShowSalaForm] = useState(false);
  const [showTurmaForm, setShowTurmaForm] = useState(false);
  const [editingSala, setEditingSala] = useState<Sala | null>(null);
  const [editingTurma, setEditingTurma] = useState<Turma | null>(null);

  // Formulário de Sala
  const [salaForm, setSalaForm] = useState<FormSala>({
    nome: '',
    capacidade_total: 0,
    localizacao: '',
    status: 'ativa',
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

  const handleAddSala = () => {
    const novaSala: Sala = {
      id_sala: `sala_${Date.now()}`,
      ...salaForm,
    };

    const projetoAtualizado: ProjetoAlocacao = {
      ...projeto,
      salas: [...projeto.salas, novaSala]
    };

    dispatch({ type: 'UPDATE_PROJETO', payload: projetoAtualizado });
    
    setSalaForm({
      nome: '',
      capacidade_total: 0,
      localizacao: '',
      status: 'ativa',
      cadeiras_moveis: 0,
      cadeiras_especiais: 0,
    });
    setShowSalaForm(false);
  };

  const handleAddTurma = () => {
    const novaTurma: Turma = {
      id_turma: `turma_${Date.now()}`,
      ...turmaForm,
    };

    const projetoAtualizado: ProjetoAlocacao = {
      ...projeto,
      turmas: [...projeto.turmas, novaTurma]
    };

    dispatch({ type: 'UPDATE_PROJETO', payload: projetoAtualizado });
    
    setTurmaForm({
      nome: '',
      alunos: 0,
      duracao_min: 60,
      esp_necessarias: 0,
    });
    setShowTurmaForm(false);
  };

  const handleDeleteSala = (salaId: string) => {
    if (window.confirm('Tem certeza que deseja remover esta sala do projeto?')) {
      const projetoAtualizado: ProjetoAlocacao = {
        ...projeto,
        salas: projeto.salas.filter(sala => sala.id_sala !== salaId)
      };
      dispatch({ type: 'UPDATE_PROJETO', payload: projetoAtualizado });
    }
  };

  const handleDeleteTurma = (turmaId: string) => {
    if (window.confirm('Tem certeza que deseja remover esta turma do projeto?')) {
      const projetoAtualizado: ProjetoAlocacao = {
        ...projeto,
        turmas: projeto.turmas.filter(turma => turma.id_turma !== turmaId)
      };
      dispatch({ type: 'UPDATE_PROJETO', payload: projetoAtualizado });
    }
  };

  const handleExecutarAlocacao = () => {
    // Simulação da alocação inteligente
    const alocacoes: AlocacaoItem[] = projeto.turmas.map((turma, index) => {
      const salasCompativeis = projeto.salas.filter(sala => 
        sala.status === 'ativa' &&
        sala.capacidade_total >= turma.alunos &&
        sala.cadeiras_especiais >= turma.esp_necessarias
      );

      const salaEscolhida = salasCompativeis[index % salasCompativeis.length] || projeto.salas[0];
      
      return {
        id: `alocacao_${Date.now()}_${index}`,
        sala: salaEscolhida,
        turma: turma,
        compatibilidade_score: Math.random() * 100,
        observacoes: salasCompativeis.length === 0 ? 'Sala não atende todos os requisitos' : undefined
      };
    });

    const resultado: ResultadoAlocacao = {
      id: `resultado_${Date.now()}`,
      projeto_id: projeto.id_projeto,
      alocacoes,
      score_otimizacao: Math.random() * 100,
      data_geracao: new Date().toISOString(),
      parametros_usados: {
        priorizar_capacidade: true,
        priorizar_especiais: true,
        priorizar_proximidade: true,
      }
    };

    dispatch({ type: 'ADD_RESULTADO_ALOCACAO', payload: resultado });

    // Atualizar status do projeto
    const projetoAtualizado: ProjetoAlocacao = {
      ...projeto,
      status: 'alocado',
      ultima_alocacao: new Date().toISOString()
    };
    dispatch({ type: 'UPDATE_PROJETO', payload: projetoAtualizado });

    alert('Alocação inteligente executada com sucesso! Verifique os resultados na aba "Resultados".');
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      ativa: 'badge-success',
      inativa: 'badge-danger',
      manutencao: 'badge-warning'
    };
    
    const icons = {
      ativa: <CheckCircle size={16} />,
      inativa: <XCircle size={16} />,
      manutencao: <Wrench size={16} />
    };
    
    const labels = {
      ativa: 'Ativa',
      inativa: 'Inativa',
      manutencao: 'Manutenção'
    };

    return (
      <span className={`badge ${badges[status as keyof typeof badges]}`}>
        {icons[status as keyof typeof icons]}
        <span style={{ marginLeft: '6px' }}>
          {labels[status as keyof typeof labels]}
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
            className="btn btn-primary"
          >
            <Brain size={16} style={{ marginRight: '6px' }} />
            Executar Alocação Inteligente
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
            {projeto.salas.map((sala) => (
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
                        onClick={() => handleDeleteSala(sala.id_sala)}
                        className="btn btn-xs btn-danger"
                        title="Remover sala"
                      >
                        <Trash size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
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
            {projeto.turmas.map((turma) => (
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
                        onClick={() => handleDeleteTurma(turma.id_turma)}
                        className="btn btn-xs btn-danger"
                        title="Remover turma"
                      >
                        <Trash size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
