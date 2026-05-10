
export interface User {
  id: string;
  email: string;
  name: string;
  instagramConnected: boolean;
  instagramHandle?: string;
  plan: 'starter' | 'growth' | 'unlimited';
  dmSentThisMonth: number;
  dmQuota: number;
}

export interface Automation {
  id: string;
  userId: string;
  keywords: string[];
  replyMessage: string;
  targetUrl: string;
  active: boolean;
  createdAt: string;
  totalSent: number;
}

export interface ActivityLog {
  id: string;
  automationId: string;
  keyword: string;
  commentAuthor: string;
  timestamp: string;
  status: 'success' | 'failed';
}

export interface AnalyticsData {
  date: string;
  sent: number;
  detected: number;
  failed: number;
}
