
-- Trigger function: auto-like a proposal when its visit is published
CREATE OR REPLACE FUNCTION public.auto_like_on_visit_publish()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.visit_published = true
     AND (TG_OP = 'INSERT' OR COALESCE(OLD.visit_published, false) = false)
     AND COALESCE(NEW.client_status::text, 'pending') = 'pending' THEN
    NEW.client_status := 'liked'::proposal_status;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_auto_like_on_visit_publish ON public.property_proposals;
CREATE TRIGGER trg_auto_like_on_visit_publish
BEFORE INSERT OR UPDATE OF visit_published ON public.property_proposals
FOR EACH ROW
EXECUTE FUNCTION public.auto_like_on_visit_publish();

-- Backfill existing stuck proposals
UPDATE public.property_proposals
SET client_status = 'liked'::proposal_status
WHERE visit_published = true
  AND client_status = 'pending';
