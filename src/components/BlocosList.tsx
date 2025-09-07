import { useState } from 'react';
import { useApp } from '../context/AppContext';
import type { BlocoAlocacao } from '../types';
import { CheckCircle, XCircle, PencilSimple, Trash, Buildings } from 'phosphor-react';

interface BlocosListProps {
  onEdit?: (bloco: BlocoAlocacao) => void;
}

export default function BlocosList({ onEdit }: BlocosListProps) {
  const { state, dispatch } = useApp();
  const [filter, setFilter] = useState('all');

  const filteredBlocos = state.blocos.filter(bloco => {
    if (filter === 'all') return true;
    return bloco.status === filter;
  });

  const handleDelete = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este bloco? Isso também removerá todas as alocações relacionadas.')) {
      dispatch({ type: 'DELETE_BLOCO', payload: id });
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      ativo: 'badge-success',
      inativo: 'badge-danger'
    };
    
    const icons = {
      ativo: <CheckCircle size={16} />,
      inativo: <XCircle size={16} />
    };
    
    const labels = {
      ativo: 'Ativo',
      inativo: 'Inativo'
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

  const getSalasInfo = (salaIds: string[]) => {
    const salas = state.salas.filter(sala => salaIds.includes(sala.id_sala));
    return salas;
  };

  return (
    <div className="card">
      <div className="card-header">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="card-title">Lista de Blocos de Alocação</h2>
            <p className="card-description">
              Gerencie os blocos para organizar suas alocações
            </p>
          </div>
          <div className="flex gap-4 items-center">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="select"
            >
              <option value="all">Todos os blocos</option>
              <option value="ativo">Apenas ativos</option>
              <option value="inativo">Apenas inativos</option>
            </select>
            <span className="badge badge-info">
              {filteredBlocos.length} bloco{filteredBlocos.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>

      <div className="card-content">
        {filteredBlocos.length === 0 ? (
          <div className="text-center" style={{ padding: 'var(--spacing-8)' }}>
            <Buildings size={48} color="var(--text-secondary)" style={{ marginBottom: 'var(--spacing-4)' }} />
            <h3 className="text-lg font-semibold mb-4">Nenhum bloco encontrado</h3>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {filter === 'all' 
                ? 'Crie o primeiro bloco para organizar suas alocações'
                : 'Nenhum bloco corresponde ao filtro selecionado'
              }
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredBlocos.map((bloco) => {
              const salas = getSalasInfo(bloco.salas_disponiveis);
              const capacidadeTotal = salas.reduce((acc, sala) => acc + sala.capacidade_total, 0);
              const cadeirasEspeciais = salas.reduce((acc, sala) => acc + sala.cadeiras_especiais, 0);

              return (
                <div key={bloco.id_bloco} className="card" style={{ border: '1px solid var(--border-color)' }}>
                  <div className="card-content">
                    <div className="flex justify-between items-start">
                      <div style={{ flex: 1 }}>
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold">{bloco.nome}</h3>
                          {getStatusBadge(bloco.status)}
                        </div>
                        
                        <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
                          {bloco.descricao}
                        </p>

                        <div className="grid grid-cols-3 gap-4 mb-4">
                          <div className="flex flex-col">
                            <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                              Salas
                            </span>
                            <span className="text-lg font-semibold">
                              {salas.length}
                            </span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                              Capacidade Total
                            </span>
                            <span className="text-lg font-semibold">
                              {capacidadeTotal}
                            </span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                              Cadeiras Especiais
                            </span>
                            <span className="text-lg font-semibold">
                              {cadeirasEspeciais}
                            </span>
                          </div>
                        </div>

                        <div>
                          <h4 className="text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                            Salas Incluídas:
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {salas.map((sala) => (
                              <span key={sala.id_sala} className="badge badge-info">
                                {sala.nome} ({sala.capacidade_total})
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2 ml-4">
                        {onEdit && (
                          <button
                            onClick={() => onEdit(bloco)}
                            className="btn btn-xs btn-secondary"
                            title="Editar bloco"
                          >
                            <PencilSimple size={16} />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(bloco.id_bloco)}
                          className="btn btn-xs btn-danger"
                          title="Excluir bloco"
                        >
                          <Trash size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
