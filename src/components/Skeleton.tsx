
interface SkeletonProps {
  height?: string;
  width?: string;
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'full';
  className?: string;
  animate?: boolean;
}

// Componente base do skeleton
export function Skeleton({ 
  height = '1rem', 
  width = '100%', 
  rounded = 'md',
  className = '',
  animate = true 
}: SkeletonProps) {
  const borderRadius = {
    none: '0',
    sm: 'var(--radius-sm)',
    md: 'var(--radius)',
    lg: 'var(--radius-lg)',
    full: '9999px'
  };

  return (
    <div
      className={`bg-gray-200 ${animate ? 'animate-pulse' : ''} ${className}`}
      style={{
        height,
        width,
        borderRadius: borderRadius[rounded],
      }}
    />
  );

// Skeleton para cards do Dashboard
export function SkeletonDashboardStats() {
  return (
    <div className="grid grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="card">
          <div className="card-content">
            <div className="flex items-center justify-between">
              <div style={{ flex: 1 }}>
                <Skeleton height="0.875rem" width="60%" className="mb-2" />
                <Skeleton height="1.5rem" width="40%" className="mb-1" />
                <Skeleton height="0.875rem" width="50%" />
              </div>
              <Skeleton width="2rem" height="2rem" rounded="lg" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Skeleton para seções do Dashboard (Alertas, Compatibilidade)
export function SkeletonDashboardSections() {
  return (
    <div className="grid grid-cols-2 gap-6">
      {Array.from({ length: 2 }).map((_, index) => (
        <div key={index} className="card">
          <div className="card-header">
            <div className="flex items-center">
              <Skeleton width="1.25rem" height="1.25rem" rounded="sm" className="mr-2" />
              <Skeleton height="1.125rem" width="30%" />
            </div>
            <Skeleton height="0.875rem" width="70%" className="mt-2" />
          </div>
          <div className="card-content">
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, itemIndex) => (
                <div key={itemIndex} className="flex items-center justify-between">
                  <div style={{ flex: 1 }}>
                    <Skeleton height="0.875rem" width="60%" className="mb-1" />
                    <Skeleton height="0.75rem" width="40%" />
                  </div>
                  <Skeleton width="4rem" height="1.5rem" rounded="sm" />
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Skeleton para exportar dados
export function SkeletonDashboardExport() {
  return (
    <div className="card">
      <div className="card-header">
        <div className="flex items-center">
          <Skeleton width="1.25rem" height="1.25rem" rounded="sm" className="mr-2" />
          <Skeleton height="1.125rem" width="25%" />
        </div>
        <Skeleton height="0.875rem" width="60%" className="mt-2" />
      </div>
      <div className="card-content">
        <div className="flex gap-4">
          <Skeleton width="8rem" height="2.5rem" rounded="md" />
          <Skeleton width="10rem" height="2.5rem" rounded="md" />
        </div>
      </div>
    </div>
  );
}

// Skeleton para lista de projetos
export function SkeletonProjetosList() {
  return (
    <div className="grid gap-4">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="card">
          <div className="card-content">
            <div style={{ position: 'relative' }}>
              {/* Header com título e badge */}
              <div className="flex items-center gap-3 mb-2">
                <Skeleton height="1.125rem" width="45%" />
                <Skeleton width="5rem" height="1.5rem" rounded="sm" />
              </div>

              {/* Descrição */}
              <Skeleton height="0.875rem" width="88%" className="mb-4" />

              {/* Grid de 3 colunas com estatísticas */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Skeleton height="0.875rem" width="70%" className="mb-1" />
                  <Skeleton height="1rem" width="25%" />
                </div>
                <div>
                  <Skeleton height="0.875rem" width="65%" className="mb-1" />
                  <Skeleton height="1rem" width="20%" />
                </div>
                <div>
                  <Skeleton height="0.875rem" width="85%" className="mb-1" />
                  <Skeleton height="1rem" width="35%" />
                </div>
              </div>

              {/* Botões de ação no canto superior direito */}
              <div style={{
                position: 'absolute',
                top: '0',
                right: '0',
                display: 'flex',
                gap: '6px'
              }}>
                <Skeleton width="2rem" height="2rem" rounded="sm" />
                <Skeleton width="2rem" height="2rem" rounded="sm" />
                <Skeleton width="2rem" height="2rem" rounded="sm" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Skeleton para resultados
export function SkeletonResultados() {
  return (
    <div className="grid gap-4">
      {Array.from({ length: 2 }).map((_, index) => (
        <div key={index} className="card">
          <div className="card-header">
            <div className="flex justify-between items-center">
              <div style={{ flex: 1 }}>
                <div className="flex items-center mb-2">
                  <Skeleton width="1.25rem" height="1.25rem" rounded="sm" className="mr-2" />
                  <Skeleton height="1.125rem" width="40%" />
                </div>
                <Skeleton height="0.875rem" width="60%" className="mb-1" />
                <div className="flex items-center gap-1">
                  <Skeleton width="0.875rem" height="0.875rem" rounded="sm" />
                  <Skeleton height="0.75rem" width="50%" />
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <Skeleton height="0.875rem" width="6rem" className="mb-1" />
                  <Skeleton height="1.5rem" width="3rem" />
                </div>
                <div className="flex gap-2">
                  <Skeleton width="4rem" height="2rem" rounded="sm" />
                  <Skeleton width="5rem" height="2rem" rounded="sm" />
                </div>
              </div>
            </div>
          </div>
          
          <div className="card-content">
            {/* Parâmetros */}
            <div className="mb-6">
              <Skeleton height="1rem" width="40%" className="mb-2" />
              <div className="flex flex-wrap gap-2">
                <Skeleton width="4rem" height="1.5rem" rounded="sm" />
                <Skeleton width="6rem" height="1.5rem" rounded="sm" />
                <Skeleton width="5rem" height="1.5rem" rounded="sm" />
              </div>
            </div>

            {/* Estatísticas */}
            <div className="mb-6">
              <Skeleton height="1rem" width="35%" className="mb-3" />
              <div className="grid grid-cols-4 gap-4 text-center">
                {Array.from({ length: 4 }).map((_, statIndex) => (
                  <div key={statIndex} className="bg-gray-50 p-3 rounded-lg">
                    <Skeleton height="1.5rem" width="60%" className="mb-1 mx-auto" />
                    <Skeleton height="0.875rem" width="80%" className="mx-auto" />
                  </div>
                ))}
              </div>
            </div>

            {/* Alocações detalhadas */}
            <div>
              <Skeleton height="1rem" width="45%" className="mb-4" />
              <div className="space-y-3">
                {Array.from({ length: 2 }).map((_, alocIndex) => (
                  <div key={alocIndex} className="card" style={{ border: '1px solid var(--border-color)', backgroundColor: '#fafafa' }}>
                    <div className="card-content">
                      <div className="flex justify-between items-start">
                        <div style={{ flex: 1 }}>
                          <div className="flex items-center gap-3 mb-3">
                            <Skeleton width="2rem" height="1.25rem" rounded="sm" />
                            <Skeleton height="1rem" width="25%" />
                            <span className="text-lg" style={{ color: 'var(--text-secondary)' }}>→</span>
                            <Skeleton height="1rem" width="30%" />
                          </div>
                          
                          <div className="grid grid-cols-4 gap-3 mb-2">
                            {Array.from({ length: 4 }).map((_, colIndex) => (
                              <div key={colIndex} className="bg-white p-2 rounded">
                                <Skeleton height="0.75rem" width="60%" className="mb-1" />
                                <Skeleton height="0.875rem" width="40%" />
                              </div>
                            ))}
                          </div>

                          <Skeleton width="8rem" height="1.25rem" rounded="sm" />
                        </div>
                        
                        <div className="text-center ml-4 min-w-[80px]">
                          <Skeleton height="0.75rem" width="100%" className="mb-1" />
                          <Skeleton height="1.5rem" width="60%" className="mx-auto mb-1" />
                          <Skeleton height="0.5rem" width="100%" rounded="full" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Skeleton para header do projeto
export function SkeletonProjetoHeader() {
  return (
    <div className="grid gap-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Skeleton width="5rem" height="2.5rem" rounded="md" />
        <div style={{ flex: 1 }}>
          <Skeleton height="1.5rem" width="40%" className="mb-2" />
          <Skeleton height="0.875rem" width="70%" />
        </div>
        <Skeleton width="12rem" height="2.5rem" rounded="md" />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="card">
            <div className="card-content">
              <div className="flex items-center justify-between">
                <div>
                  <Skeleton height="0.875rem" width="60%" className="mb-1" />
                  <Skeleton height="1.5rem" width="40%" />
                </div>
                <Skeleton width="1.5rem" height="1.5rem" rounded="sm" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation */}
      <div className="flex gap-2">
        <Skeleton width="8rem" height="2.5rem" rounded="md" />
        <Skeleton width="9rem" height="2.5rem" rounded="md" />
      </div>
    </div>
  );
}

// Skeleton para listas de itens (salas/turmas)
export function SkeletonItemsList() {
  return (
    <div className="grid gap-6">
      <div className="flex justify-between items-center">
        <Skeleton height="1.125rem" width="30%" />
        <Skeleton width="8rem" height="2.5rem" rounded="md" />
      </div>

      <div className="grid gap-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="card">
            <div className="card-content">
              <div className="flex justify-between items-start">
                <div style={{ flex: 1 }}>
                  <Skeleton height="1.125rem" width="40%" className="mb-2" />
                  <Skeleton height="0.875rem" width="60%" className="mb-3" />
                  <div className="flex gap-2 flex-wrap">
                    <Skeleton width="4rem" height="1.25rem" rounded="sm" />
                    <Skeleton width="5rem" height="1.25rem" rounded="sm" />
                    <Skeleton width="3rem" height="1.25rem" rounded="sm" />
                  </div>
                </div>
                <div className="flex gap-1">
                  <Skeleton width="1.5rem" height="1.5rem" rounded="sm" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Skeleton para formulários
export function SkeletonForm() {
  return (
    <div className="card">
      <div className="card-header">
        <Skeleton height="1.125rem" width="25%" />
      </div>
      <div className="card-content">
        <div className="form">
          <div className="form-row">
            <div className="form-group">
              <Skeleton height="0.875rem" width="20%" className="mb-2" />
              <Skeleton height="2.5rem" width="100%" rounded="md" />
            </div>
            <div className="form-group">
              <Skeleton height="0.875rem" width="30%" className="mb-2" />
              <Skeleton height="2.5rem" width="100%" rounded="md" />
            </div>
          </div>
          <div className="form-group">
            <Skeleton height="0.875rem" width="25%" className="mb-2" />
            <Skeleton height="4rem" width="100%" rounded="md" />
          </div>
          <div className="flex gap-4">
            <Skeleton width="6rem" height="2.5rem" rounded="md" />
            <Skeleton width="5rem" height="2.5rem" rounded="md" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Skeleton;
