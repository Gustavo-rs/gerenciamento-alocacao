const API_BASE_URL = 'http://localhost:3001/api';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

class ApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      };
    }
  }

  // Salas
  async getSalas() {
    return this.request('/salas');
  }

  async getSala(id: string) {
    return this.request(`/salas/${id}`);
  }

  async createSala(sala: any) {
    return this.request('/salas', {
      method: 'POST',
      body: JSON.stringify(sala),
    });
  }

  async updateSala(id: string, sala: any) {
    return this.request(`/salas/${id}`, {
      method: 'PUT',
      body: JSON.stringify(sala),
    });
  }

  async deleteSala(id: string) {
    return this.request(`/salas/${id}`, {
      method: 'DELETE',
    });
  }

  // Turmas
  async getTurmas() {
    return this.request('/turmas');
  }

  async getTurma(id: string) {
    return this.request(`/turmas/${id}`);
  }

  async createTurma(turma: any) {
    return this.request('/turmas', {
      method: 'POST',
      body: JSON.stringify(turma),
    });
  }

  async updateTurma(id: string, turma: any) {
    return this.request(`/turmas/${id}`, {
      method: 'PUT',
      body: JSON.stringify(turma),
    });
  }

  async deleteTurma(id: string) {
    return this.request(`/turmas/${id}`, {
      method: 'DELETE',
    });
  }

  // Projetos
  async getProjetos() {
    return this.request('/projetos');
  }

  async getProjeto(id: string) {
    return this.request(`/projetos/${id}`);
  }

  async createProjeto(projeto: any) {
    return this.request('/projetos', {
      method: 'POST',
      body: JSON.stringify(projeto),
    });
  }

  async updateProjeto(id: string, projeto: any) {
    return this.request(`/projetos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(projeto),
    });
  }

  async deleteProjeto(id: string) {
    return this.request(`/projetos/${id}`, {
      method: 'DELETE',
    });
  }

  async addSalaToProjeto(projetoId: string, salaId: string) {
    return this.request(`/projetos/${projetoId}/salas`, {
      method: 'POST',
      body: JSON.stringify({ sala_id: salaId }),
    });
  }

  async removeSalaFromProjeto(projetoId: string, salaId: string) {
    return this.request(`/projetos/${projetoId}/salas/${salaId}`, {
      method: 'DELETE',
    });
  }

  async addTurmaToProjeto(projetoId: string, turmaId: string) {
    return this.request(`/projetos/${projetoId}/turmas`, {
      method: 'POST',
      body: JSON.stringify({ turma_id: turmaId }),
    });
  }

  async removeTurmaFromProjeto(projetoId: string, turmaId: string) {
    return this.request(`/projetos/${projetoId}/turmas/${turmaId}`, {
      method: 'DELETE',
    });
  }

  // Resultados
  async getResultados() {
    return this.request('/resultados');
  }

  async getResultado(id: string) {
    return this.request(`/resultados/${id}`);
  }

  async getResultadosByProjeto(projetoId: string) {
    return this.request(`/resultados/projeto/${projetoId}`);
  }

  async createResultado(resultado: any) {
    return this.request('/resultados', {
      method: 'POST',
      body: JSON.stringify(resultado),
    });
  }

  async executarAlocacao(
    projetoId: string,
    parametros = {
      priorizar_capacidade: true,
      priorizar_especiais: true,
      priorizar_proximidade: true,
    }
  ) {
    return this.request(`/resultados/executar/${projetoId}`, {
      method: 'POST',
      body: JSON.stringify(parametros),
    });
  }

  async deleteResultado(id: string) {
    return this.request(`/resultados/${id}`, {
      method: 'DELETE',
    });
  }

  // Health check
  async healthCheck() {
    try {
      const response = await fetch('http://localhost:3001/health');
      return response.ok;
    } catch {
      return false;
    }
  }
}

export const apiService = new ApiService();
