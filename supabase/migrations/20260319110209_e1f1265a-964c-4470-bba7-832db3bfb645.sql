-- 1. Create a client-safe view that excludes staff_notes and close_reason
CREATE OR REPLACE VIEW public.client_cases AS
SELECT id, client_id, status, initial_criteria, contract_data, created_at, updated_at, closed_at
FROM public.cases;

-- 2. Drop the existing client SELECT policy
DROP POLICY IF EXISTS "Clients can view their own cases" ON public.cases;

-- 3. Re-create client SELECT policy restricted to the view approach:
--    We use a column-level security approach by creating a restrictive function
--    Since Postgres RLS can't restrict columns directly, we'll use RLS on the
--    base table for admins only and grant clients access via the view.

-- Remove all client-facing policies on cases (keep admin ones)
-- Clients will query client_cases view instead

-- 4. Enable RLS on the view isn't possible, so we secure via grants:
--    The view runs as the definer, so we need to ensure the client code
--    queries 'client_cases' instead of 'cases'.

-- Actually, the simplest secure approach: re-add the client policy but
-- the client code should query the view. However, to truly block access
-- we should just not have a client SELECT policy on cases at all.
-- But that would break the foreign key lookups in other RLS policies.

-- Better approach: keep the policy but move staff_notes to a separate admin-only table.

-- Step 1: Create admin-only staff notes table
CREATE TABLE IF NOT EXISTS public.case_staff_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(case_id)
);

-- Step 2: Enable RLS
ALTER TABLE public.case_staff_notes ENABLE ROW LEVEL SECURITY;

-- Step 3: Admin-only policies
CREATE POLICY "Admins can manage staff notes"
  ON public.case_staff_notes FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can view staff notes"
  ON public.case_staff_notes FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Step 4: Migrate existing staff_notes data
INSERT INTO public.case_staff_notes (case_id, notes)
SELECT id, staff_notes FROM public.cases WHERE staff_notes IS NOT NULL
ON CONFLICT (case_id) DO UPDATE SET notes = EXCLUDED.notes;

-- Step 5: Drop the staff_notes column from cases
ALTER TABLE public.cases DROP COLUMN IF EXISTS staff_notes;

-- Clean up the view we created (not needed with this approach)
DROP VIEW IF EXISTS public.client_cases;