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

  const hasPlaceholders = (text: string) => /{{.*?}}/.test(text);
  const containsPlaceholders = hasPlaceholders(subject) || hasPlaceholders(message);

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
              backgroundColor: '#fffbeb', 
              border: '1px solid #fef3c7', 
              padding: '0.75rem', 
              borderRadius: '8px', 
              marginBottom: '1.5rem',
              display: 'flex',
              gap: '0.5rem',
              alignItems: 'center',
              color: '#92400e',
              fontSize: '0.85rem'
            }}>
              <span style={{ fontSize: '1.2rem' }}>⚠️</span>
              <div>
                <strong>Placeholders detected!</strong> Please make sure to replace items like <code>{"{{Name}}"}</code> before sending.
              </div>
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
