import React from 'react';
import { createPortal } from 'react-dom';
import { Brain, Clock } from 'phosphor-react';

interface ProcessingModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  progress?: number; // 0-100
}

export default function ProcessingModal({ 
  isOpen, 
  title, 
  message,
  progress 
}: ProcessingModalProps) {
  if (!isOpen) return null;

  const modalContent = (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10001,
        padding: '1rem'
      }}
    >
      <div 
        style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          width: '100%',
          maxWidth: '32rem',
          padding: '2rem',
          textAlign: 'center'
        }}
      >
        {/* Animação do cérebro */}
        <div style={{ 
          display: 'flex',
          justifyContent: 'center',
          marginBottom: '1.5rem'
        }}>
          <div 
            style={{
              color: '#10b981',
              animation: 'pulse 2s infinite',
              padding: '1rem',
              borderRadius: '50%',
              backgroundColor: '#10b98120',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Brain size={48} />
          </div>
        </div>

        {/* Título */}
        <h3 style={{ 
          fontSize: '1.25rem', 
          fontWeight: '600', 
          margin: '0 0 0.5rem 0',
          color: '#111827'
        }}>
          {title}
        </h3>

        {/* Mensagem */}
        <p style={{ 
          color: '#6b7280',
          lineHeight: 1.5,
          marginBottom: '1.5rem',
          fontSize: '0.875rem'
        }}>
          {message}
        </p>

        {/* Barra de progresso (se fornecida) */}
        {progress !== undefined && (
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{
              width: '100%',
              height: '8px',
              backgroundColor: '#e5e7eb',
              borderRadius: '4px',
              overflow: 'hidden'
            }}>
              <div 
                style={{
                  width: `${progress}%`,
                  height: '100%',
                  backgroundColor: '#10b981',
                  borderRadius: '4px',
                  transition: 'width 0.3s ease'
                }}
              />
            </div>
            <p style={{ 
              color: '#6b7280',
              fontSize: '0.75rem',
              margin: '0.5rem 0 0 0'
            }}>
              {progress}% concluído
            </p>
          </div>
        )}

        {/* Spinner de loading mais visível */}
        <div style={{ 
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.75rem',
          color: '#10b981',
          fontSize: '1rem',
          fontWeight: '500',
          marginBottom: '1rem'
        }}>
          <div 
            style={{
              width: '1.5rem',
              height: '1.5rem',
              border: '3px solid #10b98130',
              borderTop: '3px solid #10b981',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}
          />
          <Clock size={20} />
          <span>Processando algoritmo...</span>
        </div>

        {/* Status detalhado */}
        <div style={{
          backgroundColor: '#f0fdf4',
          border: '1px solid #bbf7d0',
          borderRadius: '8px',
          padding: '12px',
          marginBottom: '1rem'
        }}>
          <div style={{ 
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: '#166534',
            fontSize: '0.875rem',
            fontWeight: '500',
            marginBottom: '4px'
          }}>
            <div 
              style={{
                width: '8px',
                height: '8px',
                backgroundColor: '#10b981',
                borderRadius: '50%',
                animation: 'pulse 2s infinite'
              }}
            />
            <span>Executando Machine Learning</span>
          </div>
          <p style={{ 
            color: '#15803d',
            fontSize: '0.75rem',
            margin: 0,
            paddingLeft: '16px'
          }}>
            Analisando compatibilidade entre salas e turmas...
          </p>
        </div>

        {/* Nota sobre o tempo */}
        <p style={{ 
          color: '#9ca3af',
          fontSize: '0.75rem',
          margin: 0,
          fontStyle: 'italic',
          textAlign: 'center'
        }}>
          ⏱️ Este processo pode levar alguns minutos. Por favor, aguarde.
        </p>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
