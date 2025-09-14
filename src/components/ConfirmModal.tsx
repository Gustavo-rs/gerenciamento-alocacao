import React from 'react';
import { createPortal } from 'react-dom';
import { Warning, Check, X } from 'phosphor-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({ 
  isOpen, 
  title, 
  message, 
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  type = 'warning',
  onConfirm, 
  onCancel 
}: ConfirmModalProps) {
  if (!isOpen) return null;

  const getColors = () => {
    switch (type) {
      case 'danger':
        return {
          bg: '#ef4444',
          border: '#dc2626',
          confirmBg: '#dc2626',
          confirmHover: '#b91c1c'
        };
      case 'warning':
        return {
          bg: '#f59e0b',
          border: '#d97706',
          confirmBg: '#d97706',
          confirmHover: '#b45309'
        };
      default:
        return {
          bg: '#3b82f6',
          border: '#2563eb',
          confirmBg: '#2563eb',
          confirmHover: '#1d4ed8'
        };
    }
  };

  const colors = getColors();

  const getIcon = () => {
    switch (type) {
      case 'danger':
        return <X size={24} />;
      case 'info':
        return <Check size={24} />;
      default:
        return <Warning size={24} />;
    }
  };

  const modalContent = (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        padding: '1rem'
      }}
    >
      <div 
        style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          width: '100%',
          maxWidth: '28rem',
          padding: '1.5rem'
        }}
      >
        {/* Header com ícone */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.75rem',
          marginBottom: '1rem'
        }}>
          <div style={{ 
            color: colors.bg,
            padding: '0.5rem',
            borderRadius: '50%',
            backgroundColor: `${colors.bg}20`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {getIcon()}
          </div>
          <h3 style={{ 
            fontSize: '1.125rem', 
            fontWeight: '600', 
            margin: 0,
            color: '#111827'
          }}>
            {title}
          </h3>
        </div>

        {/* Mensagem */}
        <p style={{ 
          color: '#6b7280',
          lineHeight: 1.5,
          marginBottom: '1.5rem',
          fontSize: '0.875rem'
        }}>
          {message}
        </p>

        {/* Botões */}
        <div style={{ 
          display: 'flex', 
          gap: '0.75rem',
          justifyContent: 'flex-end'
        }}>
          <button
            onClick={onCancel}
            style={{
              padding: '0.5rem 1rem',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              backgroundColor: 'white',
              color: '#374151',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: '500',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f9fafb';
              e.currentTarget.style.borderColor = '#9ca3af';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'white';
              e.currentTarget.style.borderColor = '#d1d5db';
            }}
          >
            {cancelText}
          </button>
          
          <button
            onClick={onConfirm}
            style={{
              padding: '0.5rem 1rem',
              border: 'none',
              borderRadius: '6px',
              backgroundColor: colors.confirmBg,
              color: 'white',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: '500',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = colors.confirmHover;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = colors.confirmBg;
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
