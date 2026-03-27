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
    padding: '0.625rem 1.25rem',
    borderRadius: 'var(--radius)',
    border: '1px solid transparent',
    fontSize: '0.875rem',
    fontWeight: 600,
    cursor: (disabled || isLoading) ? 'not-allowed' : 'pointer',
    opacity: (disabled || isLoading) ? 0.7 : 1,
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    fontFamily: 'inherit'
  };

  const variants = {
    primary: {
      backgroundColor: 'var(--primary)',
      color: 'var(--primary-foreground)',
      boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
    },
    secondary: {
      backgroundColor: 'var(--secondary)',
      color: 'var(--secondary-foreground)',
    },
    outline: {
      backgroundColor: 'transparent',
      border: '1px solid var(--border)',
      color: 'var(--primary)',
    }
  };

  return (
    <button 
      style={{ ...baseStyle, ...variants[variant], ...style }} 
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <span style={{ 
          width: '14px', 
          height: '14px', 
          border: '2px solid currentColor', 
          borderTopColor: 'transparent', 
          borderRadius: '50%', 
          display: 'inline-block',
          animation: 'spin 1s linear infinite',
          flexShrink: 0
        }} />
      )}
      {children}
    </button>
  );
};
