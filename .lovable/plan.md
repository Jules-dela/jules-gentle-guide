## Goal

Let Sayan (and every client) browse all pending proposals freely — flip back and forth between them — and only commit to Like / Dislike whenever they want, in any order. This also solves the "I can't see the other 3" problem: even with one already liked, the remaining pending proposals stay reachable.

## How the gallery works today

`ResearchGallery.tsx` is a one-way swipe deck:
- Internal state `reviewedIds` tracks which apartments have been acted on.
- `unreviewedApartments = apartments.filter(apt => !reviewedIds.has(apt.id))` — once you Like or Dislike, the card disappears from the stack.
- `currentIndex` only moves forward (after a decision).
- No "previous" / "next" navigation; no way to skip a card.

## Proposed change (frontend only)

Turn the gallery into a **browseable carousel of pending proposals** with optional decisions.

1. **Navigation controls** on the `ApartmentCard` area:
   - Left / Right chevron buttons (and swipe gestures on mobile) to move between *all* pending proposals freely, regardless of whether they've been liked or disliked already.
   - A counter ("2 of 3") and the existing progress dots become clickable to jump directly to any proposal.

2. **Decoupled decisions**:
   - Like and Dislike no longer auto-advance or remove the card from the deck.
   - Each card shows its current state (Liked ❤️ / Disliked / Undecided) with the action buttons reflecting it. Tapping Like on a disliked card flips it to Liked, etc.
   - A client can review all proposals first, then go back and like the ones they want.

3. **"Done reviewing" affordance**:
   - Replace the implicit auto-advance with an explicit **"I'm done — send my picks"** button that becomes prominent once at least one decision is made.
   - Clicking it runs the existing `handleAllReviewed` logic: if ≥1 liked → advance to Stage 3; if 0 liked → show the refinement dialog.
   - Until the client clicks Done, the stage stays at 2 so newly-added proposals keep appearing.

4. **State source of truth**:
   - Drop local `reviewedIds` / `localLikedIds` state. Drive everything from the `client_status` on the `PropertyProposal` rows already in `proposals` (pending / liked / rejected), so refreshes and multi-device sessions stay consistent.
   - Pass the full list of non-trashed proposals (pending + liked + rejected) into the gallery, not only pending ones, so the client can revisit and change their mind.

5. **Dashboard glue** (`PortalDashboard.tsx`):
   - Stop auto-jumping to Stage 3 the moment one proposal is liked. Only advance when the client clicks "Done" (or when admin publishes a visit, which is already auto-handled by the DB trigger).
   - Keep Stage 3 accessible via the timeline tracker for the already-liked proposals so nothing is lost.

## Out of scope

- No DB / RPC changes. `client_update_proposal_feedback` already supports flipping status both ways.
- No change to multi-listing switcher, Stage 3 visit report, or admin tooling.
- No change to the auto-like-on-visit-publish trigger.

## Files touched

- `src/components/portal/ResearchGallery.tsx` — carousel UX, drop one-way logic, add Done button.
- `src/components/portal/ApartmentCard.tsx` — show current decision state, add prev/next chevrons, keep Like/Dislike toggleable.
- `src/pages/PortalDashboard.tsx` — pass full proposal list, remove forced stage-advance on first like.
