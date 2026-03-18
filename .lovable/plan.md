

## Plan: Validate international phone number format

**Current state**: The waitlist form only checks that the phone starts with `+`. Users can submit `+abc` or `+1` (too short to be real).

**Changes** — single file: `src/components/WaitlistSection.tsx`

1. Replace the basic `startsWith("+")` check with a regex that enforces:
   - Starts with `+`
   - Followed by 1-3 digit country code
   - Followed by 6-14 more digits (spaces/dashes allowed but stripped for validation)
   - Total digit count between 7 and 15 (per E.164 standard)

2. Update error message to guide users (e.g. "Please enter a valid international number like +41 79 123 45 67").

3. Strip non-digit characters (except leading `+`) before saving to the database for consistent storage.

No database or routing changes needed.

