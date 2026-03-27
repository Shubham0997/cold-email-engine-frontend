import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { api } from '../services/api';

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
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<CampaignDetailsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isResetting, setIsResetting] = useState(false);
  const [isStarting, setIsStarting] = useState(false);

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
  }, [id]);

  const handleReset = async () => {
    if (!id || !window.confirm('This will reset all recipients and RERUN the campaign. Are you sure?')) return;
    setIsResetting(true);
    try {
      await api.resetCampaign(id);
      await api.startCampaign(id);
      window.location.reload();
    } catch (err) {
      alert('Failed to reset and rerun campaign');
    } finally {
      setIsResetting(false);
    }
  };

  const handleStart = async () => {
    if (!id) return;
    setIsStarting(true);
    try {
      await api.startCampaign(id);
      window.location.reload();
    } catch (err) {
      alert('Failed to start campaign');
    } finally {
      setIsStarting(false);
    }
  };

  const containerStyle: React.CSSProperties = {
    maxWidth: '900px',
    margin: '2rem auto',
    padding: '0rem 1rem'
  };

  if (isLoading) return <div style={containerStyle}>Loading...</div>;
  if (!data) return <div style={containerStyle}>Campaign not found</div>;

  return (
    <div style={containerStyle}>
      <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <Link to="/campaigns" style={{ color: '#666', textDecoration: 'none', fontSize: '0.9rem' }}>
            &larr; Back to Campaigns
          </Link>
          <h1 style={{ marginTop: '0.5rem', color: '#111' }}>{data.campaign.name}</h1>
          <p style={{ color: '#666' }}>Created on {new Date(data.campaign.created_at).toLocaleString()}</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
          {data.campaign.status === 'DRAFT' && (
            <Button onClick={handleStart} variant="primary" isLoading={isStarting}>
              Start Campaign
            </Button>
          )}
          <Button onClick={() => navigate(`/campaigns/edit/${id}`)} variant="secondary">
            Edit Campaign
          </Button>
          <Button onClick={handleReset} variant="secondary" isLoading={isResetting}>
            Reset & Rerun
          </Button>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
        <div>
          <Card title="Campaign Info">
            <div style={{ fontSize: '0.9rem' }}>
              <p><strong>Status:</strong> {data.campaign.status}</p>
              <p><strong>Subject:</strong> {data.campaign.subject}</p>
              <div style={{ marginTop: '1rem' }}>
                <strong>Message:</strong>
                <pre style={{ 
                  whiteSpace: 'pre-wrap', 
                  backgroundColor: '#f8f9fa', 
                  padding: '10px', 
                  borderRadius: '4px',
                  fontSize: '0.8rem',
                  marginTop: '0.5rem'
                }}>
                  {data.campaign.body}
                </pre>
              </div>
            </div>
          </Card>
        </div>

        <div>
          <Card title="Recipients Status">
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #eee' }}>
                  <th style={{ padding: '0.5rem 0' }}>Email</th>
                  <th style={{ padding: '0.5rem 0' }}>Status</th>
                  <th style={{ padding: '0.5rem 0' }}>Opened At</th>
                </tr>
              </thead>
              <tbody>
                {data.recipients.map((r) => (
                  <tr key={r.id} style={{ borderBottom: '1px solid #f9f9f9' }}>
                    <td style={{ padding: '0.75rem 0', fontSize: '0.9rem' }}>{r.email}</td>
                    <td style={{ padding: '0.75rem 0' }}>
                      <span style={{ 
                        fontSize: '0.8rem', 
                        fontWeight: 600,
                        color: r.status === 'SENT' ? '#1e8e3e' : r.status === 'FAILED' ? '#d93025' : '#666'
                      }}>
                        {r.status}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem 0', fontSize: '0.8rem', color: '#666' }}>
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
