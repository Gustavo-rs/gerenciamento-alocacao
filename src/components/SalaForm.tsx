import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import type { FormSala, Sala } from '../types';
import { FloppyDisk, Plus, X } from 'phosphor-react';

interface SalaFormProps {
  sala?: Sala;
  onClose?: () => void;
}

export default function SalaForm({ sala, onClose }: SalaFormProps) {
  const { dispatch } = useApp();
  
  const [formData, setFormData] = useState<FormSala>({
    nome: sala?.nome || '',
    capacidade_total: sala?.capacidade_total || 0,
    localizacao: sala?.localizacao || '',
    status: sala?.status || 'ativa',
    cadeiras_moveis: sala?.cadeiras_moveis || false,
    cadeiras_especiais: sala?.cadeiras_especiais || 0,
  });

  const [errors, setErrors] = useState<Partial<FormSala>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<FormSala> = {};

    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome é obrigatório';
    }

    if (formData.capacidade_total <= 0) {
      newErrors.capacidade_total = 'Capacidade deve ser maior que zero';
    }

    if (!formData.localizacao.trim()) {
      newErrors.localizacao = 'Localização é obrigatória';
    }

    if (formData.cadeiras_especiais < 0) {
      newErrors.cadeiras_especiais = 'Cadeiras especiais não pode ser negativo';
    }

    if (formData.cadeiras_especiais > formData.capacidade_total) {
      newErrors.cadeiras_especiais = 'Cadeiras especiais não pode ser maior que a capacidade total';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const novaSala: Sala = {
      id_sala: sala?.id_sala || `sala_${Date.now()}`,
      ...formData,
    };

    if (sala) {
      dispatch({ type: 'UPDATE_SALA', payload: novaSala });
    } else {
      dispatch({ type: 'ADD_SALA', payload: novaSala });
    }

    // Reset form
    setFormData({
      nome: '',
      capacidade_total: 0,
      localizacao: '',
      status: 'ativa',
      cadeiras_moveis: false,
      cadeiras_especiais: 0,
    });

    if (onClose) {
      onClose();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' 
        ? (e.target as HTMLInputElement).checked
        : type === 'number' 
        ? Number(value)
        : value
    }));

    // Clear error when user starts typing
    if (errors[name as keyof FormSala]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="form">
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="nome" className="label">
            Nome da Sala *
          </label>
          <input
            type="text"
            id="nome"
            name="nome"
            value={formData.nome}
            onChange={handleChange}
            className="input"
            placeholder="Ex: Sala 1"
          />
          {errors.nome && (
            <span className="text-sm" style={{ color: 'var(--danger-color)' }}>
              {errors.nome}
            </span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="capacidade_total" className="label">
            Capacidade Total *
          </label>
          <input
            type="number"
            id="capacidade_total"
            name="capacidade_total"
            value={formData.capacidade_total}
            onChange={handleChange}
            className="input"
            min="1"
            placeholder="Ex: 35"
          />
          {errors.capacidade_total && (
            <span className="text-sm" style={{ color: 'var(--danger-color)' }}>
              {errors.capacidade_total}
            </span>
          )}
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="localizacao" className="label">
            Localização *
          </label>
          <input
            type="text"
            id="localizacao"
            name="localizacao"
            value={formData.localizacao}
            onChange={handleChange}
            className="input"
            placeholder="Ex: Bloco A - 2º andar"
          />
          {errors.localizacao && (
            <span className="text-sm" style={{ color: 'var(--danger-color)' }}>
              {errors.localizacao}
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
            <option value="ativa">Ativa</option>
            <option value="inativa">Inativa</option>
            <option value="manutencao">Em Manutenção</option>
          </select>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="cadeiras_especiais" className="label">
            Cadeiras Especiais
          </label>
          <input
            type="number"
            id="cadeiras_especiais"
            name="cadeiras_especiais"
            value={formData.cadeiras_especiais}
            onChange={handleChange}
            className="input"
            min="0"
            placeholder="Ex: 2"
          />
          {errors.cadeiras_especiais && (
            <span className="text-sm" style={{ color: 'var(--danger-color)' }}>
              {errors.cadeiras_especiais}
            </span>
          )}
        </div>

        <div className="form-group">
          <div className="checkbox-group" style={{ marginTop: '24px' }}>
            <input
              type="checkbox"
              id="cadeiras_moveis"
              name="cadeiras_moveis"
              checked={formData.cadeiras_moveis}
              onChange={handleChange}
              className="checkbox"
            />
            <label htmlFor="cadeiras_moveis" className="label">
              Cadeiras Móveis
            </label>
          </div>
        </div>
      </div>

      <div className="flex gap-4 mt-6">
        <button type="submit" className="btn btn-primary">
          {sala ? (
            <>
              <FloppyDisk size={16} style={{ marginRight: '6px' }} />
              Atualizar Sala
            </>
          ) : (
            <>
              <Plus size={16} style={{ marginRight: '6px' }} />
              Cadastrar Sala
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
  );
}
