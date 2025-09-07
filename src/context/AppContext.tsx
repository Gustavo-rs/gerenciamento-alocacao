import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import type { ProjetoAlocacao, ResultadoAlocacao } from '../types';

interface AppState {
  projetos: ProjetoAlocacao[];
  resultados_alocacao: ResultadoAlocacao[];
}

type Action =
  | { type: 'ADD_PROJETO'; payload: ProjetoAlocacao }
  | { type: 'UPDATE_PROJETO'; payload: ProjetoAlocacao }
  | { type: 'DELETE_PROJETO'; payload: string }
  | { type: 'ADD_RESULTADO_ALOCACAO'; payload: ResultadoAlocacao }
  | { type: 'DELETE_RESULTADO_ALOCACAO'; payload: string };

const initialState: AppState = {
  projetos: [
    {
      id_projeto: "alocacao_matutino",
      nome: "Alocação Matutino - Bloco A",
      descricao: "Alocação das turmas do período matutino no Bloco A",
      status: "configuracao",
      data_criacao: new Date().toISOString(),
      salas: [
        { 
          id_sala: "sala_1", 
          nome: "Sala 1", 
          capacidade_total: 35, 
          localizacao: "Bloco A - 2º", 
          status: "ativa", 
          cadeiras_moveis: 35, 
          cadeiras_especiais: 2 
        },
        { 
          id_sala: "sala_3", 
          nome: "Sala 3", 
          capacidade_total: 28, 
          localizacao: "Bloco A - 1º", 
          status: "ativa", 
          cadeiras_moveis: 28, 
          cadeiras_especiais: 1 
        }
      ],
      turmas: [
        { 
          id_turma: "port_101", 
          nome: "Português 101", 
          alunos: 32, 
          duracao_min: 120, 
          esp_necessarias: 1 
        },
        { 
          id_turma: "mat_101", 
          nome: "Matemática 101", 
          alunos: 28, 
          duracao_min: 120, 
          esp_necessarias: 0 
        }
      ]
    },
    {
      id_projeto: "alocacao_vespertino",
      nome: "Alocação Vespertino - Bloco B",
      descricao: "Alocação das turmas do período vespertino no Bloco B",
      status: "pronto",
      data_criacao: new Date().toISOString(),
      salas: [
        { 
          id_sala: "sala_2", 
          nome: "Sala 2", 
          capacidade_total: 40, 
          localizacao: "Bloco B - 1º", 
          status: "ativa", 
          cadeiras_moveis: 0, 
          cadeiras_especiais: 0 
        },
        { 
          id_sala: "sala_4", 
          nome: "Sala 4", 
          capacidade_total: 50, 
          localizacao: "Bloco C - 3º", 
          status: "ativa", 
          cadeiras_moveis: 50, 
          cadeiras_especiais: 3 
        }
      ],
      turmas: [
        { 
          id_turma: "cien_201", 
          nome: "Ciências 201", 
          alunos: 38, 
          duracao_min: 120, 
          esp_necessarias: 0 
        },
        { 
          id_turma: "hist_201", 
          nome: "História 201", 
          alunos: 45, 
          duracao_min: 120, 
          esp_necessarias: 2 
        }
      ]
    }
  ],
  resultados_alocacao: []
};

function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'ADD_PROJETO':
      return {
        ...state,
        projetos: [...state.projetos, action.payload]
      };
    case 'UPDATE_PROJETO':
      return {
        ...state,
        projetos: state.projetos.map(projeto => 
          projeto.id_projeto === action.payload.id_projeto ? action.payload : projeto
        )
      };
    case 'DELETE_PROJETO':
      return {
        ...state,
        projetos: state.projetos.filter(projeto => projeto.id_projeto !== action.payload),
        resultados_alocacao: state.resultados_alocacao.filter(resultado => resultado.projeto_id !== action.payload)
      };
    case 'ADD_RESULTADO_ALOCACAO':
      return {
        ...state,
        resultados_alocacao: [...state.resultados_alocacao, action.payload]
      };
    case 'DELETE_RESULTADO_ALOCACAO':
      return {
        ...state,
        resultados_alocacao: state.resultados_alocacao.filter(resultado => resultado.id !== action.payload)
      };
    default:
      return state;
  }
}

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<Action>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
