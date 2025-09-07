import { XCircle, ArrowClockwise } from 'phosphor-react';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

export default function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  return (
    <div className="card">
      <div className="card-content text-center" style={{ padding: 'var(--spacing-8)' }}>
        <XCircle size={48} color="var(--danger-color)" style={{ marginBottom: 'var(--spacing-4)' }} />
        <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--danger-color)' }}>
          Erro
        </h3>
        <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
          {message}
        </p>
        {onRetry && (
          <button onClick={onRetry} className="btn btn-secondary">
            <ArrowClockwise size={16} style={{ marginRight: '6px' }} />
            Tentar Novamente
          </button>
        )}
      </div>
    </div>
  );
}
