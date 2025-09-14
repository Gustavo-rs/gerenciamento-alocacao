import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle, XCircle, Info, Warning, X } from 'phosphor-react';

export interface ToastProps {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message?: string;
  duration?: number;
  onClose: (id: string) => void;
}

export function Toast({ id, type, title, message, duration = 5000, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id);
    }, duration);

    return () => clearTimeout(timer);
  }, [id, duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle size={20} />;
      case 'error':
        return <XCircle size={20} />;
      case 'warning':
        return <Warning size={20} />;
      default:
        return <Info size={20} />;
    }
  };

  const getColors = () => {
    switch (type) {
      case 'success':
        return {
          bg: '#10b981',
          border: '#059669',
          icon: '#ffffff'
        };
      case 'error':
        return {
          bg: '#ef4444',
          border: '#dc2626',
          icon: '#ffffff'
        };
      case 'warning':
        return {
          bg: '#f59e0b',
          border: '#d97706',
          icon: '#ffffff'
        };
      default:
        return {
          bg: '#3b82f6',
          border: '#2563eb',
          icon: '#ffffff'
        };
    }
  };

  const colors = getColors();

  const toastContent = (
    <div
      style={{
        position: 'fixed',
        top: '1rem',
        right: '1rem',
        zIndex: 10000,
        backgroundColor: colors.bg,
        color: 'white',
        borderRadius: '8px',
        padding: '1rem',
        minWidth: '300px',
        maxWidth: '500px',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        border: `2px solid ${colors.border}`,
        animation: 'slideInRight 0.3s ease-out'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
        <div style={{ color: colors.icon, flexShrink: 0, marginTop: '2px' }}>
          {getIcon()}
        </div>
        
        <div style={{ flex: 1 }}>
          <h4 style={{ 
            margin: 0, 
            fontSize: '0.875rem', 
            fontWeight: '600',
            marginBottom: message ? '0.25rem' : 0
          }}>
            {title}
          </h4>
          {message && (
            <p style={{ 
              margin: 0, 
              fontSize: '0.75rem', 
              opacity: 0.9,
              lineHeight: 1.4
            }}>
              {message}
            </p>
          )}
        </div>
        
        <button
          onClick={() => onClose(id)}
          style={{
            background: 'none',
            border: 'none',
            color: 'white',
            cursor: 'pointer',
            padding: '0.25rem',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: 0.8,
            flexShrink: 0
          }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
          onMouseLeave={(e) => e.currentTarget.style.opacity = '0.8'}
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );

  return createPortal(toastContent, document.body);
}

// Context para gerenciar toasts
import { createContext, useContext, useState, ReactNode } from 'react';

interface ToastContextType {
  addToast: (toast: Omit<ToastProps, 'id' | 'onClose'>) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const addToast = (toast: Omit<ToastProps, 'id' | 'onClose'>) => {
    const id = Date.now().toString();
    const newToast: ToastProps = {
      ...toast,
      id,
      onClose: removeToast
    };
    setToasts(prev => [...prev, newToast]);
  };

  const success = (title: string, message?: string) => {
    addToast({ type: 'success', title, message });
  };

  const error = (title: string, message?: string) => {
    addToast({ type: 'error', title, message });
  };

  const info = (title: string, message?: string) => {
    addToast({ type: 'info', title, message });
  };

  const warning = (title: string, message?: string) => {
    addToast({ type: 'warning', title, message });
  };

  return (
    <ToastContext.Provider value={{ addToast, success, error, info, warning }}>
      {children}
      {toasts.map(toast => (
        <Toast key={toast.id} {...toast} />
      ))}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
