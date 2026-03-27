import React, { createContext, useContext, useState, ReactNode } from 'react';

interface LoadingContextType {
  setIsLoading: (isLoading: boolean, message?: string) => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) throw new Error('useLoading must be used within a LoadingProvider');
  return context;
};

export const LoadingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [loadingState, setLoadingState] = useState<{ active: boolean; message: string }>({
    active: false,
    message: 'Processing...',
  });

  const setIsLoading = (active: boolean, message: string = 'Processing...') => {
    setLoadingState({ active, message });
  };

  const overlayStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    backdropFilter: 'blur(8px)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20000,
    animation: 'fade-in 0.3s ease-out forwards',
  };

  const loaderStyle: React.CSSProperties = {
    width: '40px',
    height: '40px',
    border: '3px solid rgba(255, 255, 255, 0.1)',
    borderTopColor: '#ffffff',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginBottom: '1.5rem',
  };

  const messageStyle: React.CSSProperties = {
    color: '#ffffff',
    fontSize: '1rem',
    fontWeight: 500,
    letterSpacing: '0.025em',
    textAlign: 'center',
  };

  return (
    <LoadingContext.Provider value={{ setIsLoading }}>
      {children}
      {loadingState.active && (
        <div style={overlayStyle}>
          <div style={loaderStyle} />
          <div style={messageStyle}>{loadingState.message}</div>
        </div>
      )}
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </LoadingContext.Provider>
  );
};
