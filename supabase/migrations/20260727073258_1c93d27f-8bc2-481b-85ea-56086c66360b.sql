CREATE TABLE public.admin_dismissed_attention_items (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    client_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    reason_type text NOT NULL,
    dismissed_at timestamp with time zone NOT NULL DEFAULT now(),
    UNIQUE (user_id, client_id, reason_type)
);

GRANT SELECT, INSERT, DELETE ON public.admin_dismissed_attention_items TO authenticated;
GRANT ALL ON public.admin_dismissed_attention_items TO service_role;

ALTER TABLE public.admin_dismissed_attention_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage their own dismissed attention items"
ON public.admin_dismissed_attention_items
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.purge_old_dismissed_attention_items()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  DELETE FROM public.admin_dismissed_attention_items
  WHERE user_id = auth.uid()
    AND dismissed_at < now() - interval '90 days';
END;
$function$;