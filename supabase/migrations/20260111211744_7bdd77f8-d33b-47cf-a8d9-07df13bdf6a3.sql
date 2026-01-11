
-- Create case status enum
CREATE TYPE public.case_status AS ENUM (
  'request_received',
  'search_in_progress',
  'proposals_available',
  'visit_in_progress',
  'documents_preparation',
  'application_review',
  'key_handover_scheduled',
  'closed'
);

-- Create client type enum
CREATE TYPE public.client_type AS ENUM (
  'student',
  'employee',
  'other'
);

-- Create document status enum
CREATE TYPE public.document_status AS ENUM (
  'missing',
  'uploaded',
  'validated',
  'rejected'
);

-- Create proposal status enum
CREATE TYPE public.proposal_status AS ENUM (
  'pending',
  'liked',
  'rejected'
);

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  client_type client_type DEFAULT 'other',
  company_school TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create cases table
CREATE TABLE public.cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  status case_status DEFAULT 'request_received' NOT NULL,
  initial_criteria JSONB,
  staff_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  closed_at TIMESTAMP WITH TIME ZONE,
  close_reason TEXT
);

ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;

-- Create case_status_history table
CREATE TABLE public.case_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID REFERENCES public.cases(id) ON DELETE CASCADE NOT NULL,
  status case_status NOT NULL,
  changed_by UUID REFERENCES auth.users(id),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.case_status_history ENABLE ROW LEVEL SECURITY;

-- Create property_proposals table
CREATE TABLE public.property_proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID REFERENCES public.cases(id) ON DELETE CASCADE NOT NULL,
  address TEXT,
  neighbourhood TEXT,
  rent DECIMAL(10, 2),
  charges DECIMAL(10, 2),
  size_sqm DECIMAL(10, 2),
  rooms INTEGER,
  property_type TEXT,
  tags TEXT[],
  photos TEXT[],
  description TEXT,
  agency_info TEXT,
  client_status proposal_status DEFAULT 'pending',
  rejection_reasons TEXT[],
  rejection_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.property_proposals ENABLE ROW LEVEL SECURITY;

-- Create visit_videos table
CREATE TABLE public.visit_videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id UUID REFERENCES public.property_proposals(id) ON DELETE CASCADE NOT NULL,
  video_url TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.visit_videos ENABLE ROW LEVEL SECURITY;

-- Create case_documents table
CREATE TABLE public.case_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID REFERENCES public.cases(id) ON DELETE CASCADE NOT NULL,
  document_type TEXT NOT NULL,
  label TEXT NOT NULL,
  status document_status DEFAULT 'missing' NOT NULL,
  file_url TEXT,
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  validated_at TIMESTAMP WITH TIME ZONE
);

ALTER TABLE public.case_documents ENABLE ROW LEVEL SECURITY;

