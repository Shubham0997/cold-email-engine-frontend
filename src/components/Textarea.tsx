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
    fontSize: '0.85rem',
    fontWeight: 500,
    color: '#555',
  };

  const textareaStyle: React.CSSProperties = {
    padding: '0.6rem 0.75rem',
    borderRadius: '4px',
    border: '1px solid #d1d5db',
    fontSize: '0.95rem',
    outline: 'none',
    fontFamily: 'inherit',
    resize: 'vertical',
    minHeight: '100px',
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
