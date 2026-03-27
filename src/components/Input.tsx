import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Input: React.FC<InputProps> = ({ label, style, id, ...props }) => {
  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
    marginBottom: '1rem',
    width: '100%',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '0.875rem',
    fontWeight: 600,
    color: 'var(--slate-700)',
    marginBottom: '0.25rem'
  };

  const inputStyle: React.CSSProperties = {
    padding: '0.625rem 0.875rem',
    borderRadius: 'var(--radius)',
    border: '1px solid var(--border)',
    fontSize: '0.875rem',
    outline: 'none',
    backgroundColor: '#fff',
    color: 'var(--primary)',
    transition: 'all 0.2s ease',
  };

  return (
    <div style={containerStyle}>
      {label && <label htmlFor={id} style={labelStyle}>{label}</label>}
      <input 
        id={id}
        style={{ ...inputStyle, ...style }}
        {...props} 
      />
    </div>
  );
};
