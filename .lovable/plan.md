# Auto-like proposals on visit publish

## Problem
Today a proposal only moves from Research (Stage 2) to Viewing (Stage 3) when the client taps **Like** in the gallery. If we publish a visit report (photos/video) before they like it, they stay stuck in Research and don't see the viewing — exactly what happened to Eva Andreycheva.

## Fix
Treat publishing a viewing as implicit consent: the moment a proposal becomes `visit_published = true`, automatically mark `client_status = 'liked'` (only if it's still `pending`, so we never overwrite a genuine rejection).

## How

**1. Database trigger** on `property_proposals`
- Fires on INSERT or UPDATE when `visit_published` becomes `true`
- If `client_status = 'pending'`, set it to `'liked'`
- Leaves `'rejected'` proposals untouched (admin shouldn't be publishing visits for those anyway)

**2. Backfill existing rows**
- One-time UPDATE: any proposal where `visit_published = true` AND `client_status = 'pending'` → `'liked'`
- This immediately unblocks Eva and anyone else in the same state

**3. No frontend changes needed**
- The portal already gates Stage 3 visibility on `client_status = 'liked' AND visit_published = true`
- Once the data is corrected, the viewing card with the video appears on the client's next portal load

## Out of scope
- No change to the swipe gallery UX for proposals without a published visit — those still require an explicit Like.
- No change to admin UI; publishing a visit report continues to work the same way, just with the new side effect.
