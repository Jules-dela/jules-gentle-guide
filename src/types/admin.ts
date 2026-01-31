export interface ContractData {
  signature_image: string;
  ip_address: string;
  timestamp: string;
  user_agent: string;
  device_info: {
    platform: string;
    language: string;
    screen_width: number;
    screen_height: number;
  };
}

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
  // Document tracking
  docs_uploaded: number;
  docs_total: number;
  docs_pending_review: boolean;
  dossier_submitted: boolean;
  // Contract signing
  contract_data: ContractData | null;
  is_contract_signed: boolean;
}

export interface ClientInteraction {
  id: string;
  client_id: string;
  client_name: string;
  type: 'liked' | 'rejected' | 'document_uploaded' | 'feedback' | 'dossier_submitted' | 'visit_instructions';
  description: string;
  reason?: string;
  timestamp: string;
}

export interface AdminStats {
  completed: number;
  inProgress: number;
  issues: number;
  dossiersReady: number;
}

export interface AdminDocument {
  id: string;
  case_id: string;
  document_type: string;
  label: string;
  file_url: string | null;
  status: 'missing' | 'uploaded' | 'validated' | 'rejected';
  rejection_reason: string | null;
  created_at: string;
  validated_at: string | null;
}

// Mandatory document types for Swiss rental applications
export const MANDATORY_DOCUMENT_TYPES = [
  { type: 'id', label: 'Valid ID / Passport' },
  { type: 'income', label: 'Proof of Income / Employment Contract' },
  { type: 'poursuites', label: 'Extrait des Poursuites (Debt Collection Extract)' },
  { type: 'insurance', label: 'RC Insurance (Liability Insurance)' },
  { type: 'guarantor', label: 'Guarantor Form / Guarantee Letter' },
] as const;
