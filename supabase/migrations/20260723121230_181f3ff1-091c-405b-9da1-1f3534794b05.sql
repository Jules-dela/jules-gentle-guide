
ALTER TABLE public.case_staff_notes
  ADD COLUMN IF NOT EXISTS whatsapp_contacted    boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS whatsapp_contacted_at timestamptz,
  ADD COLUMN IF NOT EXISTS managed_by            text,
  ADD COLUMN IF NOT EXISTS next_visit_at         timestamptz;

ALTER TABLE public.property_proposals
  ADD COLUMN IF NOT EXISTS photo_titles jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS archived     boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS archived_at  timestamptz;
