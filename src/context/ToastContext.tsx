import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within a ToastProvider');
  return context;
};

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const toastContainerStyle: React.CSSProperties = {
    position: 'fixed',
    bottom: '2rem',
    right: '2rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    zIndex: 9999,
  };

  const getToastStyle = (type: ToastType): React.CSSProperties => ({
    padding: '1rem 1.5rem',
    borderRadius: '0.75rem',
    backgroundColor: type === 'error' ? '#fee2e2' : type === 'success' ? '#ecfdf5' : 'var(--secondary)',
    color: type === 'error' ? '#dc2626' : type === 'success' ? '#059669' : 'var(--primary)',
    border: `1px solid ${type === 'error' ? '#fecaca' : type === 'success' ? '#d1fae5' : 'var(--border)'}`,
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    fontSize: '0.875rem',
    fontWeight: 600,
    minWidth: '280px',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    animation: 'toast-in 0.3s ease-out forwards',
  });

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div style={toastContainerStyle}>
        {toasts.map((toast) => (
          <div key={toast.id} style={getToastStyle(toast.type)}>
            <span style={{ fontSize: '1.25rem' }}>
              {toast.type === 'success' ? '✅' : toast.type === 'error' ? '❌' : 'ℹ️'}
            </span>
            {toast.message}
          </div>
        ))}
      </div>
      <style>{`
        @keyframes toast-in {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </ToastContext.Provider>
  );
};
