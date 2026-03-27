import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, EmailStats } from '../services/api';
import { Card } from '../components/Card';

export const Dashboard = () => {
  const [stats, setStats] = useState<EmailStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filter state
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [campaignFilter, setCampaignFilter] = useState('all');

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

  const filteredEmails = stats?.emails.filter(email => {
    // Date range filter
    const sentDateStr = new Date(email.created_at).toISOString().split('T')[0];
    
    if (fromDate && sentDateStr < fromDate) return false;
    if (toDate && sentDateStr > toDate) return false;
    
    // Campaign filter
    if (campaignFilter !== 'all') {
      if (email.campaign_name !== campaignFilter) return false;
    }
    
    return true;
  }) || [];

  const campaigns = Array.from(new Set(stats?.emails.map(e => e.campaign_name).filter(Boolean))) as string[];

  // Dynamic Metrics
  const totalSent = filteredEmails.length;
  const uniqueOpens = filteredEmails.filter(e => e.status === 'OPENED').length;
  const openRate = totalSent > 0 ? ((uniqueOpens / totalSent) * 100).toFixed(1) : '0.0';

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
          <p style={{ fontSize: '2.5rem', fontWeight: 800, margin: '0.5rem 0 0', color: '#111' }}>{totalSent}</p>
        </div>
        <div style={statBoxStyle}>
          <h3 style={{ margin: 0, color: '#666', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Unique Opens</h3>
          <p style={{ fontSize: '2.5rem', fontWeight: 800, margin: '0.5rem 0 0', color: '#137333' }}>{uniqueOpens}</p>
        </div>
        <div style={statBoxStyle}>
          <h3 style={{ margin: 0, color: '#666', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Open Rate</h3>
          <p style={{ fontSize: '2.5rem', fontWeight: 800, margin: '0.5rem 0 0', color: '#0066ff' }}>{openRate}%</p>
        </div>
      </div>

      <Card title="Tracking History">
        <div style={{ 
          display: 'flex', 
          gap: '1rem', 
          marginBottom: '1.5rem', 
          flexWrap: 'wrap',
          alignItems: 'flex-end',
          padding: '0 0.5rem'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#666' }}>From Date</label>
            <input 
              type="date" 
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              style={{ 
                padding: '0.5rem', 
                borderRadius: '6px', 
                border: '1px solid #ddd',
                fontSize: '0.875rem'
              }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#666' }}>To Date</label>
            <input 
              type="date" 
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              style={{ 
                padding: '0.5rem', 
                borderRadius: '6px', 
                border: '1px solid #ddd',
                fontSize: '0.875rem'
              }}
            />
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#666' }}>Campaign</label>
            <select 
              value={campaignFilter}
              onChange={(e) => setCampaignFilter(e.target.value)}
              style={{ 
                padding: '0.5rem', 
                borderRadius: '6px', 
                border: '1px solid #ddd',
                fontSize: '0.875rem',
                minWidth: '150px'
              }}
            >
              <option value="all">All Campaigns</option>
              {campaigns.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          
          {(fromDate || toDate || campaignFilter !== 'all') && (
            <button 
              onClick={() => { setFromDate(''); setToDate(''); setCampaignFilter('all'); }}
              style={{ 
                padding: '0.5rem 1rem', 
                borderRadius: '6px', 
                border: 'none',
                backgroundColor: '#f3f4f6',
                color: '#374151',
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Clear Filters
            </button>
          )}
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #f3f4f6' }}>
                <th style={{ padding: '1rem', color: '#4b5563', fontWeight: 600 }}>Recipient</th>
                <th style={{ padding: '1rem', color: '#4b5563', fontWeight: 600 }}>Campaign</th>
                <th style={{ padding: '1rem', color: '#4b5563', fontWeight: 600 }}>Subject</th>
                <th style={{ padding: '1rem', color: '#4b5563', fontWeight: 600 }}>Status</th>
                <th style={{ padding: '1rem', color: '#4b5563', fontWeight: 600 }}>Sent At</th>
                <th style={{ padding: '1rem', color: '#4b5563', fontWeight: 600 }}>Last Activity</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmails.map((email, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '1rem', fontWeight: 500 }}>{email.recipient_email}</td>
                  <td style={{ padding: '1rem', color: '#0066ff', fontWeight: 600, fontSize: '0.8rem' }}>{email.campaign_name}</td>
                  <td style={{ padding: '1rem', color: '#4b5563' }}>{email.subject}</td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ 
                      display: 'inline-block', 
                      padding: '0.25rem 0.75rem', 
                      borderRadius: '9999px', 
                      fontSize: '0.75rem', 
                      fontWeight: 700,
                      backgroundColor: email.status === 'OPENED' ? '#dcfce7' : '#f3f4f6',
                      color: email.status === 'OPENED' ? '#166533' : '#374151'
                    }}>
                      {email.status}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', color: '#6b7280', fontSize: '0.875rem' }}>
                    {new Date(email.created_at).toLocaleString()}
                  </td>
                  <td style={{ padding: '1rem', color: '#6b7280', fontSize: '0.875rem' }}>
                    {email.opened_at ? new Date(email.opened_at).toLocaleString() : 'Not yet opened'}
                  </td>
                </tr>
              ))}
              {filteredEmails.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: '#9ca3af' }}>No emails match the selected filters.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
