import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import type { FormTurma, Turma } from '../types';
import { FloppyDisk, Plus, X } from 'phosphor-react';

interface TurmaFormProps {
  turma?: Turma;
  onClose?: () => void;
}

export default function TurmaForm({ turma, onClose }: TurmaFormProps) {
  const { dispatch } = useApp();
  
  const [formData, setFormData] = useState<FormTurma>({
    nome: turma?.nome || '',
    alunos: turma?.alunos || 0,
    duracao_min: turma?.duracao_min || 60,
    esp_necessarias: turma?.esp_necessarias || 0,
  });

  const [errors, setErrors] = useState<Partial<FormTurma>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<FormTurma> = {};

    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome é obrigatório';
    }

    if (formData.alunos <= 0) {
      newErrors.alunos = 'Número de alunos deve ser maior que zero';
    }

    if (formData.duracao_min <= 0) {
      newErrors.duracao_min = 'Duração deve ser maior que zero';
    }

    if (formData.esp_necessarias < 0) {
      newErrors.esp_necessarias = 'Especiais necessárias não pode ser negativo';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const novaTurma: Turma = {
      id_turma: turma?.id_turma || `turma_${Date.now()}`,
      ...formData,
    };

    if (turma) {
      dispatch({ type: 'UPDATE_TURMA', payload: novaTurma });
    } else {
      dispatch({ type: 'ADD_TURMA', payload: novaTurma });
    }

    // Reset form
    setFormData({
      nome: '',
      alunos: 0,
      duracao_min: 60,
      esp_necessarias: 0,
    });

    if (onClose) {
      onClose();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }));

    // Clear error when user starts typing
    if (errors[name as keyof FormTurma]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const duracaoOptions = [
    { value: 30, label: '30 minutos' },
    { value: 45, label: '45 minutos' },
    { value: 60, label: '1 hora' },
    { value: 90, label: '1h 30min' },
    { value: 120, label: '2 horas' },
    { value: 150, label: '2h 30min' },
    { value: 180, label: '3 horas' },
  ];

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">
          {turma ? 'Editar Turma' : 'Nova Turma'}
        </h2>
        <p className="card-description">
          {turma 
            ? 'Atualize as informações da turma'
            : 'Preencha os dados para cadastrar uma nova turma'
          }
        </p>
      </div>
      
      <div className="card-content">
        <form onSubmit={handleSubmit} className="form">
          <div className="form-group">
            <label htmlFor="nome" className="label">
              Nome da Turma *
            </label>
            <input
              type="text"
              id="nome"
              name="nome"
              value={formData.nome}
              onChange={handleChange}
              className="input"
              placeholder="Ex: Aula de Português"
            />
            {errors.nome && (
              <span className="text-sm" style={{ color: 'var(--danger-color)' }}>
                {errors.nome}
              </span>
            )}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="alunos" className="label">
                Número de Alunos *
              </label>
              <input
                type="number"
                id="alunos"
                name="alunos"
                value={formData.alunos}
                onChange={handleChange}
                className="input"
                min="1"
                placeholder="Ex: 30"
              />
              {errors.alunos && (
                <span className="text-sm" style={{ color: 'var(--danger-color)' }}>
                  {errors.alunos}
                </span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="duracao_min" className="label">
                Duração da Aula *
              </label>
              <select
                id="duracao_min"
                name="duracao_min"
                value={formData.duracao_min}
                onChange={handleChange}
                className="select"
              >
                {duracaoOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {errors.duracao_min && (
                <span className="text-sm" style={{ color: 'var(--danger-color)' }}>
                  {errors.duracao_min}
                </span>
              )}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="esp_necessarias" className="label">
              Cadeiras Especiais Necessárias
            </label>
            <input
              type="number"
              id="esp_necessarias"
              name="esp_necessarias"
              value={formData.esp_necessarias}
              onChange={handleChange}
              className="input"
              min="0"
              placeholder="Ex: 2"
            />
            <small className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Quantidade de cadeiras especiais que a turma necessita
            </small>
            {errors.esp_necessarias && (
              <span className="text-sm" style={{ color: 'var(--danger-color)' }}>
                {errors.esp_necessarias}
              </span>
            )}
          </div>

          <div className="flex gap-4 mt-6">
            <button type="submit" className="btn btn-primary">
              {turma ? (
                <>
                  <FloppyDisk size={16} style={{ marginRight: '6px' }} />
                  Atualizar Turma
                </>
              ) : (
                <>
                  <Plus size={16} style={{ marginRight: '6px' }} />
                  Cadastrar Turma
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
