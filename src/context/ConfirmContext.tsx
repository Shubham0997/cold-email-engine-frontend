import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Button } from '../components/Button';

interface ConfirmOptions {
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'primary';
}

interface ConfirmContextType {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined);

export const useConfirm = () => {
  const context = useContext(ConfirmContext);
  if (!context) throw new Error('useConfirm must be used within a ConfirmProvider');
  return context;
};

export const ConfirmProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    options: ConfirmOptions;
    resolve: (value: boolean) => void;
  } | null>(null);

  const confirm = (options: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      setConfirmState({
        isOpen: true,
        options,
        resolve,
      });
    });
  };

  const handleClose = (value: boolean) => {
    if (confirmState) {
      confirmState.resolve(value);
      setConfirmState(null);
    }
  };

  const overlayStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10000,
    animation: 'fade-in 0.2s ease-out forwards',
  };

  const modalStyle: React.CSSProperties = {
    backgroundColor: '#ffffff',
    padding: '2rem',
    borderRadius: '1.25rem',
    width: '90%',
    maxWidth: '450px',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    animation: 'modal-up 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
  };

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      {confirmState?.isOpen && (
        <div style={overlayStyle}>
          <div style={modalStyle}>
            {confirmState.options.title && (
              <h2 style={{ marginTop: 0, marginBottom: '0.75rem', fontSize: '1.25rem', color: 'var(--primary)' }}>
                {confirmState.options.title}
              </h2>
            )}
            <p style={{ color: 'var(--muted-foreground)', fontSize: '1rem', lineHeight: 1.5, marginBottom: '2rem' }}>
              {confirmState.options.message}
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <Button onClick={() => handleClose(false)} variant="secondary">
                {confirmState.options.cancelLabel || 'Cancel'}
              </Button>
              <Button 
                onClick={() => handleClose(true)} 
                variant={confirmState.options.variant === 'danger' ? 'outline' : 'primary'}
                style={confirmState.options.variant === 'danger' ? { color: '#ef4444', borderColor: '#fecaca' } : {}}
              >
                {confirmState.options.confirmLabel || 'Confirm'}
              </Button>
            </div>
          </div>
        </div>
      )}
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes modal-up {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </ConfirmContext.Provider>
  );
};
