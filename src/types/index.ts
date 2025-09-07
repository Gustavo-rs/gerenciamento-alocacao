export interface Sala {
  id_sala: string;
  nome: string;
  capacidade_total: number;
  localizacao: string;
  status: 'ativa' | 'inativa' | 'manutencao';
  cadeiras_moveis: number;
  cadeiras_especiais: number;
}

export interface Turma {
  id_turma: string;
  nome: string;
  alunos: number;
  duracao_min: number;
  esp_necessarias: number;
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
  status: 'ativa' | 'inativa' | 'manutencao';
  cadeiras_moveis: number;
  cadeiras_especiais: number;
}

export interface FormTurma {
  nome: string;
  alunos: number;
  duracao_min: number;
  esp_necessarias: number;
}

export interface ProjetoAlocacao {
  id_projeto: string;
  nome: string;
  descricao: string;
  status: 'configuracao' | 'pronto' | 'processando' | 'alocado' | 'concluido';
  data_criacao: string;
  ultima_alocacao?: string;
  salas: Sala[];
  turmas: Turma[];
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
  alocacoes: AlocacaoItem[];
  score_otimizacao: number;
  data_geracao: string;
  parametros_usados: {
    priorizar_capacidade: boolean;
    priorizar_especiais: boolean;
    priorizar_proximidade: boolean;
  };
}
