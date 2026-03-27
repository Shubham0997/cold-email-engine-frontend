import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { api } from '../services/api';

interface Campaign {
  id: string;
  name: string;
  status: string;
  total_recipients: number;
  created_at: string;
}

export const CampaignList = () => {
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const data = await api.getCampaigns();
        setCampaigns(data);
      } catch (err) {
        console.error('Failed to fetch campaigns', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCampaigns();
  }, []);

  const containerStyle: React.CSSProperties = {
    maxWidth: '900px',
    margin: '2rem auto',
    padding: '0 1rem'
  };

  if (isLoading) {
    return <div style={containerStyle}><Card title="Campaigns">Loading campaigns...</Card></div>;
  }

  return (
    <div style={containerStyle}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ color: '#111' }}>Email Campaigns</h1>
        <Button onClick={() => navigate('/campaigns/create')} variant="primary">
          + Create New Campaign
        </Button>
      </header>

      <Card title="Your Campaigns">
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #eee' }}>
                <th style={{ padding: '1rem 0' }}>Campaign Name</th>
                <th style={{ padding: '1rem 0' }}>Status</th>
                <th style={{ padding: '1rem 0' }}>Recipients</th>
                <th style={{ padding: '1rem 0' }}>Created At</th>
                <th style={{ padding: '1rem 0' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
                    No campaigns found. Start by creating one!
                  </td>
                </tr>
              ) : (
                campaigns.map((camp) => (
                  <tr key={camp.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                    <td style={{ padding: '1rem 0', fontWeight: 600 }}>{camp.name}</td>
                    <td style={{ padding: '1rem 0' }}>
                      <span style={{ 
                        padding: '4px 8px', 
                        borderRadius: '12px', 
                        fontSize: '0.8rem', 
                        fontWeight: 600,
                        backgroundColor: camp.status === 'COMPLETED' ? '#e6f4ea' : camp.status === 'DRAFT' ? '#eee' : '#fef7e0',
                        color: camp.status === 'COMPLETED' ? '#1e8e3e' : camp.status === 'DRAFT' ? '#666' : '#b06000'
                      }}>
                        {camp.status}
                      </span>
                    </td>
                    <td style={{ padding: '1rem 0', color: '#666' }}>
                      {camp.total_recipients} recipients
                    </td>
                    <td style={{ padding: '1rem 0', color: '#666', fontSize: '0.9rem' }}>
                      {new Date(camp.created_at).toLocaleString()}
                    </td>
                    <td style={{ padding: '1rem 0' }}>
                      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        {camp.status === 'DRAFT' && (
                          <button 
                            onClick={() => api.startCampaign(camp.id).then(() => window.location.reload())}
                            style={{ background: 'none', border: 'none', color: '#1e8e3e', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}
                          >
                            Start
                          </button>
                        )}
                        {camp.status === 'COMPLETED' && (
                          <button 
                            onClick={() => {
                              if(window.confirm('Reset this campaign to rerun?')) {
                                api.resetCampaign(camp.id).then(() => window.location.reload());
                              }
                            }}
                            style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', fontSize: '0.85rem' }}
                          >
                            Reset
                          </button>
                        )}
                        <Link to={`/campaigns/edit/${camp.id}`} style={{ color: '#666', textDecoration: 'none', fontSize: '0.85rem' }}>
                          Edit
                        </Link>
                        <Link to={`/campaigns/${camp.id}`} style={{ color: '#0066ff', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 600 }}>
                          Details
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
      
      <div style={{ marginTop: '2rem', textAlign: 'center' }}>
        <Link to="/" style={{ color: '#666', textDecoration: 'none', fontSize: '0.9rem' }}>
          &larr; Back to Single Email Send
        </Link>
      </div>
    </div>
  );
};
