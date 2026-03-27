import { useState } from 'react';
import { api } from '../services/api';
import { Card } from '../components/Card';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { Textarea } from '../components/Textarea';
import { useToast } from '../context/ToastContext';
import { extractPlaceholders, applyVariables } from '../utils/emailUtils';

export const Home = () => {
  const { showToast } = useToast();
  const [researchPrompt, setResearchPrompt] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [isResearching, setIsResearching] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [variableValues, setVariableValues] = useState<{[key: string]: string}>({});

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
              disabled={!researchPrompt || isResearching} 
              isLoading={isResearching}
              variant="secondary"
            >
              Get AI Draft
            </Button>
          </div>
        </div>

        <form onSubmit={handleSend}>
          <div style={{ marginBottom: '1rem' }}>
            <Input 
              label="Recipient Email" 
              type="email" 
              value={recipientEmail} 
              onChange={(e) => setRecipientEmail(e.target.value)} 
              placeholder="jane@example.com" 
              required 
            />
          </div>

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
                  style={{ 
                    padding: '0.375rem 0.75rem', 
                    fontSize: '0.75rem', 
                    borderRadius: '0.375rem', 
                    border: 'none',
                    backgroundColor: !showPreview ? '#fff' : 'transparent',
                    color: !showPreview ? 'var(--primary)' : 'var(--muted-foreground)',
                    fontWeight: 600,
                    cursor: 'pointer',
                    boxShadow: !showPreview ? '0 1px 2px rgba(0,0,0,0.05)' : 'none'
                  }}
                >
                  Edit HTML
                </button>
                <button 
                  type="button"
                  onClick={() => setShowPreview(true)}
                  style={{ 
                    padding: '0.375rem 0.75rem', 
                    fontSize: '0.75rem', 
                    borderRadius: '0.375rem', 
                    border: 'none',
                    backgroundColor: showPreview ? '#fff' : 'transparent',
                    color: showPreview ? 'var(--primary)' : 'var(--muted-foreground)',
                    fontWeight: 600,
                    cursor: 'pointer',
                    boxShadow: showPreview ? '0 1px 2px rgba(0,0,0,0.05)' : 'none'
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

          <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: '2rem' }}>
            <Button type="submit" isLoading={isSending} disabled={isSending}>
              Send Outreach
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
