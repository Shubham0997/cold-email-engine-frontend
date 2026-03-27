import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Textarea } from '../components/Textarea';
import { Card } from '../components/Card';

export const Home = () => {
  const [recipient, setRecipient] = useState('');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sendResult, setSendResult] = useState<{success: boolean, text: string} | null>(null);

  const handleQuickSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipient || !message) return;
    setIsSending(true);
    setSendResult(null);
    try {
      const res = await api.sendSingleEmail(recipient, message);
      setSendResult({ success: true, text: `Success! Email ID: ${res.email_id}` });
      setRecipient('');
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
