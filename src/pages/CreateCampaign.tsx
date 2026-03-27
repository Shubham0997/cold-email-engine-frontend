import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card } from '../components/Card';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { Textarea } from '../components/Textarea';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { useConfirm } from '../context/ConfirmContext';
import { extractPlaceholders } from '../utils/emailUtils';
import { parseEmailsFromCsv } from '../utils/csvUtils';

export const CreateCampaign = () => {
  const { showToast } = useToast();
  const { confirm } = useConfirm();
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
  const [variableValues, setVariableValues] = useState<{[key: string]: string}>({});
  const [showPreview, setShowPreview] = useState(true);

  const placeholders = Array.from(new Set([
    ...extractPlaceholders(subject),
    ...extractPlaceholders(body)
  ])).filter(p => p !== 'email' && p !== 'name'); 

  const containsPlaceholders = placeholders.length > 0;

  const handleVariableChange = (key: string, value: string) => {
    setVariableValues(prev => ({ ...prev, [key]: value }));
  };

  const handleApplyVariables = () => {
    let newSubject = subject;
    let newBody = body;
    Object.entries(variableValues).forEach(([key, val]) => {
      if (!val) return;
      const regex = new RegExp(`{{${key}}}`, 'g');
      newSubject = newSubject.replace(regex, val);
      newBody = newBody.replace(regex, val);
    });
    setSubject(newSubject);
    setBody(newBody);
    setVariableValues({});
  };

  const handleAIResearch = async () => {
    if (!prompt) return;
    setIsResearching(true);
    setResearchStatus('templates');
    try {
      const res = await api.research(prompt, true);
      setSubject(res.subject);
      setBody(res.body);

      if (includeLeads) {
        setResearchStatus('leads');
        const leadRes = await api.generateLeads(prompt);
        if (leadRes.leads && leadRes.leads.length > 0) {
          const newRecipients = leadRes.leads.join('\n');
          setRecipients(prev => prev ? `${prev}\n${newRecipients}` : newRecipients);
        }
      }
    } catch (err) {
      showToast('AI Research failed. Check your API key.', 'error');
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
          setRecipients(data.recipients.map((r: any) => r.email).join('\n'));
        } catch (err) {
          console.error('Failed to fetch campaign for editing', err);
          showToast('Failed to load campaign data', 'error');
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
      const confirmed = await confirm({
        title: 'Unreplaced Placeholders',
        message: 'We detected unreplaced placeholders like {{name}} in your template. Are you sure you want to create the campaign as is?',
        confirmLabel: 'Create Anyway',
      });
      if (!confirmed) return;
    }

    setIsSubmitting(true);
    
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
    } catch (err: any) {
      showToast(err.message || `Failed to ${id ? 'update' : 'create'} campaign`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const uniqueEmails = parseEmailsFromCsv(text);

      if (uniqueEmails.length > 0) {
        setRecipients(prev => {
          const existing = prev.split('\n').map(e => e.trim()).filter(Boolean);
          const combined = Array.from(new Set([...existing, ...uniqueEmails]));
          return combined.join('\n');
        });
        showToast(`Successfully imported ${uniqueEmails.length} unique emails from CSV.`);
      } else {
        showToast('No valid email addresses found in the CSV file.', 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  if (isLoading) {
    return <div className="container-narrow"><Card title="Editing Campaign">Loading campaign data...</Card></div>;
  }

  return (
    <div className="container-narrow">
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
                    style={{ cursor: 'pointer', width: '1rem', height: '1rem', accentColor: 'var(--accent)' }}
                  />
                  <label htmlFor="include-leads" style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)', cursor: 'pointer', fontWeight: 500 }}>
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
          
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--slate-700)' }}>Email Body Template</label>
              <div style={{ display: 'flex', backgroundColor: 'var(--secondary)', padding: '0.25rem', borderRadius: '0.5rem' }}>
                <button 
                  type="button"
                  onClick={() => setShowPreview(false)}
                  style={{ 
                    padding: '0.375rem 0.75rem', 
                    fontSize: '0.75rem', 
                    borderRadius: '0.375rem', 
                    border: 'none',
                    backgroundColor: !showPreview ? '#fff' : 'transparent',
                    color: !showPreview ? 'var(--primary)' : 'var(--muted-foreground)',
                    fontWeight: 600,
                    cursor: 'pointer',
                    boxShadow: !showPreview ? '0 1px 2px rgba(0,0,0,0.05)' : 'none'
                  }}
                >
                  Edit HTML
                </button>
                <button 
                  type="button"
                  onClick={() => setShowPreview(true)}
                  style={{ 
                    padding: '0.375rem 0.75rem', 
                    fontSize: '0.75rem', 
                    borderRadius: '0.375rem', 
                    border: 'none',
                    backgroundColor: showPreview ? '#fff' : 'transparent',
                    color: showPreview ? 'var(--primary)' : 'var(--muted-foreground)',
                    fontWeight: 600,
                    cursor: 'pointer',
                    boxShadow: showPreview ? '0 1px 2px rgba(0,0,0,0.05)' : 'none'
                  }}
                >
                  Preview
                </button>
              </div>
            </div>
            {!showPreview ? (
              <Textarea 
                id="campaign-body"
                label="" 
                value={body} 
                onChange={(e) => setBody(e.target.value)} 
                placeholder="Hi {{name}},\n\nI was impressed by your work at {{company}}..." 
                required 
                rows={10}
              />
            ) : (
              <div 
                style={{ 
                  border: '1px solid var(--border)', 
                  borderRadius: 'var(--radius)', 
                  padding: '1.5rem', 
                  backgroundColor: '#fff', 
                  minHeight: '300px',
                  maxHeight: '500px',
                  overflowY: 'auto'
                }}
                dangerouslySetInnerHTML={{ __html: body }}
              />
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <label style={{ fontSize: '0.9rem', fontWeight: 600, color: '#444' }}>Recipients (One email per line)</label>
            <div style={{ position: 'relative' }}>
              <input 
                type="file" 
                id="csv-upload" 
                accept=".csv,.txt" 
                onChange={handleCsvUpload} 
                style={{ 
                  position: 'absolute', 
                  width: '1px', 
                  height: '1px', 
                  padding: '0', 
                  overflow: 'hidden', 
                  clip: 'rect(0,0,0,0)', 
                  whiteSpace: 'nowrap', 
                  border: '0' 
                }} 
              />
              <label 
                htmlFor="csv-upload" 
                style={{ 
                  fontSize: '0.8rem', 
                  color: '#0066ff', 
                  cursor: 'pointer', 
                  fontWeight: 600,
                  textDecoration: 'underline'
                }}
              >
                Upload CSV
              </label>
            </div>
          </div>
          <Textarea 
            id="campaign-recipients"
            label="" 
            value={recipients} 
            onChange={(e) => setRecipients(e.target.value)} 
            placeholder="john@example.com&#10;jane@company.com" 
            required 
          />

          {containsPlaceholders && (
            <div style={{ 
              backgroundColor: 'var(--muted)', 
              border: '1px solid var(--border)', 
              padding: '1.5rem', 
              borderRadius: 'var(--radius)', 
              marginTop: '1.5rem',
              marginBottom: '1.5rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                <span style={{ fontSize: '1.25rem' }}>✨</span>
                <strong style={{ fontSize: '0.95rem', color: 'var(--primary)' }}>Refine Template Variables</strong>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                {placeholders.map(p => (
                  <Input 
                    key={p}
                    id={`var-${p}`}
                    label={`Replace {{${p}}} with...`}
                    value={variableValues[p] || ''}
                    onChange={(e) => handleVariableChange(p, e.target.value)}
                    placeholder={`Enter ${p}...`}
                  />
                ))}
              </div>
              <Button 
                type="button" 
                variant="secondary" 
                onClick={handleApplyVariables}
                style={{ marginTop: '0.5rem', width: 'auto', padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                disabled={Object.values(variableValues).every(v => !v)}
              >
                Apply to Template
              </Button>
              <p style={{ marginTop: '0.75rem', fontSize: '0.75rem', color: '#64748b' }}>
                * System variables like <code>{"{{email}}"}</code> will be handled automatically during sending.
              </p>
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
