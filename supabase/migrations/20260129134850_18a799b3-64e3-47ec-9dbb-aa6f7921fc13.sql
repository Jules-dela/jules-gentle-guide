-- Add client_visit_questions column to property_proposals
-- This stores questions from clients about specific inspection points for landlord visits
ALTER TABLE public.property_proposals 
ADD COLUMN client_visit_questions text NULL;