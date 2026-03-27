import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  isLoading, 
  disabled,
  style,
  ...props 
}) => {
  const baseStyle: React.CSSProperties = {
    padding: '0.5rem 1rem',
    borderRadius: '4px',
    border: '1px solid transparent',
    fontSize: '0.9rem',
    fontWeight: 500,
    cursor: (disabled || isLoading) ? 'not-allowed' : 'pointer',
    opacity: (disabled || isLoading) ? 0.7 : 1,
    transition: 'background-color 0.2s',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem'
  };

  const variants = {
    primary: {
      backgroundColor: '#0066ff',
      color: 'white',
    },
    secondary: {
      backgroundColor: '#f0f0f0',
      color: '#333',
    },
    outline: {
      backgroundColor: 'transparent',
      border: '1px solid #ccc',
      color: '#333',
    }
  };

  return (
    <button 
      style={{ ...baseStyle, ...variants[variant], ...style }} 
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <span style={{ width: '12px', height: '12px', border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />}
      {children}
    </button>
  );
};
