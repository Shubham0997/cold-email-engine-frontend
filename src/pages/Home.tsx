import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Textarea } from '../components/Textarea';
import { Card } from '../components/Card';

export const Home = () => {
  const [recipient, setRecipient] = useState('');
  const [subject, setSubject] = useState('Quick Message');
  const [message, setMessage] = useState('');
  const [prompt, setPrompt] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isResearching, setIsResearching] = useState(false);
  const [sendResult, setSendResult] = useState<{success: boolean, text: string} | null>(null);
  const [variableValues, setVariableValues] = useState<{[key: string]: string}>({});

  const extractPlaceholders = (text: string) => {
    const matches = text.match(/{{(.*?)}}/g);
    if (!matches) return [];
    return Array.from(new Set(matches.map(m => m.slice(2, -2))));
  };

  const placeholders = Array.from(new Set([
    ...extractPlaceholders(subject),
    ...extractPlaceholders(message)
  ])).filter(p => p !== 'email' && p !== 'Name'); // Filter out system ones if needed, but let's keep Name if it's there

  const containsPlaceholders = placeholders.length > 0;

  const handleVariableChange = (key: string, value: string) => {
    setVariableValues(prev => ({ ...prev, [key]: value }));
  };

  const applyVariables = () => {
    let newSubject = subject;
    let newMessage = message;
    Object.entries(variableValues).forEach(([key, val]) => {
      if (!val) return;
      const regex = new RegExp(`{{${key}}}`, 'g');
      newSubject = newSubject.replace(regex, val);
      newMessage = newMessage.replace(regex, val);
    });
    setSubject(newSubject);
    setMessage(newMessage);
    setVariableValues({});
  };

  const handleAIResearch = async () => {
    if (!prompt) return;
    setIsResearching(true);
    try {
      const res = await api.research(prompt);
      setSubject(res.subject);
      setMessage(res.body);
    } catch (err) {
      alert('AI Research failed. Check your API key.');
    } finally {
      setIsResearching(false);
    }
  };

  const handleQuickSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipient || !message) return;
    
    if (containsPlaceholders) {
      if (!window.confirm('We detected unreplaced placeholders like {{Name}} in your email. Are you sure you want to send it as is?')) {
        return;
      }
    }

    setIsSending(true);
    setSendResult(null);
    try {
      const res = await api.sendSingleEmail(recipient, message, subject);
      setSendResult({ success: true, text: `Success! Email ID: ${res.email_id}` });
      setRecipient('');
      setSubject('Quick Message');
      setMessage('');
    } catch (err) {
      setSendResult({ success: false, text: 'Failed to send email.' });
    } finally {
      setIsSending(false);
    }
  };

  const containerStyle: React.CSSProperties = {
    maxWidth: '800px',
    margin: '3rem auto',
    padding: '0 1rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem'
  };

  return (
    <div style={containerStyle}>
      <header style={{ textAlign: 'center', marginBottom: '1rem' }}>
        <h1 style={{ marginBottom: '0.5rem', color: '#111' }}>Cold Email Engine</h1>
        <Link to="/stats" style={{ color: '#0066ff', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600 }}>
          Go to Analytics Dashboard &rarr;
        </Link>
      </header>
      
      <Card title="Send Tracked Email">
        <form onSubmit={handleQuickSend}>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end', marginBottom: '1.5rem' }}>
            <div style={{ flex: 1 }}>
              <Textarea 
                id="ai-prompt"
                label="AI Research Prompt (Optional)" 
                value={prompt} 
                onChange={(e) => setPrompt(e.target.value)} 
                placeholder="e.g. Write a cold email for a coffee roasting partnership" 
                rows={3}
              />
            </div>
            <div style={{ marginBottom: '1.1rem' }}>
              <Button 
                type="button" 
                onClick={handleAIResearch} 
                disabled={!prompt || isResearching}
                variant="secondary"
                style={{ padding: '0.6rem 1.2rem'}}
                isLoading={isResearching}
              >
                {isResearching ? 'Researching...' : 'AI Research'}
              </Button>
            </div>
          </div>

          <Input 
            id="quick-recipient"
            label="Recipient Email" 
            type="email" 
            value={recipient} 
            onChange={(e) => setRecipient(e.target.value)} 
            placeholder="john@example.com" 
            required 
          />
          <Input 
            id="quick-subject"
            label="Email Subject" 
            type="text" 
            value={subject} 
            onChange={(e) => setSubject(e.target.value)} 
            placeholder="Quick Message" 
            required 
          />
          <Textarea 
            id="quick-message"
            label="Message Content" 
            value={message} 
            onChange={(e) => setMessage(e.target.value)} 
            placeholder="Hi John, I'd like to reach out regarding..." 
            required 
          />

          {containsPlaceholders && (
            <div style={{ 
              backgroundColor: '#f8fafc', 
              border: '1px solid #e2e8f0', 
              padding: '1.25rem', 
              borderRadius: '12px', 
              marginBottom: '1.5rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <span style={{ fontSize: '1.2rem' }}>✨</span>
                <strong style={{ fontSize: '0.95rem', color: '#334155' }}>Refine Variables</strong>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                {placeholders.map(p => (
                  <Input 
                    key={p}
                    id={`var-${p}`}
                    label={`Value for {{${p}}}`}
                    value={variableValues[p] || ''}
                    onChange={(e) => handleVariableChange(p, e.target.value)}
                    placeholder={`Enter ${p}...`}
                  />
                ))}
              </div>
              <Button 
                type="button" 
                variant="secondary" 
                onClick={applyVariables}
                style={{ marginTop: '0.5rem', width: 'auto', padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                disabled={Object.values(variableValues).every(v => !v)}
              >
                Apply to Message
              </Button>
            </div>
          )}

          <Button type="submit" isLoading={isSending} disabled={!recipient || !message}>
            {isSending ? 'Sending...' : 'Send with Tracking'}
          </Button>
          {sendResult && (
            <p style={{ marginTop: '1rem', color: sendResult.success ? 'green' : 'red', fontSize: '0.9rem' }}>
              {sendResult.text}
            </p>
          )}
        </form>
      </Card>
    </div>
  );
};
