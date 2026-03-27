import React from 'react';

interface CardProps {
  children: React.ReactNode;
  title?: string;
  headerAction?: React.ReactNode;
  style?: React.CSSProperties;
}

export const Card: React.FC<CardProps> = ({ children, title, headerAction, style }) => {
  const cardStyle: React.CSSProperties = {
    backgroundColor: '#fff',
    borderRadius: '1rem',
    border: '1px solid var(--border)',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05)',
    padding: '2rem',
    ...style
  };

  const titleStyle: React.CSSProperties = {
    marginTop: 0,
    marginBottom: '1.5rem',
    fontSize: '1.25rem',
    color: 'var(--primary)',
    fontWeight: 700,
    letterSpacing: '-0.025em'
  };

  return (
    <div style={cardStyle}>
      {(title || headerAction) && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          {title && <h2 style={{ ...titleStyle, marginBottom: 0 }}>{title}</h2>}
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}
      {children}
    </div>
  );
};
