import { useState } from 'react';
import { useApp } from '../context/AppContext';
import type { FormBlocoAlocacao, BlocoAlocacao } from '../types';
import { FloppyDisk, Plus, X, CheckCircle } from 'phosphor-react';

interface BlocoFormProps {
  bloco?: BlocoAlocacao;
  onClose?: () => void;
}

export default function BlocoForm({ bloco, onClose }: BlocoFormProps) {
  const { state, dispatch } = useApp();
  
  const [formData, setFormData] = useState<FormBlocoAlocacao>({
    nome: bloco?.nome || '',
    descricao: bloco?.descricao || '',
    salas_disponiveis: bloco?.salas_disponiveis || [],
    status: bloco?.status || 'ativo',
  });

  const [errors, setErrors] = useState<Partial<FormBlocoAlocacao>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<FormBlocoAlocacao> = {};

    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome é obrigatório';
    }

    if (!formData.descricao.trim()) {
      newErrors.descricao = 'Descrição é obrigatória';
    }

    if (formData.salas_disponiveis.length === 0) {
      newErrors.salas_disponiveis = 'Selecione pelo menos uma sala';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const novoBloco: BlocoAlocacao = {
      id_bloco: bloco?.id_bloco || `bloco_${Date.now()}`,
      data_criacao: bloco?.data_criacao || new Date().toISOString(),
      ...formData,
    };

    if (bloco) {
      dispatch({ type: 'UPDATE_BLOCO', payload: novoBloco });
    } else {
      dispatch({ type: 'ADD_BLOCO', payload: novoBloco });
    }

    // Reset form
    setFormData({
      nome: '',
      descricao: '',
      salas_disponiveis: [],
      status: 'ativo',
    });

    if (onClose) {
      onClose();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name as keyof FormBlocoAlocacao]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const handleSalaToggle = (salaId: string) => {
    setFormData(prev => ({
      ...prev,
      salas_disponiveis: prev.salas_disponiveis.includes(salaId)
        ? prev.salas_disponiveis.filter(id => id !== salaId)
        : [...prev.salas_disponiveis, salaId]
    }));

    // Clear error when user selects a sala
    if (errors.salas_disponiveis) {
      setErrors(prev => ({
        ...prev,
        salas_disponiveis: undefined
      }));
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">
          {bloco ? 'Editar Bloco' : 'Novo Bloco de Alocação'}
        </h2>
        <p className="card-description">
          {bloco 
            ? 'Atualize as informações do bloco'
            : 'Crie um novo bloco para organizar suas alocações'
          }
        </p>
      </div>
      
      <div className="card-content">
        <form onSubmit={handleSubmit} className="form">
          <div className="form-group">
            <label htmlFor="nome" className="label">
              Nome do Bloco *
            </label>
            <input
              type="text"
              id="nome"
              name="nome"
              value={formData.nome}
              onChange={handleChange}
              className="input"
              placeholder="Ex: Bloco A"
            />
            {errors.nome && (
              <span className="text-sm" style={{ color: 'var(--danger-color)' }}>
                {errors.nome}
              </span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="descricao" className="label">
              Descrição *
            </label>
            <textarea
              id="descricao"
              name="descricao"
              value={formData.descricao}
              onChange={handleChange}
              className="textarea"
              rows={3}
              placeholder="Ex: Salas do Bloco A - 1º e 2º andares"
            />
            {errors.descricao && (
              <span className="text-sm" style={{ color: 'var(--danger-color)' }}>
                {errors.descricao}
              </span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="status" className="label">
              Status
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="select"
            >
              <option value="ativo">Ativo</option>
              <option value="inativo">Inativo</option>
            </select>
          </div>

          <div className="form-group">
            <label className="label">
              Salas Disponíveis *
            </label>
            <div className="grid grid-cols-2 gap-3 mt-2">
              {state.salas.filter(sala => sala.status === 'ativa').map((sala) => (
                <label key={sala.id_sala} className="checkbox-group" style={{ 
                  padding: 'var(--spacing-3)', 
                  border: `1px solid ${formData.salas_disponiveis.includes(sala.id_sala) ? 'var(--primary-color)' : 'var(--border-color)'}`,
                  borderRadius: 'var(--radius)',
                  background: formData.salas_disponiveis.includes(sala.id_sala) ? 'rgba(59, 130, 246, 0.05)' : 'transparent',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}>
                  <input
                    type="checkbox"
                    checked={formData.salas_disponiveis.includes(sala.id_sala)}
                    onChange={() => handleSalaToggle(sala.id_sala)}
                    className="checkbox"
                  />
                  <div style={{ flex: 1 }}>
                    <div className="font-medium">{sala.nome}</div>
                    <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                      {sala.localizacao} • {sala.capacidade_total} lugares
                      {sala.cadeiras_especiais > 0 && ` • ${sala.cadeiras_especiais} especiais`}
                    </div>
                  </div>
                  {formData.salas_disponiveis.includes(sala.id_sala) && (
                    <CheckCircle size={20} color="var(--primary-color)" />
                  )}
                </label>
              ))}
            </div>
            {errors.salas_disponiveis && (
              <span className="text-sm" style={{ color: 'var(--danger-color)', marginTop: 'var(--spacing-2)', display: 'block' }}>
                {errors.salas_disponiveis}
              </span>
            )}
            <small className="text-sm" style={{ color: 'var(--text-secondary)', marginTop: 'var(--spacing-2)', display: 'block' }}>
              Selecione as salas que farão parte deste bloco de alocação
            </small>
          </div>

          <div className="flex gap-4 mt-6">
            <button type="submit" className="btn btn-primary">
              {bloco ? (
                <>
                  <FloppyDisk size={16} style={{ marginRight: '6px' }} />
                  Atualizar Bloco
                </>
              ) : (
                <>
                  <Plus size={16} style={{ marginRight: '6px' }} />
                  Criar Bloco
                </>
              )}
            </button>
            {onClose && (
              <button type="button" onClick={onClose} className="btn btn-secondary">
                <X size={16} style={{ marginRight: '6px' }} />
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

