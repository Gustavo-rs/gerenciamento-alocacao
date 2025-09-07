import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import type { ProjetoAlocacao, ResultadoAlocacao } from '../types';
import { apiService } from '../services/api';

interface AppState {
  projetos: ProjetoAlocacao[];
  resultados_alocacao: ResultadoAlocacao[];
  loading: boolean;
  error: string | null;
}

type Action =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_PROJETOS'; payload: ProjetoAlocacao[] }
  | { type: 'ADD_PROJETO'; payload: ProjetoAlocacao }
  | { type: 'UPDATE_PROJETO'; payload: ProjetoAlocacao }
  | { type: 'DELETE_PROJETO'; payload: string }
  | { type: 'SET_RESULTADOS'; payload: ResultadoAlocacao[] }
  | { type: 'ADD_RESULTADO_ALOCACAO'; payload: ResultadoAlocacao }
  | { type: 'DELETE_RESULTADO_ALOCACAO'; payload: string };

const initialState: AppState = {
  projetos: [],
  resultados_alocacao: [],
  loading: false,
  error: null,
};

function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'SET_PROJETOS':
      return { ...state, projetos: action.payload, loading: false, error: null };
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
    case 'SET_RESULTADOS':
      return { ...state, resultados_alocacao: action.payload, loading: false, error: null };
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
  // Ações de API - Projetos
  loadProjetos: () => Promise<void>;
  loadProjeto: (id: string) => Promise<ProjetoAlocacao | null>;
  createProjeto: (projeto: Omit<ProjetoAlocacao, 'id' | 'created_at' | 'updated_at'>) => Promise<boolean>;
  updateProjeto: (id: string, projeto: Partial<ProjetoAlocacao>) => Promise<boolean>;
  deleteProjeto: (id: string) => Promise<boolean>;
  executarAlocacao: (projetoId: string) => Promise<boolean>;
  loadResultados: () => Promise<void>;
  // Ações de API - Salas e Turmas
  addSalaToProjeto: (projetoId: string, sala: any) => Promise<ProjetoAlocacao | null>;
  removeSalaFromProjeto: (projetoId: string, salaId: string) => Promise<ProjetoAlocacao | null>;
  addTurmaToProjeto: (projetoId: string, turma: any) => Promise<ProjetoAlocacao | null>;
  removeTurmaFromProjeto: (projetoId: string, turmaId: string) => Promise<ProjetoAlocacao | null>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Carregar projetos da API
  const loadProjetos = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await apiService.getProjetos();
      if (response.success && response.data) {
        // Transformar dados da API para o formato do frontend
        const projetos = response.data.map((projeto: any) => ({
          ...projeto,
          status: projeto.status,
          salas: projeto.salas?.map((ps: any) => ps.sala) || [],
          turmas: projeto.turmas?.map((pt: any) => pt.turma) || [],
        }));
        dispatch({ type: 'SET_PROJETOS', payload: projetos });
      } else {
        dispatch({ type: 'SET_ERROR', payload: response.error || 'Erro ao carregar projetos' });
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Erro ao conectar com o servidor' });
    }
  };

  // Carregar projeto específico da API
  const loadProjeto = async (id: string): Promise<ProjetoAlocacao | null> => {
    try {
      const response = await apiService.getProjeto(id);
      if (response.success && response.data) {
        const projeto = {
          ...response.data,
          salas: response.data.salas?.map((ps: any) => ps.sala) || [],
          turmas: response.data.turmas?.map((pt: any) => pt.turma) || [],
        };
        
        // Atualizar no estado global também
        dispatch({ type: 'UPDATE_PROJETO', payload: projeto });
        return projeto;
      }
      return null;
    } catch (error) {
      console.error('Erro ao carregar projeto:', error);
      return null;
    }
  };

  // Criar projeto
  const createProjeto = async (projeto: Omit<ProjetoAlocacao, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const response = await apiService.createProjeto(projeto);
      if (response.success && response.data) {
        const novoProjeto = {
          ...response.data,
          salas: [],
          turmas: [],
        };
        dispatch({ type: 'ADD_PROJETO', payload: novoProjeto });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Erro ao criar projeto:', error);
      return false;
    }
  };

  // Atualizar projeto
  const updateProjeto = async (id: string, projeto: Partial<ProjetoAlocacao>) => {
    try {
      const response = await apiService.updateProjeto(id, projeto);
      if (response.success && response.data) {
        const projetoAtualizado = {
          ...response.data,
          salas: response.data.salas?.map((ps: any) => ps.sala) || [],
          turmas: response.data.turmas?.map((pt: any) => pt.turma) || [],
        };
        dispatch({ type: 'UPDATE_PROJETO', payload: projetoAtualizado });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Erro ao atualizar projeto:', error);
      return false;
    }
  };

  // Deletar projeto
  const deleteProjeto = async (id: string) => {
    try {
      const response = await apiService.deleteProjeto(id);
      if (response.success) {
        dispatch({ type: 'DELETE_PROJETO', payload: id });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Erro ao deletar projeto:', error);
      return false;
    }
  };

  // Executar alocação
  const executarAlocacao = async (projetoId: string) => {
    try {
      const response = await apiService.executarAlocacao(projetoId);
      if (response.success && response.data) {
        dispatch({ type: 'ADD_RESULTADO_ALOCACAO', payload: response.data });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Erro ao executar alocação:', error);
      return false;
    }
  };

  // Carregar resultados
  const loadResultados = async () => {
    try {
      const response = await apiService.getResultados();
      if (response.success && response.data) {
        dispatch({ type: 'SET_RESULTADOS', payload: response.data });
      }
    } catch (error) {
      console.error('Erro ao carregar resultados:', error);
    }
  };

  // Adicionar sala ao projeto
  const addSalaToProjeto = async (projetoId: string, sala: any): Promise<ProjetoAlocacao | null> => {
    try {
      // Primeiro criar a sala na API
      const createResponse = await apiService.createSala(sala);
      if (!createResponse.success || !createResponse.data) {
        return null;
      }

      // Depois associar ao projeto
      const addResponse = await apiService.addSalaToProjeto(projetoId, createResponse.data.id);
      if (addResponse.success) {
        // Recarregar projeto específico para obter dados atualizados
        return await loadProjeto(projetoId);
      }
      return null;
    } catch (error) {
      console.error('Erro ao adicionar sala:', error);
      return null;
    }
  };

  // Remover sala do projeto
  const removeSalaFromProjeto = async (projetoId: string, salaId: string): Promise<ProjetoAlocacao | null> => {
    try {
      const response = await apiService.removeSalaFromProjeto(projetoId, salaId);
      if (response.success) {
        return await loadProjeto(projetoId);
      }
      return null;
    } catch (error) {
      console.error('Erro ao remover sala:', error);
      return null;
    }
  };

  // Adicionar turma ao projeto
  const addTurmaToProjeto = async (projetoId: string, turma: any): Promise<ProjetoAlocacao | null> => {
    try {
      // Primeiro criar a turma na API
      const createResponse = await apiService.createTurma(turma);
      if (!createResponse.success || !createResponse.data) {
        return null;
      }

      // Depois associar ao projeto
      const addResponse = await apiService.addTurmaToProjeto(projetoId, createResponse.data.id);
      if (addResponse.success) {
        // Recarregar projeto específico para obter dados atualizados
        return await loadProjeto(projetoId);
      }
      return null;
    } catch (error) {
      console.error('Erro ao adicionar turma:', error);
      return null;
    }
  };

  // Remover turma do projeto
  const removeTurmaFromProjeto = async (projetoId: string, turmaId: string): Promise<ProjetoAlocacao | null> => {
    try {
      const response = await apiService.removeTurmaFromProjeto(projetoId, turmaId);
      if (response.success) {
        return await loadProjeto(projetoId);
      }
      return null;
    } catch (error) {
      console.error('Erro ao remover turma:', error);
      return null;
    }
  };

  // Carregar dados iniciais
  useEffect(() => {
    loadProjetos();
    loadResultados();
  }, []);

  return (
    <AppContext.Provider value={{ 
      state, 
      dispatch,
      loadProjetos,
      loadProjeto,
      createProjeto,
      updateProjeto,
      deleteProjeto,
      executarAlocacao,
      loadResultados,
      addSalaToProjeto,
      removeSalaFromProjeto,
      addTurmaToProjeto,
      removeTurmaFromProjeto
    }}>
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
