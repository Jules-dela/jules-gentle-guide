# Open the application form to everyone

## Problem

The `/apply` form is silently rejecting submissions that don't carry a `?token=...` URL parameter. The `send-application-emails` edge function requires an unused row in `waitlist_tokens` and returns `403 "Invalid or used invitation"` otherwise. That's almost certainly why "Matteo" filled the form on Wednesday and nothing reached the admin — he landed on `/apply` without a token, so the function rejected him before anything was persisted.

The deposit/payment flow itself is independent and stays exactly as it is.

## Changes

1. **`supabase/functions/send-application-emails/index.ts`**
   - Remove the `token` field from the Zod schema (make it optional or drop entirely).
   - Delete the `waitlist_tokens` lookup block (the `403 "Invalid or used invitation"` early-return).
   - Delete the "mark token as used" update block near the end.
   - Keep everything else: rate limiting, honeypot, user/profile/case creation, leads + housing_applications inserts, magic link, server-side contract signing.

2. **`src/components/CriteriaForm.tsx`**
   - Stop reading `?token=` from the URL and stop sending it in the `invoke` body.

3. **Leave alone**
   - Stripe deposit / `verify-payment` flow.
   - `waitlist_tokens` table and any admin UI that still uses it — just no longer enforced at submission time. (We can clean that up later if you confirm it's fully dead.)

## Verification

After deploy, submit the form at `/apply` from a fresh browser with no query string, then check that:
- A new row appears in `intake_submissions` (or the expected target table for that step) and in `leads` / `housing_applications`.
- The submitter receives the magic-link email and lands in the portal.
- No `403` in the edge-function logs.
