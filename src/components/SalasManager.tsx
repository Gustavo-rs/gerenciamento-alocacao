import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import SalasList from './SalasList';
import SalaForm from './SalaForm';
import Modal from './Modal';
import type { Sala } from '../types';
import { Plus, Buildings } from 'phosphor-react';

export default function SalasManager() {
  const { state } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [editingSala, setEditingSala] = useState<Sala | null>(null);

  const handleAddSala = () => {
    setEditingSala(null);
    setShowModal(true);
  };

  const handleEditSala = (sala: Sala) => {
    setEditingSala(sala);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingSala(null);
  };

  return (
    <div className="grid gap-6">
      {/* Header */}
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Gerenciar Salas</h1>
          <p className="text-base" style={{ color: 'var(--text-secondary)', lineHeight: '1.5' }}>
            Gerencie todas as salas disponíveis no sistema. Adicione, edite ou remova salas conforme necessário.
          </p>
        </div>
        <div className="flex-1">
          <button 
            onClick={handleAddSala}
            className="btn btn-primary"
          >
            <Plus size={16} style={{ marginRight: '6px' }} />
            Adicionar Sala
          </button>
        </div>
      </div>

      {/* Lista de Salas */}
      <SalasList onEdit={handleEditSala} />

      {/* Modal para Adicionar/Editar Sala */}
      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title={editingSala ? 'Editar Sala' : 'Nova Sala'}
        size="lg"
      >
        <SalaForm
          sala={editingSala || undefined}
          onClose={handleCloseModal}
        />
      </Modal>
    </div>
  );
}
