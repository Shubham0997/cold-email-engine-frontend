import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card } from '../components/Card';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { Textarea } from '../components/Textarea';
import { api } from '../services/api';

export const CreateCampaign = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [recipients, setRecipients] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(!!id);

  useEffect(() => {
    if (id) {
      const fetchCampaign = async () => {
        try {
          const data = await api.getCampaignDetails(id);
          const campaign = data.campaign;
          setName(campaign.name);
          setSubject(campaign.subject);
          setBody(campaign.body);
          // Convert recipients list back to newline-separated string
          setRecipients(data.recipients.map((r: any) => r.email).join('\n'));
        } catch (err) {
          console.error('Failed to fetch campaign for editing', err);
          alert('Failed to load campaign data');
        } finally {
          setIsLoading(false);
        }
      };
      fetchCampaign();
    }
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Parse recipients (one per line)
    const recipientList = recipients.split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);

    try {
      if (id) {
        await api.updateCampaign(id, name, subject, body, recipientList);
      } else {
        await api.createCampaign(name, subject, body, recipientList);
      }
      navigate('/campaigns');
    } catch (err) {
      alert(`Failed to ${id ? 'update' : 'create'} campaign`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const containerStyle: React.CSSProperties = {
    maxWidth: '800px',
    margin: '2rem auto',
    padding: '0 1rem'
  };

  if (isLoading) {
    return <div style={containerStyle}><Card title="Editing Campaign">Loading campaign data...</Card></div>;
  }

  return (
    <div style={containerStyle}>
      <Card title={id ? "Edit Campaign" : "Start New Campaign"}>
        <form onSubmit={handleSubmit}>
          <Input 
            id="campaign-name"
            label="Campaign Name" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            placeholder="Spring Outreach 2026" 
            required 
          />
          <Input 
            id="campaign-subject"
            label="Email Subject Template" 
            value={subject} 
            onChange={(e) => setSubject(e.target.value)} 
            placeholder="Hello {{name}}, following up!" 
            required 
          />
          <Textarea 
            id="campaign-body"
            label="Email Body Template" 
            value={body} 
            onChange={(e) => setBody(e.target.value)} 
            placeholder="Hi {{name}},\n\nI was impressed by your work at {{company}}..." 
            required 
            rows={10}
          />
          <Textarea 
            id="campaign-recipients"
            label="Recipients (One email per line)" 
            value={recipients} 
            onChange={(e) => setRecipients(e.target.value)} 
            placeholder="john@example.com&#10;jane@company.com" 
            required 
            rows={5}
          />
          
          <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem' }}>
            <Button type="submit" isLoading={isSubmitting} variant="primary">
              {id ? "Update Campaign" : "Create & Start Campaign"}
            </Button>
            <Button type="button" onClick={() => navigate('/campaigns')} variant="secondary">
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
