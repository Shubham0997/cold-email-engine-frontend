import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Card } from '../components/Card';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { Textarea } from '../components/Textarea';
import { useToast } from '../context/ToastContext';
import { extractPlaceholders, applyVariables } from '../utils/emailUtils';

export const Home = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [researchPrompt, setResearchPrompt] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [isResearching, setIsResearching] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [variableValues, setVariableValues] = useState<{[key: string]: string}>({});
  const [hasSmtp, setHasSmtp] = useState<boolean | null>(null);

  useEffect(() => {
    api.getSmtpConfig().then(res => {
      setHasSmtp(res.has_config);
    }).catch(() => setHasSmtp(false));
  }, []);

  const placeholders = Array.from(new Set([
    ...extractPlaceholders(subject),
    ...extractPlaceholders(body)
  ])).filter(p => p !== 'email'); 

  const containsPlaceholders = placeholders.length > 0;

  const handleVariableChange = (key: string, value: string) => {
    setVariableValues(prev => ({ ...prev, [key]: value }));
  };

  const handleApplyVariables = () => {
    const { subject: newSubject, body: newBody } = applyVariables(subject, body, variableValues);
    setSubject(newSubject);
    setBody(newBody);
    setVariableValues({});
  };

  const handleResearch = async () => {
    if (!researchPrompt) return;
    setIsResearching(true);
    try {
      const data = await api.research(researchPrompt);
      setSubject(data.subject);
      setBody(data.body);
    } catch (err) {
      showToast('AI Research failed. Check your Gemini API key in backend.', 'error');
    } finally {
      setIsResearching(false);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientEmail || !subject || !body) return;
    
    if (hasSmtp === false) {
      showToast('You must configure your SMTP settings before sending.', 'error');
      navigate('/settings');
      return;
    }
    
    setIsSending(true);
    try {
      await api.sendSingleEmail(
        recipientEmail, 
        body, 
        subject
      );
      showToast('Email sent successfully!');
      // Optional: Clear form
      setRecipientEmail('');
    } catch (err) {
      showToast('Failed to send email.', 'error');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="container-narrow">
      <Card title="AI Outreach Assistant">
        <div style={{ position: 'relative' }}>
          {hasSmtp !== true && (
            <div style={{
              position: 'absolute',
              inset: '-1rem',
              backgroundColor: 'rgba(255,255,255,0.7)',
              backdropFilter: 'blur(2px)',
              zIndex: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 'var(--radius)'
            }}>
              <div style={{
                backgroundColor: '#fff',
                padding: '2rem',
                borderRadius: '0.75rem',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                border: '1px solid var(--border)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '1rem',
                textAlign: 'center',
                maxWidth: '350px'
              }}>
                {hasSmtp === null ? (
                  <>
                    <div style={{ 
                      width: '32px', height: '32px', border: '3px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' 
                    }} />
                    <span style={{ fontWeight: 600, color: 'var(--primary)', fontSize: '1rem' }}>Verifying Profile...</span>
                  </>
                ) : (
                  <>
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                    <div>
                      <h3 style={{ fontWeight: 700, color: 'var(--primary)', margin: '0 0 0.5rem 0', fontSize: '1.1rem' }}>SMTP Configuration Required</h3>
                      <p style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)', margin: 0, lineHeight: 1.5 }}>You must connect to an email provider before you can write or send emails.</p>
                    </div>
                    <Link to="/settings" style={{
                      marginTop: '0.5rem',
                      padding: '0.625rem 1.25rem',
                      backgroundColor: '#dc2626',
                      color: 'white',
                      textDecoration: 'none',
                      borderRadius: '0.5rem',
                      fontWeight: 600,
                      fontSize: '0.875rem',
                      transition: 'background-color 0.2s'
                    }}>
                      Setup Now
                    </Link>
                  </>
                )}
              </div>
            </div>
          )}
          <fieldset disabled={hasSmtp !== true} style={{ border: 'none', padding: 0, margin: 0 }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
            <div style={{ flex: 1 }}>
              <Textarea 
                label="Research Topic / Context" 
                value={researchPrompt} 
                onChange={(e) => setResearchPrompt(e.target.value)} 
                placeholder="e.g. A coffee equipment supplier reaching out to a local cafe owner about a new espresso machine" 
                rows={3}
              />
            </div>
            <div style={{ marginTop: '1.6rem' }}>
              <Button 
                onClick={handleResearch} 
                disabled={!researchPrompt || isResearching || hasSmtp === false} 
                isLoading={isResearching}
                variant="secondary"
              >
                Get AI Draft
              </Button>
            </div>
          </div>

          <form onSubmit={handleSend}>
            <Input 
              label="Recipient Email" 
              type="email" 
              value={recipientEmail} 
              onChange={(e) => setRecipientEmail(e.target.value)} 
              placeholder="jane@example.com" 
              required 
            />

            <Input 
              label="Subject" 
              value={subject} 
              onChange={(e) => setSubject(e.target.value)} 
              placeholder="Introduction from..." 
              required 
            />
            
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--slate-700)' }}>Email Body (HTML Supported)</label>
                <div style={{ display: 'flex', backgroundColor: 'var(--secondary)', padding: '0.25rem', borderRadius: '0.5rem' }}>
                  <button 
                    type="button"
                    onClick={() => setShowPreview(false)}
                    disabled={hasSmtp === false}
                    style={{ 
                      padding: '0.375rem 0.75rem', 
                      fontSize: '0.75rem', 
                      borderRadius: '0.375rem', 
                      border: 'none',
                      backgroundColor: !showPreview ? '#fff' : 'transparent',
                      color: !showPreview ? 'var(--primary)' : 'var(--muted-foreground)',
                      fontWeight: 600,
                      cursor: hasSmtp === false ? 'not-allowed' : 'pointer',
                      opacity: hasSmtp === false ? 0.6 : 1,
                      boxShadow: !showPreview && hasSmtp !== false ? '0 1px 2px rgba(0,0,0,0.05)' : 'none'
                    }}
                  >
                    Edit HTML
                  </button>
                  <button 
                    type="button"
                    onClick={() => setShowPreview(true)}
                    disabled={hasSmtp === false}
                    style={{ 
                      padding: '0.375rem 0.75rem', 
                      fontSize: '0.75rem', 
                      borderRadius: '0.375rem', 
                      border: 'none',
                      backgroundColor: showPreview ? '#fff' : 'transparent',
                      color: showPreview ? 'var(--primary)' : 'var(--muted-foreground)',
                      fontWeight: 600,
                      cursor: hasSmtp === false ? 'not-allowed' : 'pointer',
                      opacity: hasSmtp === false ? 0.6 : 1,
                      boxShadow: showPreview && hasSmtp !== false ? '0 1px 2px rgba(0,0,0,0.05)' : 'none'
                    }}
                  >
                    Preview
                  </button>
                </div>
              </div>

              {!showPreview ? (
                <Textarea 
                  label="" 
                  value={body} 
                  onChange={(e) => setBody(e.target.value)} 
                  placeholder="Hi {{name}}, ..." 
                  required 
                  rows={12}
                />
              ) : (
                <div 
                  style={{ 
                    border: '1px solid var(--border)', 
                    borderRadius: 'var(--radius)', 
                    padding: '1.5rem', 
                    backgroundColor: '#fff', 
                    minHeight: '300px',
                    maxHeight: '500px',
                    overflowY: 'auto'
                  }}
                  dangerouslySetInnerHTML={{ __html: body }}
                />
              )}
            </div>

            {containsPlaceholders && (
              <div style={{ 
                backgroundColor: 'var(--muted)', 
                border: '1px solid var(--border)', 
                padding: '1.5rem', 
                borderRadius: 'var(--radius)', 
                marginTop: '1.5rem',
                marginBottom: '1rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                  <span style={{ fontSize: '1.25rem' }}>✨</span>
                  <strong style={{ fontSize: '0.95rem', color: 'var(--primary)' }}>Refine Template Variables</strong>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  {placeholders.map(p => (
                    <Input 
                      key={p}
                      label={`Replace {{${p}}} with...`}
                      value={variableValues[p] || ''}
                      onChange={(e) => handleVariableChange(p, e.target.value)}
                      placeholder={`Enter ${p}...`}
                    />
                  ))}
                </div>
                <Button 
                  type="button" 
                  variant="secondary" 
                  onClick={handleApplyVariables}
                  style={{ marginTop: '1rem', width: 'auto', padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                  disabled={Object.values(variableValues).every(v => !v)}
                >
                  Apply to Template
                </Button>
              </div>
            )}

            <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
              <Button 
                type="submit" 
                isLoading={isSending} 
                variant="primary" 
                disabled={hasSmtp === false}
              >
                Send Outreach
              </Button>
            </div>
          </form>
        </fieldset>
        </div>
      </Card>
    </div>
  );
};