-- Create key_handover table
CREATE TABLE public.key_handover (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID REFERENCES public.cases(id) ON DELETE CASCADE NOT NULL UNIQUE,
  scheduled_date DATE,
  scheduled_time TIME,
  location TEXT,
  contact_person TEXT,
  contact_phone TEXT,
  confirmed_by_client BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.key_handover ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage all profiles"
ON public.profiles FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for cases
CREATE POLICY "Clients can view their own cases"
ON public.cases FOR SELECT
USING (client_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Admins can view all cases"
ON public.cases FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage all cases"
ON public.cases FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for case_status_history
CREATE POLICY "Clients can view their case history"
ON public.case_status_history FOR SELECT
USING (case_id IN (
  SELECT c.id FROM public.cases c
  JOIN public.profiles p ON c.client_id = p.id
  WHERE p.user_id = auth.uid()
));

CREATE POLICY "Admins can view all case history"
ON public.case_status_history FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage case history"
ON public.case_status_history FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for property_proposals
CREATE POLICY "Clients can view their proposals"
ON public.property_proposals FOR SELECT
USING (case_id IN (
  SELECT c.id FROM public.cases c
  JOIN public.profiles p ON c.client_id = p.id
  WHERE p.user_id = auth.uid()
));

CREATE POLICY "Clients can update proposal feedback"
ON public.property_proposals FOR UPDATE
USING (case_id IN (
  SELECT c.id FROM public.cases c
  JOIN public.profiles p ON c.client_id = p.id
  WHERE p.user_id = auth.uid()
));

CREATE POLICY "Admins can view all proposals"
ON public.property_proposals FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage all proposals"
ON public.property_proposals FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for visit_videos
CREATE POLICY "Clients can view their visit videos"
ON public.visit_videos FOR SELECT
USING (proposal_id IN (
  SELECT pp.id FROM public.property_proposals pp
  JOIN public.cases c ON pp.case_id = c.id
  JOIN public.profiles p ON c.client_id = p.id
  WHERE p.user_id = auth.uid()
));

CREATE POLICY "Admins can view all visit videos"
ON public.visit_videos FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage all visit videos"
ON public.visit_videos FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for case_documents
CREATE POLICY "Clients can view their documents"
ON public.case_documents FOR SELECT
USING (case_id IN (
  SELECT c.id FROM public.cases c
  JOIN public.profiles p ON c.client_id = p.id
  WHERE p.user_id = auth.uid()
));

CREATE POLICY "Clients can upload documents"
ON public.case_documents FOR UPDATE
USING (case_id IN (
  SELECT c.id FROM public.cases c
  JOIN public.profiles p ON c.client_id = p.id
  WHERE p.user_id = auth.uid()
));

CREATE POLICY "Admins can view all documents"
ON public.case_documents FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage all documents"
ON public.case_documents FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for key_handover
CREATE POLICY "Clients can view their key handover"
ON public.key_handover FOR SELECT
USING (case_id IN (
  SELECT c.id FROM public.cases c
  JOIN public.profiles p ON c.client_id = p.id
  WHERE p.user_id = auth.uid()
));

CREATE POLICY "Clients can confirm key handover"
ON public.key_handover FOR UPDATE
USING (case_id IN (
  SELECT c.id FROM public.cases c
  JOIN public.profiles p ON c.client_id = p.id
  WHERE p.user_id = auth.uid()
));

CREATE POLICY "Admins can view all key handovers"
ON public.key_handover FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage all key handovers"
ON public.key_handover FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for cases updated_at
CREATE TRIGGER update_cases_updated_at
BEFORE UPDATE ON public.cases
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to log status changes
CREATE OR REPLACE FUNCTION public.log_case_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.case_status_history (case_id, status, changed_by)
    VALUES (NEW.id, NEW.status, auth.uid());
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for case status history
CREATE TRIGGER on_case_status_change
AFTER UPDATE ON public.cases
FOR EACH ROW
EXECUTE FUNCTION public.log_case_status_change();

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('property-photos', 'property-photos', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('visit-videos', 'visit-videos', false);
INSERT INTO storage.buckets (id, name, public) VALUES ('client-documents', 'client-documents', false);

-- Storage policies for property-photos (public)
CREATE POLICY "Property photos are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'property-photos');

CREATE POLICY "Admins can upload property photos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'property-photos' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete property photos"
ON storage.objects FOR DELETE
USING (bucket_id = 'property-photos' AND public.has_role(auth.uid(), 'admin'));

-- Storage policies for visit-videos (private)
CREATE POLICY "Admins can manage visit videos"
ON storage.objects FOR ALL
USING (bucket_id = 'visit-videos' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Clients can view their visit videos"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'visit-videos' 
  AND (storage.foldername(name))[1] IN (
    SELECT c.id::text FROM public.cases c
    JOIN public.profiles p ON c.client_id = p.id
    WHERE p.user_id = auth.uid()
  )
);

-- Storage policies for client-documents (private)
CREATE POLICY "Admins can manage client documents"
ON storage.objects FOR ALL
USING (bucket_id = 'client-documents' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Clients can upload their documents"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'client-documents'
  AND (storage.foldername(name))[1] IN (
    SELECT c.id::text FROM public.cases c
    JOIN public.profiles p ON c.client_id = p.id
    WHERE p.user_id = auth.uid()
  )
);

CREATE POLICY "Clients can view their documents"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'client-documents'
  AND (storage.foldername(name))[1] IN (
    SELECT c.id::text FROM public.cases c
    JOIN public.profiles p ON c.client_id = p.id
    WHERE p.user_id = auth.uid()
  )
);

-- Enable realtime for cases and property_proposals
ALTER PUBLICATION supabase_realtime ADD TABLE public.cases;
ALTER PUBLICATION supabase_realtime ADD TABLE public.property_proposals;
ALTER PUBLICATION supabase_realtime ADD TABLE public.case_documents;
