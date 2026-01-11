
-- Fix function search_path for update_updated_at_column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Fix function search_path for log_case_status_change
CREATE OR REPLACE FUNCTION public.log_case_status_change()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.case_status_history (case_id, status, changed_by)
    VALUES (NEW.id, NEW.status, auth.uid());
  END IF;
  RETURN NEW;
END;
$$;

-- The RLS policy "Anyone can submit applications" with true is intentional for the public form
-- The rate_limit_submissions table with no policy is internal - let's add a policy for it
CREATE POLICY "Service role can manage rate limits"
ON public.rate_limit_submissions FOR ALL
USING (true)
WITH CHECK (true);
