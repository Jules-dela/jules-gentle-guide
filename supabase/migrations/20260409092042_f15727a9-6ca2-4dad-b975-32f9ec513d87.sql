-- Create listing_status enum
CREATE TYPE public.listing_status AS ENUM ('research', 'viewings', 'documents', 'completed');

-- Add listing_status column with default
ALTER TABLE public.property_proposals
  ADD COLUMN listing_status public.listing_status NOT NULL DEFAULT 'research';

-- Backfill existing liked proposals with published visit reports → viewings
UPDATE public.property_proposals
SET listing_status = 'viewings'
WHERE client_status = 'liked' AND visit_published = true;
