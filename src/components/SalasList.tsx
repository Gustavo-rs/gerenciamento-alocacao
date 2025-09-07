import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import type { Sala } from '../types';
import { CheckCircle, XCircle, Wrench, PencilSimple, Trash, Buildings } from 'phosphor-react';

interface SalasListProps {
  onEdit?: (sala: Sala) => void;
}

export default function SalasList({ onEdit }: SalasListProps) {
  const { state, dispatch } = useApp();
  const [filter, setFilter] = useState('all');

  const filteredSalas = state.salas.filter(sala => {
    if (filter === 'all') return true;
    return sala.status === filter;
  });

  const handleDelete = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta sala?')) {
      dispatch({ type: 'DELETE_SALA', payload: id });
    }
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

  return (
    <div className="card">
      <div className="card-header">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="card-title">Lista de Salas</h2>
            <p className="card-description">
              Gerencie todas as salas disponíveis
            </p>
          </div>
          <div className="flex gap-4 items-center">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="select"
            >
              <option value="all">Todas as salas</option>
              <option value="ativa">Apenas ativas</option>
              <option value="inativa">Apenas inativas</option>
              <option value="manutencao">Em manutenção</option>
            </select>
            <span className="badge badge-info">
              {filteredSalas.length} sala{filteredSalas.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>

      <div className="card-content">
        {filteredSalas.length === 0 ? (
          <div className="text-center" style={{ padding: 'var(--spacing-8)' }}>
            <Buildings size={48} color="var(--text-secondary)" style={{ marginBottom: 'var(--spacing-4)' }} />
            <h3 className="text-lg font-semibold mb-4">Nenhuma sala encontrada</h3>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {filter === 'all' 
                ? 'Adicione a primeira sala para começar'
                : 'Nenhuma sala corresponde ao filtro selecionado'
              }
            </p>
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Localização</th>
                  <th>Capacidade</th>
                  <th>Cadeiras Esp.</th>
                  <th>Móveis</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredSalas.map((sala) => (
                  <tr key={sala.id_sala}>
                    <td className="font-medium">{sala.nome}</td>
                    <td>{sala.localizacao}</td>
                    <td>
                      <span className="badge badge-info">
                        {sala.capacidade_total} lugares
                      </span>
                    </td>
                    <td>
                      {sala.cadeiras_especiais > 0 ? (
                        <span className="badge badge-warning">
                          {sala.cadeiras_especiais}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-secondary)' }}>—</span>
                      )}
                    </td>
                    <td>
                      {sala.cadeiras_moveis ? (
                        <span style={{ color: 'var(--success-color)', display: 'flex', alignItems: 'center' }}>
                          <CheckCircle size={16} style={{ marginRight: '4px' }} />
                          Sim
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center' }}>
                          <XCircle size={16} style={{ marginRight: '4px' }} />
                          Não
                        </span>
                      )}
                    </td>
                    <td>{getStatusBadge(sala.status)}</td>
                    <td>
                      <div className="flex gap-2">
                        {onEdit && (
                          <button
                            onClick={() => onEdit(sala)}
                            className="btn btn-xs btn-secondary"
                            title="Editar sala"
                          >
                            <PencilSimple size={16} />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(sala.id_sala)}
                          className="btn btn-xs btn-danger"
                          title="Excluir sala"
                        >
                          <Trash size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
