import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import type { Turma } from '../types';
import { Users, PencilSimple, Trash } from 'phosphor-react';

interface TurmasListProps {
  onEdit?: (turma: Turma) => void;
}

export default function TurmasList({ onEdit }: TurmasListProps) {
  const { state, dispatch } = useApp();
  const [sortBy, setSortBy] = useState('nome');

  const sortedTurmas = [...state.turmas].sort((a, b) => {
    switch (sortBy) {
      case 'alunos':
        return b.alunos - a.alunos;
      case 'duracao':
        return b.duracao_min - a.duracao_min;
      case 'especiais':
        return b.esp_necessarias - a.esp_necessarias;
      default:
        return a.nome.localeCompare(b.nome);
    }
  });

  const handleDelete = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta turma?')) {
      dispatch({ type: 'DELETE_TURMA', payload: id });
    }
  };

  const formatDuracao = (minutos: number) => {
    const horas = Math.floor(minutos / 60);
    const mins = minutos % 60;
    
    if (horas === 0) {
      return `${mins}min`;
    } else if (mins === 0) {
      return `${horas}h`;
    } else {
      return `${horas}h ${mins}min`;
    }
  };

  const getAlunosColor = (alunos: number) => {
    if (alunos <= 20) return 'var(--success-color)';
    if (alunos <= 35) return 'var(--warning-color)';
    return 'var(--danger-color)';
  };

  return (
    <div className="card">
      <div className="card-header">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="card-title">Lista de Turmas</h2>
            <p className="card-description">
              Gerencie todas as turmas cadastradas
            </p>
          </div>
          <div className="flex gap-4 items-center">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="select"
            >
              <option value="nome">Ordenar por nome</option>
              <option value="alunos">Ordenar por nº alunos</option>
              <option value="duracao">Ordenar por duração</option>
              <option value="especiais">Ordenar por especiais</option>
            </select>
            <span className="badge badge-info">
              {state.turmas.length} turma{state.turmas.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>

      <div className="card-content">
        {state.turmas.length === 0 ? (
          <div className="text-center" style={{ padding: 'var(--spacing-8)' }}>
            <Users size={48} color="var(--text-secondary)" style={{ marginBottom: 'var(--spacing-4)' }} />
            <h3 className="text-lg font-semibold mb-4">Nenhuma turma encontrada</h3>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Adicione a primeira turma para começar
            </p>
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Nome da Turma</th>
                  <th>Nº Alunos</th>
                  <th>Duração</th>
                  <th>Especiais Necessárias</th>
                  <th>Compatibilidade</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {sortedTurmas.map((turma) => {
                  const salasCompativeis = state.salas.filter(sala => 
                    sala.status === 'ativa' &&
                    sala.capacidade_total >= turma.alunos &&
                    sala.cadeiras_especiais >= turma.esp_necessarias
                  );

                  return (
                    <tr key={turma.id_turma}>
                      <td className="font-medium">{turma.nome}</td>
                      <td>
                        <span 
                          className="badge badge-info"
                          style={{ color: getAlunosColor(turma.alunos) }}
                        >
                          {turma.alunos} alunos
                        </span>
                      </td>
                      <td>
                        <span className="badge badge-info">
                          {formatDuracao(turma.duracao_min)}
                        </span>
                      </td>
                      <td>
                        {turma.esp_necessarias > 0 ? (
                          <span className="badge badge-warning">
                            {turma.esp_necessarias}
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-secondary)' }}>—</span>
                        )}
                      </td>
                      <td>
                        <span 
                          className={`badge ${
                            salasCompativeis.length > 0 ? 'badge-success' : 'badge-danger'
                          }`}
                        >
                          {salasCompativeis.length > 0 
                            ? `${salasCompativeis.length} sala${salasCompativeis.length !== 1 ? 's' : ''}`
                            : 'Nenhuma sala'
                          }
                        </span>
                      </td>
                      <td>
                        <div className="flex gap-2">
                          {onEdit && (
                            <button
                              onClick={() => onEdit(turma)}
                              className="btn btn-xs btn-secondary"
                              title="Editar turma"
                            >
                              <PencilSimple size={16} />
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(turma.id_turma)}
                            className="btn btn-xs btn-danger"
                            title="Excluir turma"
                          >
                            <Trash size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
