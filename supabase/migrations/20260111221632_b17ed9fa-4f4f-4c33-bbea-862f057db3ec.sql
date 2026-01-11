-- Drop restrictive policies and recreate as permissive
-- Fix profiles table policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.profiles;

CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage all profiles" 
ON public.profiles 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Fix cases table policies
DROP POLICY IF EXISTS "Clients can view their own cases" ON public.cases;
DROP POLICY IF EXISTS "Admins can view all cases" ON public.cases;
DROP POLICY IF EXISTS "Admins can manage all cases" ON public.cases;

CREATE POLICY "Clients can view their own cases" 
ON public.cases 
FOR SELECT 
USING (client_id IN (
  SELECT id FROM profiles WHERE user_id = auth.uid()
));

CREATE POLICY "Admins can view all cases" 
ON public.cases 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage all cases" 
ON public.cases 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Fix property_proposals table policies
DROP POLICY IF EXISTS "Clients can view their proposals" ON public.property_proposals;
DROP POLICY IF EXISTS "Clients can update proposal feedback" ON public.property_proposals;
DROP POLICY IF EXISTS "Admins can view all proposals" ON public.property_proposals;
DROP POLICY IF EXISTS "Admins can manage all proposals" ON public.property_proposals;

CREATE POLICY "Clients can view their proposals" 
ON public.property_proposals 
FOR SELECT 
USING (case_id IN (
  SELECT c.id FROM cases c
  JOIN profiles p ON c.client_id = p.id
  WHERE p.user_id = auth.uid()
));

CREATE POLICY "Clients can update proposal feedback" 
ON public.property_proposals 
FOR UPDATE 
USING (case_id IN (
  SELECT c.id FROM cases c
  JOIN profiles p ON c.client_id = p.id
  WHERE p.user_id = auth.uid()
));

CREATE POLICY "Admins can view all proposals" 
ON public.property_proposals 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage all proposals" 
ON public.property_proposals 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Fix case_documents table policies
DROP POLICY IF EXISTS "Clients can view their documents" ON public.case_documents;
DROP POLICY IF EXISTS "Clients can upload documents" ON public.case_documents;
DROP POLICY IF EXISTS "Admins can view all documents" ON public.case_documents;
DROP POLICY IF EXISTS "Admins can manage all documents" ON public.case_documents;

CREATE POLICY "Clients can view their documents" 
ON public.case_documents 
FOR SELECT 
USING (case_id IN (
  SELECT c.id FROM cases c
  JOIN profiles p ON c.client_id = p.id
  WHERE p.user_id = auth.uid()
));

CREATE POLICY "Clients can upload documents" 
ON public.case_documents 
FOR UPDATE 
USING (case_id IN (
  SELECT c.id FROM cases c
  JOIN profiles p ON c.client_id = p.id
  WHERE p.user_id = auth.uid()
));

CREATE POLICY "Admins can view all documents" 
ON public.case_documents 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage all documents" 
ON public.case_documents 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Fix key_handover table policies
DROP POLICY IF EXISTS "Clients can view their key handover" ON public.key_handover;
DROP POLICY IF EXISTS "Clients can confirm key handover" ON public.key_handover;
DROP POLICY IF EXISTS "Admins can view all key handovers" ON public.key_handover;
DROP POLICY IF EXISTS "Admins can manage all key handovers" ON public.key_handover;

CREATE POLICY "Clients can view their key handover" 
ON public.key_handover 
FOR SELECT 
USING (case_id IN (
  SELECT c.id FROM cases c
  JOIN profiles p ON c.client_id = p.id
  WHERE p.user_id = auth.uid()
));

CREATE POLICY "Clients can confirm key handover" 
ON public.key_handover 
FOR UPDATE 
USING (case_id IN (
  SELECT c.id FROM cases c
  JOIN profiles p ON c.client_id = p.id
  WHERE p.user_id = auth.uid()
));

CREATE POLICY "Admins can view all key handovers" 
ON public.key_handover 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage all key handovers" 
ON public.key_handover 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Fix case_status_history table policies
DROP POLICY IF EXISTS "Clients can view their case history" ON public.case_status_history;
DROP POLICY IF EXISTS "Admins can view all case history" ON public.case_status_history;
DROP POLICY IF EXISTS "Admins can manage case history" ON public.case_status_history;

CREATE POLICY "Clients can view their case history" 
ON public.case_status_history 
FOR SELECT 
USING (case_id IN (
  SELECT c.id FROM cases c
  JOIN profiles p ON c.client_id = p.id
  WHERE p.user_id = auth.uid()
));

CREATE POLICY "Admins can view all case history" 
ON public.case_status_history 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage case history" 
ON public.case_status_history 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Fix visit_videos table policies
DROP POLICY IF EXISTS "Clients can view their visit videos" ON public.visit_videos;
DROP POLICY IF EXISTS "Admins can view all visit videos" ON public.visit_videos;
DROP POLICY IF EXISTS "Admins can manage all visit videos" ON public.visit_videos;

CREATE POLICY "Clients can view their visit videos" 
ON public.visit_videos 
FOR SELECT 
USING (proposal_id IN (
  SELECT pp.id FROM property_proposals pp
  JOIN cases c ON pp.case_id = c.id
  JOIN profiles p ON c.client_id = p.id
  WHERE p.user_id = auth.uid()
));

CREATE POLICY "Admins can view all visit videos" 
ON public.visit_videos 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage all visit videos" 
ON public.visit_videos 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));