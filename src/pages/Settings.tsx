import { useState, useEffect } from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { api, SmtpConfig } from '../services/api';

export const Settings = () => {
  const { showToast } = useToast();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  const [hasConfig, setHasConfig] = useState(false);

  useEffect(() => {
    if (!user) return;
    
    const fetchConfig = async () => {
      try {
        const config = await api.getSmtpConfig();
        if (config.has_config) {
          setHasConfig(true);
          setUsername(config.smtp_user || '');
          setPassword(config.smtp_pass || '');
        }
      } catch (err) {
        console.error("Failed to load SMTP config:", err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchConfig();
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      const config: Partial<SmtpConfig> = {
        smtp_host: 'smtp.gmail.com',
        smtp_port: 587,
        smtp_user: username,
        smtp_pass: password
      };
      
      const response = await api.saveSmtpConfig(config);
      setHasConfig(response.has_config);
      showToast(response.message || 'SMTP Settings verified and saved!', 'success');
      
      // If we saved for the first time, make sure password shows as masked
      if (password !== '********') {
        setPassword('********');
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to save SMTP settings', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="container-narrow" style={{ textAlign: 'center', marginTop: '4rem', color: 'var(--muted-foreground)' }}>Loading settings...</div>;
  }

  return (
    <div className="container-narrow" style={{ maxWidth: '650px', margin: '3rem auto' }}>
      <header style={{ marginBottom: '2.5rem', textAlign: 'center' }}>
        <h1 style={{ color: 'var(--primary)', fontSize: '2.25rem', letterSpacing: '-0.025em', marginBottom: '0.5rem' }}>Account Settings</h1>
        <p style={{ color: 'var(--muted-foreground)', fontSize: '1.05rem' }}>Configure your MailFlow AI account preferences.</p>
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <Card title="Google Account Connection">
          <p style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)', marginBottom: '1.5rem', lineHeight: 1.5 }}>
            To send cold emails via MailFlow AI, securely connect your Google account by providing a designated 
            <strong> App Password</strong>.
          </p>

          {!hasConfig && (
            <div style={{ 
              backgroundColor: '#fff1f2', 
              color: '#be123c', 
              padding: '1.25rem', 
              borderRadius: '0.75rem', 
              marginBottom: '2rem',
              fontSize: '0.9rem',
              border: '1px solid #fecdd3',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.75rem',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
            }}>
              <svg style={{ flexShrink: 0, marginTop: '0.125rem' }} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
              <div>
                <strong style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.95rem' }}>Action Required</strong> 
                You currently have no SMTP settings configured. You cannot send any outgoing emails until this is resolved.
              </div>
            </div>
          )}

          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--slate-700)' }}>Gmail Address</label>
              <Input 
                value={username} 
                onChange={(e) => setUsername(e.target.value)} 
                placeholder="you@gmail.com" 
                type="email"
                required 
              />
            </div>

            <div style={{ paddingBottom: '0.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--slate-700)' }}>Google App Password</label>
              <Input 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                type="password" 
                placeholder="Enter your App Password"
                required 
              />
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', alignItems: 'flex-start' }}>
                <svg style={{ flexShrink: 0, marginTop: '2px', color: 'var(--accent)' }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                <p style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)', margin: 0, lineHeight: 1.4 }}>
                  Your password is securely encrypted at rest. For security, Google requires you to generate a unique <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noreferrer" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 500 }}>App Password</a>. Normal account passwords will not work.
                </p>
              </div>
            </div>

            <div style={{ paddingTop: '1.5rem', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
              <Button type="submit" variant="primary" isLoading={isSaving} style={{ padding: '0.75rem 1.5rem', fontSize: '0.95rem' }}>
                Verify & Save Settings
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};
