-- 1) admin_dismissed_notifications
CREATE TABLE public.admin_dismissed_notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  interaction_id text NOT NULL,
  dismissed_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (user_id, interaction_id)
);

CREATE INDEX admin_dismissed_notifications_user_idx
  ON public.admin_dismissed_notifications (user_id, dismissed_at DESC);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.admin_dismissed_notifications TO authenticated;
GRANT ALL ON public.admin_dismissed_notifications TO service_role;

ALTER TABLE public.admin_dismissed_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins read own dismissed notifications"
  ON public.admin_dismissed_notifications
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins insert own dismissed notifications"
  ON public.admin_dismissed_notifications
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins update own dismissed notifications"
  ON public.admin_dismissed_notifications
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid() AND public.has_role(auth.uid(), 'admin'))
  WITH CHECK (user_id = auth.uid() AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins delete own dismissed notifications"
  ON public.admin_dismissed_notifications
  FOR DELETE TO authenticated
  USING (user_id = auth.uid() AND public.has_role(auth.uid(), 'admin'));

-- 2) Purge helper (admin-scoped, self-service)
CREATE OR REPLACE FUNCTION public.purge_old_dismissed_notifications()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  DELETE FROM public.admin_dismissed_notifications
  WHERE user_id = auth.uid()
    AND dismissed_at < now() - interval '90 days';
END;
$$;

GRANT EXECUTE ON FUNCTION public.purge_old_dismissed_notifications() TO authenticated;

-- 3) Admin-only helper to expose last_sign_in_at for client accounts
CREATE OR REPLACE FUNCTION public.get_client_last_sign_ins()
RETURNS TABLE (
  user_id uuid,
  last_sign_in_at timestamp with time zone,
  email_confirmed_at timestamp with time zone
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  RETURN QUERY
  SELECT u.id, u.last_sign_in_at, u.email_confirmed_at
  FROM auth.users u
  WHERE EXISTS (SELECT 1 FROM public.profiles p WHERE p.user_id = u.id);
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_client_last_sign_ins() TO authenticated;