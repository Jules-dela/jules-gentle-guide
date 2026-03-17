

## Problem

The `movingDate` field is **required** in the Zod schema (`z.date({ required_error: "..." })`), but it is **not included in any step's validation array** in `validateStep()`. Step 1 validates `["name", "email", "phone", "university"]` — missing `movingDate`.

This means:
- Users can proceed past step 1 without selecting a moving date
- On step 4 when they click "Find my home", `form.handleSubmit(onSubmit)` runs full schema validation, which **silently fails** because the `movingDate` error is on a field rendered in step 1 (not visible)
- The form never submits, with no visible error message

Additionally, the edge function's server-side schema doesn't include `movingDate` at all, and the `supabase.functions.invoke` call body also doesn't send `movingDate`. The field is only sent to the DB insert. So the client sends `movingDate` as a formatted string to the edge function, which gets stripped by Zod validation (it's an unknown key, not a validation failure, so it passes). This part is fine — the DB insert handles it.

**The core bug: `movingDate` missing from step 1 validation causes silent form submission failure.**

## Fix

**`src/components/CriteriaForm.tsx`** — Add `"movingDate"` to the step 1 validation array:

```typescript
case 1:
  fieldsToValidate = ["name", "email", "phone", "university", "movingDate"];
  break;
```

This ensures users cannot proceed past step 1 without selecting a moving date, and the form will actually submit on step 4.

Also add `movingDate` to the edge function invocation body so it's available for the admin email (currently it's sent but as `movingDate` key which passes through since Zod `.passthrough()` isn't used — actually it gets stripped. We should add it to the edge function schema too for the admin notification email).

**`supabase/functions/send-application-emails/index.ts`**:
- Add `movingDate: z.string().max(100).optional().nullable()` to the server schema
- Include it in the admin notification email HTML

