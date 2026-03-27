import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, EmailStats } from '../services/api';
import { Card } from '../components/Card';

export const Dashboard = () => {
  const [stats, setStats] = useState<EmailStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState('');
  
  // Filter state
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [campaignFilter, setCampaignFilter] = useState('all');
  useEffect(() => {
    const fetchData = () => {
      api.getStats()
        .then(data => {
          setStats(data);
          setLoading(false);
          setIsRefreshing(false);
        })
        .catch(() => {
          setError('Failed to load real-time analytics.');
          setLoading(false);
          setIsRefreshing(false);
        });
    };

    fetchData();
    
    // Auto-refresh every 2 minutes
    const interval = setInterval(fetchData, 120000);
    return () => clearInterval(interval);
  }, []);

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    api.getStats()
      .then(data => {
        setStats(data);
        setIsRefreshing(false);
      })
      .catch(() => {
        setIsRefreshing(false);
      });
  };

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


  const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1rem',
    marginBottom: '1rem'
  };

  const statBoxStyle: React.CSSProperties = {
    padding: '2rem 1.5rem',
    backgroundColor: '#fff',
    borderRadius: '1rem',
    border: '1px solid var(--border)',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
    textAlign: 'center'
  };

  return (
    <div className="container-wide" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <Link to="/" style={{ color: '#0066ff', textDecoration: 'none', fontWeight: 600 }}>&larr; Back to Outreach Assistant</Link>
      
      <div>
        <h1 style={{ marginTop: 0, marginBottom: '0.25rem', fontSize: '2rem', letterSpacing: '-0.025em' }}>Real-time Analytics</h1>
        <p style={{ color: 'var(--muted-foreground)', margin: 0, fontSize: '0.925rem' }}>Comprehensive performance data from Neon DB</p>
      </div>

      <div style={gridStyle}>
        <div style={statBoxStyle}>
          <h3 style={{ margin: 0, color: 'var(--muted-foreground)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Sent</h3>
          <p style={{ fontSize: '2.5rem', fontWeight: 800, margin: '0.5rem 0 0', color: 'var(--primary)', letterSpacing: '-0.025em' }}>{totalSent}</p>
        </div>
        <div style={statBoxStyle}>
          <h3 style={{ margin: 0, color: 'var(--muted-foreground)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Unique Opens</h3>
          <p style={{ fontSize: '2.5rem', fontWeight: 800, margin: '0.5rem 0 0', color: '#10b981', letterSpacing: '-0.025em' }}>{uniqueOpens}</p>
        </div>
        <div style={statBoxStyle}>
          <h3 style={{ margin: 0, color: 'var(--muted-foreground)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Open Rate</h3>
          <p style={{ fontSize: '2.5rem', fontWeight: 800, margin: '0.5rem 0 0', color: 'var(--accent)', letterSpacing: '-0.025em' }}>{openRate}%</p>
        </div>
      </div>

      <Card 
        title="Tracking History"
        headerAction={
          <button 
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            style={{
              fontSize: '0.8125rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem',
              padding: '0.375rem 0.75rem',
              borderRadius: '0.5rem',
              border: '1px solid var(--border)',
              backgroundColor: '#fff',
              cursor: isRefreshing ? 'not-allowed' : 'pointer',
              fontWeight: 600,
              transition: 'all 0.2s'
            }}
          >
            <div style={{ 
              animation: isRefreshing ? 'spin 1s linear infinite' : 'none',
              display: 'flex'
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 4v6h-6"/><path d="M1 20v-6h6"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
              </svg>
            </div>
            {isRefreshing ? 'Refreshing...' : 'Refresh History'}
          </button>
        }
      >
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
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--muted-foreground)', letterSpacing: '0.05em' }}>Recipient</th>
                <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--muted-foreground)', letterSpacing: '0.05em' }}>Campaign</th>
                <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--muted-foreground)', letterSpacing: '0.05em' }}>Subject</th>
                <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--muted-foreground)', letterSpacing: '0.05em' }}>Status</th>
                <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--muted-foreground)', letterSpacing: '0.05em' }}>Sent At</th>
                <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--muted-foreground)', letterSpacing: '0.05em' }}>Last Activity</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmails.map((email, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '1rem', fontWeight: 600, color: 'var(--primary)', fontSize: '0.875rem' }}>{email.recipient_email}</td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ fontWeight: 600, color: 'var(--accent)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.025em' }}>
                      {email.campaign_name}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', color: 'var(--muted-foreground)', fontSize: '0.875rem' }}>{email.subject}</td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ 
                      padding: '0.375rem 0.625rem', 
                      borderRadius: '2rem', 
                      fontSize: '0.75rem', 
                      fontWeight: 600,
                      backgroundColor: email.status === 'OPENED' ? '#ecfdf5' : 'var(--secondary)',
                      color: email.status === 'OPENED' ? '#059669' : 'var(--slate-700)',
                      border: '1px solid currentColor'
                    }}>
                      {email.status}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', color: 'var(--muted-foreground)', fontSize: '0.875rem' }}>
                    {new Date(email.created_at).toLocaleString()}
                  </td>
                  <td style={{ padding: '1rem', color: 'var(--muted-foreground)', fontSize: '0.875rem' }}>
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
