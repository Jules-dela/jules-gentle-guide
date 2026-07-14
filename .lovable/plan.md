## Goal

Give you a shareable, no-login fake client portal that shows every stage of the client journey with realistic demo content — so you can review the UX end-to-end without touching a real client account.

## What already exists

Your portal already supports a **demo mode** at:

- `https://uni-key.ch/portal?demo=true`
- `https://unikey.lovable.app/portal?demo=true`

It bypasses authentication and shows mock data. However, the mock data today is thin and doesn't showcase every stage well.

## What I'll add

Enrich the demo experience so all 5 stages are visibly populated:

1. **Stage 1 — Service Agreement**: Show a pre-signed contract state (with a "Demo" watermark on the signature area).
2. **Stage 2 — Research Gallery**: 3 fake property proposals (studio in Lausanne, 2.5-room in Épalinges, 3.5-room in Pully) with real placeholder photos, prices, and descriptions. Full carousel navigation works.
3. **Stage 2.5 — Landlord Questions**: A sample question set pre-filled.
4. **Stage 3 — Visit Report**: One proposal marked as "liked" with a sample visit video (short public MP4), pros/cons, and expert notes.
5. **Stage 4 — Documents Dossier**: Checklist with a mix of statuses (validated, uploaded, missing) so you can see all UI states.
6. **Stage 5 — Handover**: Sample move-in date, address, and lease download button.

Plus a **stage switcher** in demo mode: a small floating panel (only visible when `?demo=true`) that lets you jump between stages instantly (`?demo=true&stage=2`, `stage=3`, etc.) so you don't have to click through the whole flow.

A subtle "DEMO MODE" ribbon stays visible top-right so it's never confused with a real client view.

## Technical section

- All demo data lives in a single new file `src/lib/demoPortalData.ts` — no database rows, no edge functions, no writes.
- `PortalDashboard.tsx` and each stage component already check `isDemo`; I'll extend those branches to read from the new richer mock dataset.
- Add a `useDemoStage()` hook that reads `?stage=` from the URL and overrides the computed stage in demo mode only.
- Add `DemoStageSwitcher.tsx` rendered conditionally when `isDemo === true`.
- No changes to real-client code paths, no changes to RLS, no new tables.

## Out of scope

- No real Supabase user, no seeded database rows (keeps prod data clean).
- No admin-side demo (the request is for the client portal only).

Once approved, you'll be able to open `?demo=true` and click through every screen exactly as a real client would see it.