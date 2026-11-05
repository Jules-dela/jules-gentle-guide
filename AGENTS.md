# Architecture rules

- Share intake email-ending validation between forms and edge functions through `supabase/functions/_shared/email-domain.ts`, using an IANA TLD snapshot, so browser and server checks stay aligned without network-dependent form validation.
- Payment activation must revalidate email and require a successful server email check before saving the intake or redirecting to payment, so invalid addresses and verification outages cannot silently proceed.
- Store WhatsApp consent and follow-up state on cases; keep reply remarks in admin-only case_staff_notes.notes and append atomically through service-role-only RPCs, so private commentary is never exposed through client-readable cases.
- Send the n8n application webhook only for a newly created case via EdgeRuntime.waitUntil after email handling, so retries do not duplicate follow-ups and webhook failures do not break submission.
- The n8n bridge authenticates each POST with a constant-time shared-secret comparison and validates a restricted action schema before any service-role access, so automation credentials never grant arbitrary data access.