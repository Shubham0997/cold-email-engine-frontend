import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, Campaign } from '../services/api';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { useToast } from '../context/ToastContext';
import { useConfirm } from '../context/ConfirmContext';
import { useLoading } from '../context/LoadingContext';

export const CampaignList = () => {
  const { showToast } = useToast();
  const { confirm } = useConfirm();
  const { setIsLoading: setGlobalLoading } = useLoading();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.getCampaigns()
      .then(setCampaigns)
      .catch((err: any) => console.error('Failed to load campaigns', err))
      .finally(() => setIsLoading(false));
  }, []);

  const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Campaign',
      message: 'Are you sure you want to delete this campaign?',
      confirmLabel: 'Delete',
      variant: 'danger'
    });
    if (!confirmed) return;
    
    setGlobalLoading(true, 'Deleting Campaign...');
    try {
      await api.deleteCampaign(id);
      setCampaigns(prev => prev.filter(c => c.id !== id));
      showToast('Campaign deleted successfully');
    } catch (err) {
      showToast('Failed to delete campaign', 'error');
    } finally {
      setGlobalLoading(false);
    }
  };

  if (isLoading) return <div className="container-wide">Loading campaigns...</div>;

  return (
    <div className="container-wide">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.875rem' }}>Outreach Campaigns</h1>
          <p style={{ color: 'var(--muted-foreground)', margin: '0.5rem 0 0', fontSize: '0.925rem' }}>Manage your sequences and lead lists</p>
        </div>
        <Link to="/campaigns/create">
          <Button variant="primary">+ New Campaign</Button>
        </Link>
      </div>

      <Card title="All Campaigns">
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--muted-foreground)', letterSpacing: '0.05em' }}>Name</th>
              <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--muted-foreground)', letterSpacing: '0.05em' }}>Subject Template</th>
              <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--muted-foreground)', letterSpacing: '0.05em' }}>Status</th>
              <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--muted-foreground)', letterSpacing: '0.05em' }}>Created</th>
              <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--muted-foreground)', letterSpacing: '0.05em' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {campaigns.map((c) => (
              <tr key={c.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '1rem', fontWeight: 600, color: 'var(--primary)' }}>{c.name}</td>
                <td style={{ padding: '1rem', color: 'var(--muted-foreground)', fontSize: '0.875rem' }}>{c.subject}</td>
                <td style={{ padding: '1rem' }}>
                  <span style={{ 
                    padding: '0.375rem 0.625rem', 
                    borderRadius: '2rem', 
                    fontSize: '0.75rem', 
                    fontWeight: 600,
                    backgroundColor: c.status === 'COMPLETED' ? '#ecfdf5' : 'var(--secondary)',
                    color: c.status === 'COMPLETED' ? '#059669' : 'var(--slate-700)',
                    border: '1px solid currentColor',
                    display: 'inline-flex',
                    alignItems: 'center'
                  }}>
                    {c.status}
                  </span>
                </td>
                <td style={{ padding: '1rem', color: 'var(--muted-foreground)', fontSize: '0.875rem' }}>
                  {new Date(c.created_at).toLocaleDateString()}
                </td>
                <td style={{ padding: '1rem', display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
                  <Link 
                    to={`/campaigns/${c.id}`} 
                    style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 600, fontSize: '0.875rem' }}
                  >
                    View
                  </Link>
                  <button 
                    onClick={() => handleDelete(c.id)}
                    style={{ 
                      background: 'none', 
                      border: 'none', 
                      color: '#ef4444', 
                      cursor: 'pointer', 
                      fontWeight: 600, 
                      fontSize: '0.875rem',
                      padding: 0
                    }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {campaigns.length === 0 && (
              <tr>
                <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: '#999' }}>No campaigns found. Start one!</td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
};
