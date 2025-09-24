import { useState, useEffect } from 'react';
import { Plus, Eye, PencilSimple, Trash, FloppyDisk, X, Buildings, Calendar, Users, Brain, ChartBar, Copy, CaretDown, CaretRight } from 'phosphor-react';
import type { Sala, FormSala, Horario, FormHorario, DiaSemana, Periodo, AlocacaoPrincipal, Turma, FormTurma } from '../types';
import Modal from './Modal';
import ConfirmModal from './ConfirmModal';
import { useToast } from './Toast';
import ResultadosAlocacaoInteligenteAmigavel from './ResultadosAlocacaoInteligenteAmigavel';
import ProcessingModal from './ProcessingModal';

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
  const toast = useToast();
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
  const [showCloneHorarioModal, setShowCloneHorarioModal] = useState(false);
  const [selectedHorarioId, setSelectedHorarioId] = useState<string | null>(null);
  const [cloneHorarioData, setCloneHorarioData] = useState<{horario: Horario; alocacao: AlocacaoPrincipal} | null>(null);

  // Estados para confirmação
  const [confirmModal, setConfirmModal] = useState({ 
    isOpen: false, 
    title: '', 
    message: '', 
    type: 'danger' as 'danger' | 'processing',
    confirmText: 'Excluir',
    onConfirm: () => {} 
  });
  const [resultadosModal, setResultadosModal] = useState({
    isOpen: false,
    alocacaoId: '',
    nomeAlocacao: ''
  });
  const [processingModal, setProcessingModal] = useState({
    isOpen: false,
    title: '',
    message: ''
  });

  // Estados para formulários
  const [salaForm, setSalaForm] = useState<FormSala>({
    nome: '',
    capacidade_total: 0,
    localizacao: '',
    status: 'ATIVA',
    cadeiras_moveis: false,
    cadeiras_especiais: 0,
  });

  const [editingSala, setEditingSala] = useState<Sala | null>(null);
  const [editingTurma, setEditingTurma] = useState<Turma | null>(null);

  const [horarioForm, setHorarioForm] = useState<FormHorario>({
    dia_semana: 'SEGUNDA',
    periodo: 'MATUTINO'
  });

  const [turmaForm, setTurmaForm] = useState<FormTurma>({
    nome: '',
    alunos: 0,
    esp_necessarias: 0
  });

  // Estados para expansíveis
  const [expandedSections, setExpandedSections] = useState<{
    [alocacaoId: string]: {
      salas: boolean;
      horarios: boolean;
      turmas: { [horarioId: string]: boolean };
    }
  }>({});

  // Funções para controlar expansíveis
  const toggleSection = (alocacaoId: string, section: 'salas' | 'horarios') => {
    setExpandedSections(prev => ({
      ...prev,
      [alocacaoId]: {
        ...prev[alocacaoId],
        [section]: !prev[alocacaoId]?.[section]
      }
    }));
  };

  const toggleTurmas = (alocacaoId: string, horarioId: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [alocacaoId]: {
        ...prev[alocacaoId],
        turmas: {
          ...prev[alocacaoId]?.turmas,
          [horarioId]: !prev[alocacaoId]?.turmas?.[horarioId]
        }
      }
    }));
  };

  const isSectionExpanded = (alocacaoId: string, section: 'salas' | 'horarios') => {
    return expandedSections[alocacaoId]?.[section] || false;
  };

  const isTurmasExpanded = (alocacaoId: string, horarioId: string) => {
    return expandedSections[alocacaoId]?.turmas?.[horarioId] || false;
  };

  // Carregar alocações da API
  useEffect(() => {
    loadAlocacoes();
  }, []);

  const loadAlocacoes = async (preserveScroll = false) => {
    if (!preserveScroll) {
      setLoading(true);
    }
    
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
      if (!preserveScroll) {
        setLoading(false);
      }
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
         // Recarregar lista preservando posição
         await loadAlocacoes(true);
         
         // Reset form
         setFormData({ nome: '', descricao: '' });
         setShowForm(false);
         setEditingAlocacao(null);
         
         toast.success('Sucesso!', 'Alocação salva com sucesso!');
       } else {
        toast.error('Erro', data.error || 'Erro ao salvar alocação');
      }
    } catch (error) {
      console.error('Erro ao salvar alocação:', error);
      toast.error('Erro', 'Erro ao salvar alocação');
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

  const handleDelete = (alocacao: AlocacaoPrincipal) => {
    // Contar elementos relacionados
    const salasCount = alocacao.salas?.length || 0;
    const horariosCount = alocacao.horarios?.length || 0;
    const turmasCount = alocacao.horarios?.reduce((acc, h) => acc + (h.turmas?.length || 0), 0) || 0;

    // Criar mensagem detalhada
    const detalhes = [];
    if (salasCount > 0) detalhes.push(`${salasCount} sala${salasCount > 1 ? 's' : ''} associada${salasCount > 1 ? 's' : ''}`);
    if (horariosCount > 0) detalhes.push(`${horariosCount} horário${horariosCount > 1 ? 's' : ''}`);
    if (turmasCount > 0) detalhes.push(`${turmasCount} turma${turmasCount > 1 ? 's' : ''} vinculada${turmasCount > 1 ? 's' : ''}`);

    const mensagemDetalhada = detalhes.length > 0 
      ? `Esta ação também removerá: ${detalhes.join(', ')}.`
      : 'Esta alocação não possui elementos relacionados.';

    setConfirmModal({
      isOpen: true,
      title: 'Excluir Alocação',
      message: `Tem certeza que deseja excluir a alocação "${alocacao.nome}"? ${mensagemDetalhada} Esta ação não pode ser desfeita.`,
      type: 'danger',
      confirmText: 'Excluir',
      onConfirm: async () => {
        setConfirmModal({ ...confirmModal, isOpen: false });
      setLoading(true);
      try {
        const response = await fetch(`http://localhost:3001/api/alocacoes/${alocacao.id}`, {
          method: 'DELETE'
        });
        
        const data = await response.json();
        
         if (data.success) {
           await loadAlocacoes(true);
             toast.success('Sucesso!', data.message || 'Alocação excluída com sucesso!');
         } else {
            toast.error('Erro', data.error || 'Erro ao excluir alocação');
        }
      } catch (error) {
        console.error('Erro ao excluir alocação:', error);
          toast.error('Erro', 'Erro ao excluir alocação');
      } finally {
        setLoading(false);
      }
    }
    });
  };


  const handleRemoveSala = (alocacao: AlocacaoPrincipal, sala: Sala) => {
    setConfirmModal({
      isOpen: true,
      title: 'Remover Sala',
      message: `Tem certeza que deseja remover "${sala.nome}" desta alocação?`,
      type: 'danger',
      confirmText: 'Remover',
      onConfirm: async () => {
        setConfirmModal({ ...confirmModal, isOpen: false });
      setLoading(true);
      try {
        const response = await fetch(`http://localhost:3001/api/alocacoes/${alocacao.id}/salas/${sala.id}`, {
          method: 'DELETE'
        });
        
        const data = await response.json();
        
         if (data.success) {
           await loadAlocacoes(true);
             toast.success('Sucesso!', 'Sala removida com sucesso!');
         } else {
            toast.error('Erro', data.error || 'Erro ao remover sala');
        }
      } catch (error) {
        console.error('Erro ao remover sala:', error);
          toast.error('Erro', 'Erro ao remover sala');
      } finally {
        setLoading(false);
      }
    }
    });
  };


  // Funções para gerenciar horários
  const handleCreateHorario = async () => {
    if (!selectedAlocacaoId) {
      toast.error('Erro', 'Alocação não selecionada');
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
         await loadAlocacoes(true);
         setHorarioForm({ dia_semana: 'SEGUNDA', periodo: 'MATUTINO' });
         setShowHorarioModal(false);
         setSelectedAlocacaoId(null);
         toast.success('Sucesso!', 'Horário criado com sucesso!');
       } else {
        toast.error('Erro', data.error || 'Erro ao criar horário');
      }
    } catch (error) {
      console.error('Erro ao criar horário:', error);
      toast.error('Erro', 'Erro ao criar horário');
    } finally {
      setLoading(false);
    }
  };


  // Funções para gerenciar turmas nos horários
  const handleCreateTurma = async () => {
    if (!turmaForm.nome || turmaForm.alunos <= 0) {
      toast.warning('Atenção', 'Preencha o nome e número de alunos da turma');
      return;
    }

    if (!selectedHorarioId) {
      toast.error('Erro', 'Horário não selecionado');
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
        toast.error('Erro', turmaData.error || 'Erro ao criar turma');
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
         await loadAlocacoes(true);
         setTurmaForm({ nome: '', alunos: 0, esp_necessarias: 0 });
         setShowTurmaModal(false);
         setSelectedHorarioId(null);
         toast.success('Sucesso!', 'Turma criada e adicionada ao horário com sucesso!');
       } else {
        toast.error('Erro', horarioData.error || 'Erro ao adicionar turma ao horário');
      }
    } catch (error) {
      console.error('Erro ao criar turma:', error);
      toast.error('Erro', 'Erro ao criar turma');
    } finally {
      setLoading(false);
    }
  };

  const handleEditSala = (sala: Sala) => {
    setEditingSala(sala);
    setSalaForm({
      nome: sala.nome,
      capacidade_total: sala.capacidade_total,
      localizacao: sala.localizacao,
      status: sala.status,
      cadeiras_moveis: sala.cadeiras_moveis,
      cadeiras_especiais: sala.cadeiras_especiais,
    });
    setShowSalaModal(true);
  };

  const handleCreateSala = async () => {
    try {
      setLoading(true);

      const salaData = {
        ...salaForm,
        id_sala: `S${Date.now()}`
      };

      const response = await fetch('http://localhost:3001/api/salas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(salaData)
      });

      const data = await response.json();

      if (data.success) {
        // Se temos uma alocação selecionada, adicionar a sala à alocação
        if (selectedAlocacaoId) {
      const alocacaoResponse = await fetch(`http://localhost:3001/api/alocacoes/${selectedAlocacaoId}/salas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sala_id: data.data.id })
      });

      const alocacaoData = await alocacaoResponse.json();
      
      if (alocacaoData.success) {
            toast.success('Sucesso', 'Sala criada e adicionada à alocação com sucesso!');
          } else {
            toast.error('Erro', alocacaoData.error || 'Erro ao adicionar sala à alocação');
            return;
          }
        } else {
          toast.success('Sucesso', 'Sala criada com sucesso!');
        }
        
        // Reset form
        setSalaForm({
          nome: '',
          capacidade_total: 0,
          localizacao: '',
          status: 'ATIVA',
          cadeiras_moveis: false,
          cadeiras_especiais: 0,
        });
        setShowSalaModal(false);
         setSelectedAlocacaoId(null);
         
         // Reload data
         loadAlocacoes(true);
       } else {
         toast.error('Erro', data.error || 'Erro ao criar sala');
       }
    } catch (error) {
      console.error('Erro ao criar sala:', error);
      toast.error('Erro', 'Erro ao criar sala');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSala = async () => {
    if (!editingSala) return;

    try {
      setLoading(true);

      const response = await fetch(`http://localhost:3001/api/salas/${editingSala.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(salaForm)
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success('Sucesso', 'Sala atualizada com sucesso!');
        
        // Reset form
        setSalaForm({
          nome: '',
          capacidade_total: 0,
          localizacao: '',
          status: 'ATIVA',
          cadeiras_moveis: false,
          cadeiras_especiais: 0,
        });
        setEditingSala(null);
         setShowSalaModal(false);
         
         // Reload data
         loadAlocacoes(true);
       } else {
         toast.error('Erro', data.error || 'Erro ao atualizar sala');
       }
    } catch (error) {
      console.error('Erro ao atualizar sala:', error);
      toast.error('Erro', 'Erro ao atualizar sala');
    } finally {
      setLoading(false);
    }
  };

  const handleEditTurma = (turma: Turma) => {
    setEditingTurma(turma);
    setTurmaForm({
      nome: turma.nome,
      alunos: turma.alunos,
      esp_necessarias: turma.esp_necessarias,
    });
    setShowTurmaModal(true);
  };

  const handleUpdateTurma = async () => {
    if (!editingTurma) return;

    try {
      setLoading(true);

      const response = await fetch(`http://localhost:3001/api/turmas/${editingTurma.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(turmaForm)
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Sucesso', 'Turma atualizada com sucesso!');
        
        // Reset form
        setTurmaForm({ nome: '', alunos: 0, esp_necessarias: 0 });
        setEditingTurma(null);
         setShowTurmaModal(false);
         
         // Reload data
         loadAlocacoes(true);
       } else {
         toast.error('Erro', data.error || 'Erro ao atualizar turma');
       }
    } catch (error) {
      console.error('Erro ao atualizar turma:', error);
      toast.error('Erro', 'Erro ao atualizar turma');
    } finally {
      setLoading(false);
    }
  };

  const handleCloneHorario = (horario: Horario, alocacao: AlocacaoPrincipal) => {
    if (horario.turmas.length === 0) {
      toast.warning('Atenção', 'Este horário não possui turmas para clonar');
      return;
    }

    setCloneHorarioData({ horario, alocacao });
    setHorarioForm({
      dia_semana: 'SEGUNDA',
      periodo: 'MATUTINO'
    });
    setShowCloneHorarioModal(true);
  };

  // Função para obter combinações de dia/período disponíveis
  const getAvailableOptions = (alocacao: AlocacaoPrincipal, excludeHorarioId?: string) => {
    const existingCombinations = alocacao.horarios
      .filter(h => h.id !== excludeHorarioId) // Excluir horário atual se fornecido (para edição)
      .map(h => `${h.dia_semana}_${h.periodo}`);
    
    const allDias: DiaSemana[] = ['SEGUNDA', 'TERCA', 'QUARTA', 'QUINTA', 'SEXTA', 'SABADO'];
    const allPeriodos: Periodo[] = ['MATUTINO', 'VESPERTINO', 'NOTURNO'];
    
    const availableDias = allDias.filter(dia => 
      allPeriodos.some(periodo => !existingCombinations.includes(`${dia}_${periodo}`))
    );
    
    const getAvailablePeríodos = (selectedDia: DiaSemana) => {
      return allPeriodos.filter(periodo => 
        !existingCombinations.includes(`${selectedDia}_${periodo}`)
      );
    };
    
    return { availableDias, getAvailablePeríodos };
  };

  const handleExecuteClone = async () => {
    if (!cloneHorarioData) return;

    try {
      setLoading(true);

      const response = await fetch(`http://localhost:3001/api/horarios/${cloneHorarioData.horario.id}/clone`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          alocacao_id: cloneHorarioData.alocacao.id,
          dia_semana: horarioForm.dia_semana,
          periodo: horarioForm.periodo
        })
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Sucesso', `Horário clonado com ${cloneHorarioData.horario.turmas.length} turma${cloneHorarioData.horario.turmas.length > 1 ? 's' : ''}!`);
        
        // Reset e fechar modal
        setCloneHorarioData(null);
        setShowCloneHorarioModal(false);
        setHorarioForm({
          dia_semana: 'SEGUNDA',
          periodo: 'MATUTINO'
        });
        
         // Reload data
         loadAlocacoes(true);
       } else {
         toast.error('Erro', data.error || 'Erro ao clonar horário');
       }
    } catch (error) {
      console.error('Erro ao clonar horário:', error);
      toast.error('Erro', 'Erro ao clonar horário');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteHorario = (horario: Horario) => {
    const turmasCount = horario.turmas.length;
    const turmasInfo = turmasCount > 0 
      ? ` Isso também removerá ${turmasCount} turma${turmasCount > 1 ? 's' : ''} associada${turmasCount > 1 ? 's' : ''} a este horário.`
      : '';

    setConfirmModal({
      isOpen: true,
      title: 'Deletar Horário',
      message: `Tem certeza que deseja deletar o horário "${diasLabels[horario.dia_semana]} ${periodosLabels[horario.periodo]}"?${turmasInfo} Esta ação não pode ser desfeita.`,
      type: 'danger',
      confirmText: 'Deletar',
      onConfirm: async () => {
        setConfirmModal({ ...confirmModal, isOpen: false });
        setLoading(true);
        try {
          const response = await fetch(`http://localhost:3001/api/horarios/${horario.id}`, {
            method: 'DELETE'
          });
          
          const data = await response.json();
          
           if (data.success) {
         await loadAlocacoes(true);
             toast.success('Sucesso!', `Horário deletado${turmasCount > 0 ? ` com ${turmasCount} turma${turmasCount > 1 ? 's' : ''}` : ''}`);
       } else {
            toast.error('Erro', data.error || 'Erro ao deletar horário');
      }
    } catch (error) {
          console.error('Erro ao deletar horário:', error);
          toast.error('Erro', 'Erro ao deletar horário');
    } finally {
      setLoading(false);
    }
      }
    });
  };

  const handleRemoveTurma = (horario: Horario, turma: Turma) => {
    setConfirmModal({
      isOpen: true,
      title: 'Remover Turma',
      message: `Tem certeza que deseja remover "${turma.nome}" deste horário?`,
      type: 'danger',
      confirmText: 'Remover',
      onConfirm: async () => {
        setConfirmModal({ ...confirmModal, isOpen: false });
      setLoading(true);
      try {
        const response = await fetch(`http://localhost:3001/api/horarios/${horario.id}/turmas/${turma.id}`, {
          method: 'DELETE'
        });
        
        const data = await response.json();
        
         if (data.success) {
           await loadAlocacoes(true);
             toast.success('Sucesso!', 'Turma removida com sucesso!');
         } else {
            toast.error('Erro', data.error || 'Erro ao remover turma');
        }
      } catch (error) {
        console.error('Erro ao remover turma:', error);
          toast.error('Erro', 'Erro ao remover turma');
      } finally {
        setLoading(false);
      }
    }
    });
  };

  const handleExecutarAlocacaoInteligente = async (alocacao: AlocacaoPrincipal) => {
    // Verificar se há salas e horários com turmas
    if (alocacao.salas.length === 0) {
      toast.warning('Atenção', 'A alocação não possui salas associadas');
      return;
    }

    const horariosComTurmas = alocacao.horarios?.filter(h => h.turmas?.length > 0) || [];
    if (horariosComTurmas.length === 0) {
      toast.warning('Atenção', 'A alocação não possui horários com turmas');
      return;
    }

    setConfirmModal({
      isOpen: true,
      title: 'Executar Alocação Inteligente',
      message: `Deseja executar a alocação inteligente para "${alocacao.nome}"? Isso processará ${horariosComTurmas.length} horário${horariosComTurmas.length > 1 ? 's' : ''} com turmas e pode levar alguns minutos.`,
      type: 'processing',
      confirmText: 'Processar',
      onConfirm: async () => {
        setConfirmModal({ ...confirmModal, isOpen: false });
        
        // Mostrar modal de processamento (sem setLoading para não mostrar o spinner)
        setProcessingModal({
          isOpen: true,
          title: 'Processando Alocação Inteligente',
          message: `Analisando ${horariosComTurmas.length} horário${horariosComTurmas.length > 1 ? 's' : ''} e otimizando a distribuição das turmas...`
        });
        
        try {
          const response = await fetch(`http://localhost:3001/api/alocacao-inteligente/${alocacao.id}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              priorizar_capacidade: true,
              priorizar_especiais: true,
              priorizar_proximidade: true
            })
          });

          const data = await response.json();
          
          // Fechar modal de processamento
          setProcessingModal({ isOpen: false, title: '', message: '' });
          
          if (data.success) {
            toast.success('Sucesso!', data.message || 'Alocação inteligente executada com sucesso!');
            
            // Mostrar detalhes do resultado
            if (data.dados) {
              const { horarios_processados, total_horarios, score_geral, resultados_por_horario } = data.dados;
              
              // Contar turmas não alocadas
              const totalTurmasNaoAlocadas = resultados_por_horario
                ? resultados_por_horario.reduce((acc: number, r: unknown) => {
                    const result = r as { python_result?: { turmas_sobrando?: number } };
                    return acc + (result.python_result?.turmas_sobrando || 0);
                  }, 0)
                : 0;
              
              setTimeout(() => {
                let mensagem = `${horarios_processados}/${total_horarios} horários processados com score geral de ${score_geral}%`;
                if (totalTurmasNaoAlocadas > 0) {
                  mensagem += `. ⚠️ ${totalTurmasNaoAlocadas} turma${totalTurmasNaoAlocadas > 1 ? 's' : ''} não pôde${totalTurmasNaoAlocadas > 1 ? 'ram' : ''} ser alocada${totalTurmasNaoAlocadas > 1 ? 's' : ''}`;
                }
                
                toast.info('Resultado', mensagem);
              }, 500);
              
              // Abrir modal de resultados após 1 segundo
              setTimeout(() => {
                setResultadosModal({
                  isOpen: true,
                  alocacaoId: alocacao.id,
                  nomeAlocacao: alocacao.nome
                });
              }, 1000);
            }
          } else {
            toast.error('Erro', data.error || 'Erro ao executar alocação inteligente');
          }
        } catch (error) {
          console.error('Erro ao executar alocação inteligente:', error);
          setProcessingModal({ isOpen: false, title: '', message: '' });
          toast.error('Erro', 'Erro ao executar alocação inteligente');
        }
      }
    });
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

      {/* Modal de Nova Alocação */}
      <Modal
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          setEditingAlocacao(null);
          setFormData({ nome: '', descricao: '' });
        }}
        title={editingAlocacao ? 'Editar Alocação' : 'Nova Alocação'}
        size="lg"
        closeOnBackdropClick={false}
      >
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
      </Modal>

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
                      <button
                        onClick={() => handleExecutarAlocacaoInteligente(alocacao)}
                        className="btn btn-sm btn-success"
                        title="Executar alocação inteligente"
                        disabled={loading}
                        style={{ marginRight: 'var(--spacing-2)' }}
                      >
                        <Brain size={14} />
                      </button>
                      <button
                        onClick={() => setResultadosModal({
                          isOpen: true,
                          alocacaoId: alocacao.id,
                          nomeAlocacao: alocacao.nome
                        })}
                        className="btn btn-sm btn-info"
                        title="Ver resultados da alocação inteligente"
                        disabled={loading}
                        style={{ marginRight: 'var(--spacing-2)' }}
                      >
                        <ChartBar size={14} />
                      </button>
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

                   {/* Salas da Alocação - Expansível */}
                   <div className="mb-6">
                     <div 
                       className="flex items-center justify-between mb-4 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
                       onClick={() => toggleSection(alocacao.id, 'salas')}
                       style={{ cursor: 'pointer' }}
                     >
                       <h4 className="text-lg font-semibold flex items-center gap-2">
                         {isSectionExpanded(alocacao.id, 'salas') ? (
                           <CaretDown size={18} />
                         ) : (
                           <CaretRight size={18} />
                         )}
                         <Buildings size={18} />
                         Salas da Alocação
                         <span className="badge badge-info text-xs">
                           {alocacao.salas.length}
                         </span>
                       </h4>
                       <button
                         onClick={(e) => {
                           e.stopPropagation();
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
                    
                    {isSectionExpanded(alocacao.id, 'salas') && (
                      <>
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
                                        {sala.cadeiras_moveis && (
                                          <span className="badge badge-secondary">
                                            Móveis
                                          </span>
                                        )}
                                        <span className={`badge ${sala.status === 'ATIVA' ? 'badge-success' : 'badge-warning'}`}>
                                          {sala.status}
                                        </span>
                                      </div>
                                    </div>
                                    
                                     <div className="flex" style={{ flexDirection: 'column', gap: 'var(--spacing-2)', alignItems: 'center' }}>
                                       <button 
                                         onClick={() => handleEditSala(sala)}
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
                      </>
                    )}

                  </div>

                   {/* Horários da Alocação - Expansível */}
                   <div className="mb-6">
                     <div 
                       className="flex items-center justify-between mb-4 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
                       onClick={() => toggleSection(alocacao.id, 'horarios')}
                       style={{ cursor: 'pointer' }}
                     >
                       <h4 className="text-lg font-semibold flex items-center gap-2">
                         {isSectionExpanded(alocacao.id, 'horarios') ? (
                           <CaretDown size={18} />
                         ) : (
                           <CaretRight size={18} />
                         )}
                         <Calendar size={18} />
                         Horários da Alocação
                         <span className="badge badge-info text-xs">
                           {alocacao.horarios.length}
                         </span>
                       </h4>
                       <button
                         onClick={(e) => {
                           e.stopPropagation();
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
                    
                    {isSectionExpanded(alocacao.id, 'horarios') && (
                      <>
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
                                      
                                      {/* Turmas do Horário - Expansível */}
                                      {horario.turmas.length > 0 && (
                                        <div style={{ marginBottom: 'var(--spacing-3)' }}>
                                          <div 
                                            className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors mb-2"
                                            onClick={() => toggleTurmas(alocacao.id, horario.id)}
                                            style={{ cursor: 'pointer' }}
                                          >
                                            <div className="flex items-center gap-2">
                                              {isTurmasExpanded(alocacao.id, horario.id) ? (
                                                <CaretDown size={16} />
                                              ) : (
                                                <CaretRight size={16} />
                                              )}
                                              <span className="font-medium text-sm">
                                                Turmas ({horario.turmas.length})
                                              </span>
                                            </div>
                                          </div>
                                          
                                          {isTurmasExpanded(alocacao.id, horario.id) && (
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
                                                       {turma.esp_necessarias > 0 && (
                                                         <span className="badge badge-warning">
                                                           {turma.esp_necessarias} especiais
                                                         </span>
                                                       )}
                                                     </div>
                                                   </div>
                                                   <div className="flex" style={{ gap: 'var(--spacing-1)' }}>
                                                    <button
                                                      onClick={() => handleEditTurma(turma)}
                                                      className="btn btn-xs btn-secondary"
                                                      disabled={loading}
                                                      title="Editar turma"
                                                    >
                                                      <PencilSimple size={12} style={{ margin: '8px' }} />
                                                    </button>
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
                                          )}
                                        </div>
                                      )}
                                      
                                       {/* Botões de ação do horário */}
                                       <div className="pt-3 border-t border-gray-200 mt-3 space-y-2" >
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
                                         
                                         {horario.turmas.length > 0 && (
                                           <button
                                             onClick={() => handleCloneHorario(horario, alocacao)}
                                             className="btn btn-sm btn-outline-secondary w-full flex items-center justify-center gap-2"
                                             disabled={loading}
                                             title="Clonar este horário com todas as turmas"
                                           >
                                             <Copy size={16} />
                                             Clonar Horário
                                           </button>
                                         )}
                                         
                                         <button
                                           onClick={() => handleDeleteHorario(horario)}
                                           className="btn btn-sm btn-outline-danger w-full flex items-center justify-center gap-2"
                                           disabled={loading}
                                           title="Deletar este horário e todas as suas turmas"
                                         >
                                           <Trash size={16} />
                                           Deletar Horário
                                         </button>
                                       </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </>
                    )}


                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>


      {/* Modal para Adicionar Horário */}
      <Modal
        isOpen={showHorarioModal}
        onClose={() => {
          setShowHorarioModal(false);
          setSelectedAlocacaoId(null);
          setHorarioForm({ dia_semana: 'SEGUNDA', periodo: 'MATUTINO' });
        }}
        title="Adicionar Novo Horário"
        size="md"
      >
        {selectedAlocacaoId && (() => {
          const selectedAlocacao = alocacoes.find(a => a.id === selectedAlocacaoId);
          if (!selectedAlocacao) return null;
          
          const { availableDias, getAvailablePeríodos } = getAvailableOptions(selectedAlocacao);
          const availablePeríodos = getAvailablePeríodos(horarioForm.dia_semana);
          
          return (
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleCreateHorario();
              }} 
              className="form"
            >
              {availableDias.length === 0 ? (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <strong>Todos os horários possíveis já foram criados para esta alocação.</strong>
                  </p>
                  <p className="text-xs text-yellow-600 mt-1">
                    Cada combinação de dia da semana e período pode ter apenas um horário.
                  </p>
                </div>
              ) : (
                <>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="label">Dia da Semana *</label>
                      <select
                        value={horarioForm.dia_semana}
                        onChange={(e) => {
                          const newDia = e.target.value as DiaSemana;
                          const newAvailablePeríodos = getAvailablePeríodos(newDia);
                          setHorarioForm(prev => ({ 
                            ...prev, 
                            dia_semana: newDia,
                            periodo: newAvailablePeríodos.includes(prev.periodo) ? prev.periodo : newAvailablePeríodos[0] || 'MATUTINO'
                          }));
                        }}
                        className="input"
                        required
                        disabled={loading}
                      >
                        {availableDias.map(dia => (
                          <option key={dia} value={dia}>{diasLabels[dia]}</option>
                        ))}
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
                        {availablePeríodos.map(periodo => (
                          <option key={periodo} value={periodo}>{periodosLabels[periodo]}</option>
                        ))}
                      </select>
                    </div>
            </div>
            
                  <div className="flex gap-4 pt-6 border-t border-gray-200">
                    <button 
                      type="submit"
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
                </>
              )}
            </form>
          );
        })()}
      </Modal>

      {/* Modal para Adicionar Turma */}
      <Modal
        isOpen={showTurmaModal}
        onClose={() => {
          setShowTurmaModal(false);
          setSelectedHorarioId(null);
          setEditingTurma(null);
          setTurmaForm({ nome: '', alunos: 0, esp_necessarias: 0 });
        }}
        title={editingTurma ? "Editar Turma" : "Adicionar Nova Turma"}
        size="lg"
      >
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            if (editingTurma) {
              handleUpdateTurma();
            } else {
              handleCreateTurma();
            }
          }} 
          className="form"
        >
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
                
                <div className="flex gap-4 pt-6 border-t border-gray-200">
                  <button 
              type="submit"
                    className="btn btn-primary flex-1" 
                    disabled={loading}
                  >
                    <FloppyDisk size={16} style={{ marginRight: '6px' }} />
                    {loading ? (editingTurma ? 'Atualizando...' : 'Criando...') : (editingTurma ? 'Atualizar Turma' : 'Criar Turma')}
                  </button>
                  <button 
                    type="button"
                    onClick={() => {
                      setShowTurmaModal(false);
                      setSelectedHorarioId(null);
                      setEditingTurma(null);
                      setTurmaForm({ nome: '', alunos: 0, esp_necessarias: 0 });
                    }}
                    className="btn btn-secondary"
                    disabled={loading}
                  >
                    <X size={16} style={{ marginRight: '6px' }} />
                    Cancelar
                  </button>
                </div>
              </form>
      </Modal>

      {/* Modal para Adicionar Sala */}
      <Modal
        isOpen={showSalaModal}
        onClose={() => {
          setShowSalaModal(false);
          setSelectedAlocacaoId(null);
          setEditingSala(null);
          setSalaForm({
            nome: '',
            capacidade_total: 0,
            localizacao: '',
            status: 'ATIVA',
            cadeiras_moveis: false,
            cadeiras_especiais: 0,
          });
        }}
        title={editingSala ? "Editar Sala" : "Adicionar Nova Sala"}
        size="lg"
      >
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            if (editingSala) {
              handleUpdateSala();
            } else {
              handleCreateSala();
            }
          }} 
          className="form"
        >
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
              <label className="checkbox-container">
                    <input
                  type="checkbox"
                  checked={salaForm.cadeiras_moveis}
                  onChange={(e) => setSalaForm(prev => ({ ...prev, cadeiras_moveis: e.target.checked }))}
                      disabled={loading}
                    />
                <span className="label">Cadeiras Móveis</span>
              </label>
              <small className="form-text">Cadeiras podem ser emprestadas para outras salas</small>
                  </div>
                </div>
                
                {/* Botões */}
                <div className="flex gap-4 pt-6 border-t border-gray-200">
                  <button 
              type="submit"
                    className="btn btn-primary flex-1" 
                    disabled={loading}
                  >
                    <FloppyDisk size={16} style={{ marginRight: '6px' }} />
              {loading ? (editingSala ? 'Atualizando...' : 'Criando...') : (editingSala ? 'Atualizar Sala' : 'Criar Sala')}
                  </button>
                  <button 
                    type="button"
                    onClick={() => {
                      setShowSalaModal(false);
                      setSelectedAlocacaoId(null);
                setEditingSala(null);
                      setSalaForm({
                        nome: '',
                        capacidade_total: 0,
                        localizacao: '',
                        status: 'ATIVA',
                  cadeiras_moveis: false,
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
      </Modal>

      {/* Modal de Confirmação */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        type={confirmModal.type}
        confirmText={confirmModal.confirmText}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal({ ...confirmModal, isOpen: false })}
      />

      {/* Modal de resultados da alocação inteligente */}
      <ResultadosAlocacaoInteligenteAmigavel
        alocacaoId={resultadosModal.alocacaoId}
        nomeAlocacao={resultadosModal.nomeAlocacao}
        isOpen={resultadosModal.isOpen}
        onClose={() => setResultadosModal({ isOpen: false, alocacaoId: '', nomeAlocacao: '' })}
      />

      {/* Modal de processamento */}
      <ProcessingModal
        isOpen={processingModal.isOpen}
        title={processingModal.title}
        message={processingModal.message}
      />

      {/* Modal para Clonar Horário */}
      <Modal
        isOpen={showCloneHorarioModal}
        onClose={() => {
          setShowCloneHorarioModal(false);
          setCloneHorarioData(null);
          setHorarioForm({ dia_semana: 'SEGUNDA', periodo: 'MATUTINO' });
        }}
        title="Clonar Horário"
        size="md"
      >
        {cloneHorarioData && (
          <div className="space-y-4" >
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg" style={{ padding: '6px' }}>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Copy size={18} />
                Horário a ser clonado:
              </h4>
              <div className="flex items-center gap-3" style={{ margin: '6px' }}>
                <span className="badge badge-primary">
                  {diasLabels[cloneHorarioData.horario.dia_semana]}
                </span>
                <span className="badge badge-secondary">
                  {periodosLabels[cloneHorarioData.horario.periodo]}
                </span>
                <span className="badge badge-info">
                  {cloneHorarioData.horario.turmas.length} {cloneHorarioData.horario.turmas.length === 1 ? 'turma' : 'turmas'}
                </span>
            </div>
              <div className="mt-3" style={{ margin: '6px' }}>
                <p className="text-sm text-gray-600">
                  <strong>Turmas que serão clonadas:</strong>
                </p>
                <div className="mt-1 space-y-1">
                  {cloneHorarioData.horario.turmas.map((turma) => (
                    <div key={turma.id} className="text-sm text-gray-700">
                      • {turma.nome} ({turma.alunos} alunos{turma.esp_necessarias > 0 ? `, ${turma.esp_necessarias} especiais` : ''})
          </div>
                  ))}
        </div>
              </div>
            </div>
            
            {(() => {
              const { availableDias, getAvailablePeríodos } = getAvailableOptions(cloneHorarioData.alocacao);
              const availablePeríodos = getAvailablePeríodos(horarioForm.dia_semana);
              
              return (
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleExecuteClone();
                  }} 
                  className="form"
                >
                  {availableDias.length === 0 ? (
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-800">
                        <strong>Não há horários disponíveis para clonar.</strong>
                      </p>
                      <p className="text-xs text-yellow-600 mt-1">
                        Todos os possíveis horários já foram criados nesta alocação.
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="form-row">
                        <div className="form-group">
                          <label className="label">Novo Dia da Semana *</label>
                          <select
                            value={horarioForm.dia_semana}
                            onChange={(e) => {
                              const newDia = e.target.value as DiaSemana;
                              const newAvailablePeríodos = getAvailablePeríodos(newDia);
                              setHorarioForm(prev => ({ 
                                ...prev, 
                                dia_semana: newDia,
                                periodo: newAvailablePeríodos.includes(prev.periodo) ? prev.periodo : newAvailablePeríodos[0] || 'MATUTINO'
                              }));
                            }}
                            className="input"
                            required
                            disabled={loading}
                          >
                            {availableDias.map(dia => (
                              <option key={dia} value={dia}>{diasLabels[dia]}</option>
                            ))}
                          </select>
                        </div>
                        <div className="form-group">
                          <label className="label">Novo Período *</label>
                          <select
                            value={horarioForm.periodo}
                            onChange={(e) => setHorarioForm(prev => ({ ...prev, periodo: e.target.value as Periodo }))}
                            className="input"
                            required
                            disabled={loading}
                          >
                            {availablePeríodos.map(periodo => (
                              <option key={periodo} value={periodo}>{periodosLabels[periodo]}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      
                      <div className="flex gap-4 pt-6 border-t border-gray-200">
                        <button 
                          type="submit"
                          className="btn btn-primary flex-1" 
                          disabled={loading}
                        >
                          <Copy size={16} style={{ marginRight: '6px' }} />
                          {loading ? 'Clonando...' : 'Clonar Horário'}
                        </button>
                        <button 
                          type="button"
                          onClick={() => {
                            setShowCloneHorarioModal(false);
                            setCloneHorarioData(null);
                            setHorarioForm({ dia_semana: 'SEGUNDA', periodo: 'MATUTINO' });
                          }}
                          className="btn btn-secondary"
                          disabled={loading}
                        >
                          <X size={16} style={{ marginRight: '6px' }} />
                          Cancelar
                        </button>
                      </div>
                    </>
                  )}
                </form>
              );
            })()}
          </div>
        )}
      </Modal>
    </div>
  );
}
