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
    fontSize: '0.85rem',
    fontWeight: 500,
    color: '#555',
  };

  const inputStyle: React.CSSProperties = {
    padding: '0.6rem 0.75rem',
    borderRadius: '4px',
    border: '1px solid #d1d5db',
    fontSize: '0.95rem',
    outline: 'none',
    transition: 'border-color 0.2s',
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
