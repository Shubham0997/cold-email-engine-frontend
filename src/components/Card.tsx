import React from 'react';

interface CardProps {
  children: React.ReactNode;
  title?: string;
  style?: React.CSSProperties;
}

export const Card: React.FC<CardProps> = ({ children, title, style }) => {
  const cardStyle: React.CSSProperties = {
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    padding: '1.5rem',
    ...style
  };

  const titleStyle: React.CSSProperties = {
    marginTop: 0,
    marginBottom: '1rem',
    fontSize: '1.25rem',
    color: '#111',
    fontWeight: 600
  };

  return (
    <div style={cardStyle}>
      {title && <h2 style={titleStyle}>{title}</h2>}
      {children}
    </div>
  );
};
