// Portal Types - Aligned with database schema

export type CaseStatus = 
  | 'request_received'
  | 'search_in_progress'
  | 'proposals_available'
  | 'visit_in_progress'
  | 'documents_preparation'
  | 'application_review'
  | 'key_handover_scheduled'
  | 'closed';

export type ClientType = 'student' | 'employee' | 'other';

export type DocumentStatus = 'missing' | 'uploaded' | 'validated' | 'rejected';

export type ProposalStatus = 'pending' | 'liked' | 'rejected';

export interface Profile {
  id: string;
  user_id: string;
  name: string;
  email: string;
  phone: string | null;
  client_type: ClientType;
  company_school: string | null;
  created_at: string;
}

// Client-visible contract data (sensitive fields stored separately in contract_signatures)
export interface ContractData {
  signed: boolean;
  timestamp: string;
}

// Full contract signing input (used when signing, before data is split)
export interface ContractSigningInput {
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

export interface Case {
  id: string;
  client_id: string;
  status: CaseStatus;
  initial_criteria: InitialCriteria | null;
  contract_data: ContractData | null;
  
  created_at: string;
  updated_at: string;
  closed_at: string | null;
  close_reason: string | null;
}

export interface InitialCriteria {
  neighbourhood: string;
  budget: string;
  rooms: string;
  duration: string;
  property_type: string;
  roommate_preference: string;
  furnished: boolean;
  near_transport: boolean;
  pets_allowed: boolean;
  smoking_allowed: boolean;
  notes?: string;
}

export interface CaseStatusHistory {
  id: string;
  case_id: string;
  status: CaseStatus;
  changed_by: string | null;
  notes: string | null;
  created_at: string;
}

export interface PropertyProposal {
  id: string;
  case_id: string;
  address: string | null;
  neighbourhood: string | null;
  rent: number | null;
  charges: number | null;
  size_sqm: number | null;
  rooms: number | null;
  property_type: string | null;
  tags: string[];
  photos: string[];
  photo_positions: Record<string, number> | null;
  description: string | null;
  agency_info: string | null;
  client_status: ProposalStatus;
  rejection_reasons: string[];
  rejection_notes: string | null;
  client_visit_questions: string | null;
  visit_published: boolean | null;
  created_at: string;
}

export interface VisitVideo {
  id: string;
  proposal_id: string;
  video_url: string;
  notes: string | null;
  created_at: string;
}

export interface CaseDocument {
  id: string;
  case_id: string;
  document_type: string;
  label: string;
  status: DocumentStatus;
  file_url: string | null;
  rejection_reason: string | null;
  created_at: string;
  validated_at: string | null;
}

export interface KeyHandover {
  id: string;
  case_id: string;
  scheduled_date: string | null;
  scheduled_time: string | null;
  location: string | null;
  contact_person: string | null;
  contact_phone: string | null;
  confirmed_by_client: boolean;
  notes: string | null;
  created_at: string;
}

// Timeline step configuration
export interface TimelineStep {
  status: CaseStatus;
  label: string;
  description: string;
  icon: string;
}

export const TIMELINE_STEPS: TimelineStep[] = [
  {
    status: 'request_received',
    label: 'Request Received',
    description: 'Your housing request has been submitted and is being reviewed.',
    icon: 'ClipboardCheck',
  },
  {
    status: 'search_in_progress',
    label: 'Search in Progress',
    description: 'We are actively searching for properties matching your criteria.',
    icon: 'Search',
  },
  {
    status: 'proposals_available',
    label: 'Proposals Available',
    description: 'New apartment proposals are available for your review.',
    icon: 'Home',
  },
  {
    status: 'visit_in_progress',
    label: 'Visit Scheduled',
    description: 'A property visit has been scheduled or completed.',
    icon: 'Video',
  },
  {
    status: 'documents_preparation',
    label: 'Documents Preparation',
    description: 'Please upload the required documents for your application.',
    icon: 'FileText',
  },
  {
    status: 'application_review',
    label: 'Application Under Review',
    description: 'Your application is being reviewed by the property owner.',
    icon: 'Clock',
  },
  {
    status: 'key_handover_scheduled',
    label: 'Key Handover Scheduled',
    description: 'Your key handover has been scheduled. Almost there!',
    icon: 'Key',
  },
  {
    status: 'closed',
    label: 'Housing Secured',
    description: 'Congratulations! Your housing search is complete.',
    icon: 'CheckCircle',
  },
];

export const REJECTION_REASONS = [
  { value: 'rent_too_high', label: 'Rent too high' },
  { value: 'location_not_ideal', label: 'Location not ideal' },
  { value: 'too_small', label: 'Too small / lack of space' },
  { value: 'not_bright_enough', label: 'Not bright enough' },
  { value: 'poor_condition', label: 'Poor condition / not my style' },
  { value: 'other', label: 'Other' },
];
