import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Textarea } from '../components/Textarea';
import { Card } from '../components/Card';

interface EmailRecord {
  id: string;
  recipient_email: string;
  subject: string;
  status: string;
  created_at: string;
  opened_at: string | null;
}

export const Home = () => {
  const [recipient, setRecipient] = useState('');
  const [subject, setSubject] = useState('Quick Message');
  const [message, setMessage] = useState('');
  const [emails, setEmails] = useState<EmailRecord[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sendResult, setSendResult] = useState<{success: boolean, text: string} | null>(null);

  const fetchEmails = useCallback(async () => {
    try {
      const stats = await api.getStats();
      setEmails(stats.emails || []);
    } catch (err) {
      console.error('Failed to fetch emails', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEmails();
    const interval = setInterval(fetchEmails, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, [fetchEmails]);

  const handleQuickSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipient || !message) return;
    setIsSending(true);
    setSendResult(null);
    try {
      const res = await api.sendSingleEmail(recipient, message, subject);
      setSendResult({ success: true, text: `Success! Email ID: ${res.email_id}` });
      setRecipient('');
      setSubject('Quick Message');
      setMessage('');
      fetchEmails();
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

      <Card title="Recent Activity">
        {loading && emails.length === 0 ? (
          <p>Loading history...</p>
        ) : emails.length === 0 ? (
          <p style={{ color: '#666', fontStyle: 'italic' }}>No emails sent yet.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #eee' }}>
                  <th style={{ padding: '0.75rem 0' }}>Recipient</th>
                  <th style={{ padding: '0.75rem 0' }}>Subject</th>
                  <th style={{ padding: '0.75rem 0' }}>Status</th>
                  <th style={{ padding: '0.75rem 0' }}>Sent At</th>
                </tr>
              </thead>
              <tbody>
                {emails.slice(0, 10).map((email) => (
                  <tr key={email.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                    <td style={{ padding: '0.75rem 0' }}>{email.recipient_email}</td>
                    <td style={{ padding: '0.75rem 0' }}>{email.subject}</td>
                    <td style={{ padding: '0.75rem 0' }}>
                      <span style={{ 
                        padding: '2px 8px', 
                        borderRadius: '12px', 
                        fontSize: '0.75rem', 
                        fontWeight: 600,
                        backgroundColor: email.status === 'OPENED' ? '#e6f4ea' : '#f1f3f4',
                        color: email.status === 'OPENED' ? '#1e8e3e' : '#5f6368'
                      }}>
                        {email.status}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem 0', color: '#666' }}>
                      {new Date(email.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};
