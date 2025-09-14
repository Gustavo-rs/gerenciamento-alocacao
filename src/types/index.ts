export interface Sala {
  id?: string; // ID do banco
  id_sala: string;
  nome: string;
  capacidade_total: number;
  localizacao: string;
  status: 'ATIVA' | 'INATIVA' | 'MANUTENCAO';
  cadeiras_moveis: number;
  cadeiras_especiais: number;
  created_at?: string;
  updated_at?: string;
}

export interface Turma {
  id?: string; // ID do banco
  id_turma: string;
  nome: string;
  alunos: number;
  duracao_min: number;
  esp_necessarias: number;
  created_at?: string;
  updated_at?: string;
}

export interface Alocacao {
  id: string;
  sala: Sala;
  turma: Turma;
  data_alocacao: string;
  hora_inicio: string;
  hora_fim: string;
  status: 'agendada' | 'em_andamento' | 'concluida' | 'cancelada';
}

export interface FormSala {
  nome: string;
  capacidade_total: number;
  localizacao: string;
  status: 'ATIVA' | 'INATIVA' | 'MANUTENCAO';
  cadeiras_moveis: number;
  cadeiras_especiais: number;
}

export interface FormTurma {
  nome: string;
  alunos: number;
  esp_necessarias: number;
}

// Tipos para as sub-alocações (horários)
export type DiaSemana = 'SEGUNDA' | 'TERCA' | 'QUARTA' | 'QUINTA' | 'SEXTA' | 'SABADO';
export type Periodo = 'MATUTINO' | 'VESPERTINO' | 'NOTURNO';

export interface Horario {
  id: string;
  alocacao_id: string;
  dia_semana: DiaSemana;
  periodo: Periodo;
  turmas: Turma[];
  created_at?: string;
}

export interface FormHorario {
  dia_semana: DiaSemana;
  periodo: Periodo;
}

// Alocação principal atualizada
export interface AlocacaoPrincipal {
  id: string;
  nome: string;
  descricao: string;
  salas: Sala[];
  horarios: Horario[];
  created_at?: string;
}

export interface ProjetoAlocacao {
  id?: string; // ID do banco
  id_projeto: string;
  nome: string;
  descricao: string;
  status: 'CONFIGURACAO' | 'PRONTO' | 'PROCESSANDO' | 'ALOCADO' | 'CONCLUIDO';
  data_criacao: string;
  ultima_alocacao?: string;
  salas: Sala[];
  turmas: Turma[];
  created_at?: string;
  updated_at?: string;
}

export interface FormProjetoAlocacao {
  nome: string;
  descricao: string;
}

export interface AlocacaoItem {
  id: string;
  sala: Sala;
  turma: Turma;
  compatibilidade_score: number;
  observacoes?: string;
}

export interface ResultadoAlocacao {
  id: string;
  projeto_id: string;
  alocacoes?: AlocacaoItem[];
  score_otimizacao: number;
  data_geracao?: string;
  acuracia_modelo?: number;
  analise_detalhada?: {
    problemas_criticos: Array<{
      turma?: string;
      tipo: string;
      detalhes?: string[];
      resumo: string;
    }>;
    avisos: string[];
    total_turmas: number;
    total_salas: number;
    viabilidade: 'alta' | 'media' | 'baixa';
  };
  // Parâmetros podem vir de duas formas (backend vs frontend)
  parametros_usados?: {
    priorizar_capacidade: boolean;
    priorizar_especiais: boolean;
    priorizar_proximidade: boolean;
  };
  // Campos diretos da API
  priorizar_capacidade?: boolean;
  priorizar_especiais?: boolean;
  priorizar_proximidade?: boolean;
  created_at?: string;
}
