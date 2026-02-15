
-- Trigger: auto-advance case status to 'proposals_available' when a proposal is inserted
-- Only if the case has been signed (contract_data is not null) and status is still in early stages
CREATE OR REPLACE FUNCTION public.auto_advance_case_on_proposal()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.cases
  SET status = 'proposals_available'
  WHERE id = NEW.case_id
    AND contract_data IS NOT NULL
    AND status IN ('request_received', 'search_in_progress');
  RETURN NEW;
END;
$$;

CREATE TRIGGER advance_case_on_proposal_insert
AFTER INSERT ON public.property_proposals
FOR EACH ROW
EXECUTE FUNCTION public.auto_advance_case_on_proposal();
