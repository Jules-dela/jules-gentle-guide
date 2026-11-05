ALTER TABLE public.cases
  ADD COLUMN whatsapp_consent boolean DEFAULT false,
  ADD COLUMN followup_status text,
  ADD COLUMN followup_question text,
  ADD COLUMN followup_case text,
  ADD COLUMN followup_updated_at timestamptz;
ALTER TABLE public.cases ADD CONSTRAINT cases_followup_status_valid CHECK (followup_status IS NULL OR followup_status IN ('question_sent', 'answered', 'needs_human'));

CREATE OR REPLACE FUNCTION public.bridge_find_case_by_phone(p_phone text)
RETURNS TABLE(case_id uuid, name text, followup_status text, followup_question text)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF p_phone IS NULL OR p_phone !~ '^[0-9]{7,15}$' THEN
    RAISE EXCEPTION 'Invalid phone' USING ERRCODE = '22023';
  END IF;
  RETURN QUERY
  SELECT c.id, p.name, c.followup_status, c.followup_question
  FROM public.cases c JOIN public.profiles p ON p.id = c.client_id
  WHERE regexp_replace(coalesce(p.phone, ''), '[^0-9]', '', 'g') = p_phone
  ORDER BY c.created_at DESC, c.id DESC LIMIT 1;
END;
$$;
REVOKE ALL ON FUNCTION public.bridge_find_case_by_phone(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.bridge_find_case_by_phone(text) TO service_role;

CREATE OR REPLACE FUNCTION public.bridge_record_reply(p_case_id uuid, p_remark text, p_status text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE note_line text;
BEGIN
  IF p_remark IS NULL OR length(btrim(p_remark)) < 1 OR length(p_remark) > 5000
     OR p_status IS NULL OR p_status NOT IN ('question_sent', 'answered', 'needs_human') THEN
    RAISE EXCEPTION 'Invalid reply' USING ERRCODE = '22023';
  END IF;
  PERFORM 1 FROM public.cases WHERE id = p_case_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Case not found' USING ERRCODE = 'P0002'; END IF;
  note_line := '[' || to_char(now() AT TIME ZONE 'Europe/Zurich', 'DD.MM.YYYY HH24:MI') || ', WhatsApp] ' || regexp_replace(btrim(p_remark), '[\r\n]+', ' ', 'g');
  INSERT INTO public.case_staff_notes(case_id, notes)
  VALUES(p_case_id, note_line)
  ON CONFLICT(case_id) DO UPDATE SET notes = CASE
    WHEN coalesce(public.case_staff_notes.notes, '') = '' THEN EXCLUDED.notes
    ELSE public.case_staff_notes.notes || E'\n' || EXCLUDED.notes END;
  UPDATE public.cases SET followup_status = p_status, followup_updated_at = now() WHERE id = p_case_id;
END;
$$;
REVOKE ALL ON FUNCTION public.bridge_record_reply(uuid, text, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.bridge_record_reply(uuid, text, text) TO service_role;