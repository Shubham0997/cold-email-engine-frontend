import React from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

export const Textarea: React.FC<TextareaProps> = ({ label, style, id, ...props }) => {
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
    
  const textareaStyle: React.CSSProperties = {
    padding: '0.625rem 0.875rem',
    borderRadius: 'var(--radius)',
    border: '1px solid var(--border)',
    fontSize: '0.875rem',
    outline: 'none',
    fontFamily: 'inherit',
    resize: 'vertical',
    minHeight: '100px',
    backgroundColor: '#fff',
    color: 'var(--primary)',
    transition: 'all 0.2s ease',
  };

  return (
    <div style={containerStyle}>
      {label && <label htmlFor={id} style={labelStyle}>{label}</label>}
      <textarea 
        id={id}
        style={{ ...textareaStyle, ...style }}
        {...props} 
      />
    </div>
  );
};
