// Use environment variable for API base URL
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export interface EmailRecipient {
  recipient_email: string;
  status: 'SENT' | 'OPENED' | 'FAILED' | 'PENDING';
  opened_at?: string;
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
  }
};
