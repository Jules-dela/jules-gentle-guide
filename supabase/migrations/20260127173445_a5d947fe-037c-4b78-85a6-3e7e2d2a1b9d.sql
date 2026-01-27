-- Add visit report fields to property_proposals table
ALTER TABLE public.property_proposals
ADD COLUMN IF NOT EXISTS visit_photos text[] DEFAULT NULL,
ADD COLUMN IF NOT EXISTS visit_pros text[] DEFAULT NULL,
ADD COLUMN IF NOT EXISTS visit_cons text[] DEFAULT NULL,
ADD COLUMN IF NOT EXISTS visit_published boolean DEFAULT false;