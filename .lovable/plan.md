

## Plan: Multi-Like Support + Admin Improvements

### Problem Summary
1. **Client portal**: Liking an apartment immediately advances to Stage 3, preventing liking multiple apartments
2. **Admin FeedbackTracker**: Client visit questions are not visible (only shown in VisitReportUploader)
3. **Admin VisitReportUploader**: Uses `.maybeSingle()` to fetch liked proposals — if multiple are liked, this query fails. Also, it only manages one liked proposal at a time

### Changes

#### 1. Client Portal — Allow Multiple Likes (ResearchGallery + PortalDashboard)

**`src/pages/PortalDashboard.tsx`**:
- Change `handleResearchComplete` to NOT advance to stage 3. Instead, mark the proposal as liked, show success animation, then return to the gallery showing remaining pending proposals.
- Keep `pendingProposals` filter as-is (only pending ones shown for swiping).
- Remove the logic that sets `selectedApartment` and moves to stage 3 on like — stage advancement will now be driven by the admin changing case status to `visit_in_progress`.

**`src/components/portal/ResearchGallery.tsx`**:
- After the success animation, instead of calling `onComplete` which triggers stage advancement, just move to the next pending card. Rename/refactor `onComplete` to `onLike` to clarify it only records the like without advancing.
- Show a counter of liked apartments (e.g., "2 liked").

#### 2. Admin FeedbackTracker — Show Visit Questions

**`src/components/admin/FeedbackTracker.tsx`**:
- Add `client_visit_questions` to the `Proposal` interface (already exists in DB column).
- Fetch `client_visit_questions` (already fetched via `select('*')`).
- For liked proposals that have questions, show a clickable `MessageSquare` icon. Clicking opens a small dialog/popover showing the full question text.

#### 3. Admin VisitReportUploader — Support Multiple Liked Proposals

**`src/components/admin/VisitReportUploader.tsx`**:
- Change query from `.maybeSingle()` to fetch ALL liked proposals (remove `.maybeSingle()`, use array).
- Show a list/selector of liked proposals so admin can pick which one to write a visit report for.
- Each liked proposal gets its own visit report form (photos, pros, cons, publish).
- The "No visit scheduled yet" empty state only shows when zero proposals are liked.

#### 4. Portal Stage 3 — Handle Multiple Liked Proposals

**`src/pages/PortalDashboard.tsx`**:
- Instead of finding a single liked proposal for stage 3, find ALL liked proposals.
- Pass the relevant liked proposal(s) to the VisitReport component. Initially, show the one that has `visit_published = true`.

### Files to Edit
- `src/components/portal/ResearchGallery.tsx` — keep user on gallery after like
- `src/pages/PortalDashboard.tsx` — multi-like logic, stage 3 multi-proposal support
- `src/components/admin/FeedbackTracker.tsx` — show clickable visit questions
- `src/components/admin/VisitReportUploader.tsx` — support multiple liked proposals with a selector

