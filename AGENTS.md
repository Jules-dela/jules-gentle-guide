# Architecture rules

- Share intake email-ending validation between forms and edge functions through `supabase/functions/_shared/email-domain.ts`, using an IANA TLD snapshot, so browser and server checks stay aligned without network-dependent form validation.
- Payment activation must revalidate email and require a successful server email check before saving the intake or redirecting to payment, so invalid addresses and verification outages cannot silently proceed.