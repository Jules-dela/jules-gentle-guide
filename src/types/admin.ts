export interface ClientWithCase {
  id: string;
  user_id: string;
  name: string;
  email: string;
  phone: string | null;
  client_type: string | null;
  company_school: string | null;
  case_id: string | null;
  case_status: string;
  budget: string | null;
  neighbourhood: string | null;
  rooms: string | null;
  duration: string | null;
  last_activity: string | null;
  last_activity_at: string | null;
  needs_attention: boolean;
  created_at: string;
}

export interface ClientInteraction {
  id: string;
  client_id: string;
  client_name: string;
  type: 'liked' | 'rejected' | 'document_uploaded' | 'feedback';
  description: string;
  reason?: string;
  timestamp: string;
}

export interface AdminStats {
  completed: number;
  inProgress: number;
  issues: number;
}
