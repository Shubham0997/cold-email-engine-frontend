// Use environment variable for API base URL
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export interface EmailRecipient {
  id: string;
  recipient_email: string;
  subject: string;
  status: 'SENT' | 'OPENED' | 'FAILED' | 'PENDING';
  created_at: string;
  opened_at?: string;
  campaign_id?: string | null;
  campaign_name?: string;
}

export interface EmailStats {
  total_emails: number;
  opened_emails: number;
  open_rate: number;
  emails: EmailRecipient[];
}

export const api = {
  sendSingleEmail: async (recipient: string, message: string, subject?: string): Promise<{ email_id: string }> => {
    const response = await fetch(`${API_BASE}/email/send-single`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: recipient, message, subject })
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to send email');
    }
    
    return response.json();
  },
  
  getStats: async (): Promise<EmailStats> => {
    const response = await fetch(`${API_BASE}/email/stats`);
    if (!response.ok) throw new Error('Failed to fetch stats');
    return response.json();
  },

  // Campaign APIs
  createCampaign: async (name: string, subject: string, body: string, recipients: string[]) => {
    const response = await fetch(`${API_BASE}/campaigns`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, subject, body, recipients })
    });
    if (!response.ok) throw new Error('Failed to create campaign');
    return response.json();
  },

  getCampaigns: async () => {
    const response = await fetch(`${API_BASE}/campaigns`);
    if (!response.ok) throw new Error('Failed to fetch campaigns');
    return response.json();
  },

  getCampaignDetails: async (id: string) => {
    const response = await fetch(`${API_BASE}/campaigns/${id}`);
    if (!response.ok) throw new Error('Failed to fetch campaign details');
    return response.json();
  },

  startCampaign: async (id: string) => {
    const response = await fetch(`${API_BASE}/campaigns/${id}/start`, {
      method: 'POST'
    });
    if (!response.ok) throw new Error('Failed to start campaign');
    return response.json();
  },

  updateCampaign: async (id: string, name: string, subject: string, body: string, recipients: string[]) => {
    const response = await fetch(`${API_BASE}/campaigns/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, subject, body, recipients })
    });
    if (!response.ok) throw new Error('Failed to update campaign');
    return response.json();
  },

  resetCampaign: async (id: string) => {
    const response = await fetch(`${API_BASE}/campaigns/${id}/reset`, {
      method: 'POST'
    });
    if (!response.ok) throw new Error('Failed to reset campaign');
    return response.json();
  },

  research: async (prompt: string, is_campaign: boolean = false): Promise<{subject: string, body: string}> => {
    const response = await fetch(`${API_BASE}/api/ai/research`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, is_campaign })
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to perform AI research');
    }
    return response.json();
  },

  generateLeads: async (prompt: string): Promise<{leads: string[]}> => {
    const response = await fetch(`${API_BASE}/api/ai/leads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt })
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to generate leads');
    }
    return response.json();
  }
};
