import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/Card';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { Textarea } from '../components/Textarea';
// import { api } from '../services/api'; // TODO: Implement backend endpoints

export const CreateCampaign = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [recipients, setRecipients] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Parse recipients (one per line)
    const recipientList = recipients.split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);

    try {
      // For now, we'll just log this as the backend isn't ready
      // await api.createCampaign(name, subject, body, recipientList);
      console.log('Creating campaign:', { name, subject, body, recipientList });
      alert('Campaign created! (Backend integration pending)');
      navigate('/campaigns');
    } catch (err) {
      alert('Failed to create campaign');
    } finally {
      setIsSubmitting(false);
    }
  };

  const containerStyle: React.CSSProperties = {
    maxWidth: '800px',
    margin: '2rem auto',
    padding: '0 1rem'
  };

  return (
    <div style={containerStyle}>
      <Card title="Start New Campaign">
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
              Create & Start Campaign
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
