import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card } from '../components/Card';
import { Button } from '../components/Button';

// Mock data until backend is ready
const MOCK_CAMPAIGNS = [
  { id: '1', name: 'Initial Research Outreach', status: 'COMPLETED', sent: 45, opened: 21, date: '2026-03-20' },
  { id: '2', name: 'Product Update Q1', status: 'SENDING', sent: 120, opened: 45, date: '2026-03-25' },
];

export const CampaignList = () => {
  const navigate = useNavigate();
  const [campaigns] = useState(MOCK_CAMPAIGNS);

  const containerStyle: React.CSSProperties = {
    maxWidth: '900px',
    margin: '2rem auto',
    padding: '0 1rem'
  };

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
                <th style={{ padding: '1rem 0' }}>Performance</th>
                <th style={{ padding: '1rem 0' }}>Date</th>
                <th style={{ padding: '1rem 0' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((camp) => (
                <tr key={camp.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                  <td style={{ padding: '1rem 0', fontWeight: 600 }}>{camp.name}</td>
                  <td style={{ padding: '1rem 0' }}>
                    <span style={{ 
                      padding: '4px 8px', 
                      borderRadius: '12px', 
                      fontSize: '0.8rem', 
                      fontWeight: 600,
                      backgroundColor: camp.status === 'COMPLETED' ? '#e6f4ea' : '#fef7e0',
                      color: camp.status === 'COMPLETED' ? '#1e8e3e' : '#b06000'
                    }}>
                      {camp.status}
                    </span>
                  </td>
                  <td style={{ padding: '1rem 0' }}>
                    <span style={{ fontSize: '0.9rem', color: '#666' }}>
                      {camp.opened}/{camp.sent} opened ({Math.round(camp.opened/camp.sent*100)}%)
                    </span>
                  </td>
                  <td style={{ padding: '1rem 0', color: '#666', fontSize: '0.9rem' }}>{camp.date}</td>
                  <td style={{ padding: '1rem 0' }}>
                    <Link to={`/campaigns/${camp.id}`} style={{ color: '#0066ff', textDecoration: 'none', fontSize: '0.9rem' }}>
                      Details
                    </Link>
                  </td>
                </tr>
              ))}
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
