import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { useConfirm } from '../context/ConfirmContext';
import { useLoading } from '../context/LoadingContext';

interface Recipient {
  id: string;
  email: string;
  status: string;
  opened_at?: string;
}

interface CampaignDetailsData {
  campaign: {
    id: string;
    name: string;
    subject: string;
    body: string;
    status: string;
    created_at: string;
  };
  recipients: Recipient[];
}

export const CampaignDetails = () => {
  const { showToast } = useToast();
  const { confirm } = useConfirm();
  const { setIsLoading: setGlobalLoading } = useLoading();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<CampaignDetailsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isResetting, setIsResetting] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showRaw, setShowRaw] = useState(false);

  useEffect(() => {
    const fetchDetails = async () => {
      if (!id) return;
      try {
        const result = await api.getCampaignDetails(id);
        setData(result);
      } catch (err) {
        console.error('Failed to fetch campaign details', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDetails();
    
    // Auto-refresh every 2 minutes
    const interval = setInterval(fetchDetails, 120000);
    return () => clearInterval(interval);
  }, [id]);

  const handleManualRefresh = async () => {
    if (!id) return;
    setIsRefreshing(true);
    try {
      const resp = await api.getCampaignDetails(id);
      setData(resp);
      showToast('Status updated', 'success');
    } catch (err) {
      showToast('Failed to refresh status', 'error');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    const confirmed = await confirm({
      title: 'Delete Campaign',
      message: 'Are you sure you want to PERMANENTLY delete this campaign? This action cannot be undone.',
      confirmLabel: 'Delete',
      variant: 'danger'
    });
    if (!confirmed) return;
    
    setGlobalLoading(true, 'Deleting Campaign...');
    try {
      await api.deleteCampaign(id);
      navigate('/campaigns');
    } catch (err) {
      showToast('Failed to delete campaign', 'error');
    } finally {
      setGlobalLoading(false);
    }
  };

  const handleReset = async () => {
    if (!id) return;
    const confirmed = await confirm({
      title: 'Reset & Rerun',
      message: 'This will reset all recipients and RERUN the campaign. Are you sure?',
      confirmLabel: 'Reset & Rerun',
    });
    if (!confirmed) return;

    setGlobalLoading(true, 'Resetting & Rerunning Campaign...');
    setIsResetting(true);
    try {
      await api.resetCampaign(id);
      await api.startCampaign(id);
      window.location.reload();
    } catch (err) {
      showToast('Failed to reset and rerun campaign', 'error');
    } finally {
      setIsResetting(false);
      setGlobalLoading(false);
    }
  };

  const handleStart = async () => {
    if (!id) return;
    setGlobalLoading(true, 'Starting Campaign...');
    setIsStarting(true);
    try {
      await api.startCampaign(id);
      window.location.reload();
    } catch (err) {
      showToast('Failed to start campaign', 'error');
    } finally {
      setIsStarting(false);
      setGlobalLoading(false);
    }
  };

  if (isLoading) return <div className="container-wide">Loading...</div>;
  if (!data) return <div className="container-wide">Campaign not found</div>;

  return (
    <div className="container-wide">
      <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <Link to="/campaigns" style={{ color: 'var(--muted-foreground)', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
             &larr; Campaigns
          </Link>
          <h1 style={{ marginTop: '0.75rem', color: 'var(--primary)', fontSize: '2rem', letterSpacing: '-0.025em' }}>{data.campaign.name}</h1>
          <p style={{ color: 'var(--muted-foreground)', fontSize: '0.875rem', margin: '0.25rem 0 0' }}>Created on {new Date(data.campaign.created_at).toLocaleString()}</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
          {data.campaign.status === 'DRAFT' && (
            <Button onClick={handleStart} variant="primary" isLoading={isStarting}>
              Start Campaign
            </Button>
          )}
          <Button onClick={() => navigate(`/campaigns/edit/${id}`)} variant="secondary">
            Edit
          </Button>
          <Button onClick={handleReset} variant="secondary" isLoading={isResetting}>
            Reset & Rerun
          </Button>
          <Button 
            onClick={handleDelete} 
            variant="outline" 
            style={{ color: '#ef4444', borderColor: '#fee2e2' }}
          >
            Delete
          </Button>
        </div>
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div>
          <Card title="Campaign Info">
            <div style={{ fontSize: '0.9rem' }}>
              <p><strong>Status:</strong> {data.campaign.status}</p>
              <p><strong>Subject:</strong> {data.campaign.subject}</p>
              <div style={{ marginTop: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <strong style={{ color: 'var(--primary)', fontSize: '0.875rem' }}>Email Template</strong>
                  <button 
                    onClick={() => setShowRaw(!showRaw)} 
                    style={{ 
                      fontSize: '0.75rem', 
                      padding: '0.375rem 0.625rem', 
                      cursor: 'pointer',
                      borderRadius: '0.5rem',
                      border: '1px solid var(--border)',
                      backgroundColor: '#fff',
                      fontWeight: 600,
                      color: 'var(--muted-foreground)',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                    }}
                  >
                    {showRaw ? 'Show Preview' : 'Show Source'}
                  </button>
                </div>
                
                {!showRaw ? (
                  <div 
                    style={{ 
                      backgroundColor: '#fff', 
                      border: '1px solid var(--border)',
                      padding: '1.25rem', 
                      borderRadius: 'var(--radius)',
                      fontSize: '0.875rem',
                      marginTop: '0.5rem'
                    }}
                    dangerouslySetInnerHTML={{ __html: data.campaign.body }}
                  />
                ) : (
                  <pre style={{ 
                    whiteSpace: 'pre-wrap', 
                    backgroundColor: 'var(--secondary)', 
                    padding: '1rem', 
                    borderRadius: 'var(--radius)',
                    fontSize: '0.8rem',
                    color: 'var(--slate-700)',
                    marginTop: '0.5rem',
                    border: '1px solid var(--border)'
                  }}>
                    {data.campaign.body}
                  </pre>
                )}
              </div>
            </div>
          </Card>
        </div>

        <div id="recipients-section">
          <Card 
            title="Recipients Status" 
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
                {isRefreshing ? 'Refreshing...' : 'Refresh Status'}
              </button>
            }
          >
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '0.75rem 0', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--muted-foreground)', letterSpacing: '0.05em' }}>Email</th>
                  <th style={{ padding: '0.75rem 0', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--muted-foreground)', letterSpacing: '0.05em' }}>Status</th>
                  <th style={{ padding: '0.75rem 0', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--muted-foreground)', letterSpacing: '0.05em' }}>Opened At</th>
                </tr>
              </thead>
              <tbody>
                {data.recipients.map((r) => (
                  <tr key={r.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '1rem 0', fontSize: '0.875rem', fontWeight: 500, color: 'var(--primary)' }}>{r.email}</td>
                    <td style={{ padding: '1rem 0' }}>
                      <span style={{ 
                        fontSize: '0.75rem', 
                        fontWeight: 600,
                        padding: '0.25rem 0.5rem',
                        borderRadius: '0.375rem',
                        backgroundColor: r.status === 'SENT' ? '#ecfdf5' : r.status === 'FAILED' ? '#fef2f2' : 'var(--secondary)',
                        color: r.status === 'SENT' ? '#059669' : r.status === 'FAILED' ? '#dc2626' : 'var(--slate-700)',
                        border: '1px solid currentColor'
                      }}>
                        {r.status}
                      </span>
                    </td>
                    <td style={{ padding: '1rem 0', fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>
                      {r.opened_at ? new Date(r.opened_at).toLocaleString() : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
      </div>
    </div>
  );
};
