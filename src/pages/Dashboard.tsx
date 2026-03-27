import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, EmailStats } from '../services/api';
import { Card } from '../components/Card';

export const Dashboard = () => {
  const [stats, setStats] = useState<EmailStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getStats()
      .then(data => {
        setStats(data);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load real-time analytics.');
        setLoading(false);
      });
  }, []);

  if (loading) return <div style={{ padding: '3rem', textAlign: 'center' }}>Loading analytics...</div>;
  if (error || !stats) return <div style={{ padding: '3rem', textAlign: 'center', color: 'red' }}>{error}</div>;

  const containerStyle: React.CSSProperties = {
    maxWidth: '1000px',
    margin: '3rem auto',
    padding: '0 1rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem'
  };

  const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1rem',
    marginBottom: '1rem'
  };

  const statBoxStyle: React.CSSProperties = {
    padding: '1.5rem',
    backgroundColor: '#fff',
    borderRadius: '12px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    textAlign: 'center'
  };

  return (
    <div style={containerStyle}>
      <Link to="/" style={{ color: '#0066ff', textDecoration: 'none', fontWeight: 600 }}>&larr; Back to Sender</Link>
      
      <div>
        <h1 style={{ marginTop: 0, marginBottom: '0.25rem' }}>Email Analytics</h1>
        <p style={{ color: '#666', margin: 0 }}>Real-time tracking data from Neon DB</p>
      </div>

      <div style={gridStyle}>
        <div style={statBoxStyle}>
          <h3 style={{ margin: 0, color: '#666', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Sent</h3>
          <p style={{ fontSize: '2.5rem', fontWeight: 800, margin: '0.5rem 0 0', color: '#111' }}>{stats.total_emails}</p>
        </div>
        <div style={statBoxStyle}>
          <h3 style={{ margin: 0, color: '#666', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Unique Opens</h3>
          <p style={{ fontSize: '2.5rem', fontWeight: 800, margin: '0.5rem 0 0', color: '#137333' }}>{stats.opened_emails}</p>
        </div>
        <div style={statBoxStyle}>
          <h3 style={{ margin: 0, color: '#666', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Open Rate</h3>
          <p style={{ fontSize: '2.5rem', fontWeight: 800, margin: '0.5rem 0 0', color: '#0066ff' }}>{stats.open_rate}%</p>
        </div>
      </div>

      <Card title="Tracking History">
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #f3f4f6' }}>
                <th style={{ padding: '1rem', color: '#4b5563', fontWeight: 600 }}>Recipient</th>
                <th style={{ padding: '1rem', color: '#4b5563', fontWeight: 600 }}>Status</th>
                <th style={{ padding: '1rem', color: '#4b5563', fontWeight: 600 }}>Last Activity</th>
              </tr>
            </thead>
            <tbody>
              {stats.emails.map((email, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '1rem', fontWeight: 500 }}>{email.recipient_email}</td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ 
                      display: 'inline-block', 
                      padding: '0.25rem 0.75rem', 
                      borderRadius: '9999px', 
                      fontSize: '0.75rem', 
                      fontWeight: 700,
                      backgroundColor: email.status === 'OPENED' ? '#dcfce7' : '#f3f4f6',
                      color: email.status === 'OPENED' ? '#166534' : '#374151'
                    }}>
                      {email.status}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', color: '#6b7280', fontSize: '0.875rem' }}>
                    {email.opened_at ? new Date(email.opened_at).toLocaleString() : 'Not yet opened'}
                  </td>
                </tr>
              ))}
              {stats.emails.length === 0 && (
                <tr>
                  <td colSpan={3} style={{ padding: '2rem', textAlign: 'center', color: '#9ca3af' }}>No emails tracked yet. Start by sending one from the home page.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
