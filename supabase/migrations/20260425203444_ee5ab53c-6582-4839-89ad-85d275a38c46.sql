-- Harden waitlist table: enforce unique phone numbers and basic length validation
-- Remove duplicate phones first, keeping the earliest entry per phone
DELETE FROM public.waitlist a
USING public.waitlist b
WHERE a.phone = b.phone
  AND a.created_at > b.created_at;

ALTER TABLE public.waitlist
  ADD CONSTRAINT waitlist_phone_unique UNIQUE (phone);

ALTER TABLE public.waitlist
  ADD CONSTRAINT waitlist_phone_length_check CHECK (length(phone) BETWEEN 7 AND 20);