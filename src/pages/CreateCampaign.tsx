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
  const [prompt, setPrompt] = useState('');
  const [includeLeads, setIncludeLeads] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResearching, setIsResearching] = useState(false);
  const [researchStatus, setResearchStatus] = useState<'idle' | 'templates' | 'leads'>('idle');
  const [isLoading, setIsLoading] = useState(!!id);

  const hasPlaceholders = (text: string) => /{{.*?}}/.test(text);
  const containsPlaceholders = hasPlaceholders(subject) || hasPlaceholders(body);

  const handleAIResearch = async () => {
    if (!prompt) return;
    setIsResearching(true);
    setResearchStatus('templates');
    try {
      // 1. Research Subject and Body
      const res = await api.research(prompt);
      setSubject(res.subject);
      setBody(res.body);

      // 2. Fetch Potential Leads (if enabled)
      if (includeLeads) {
        setResearchStatus('leads');
        const leadRes = await api.generateLeads(prompt);
        if (leadRes.leads && leadRes.leads.length > 0) {
          const newRecipients = leadRes.leads.join('\n');
          setRecipients(prev => prev ? `${prev}\n${newRecipients}` : newRecipients);
        }
      }
    } catch (err) {
      alert('AI Research failed. Check your API key.');
    } finally {
      setIsResearching(false);
      setResearchStatus('idle');
    }
  };

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
    
    if (containsPlaceholders) {
      if (!window.confirm('We detected unreplaced placeholders like {{name}} in your template. Are you sure you want to create the campaign as is?')) {
        return;
      }
    }

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
          {!id && (
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
              <div style={{ flex: 1 }}>
                <Textarea 
                  id="ai-prompt"
                  label="AI Research & Lead Gen Prompt (Optional)" 
                  value={prompt} 
                  onChange={(e) => setPrompt(e.target.value)} 
                  placeholder="e.g. Find 10 coffee roasters in New York and write a partnership cold email" 
                  rows={3}
                />
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <input 
                    type="checkbox" 
                    id="include-leads" 
                    checked={includeLeads} 
                    onChange={(e) => setIncludeLeads(e.target.checked)}
                    style={{ cursor: 'pointer' }}
                  />
                  <label htmlFor="include-leads" style={{ fontSize: '0.85rem', color: '#666', cursor: 'pointer' }}>
                    Also find potential recipient emails
                  </label>
                </div>
              </div>
              <div style={{ marginTop: '1.6rem' }}>
                <Button 
                  type="button" 
                  onClick={handleAIResearch} 
                  disabled={!prompt || isResearching}
                  variant="secondary"
                  style={{ padding: '0.6rem 1.2rem'}}
                  isLoading={isResearching}
                >
                  {isResearching 
                    ? (researchStatus === 'templates' ? 'Drafting...' : 'Fetching Leads...') 
                    : 'AI Research'}
                </Button>
              </div>
            </div>
          )}

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

          {containsPlaceholders && (
            <div style={{ 
              backgroundColor: '#fffbeb', 
              border: '1px solid #fef3c7', 
              padding: '0.75rem', 
              borderRadius: '8px', 
              marginTop: '1.5rem',
              display: 'flex',
              gap: '0.5rem',
              alignItems: 'center',
              color: '#92400e',
              fontSize: '0.85rem'
            }}>
              <span style={{ fontSize: '1.2rem' }}>⚠️</span>
              <div>
                <strong>Placeholders detected!</strong> Please ensure your templates are ready or you've replaced items like <code>{"{{name}}"}</code>.
              </div>
            </div>
          )}
          
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
