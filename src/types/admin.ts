export interface ContractSignatureData {
  signature_image: string;
  ip_address: string | null;
  user_agent: string | null;
  signed_at: string;
  device_info: {
    platform: string;
    language: string;
    screen_width: number;
    screen_height: number;
  } | null;
  client_full_name: string | null;
  client_date_of_birth: string | null;
  client_nationality: string | null;
  client_initials: string | null;
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
  property_type: string | null;
  roommate_preference: string | null;
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
  contract_data: ContractSignatureData | null;
  is_contract_signed: boolean;
  // Deposit (intake_submissions)
  deposit_paid: boolean;
  deposit_paid_at: string | null;
  // Listing statuses for liked proposals
  listing_statuses: { id: string; address: string | null; status: string }[];
  // Team tracking (case_staff_notes)
  whatsapp_contacted: boolean;
  whatsapp_contacted_at: string | null;
  managed_by: string | null;
  next_visit_at: string | null;
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
