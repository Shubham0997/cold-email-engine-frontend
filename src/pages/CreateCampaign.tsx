import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
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
  const [leadPrompt, setLeadPrompt] = useState('');
  const [includeLeads, setIncludeLeads] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResearching, setIsResearching] = useState(false);
  const [researchStatus, setResearchStatus] = useState<'idle' | 'templates' | 'leads'>('idle');
  const [isLoading, setIsLoading] = useState(!!id);
  const [variableValues, setVariableValues] = useState<{[key: string]: string}>({});
  const [showPreview, setShowPreview] = useState(true);
  const [hasSmtp, setHasSmtp] = useState<boolean | null>(null);

  useEffect(() => {
    api.getSmtpConfig().then(res => {
      setHasSmtp(res.has_config);
    }).catch(() => setHasSmtp(false));
  }, []);

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
    if (!prompt && !(includeLeads && leadPrompt)) return;
    setIsResearching(true);
    
    try {
      if (prompt) {
        setResearchStatus('templates');
        const res = await api.research(prompt, true);
        setSubject(res.subject);
        setBody(res.body);
      }

      if (includeLeads && leadPrompt) {
        setResearchStatus('leads');
        const leadRes = await api.generateLeads(leadPrompt);
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

    if (hasSmtp === false) {
      showToast('You must configure your SMTP settings before creating a campaign.', 'error');
      navigate('/settings');
      return;
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
        <div style={{ position: 'relative' }}>
          {hasSmtp !== true && (
            <div style={{
              position: 'absolute',
              inset: '-1rem',
              backgroundColor: 'rgba(255,255,255,0.7)',
              backdropFilter: 'blur(2px)',
              zIndex: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 'var(--radius)'
            }}>
              <div style={{
                backgroundColor: '#fff',
                padding: '2rem',
                borderRadius: '0.75rem',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                border: '1px solid var(--border)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '1rem',
                textAlign: 'center',
                maxWidth: '350px'
              }}>
                {hasSmtp === null ? (
                  <>
                    <div style={{ 
                      width: '32px', height: '32px', border: '3px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' 
                    }} />
                    <span style={{ fontWeight: 600, color: 'var(--primary)', fontSize: '1rem' }}>Verifying Profile...</span>
                  </>
                ) : (
                  <>
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                    <div>
                      <h3 style={{ fontWeight: 700, color: 'var(--primary)', margin: '0 0 0.5rem 0', fontSize: '1.1rem' }}>SMTP Configuration Required</h3>
                      <p style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)', margin: 0, lineHeight: 1.5 }}>You must connect to an email provider before you can write or send emails.</p>
                    </div>
                    <Link to="/settings" style={{
                      marginTop: '0.5rem',
                      padding: '0.625rem 1.25rem',
                      backgroundColor: '#dc2626',
                      color: 'white',
                      textDecoration: 'none',
                      borderRadius: '0.5rem',
                      fontWeight: 600,
                      fontSize: '0.875rem',
                      transition: 'background-color 0.2s'
                    }}>
                      Setup Now
                    </Link>
                  </>
                )}
              </div>
            </div>
          )}
        <fieldset disabled={hasSmtp !== true} style={{ border: 'none', padding: 0, margin: 0 }}>
        <form onSubmit={handleSubmit}>
          {!id && (
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <Textarea 
                    id="ai-prompt"
                    label="Email Draft AI Prompt (Optional)" 
                    value={prompt} 
                    onChange={(e) => setPrompt(e.target.value)} 
                    placeholder="e.g. Write a partnership cold email tailored to local coffee roasters." 
                    rows={2}
                  />
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.75rem' }}>
                    <input 
                      type="checkbox" 
                      id="include-leads" 
                      checked={includeLeads} 
                      onChange={(e) => setIncludeLeads(e.target.checked)}
                      disabled={hasSmtp === false}
                      style={{ cursor: hasSmtp === false ? 'not-allowed' : 'pointer', width: '1.1rem', height: '1.1rem', accentColor: 'var(--accent)' }}
                    />
                    <label htmlFor="include-leads" style={{ fontSize: '0.875rem', color: 'var(--primary)', cursor: hasSmtp === false ? 'not-allowed' : 'pointer', fontWeight: 600 }}>
                      Fetch potential leads automatically as well
                    </label>
                  </div>
                </div>

                {includeLeads && (
                  <div style={{ padding: '1rem', backgroundColor: 'var(--muted)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                    <Textarea 
                      id="lead-prompt"
                      label="Target Audience / Recipient Search Parameter"
                      value={leadPrompt}
                      onChange={(e) => setLeadPrompt(e.target.value)}
                      placeholder="e.g. Find email addresses for 10 independently owned coffee roasters in New York City"
                      rows={2}
                    />
                  </div>
                )}
              </div>
              <div style={{ marginTop: '1.6rem' }}>
                <Button 
                  type="button" 
                  onClick={handleAIResearch} 
                  disabled={(!prompt && (!includeLeads || !leadPrompt)) || isResearching || hasSmtp === false}
                  variant="secondary"
                  style={{ padding: '0.6rem 1.2rem', whiteSpace: 'nowrap' }}
                  isLoading={isResearching}
                >
                  {isResearching 
                    ? (researchStatus === 'templates' ? 'Drafting...' : 'Fetching Leads...') 
                    : 'Run AI Automation'}
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
                    disabled={hasSmtp === false}
                    style={{ 
                      padding: '0.375rem 0.75rem', 
                      fontSize: '0.75rem', 
                      borderRadius: '0.375rem', 
                      border: 'none',
                      backgroundColor: !showPreview ? '#fff' : 'transparent',
                      color: !showPreview ? 'var(--primary)' : 'var(--muted-foreground)',
                      fontWeight: 600,
                      cursor: hasSmtp === false ? 'not-allowed' : 'pointer',
                      opacity: hasSmtp === false ? 0.6 : 1,
                      boxShadow: !showPreview && hasSmtp !== false ? '0 1px 2px rgba(0,0,0,0.05)' : 'none'
                    }}
                  >
                    Edit HTML
                  </button>
                  <button 
                    type="button"
                    onClick={() => setShowPreview(true)}
                    disabled={hasSmtp === false}
                    style={{ 
                      padding: '0.375rem 0.75rem', 
                      fontSize: '0.75rem', 
                      borderRadius: '0.375rem', 
                      border: 'none',
                      backgroundColor: showPreview ? '#fff' : 'transparent',
                      color: showPreview ? 'var(--primary)' : 'var(--muted-foreground)',
                      fontWeight: 600,
                      cursor: hasSmtp === false ? 'not-allowed' : 'pointer',
                      opacity: hasSmtp === false ? 0.6 : 1,
                      boxShadow: showPreview && hasSmtp !== false ? '0 1px 2px rgba(0,0,0,0.05)' : 'none'
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
                  disabled={hasSmtp === false}
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
                    color: hasSmtp === false ? '#9ca3af' : '#0066ff', 
                    cursor: hasSmtp === false ? 'not-allowed' : 'pointer', 
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
              <Button type="submit" isLoading={isSubmitting} disabled={hasSmtp === false} variant="primary">
                {id ? "Update Campaign" : "Create & Start Campaign"}
              </Button>
              <Button type="button" onClick={() => navigate('/campaigns')} disabled={hasSmtp === false} variant="secondary">
                Cancel
              </Button>
            </div>
          </form>
        </fieldset>
        </div>
      </Card>
    </div>
  );
};
