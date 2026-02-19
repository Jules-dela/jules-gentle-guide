
-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Service role can manage rate limits" ON public.rate_limit_submissions;

-- Create a restrictive policy for admin access only
CREATE POLICY "Admins can manage rate limits"
ON public.rate_limit_submissions FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));
