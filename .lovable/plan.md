

## Add "Remove Listing" to Admin Proposal Cards

### What changes
Add a delete button on each proposal card in the `FeedbackTracker` component, allowing admins to remove individual listings (not just bulk "Clear & Restart").

### Implementation

**File: `src/components/admin/FeedbackTracker.tsx`**

1. Add a `Trash2` icon import from lucide-react
2. Add a `deleteProposal` function that:
   - Deletes the proposal row from `property_proposals` by ID
   - Also deletes associated photos from the `property-photos` storage bucket (parsing the file paths from the `photos` array)
   - Shows a success toast
   - Refreshes the proposals list
3. Add a delete button (trash icon) on each proposal card, positioned in the top-right area next to the status badge
4. Wrap the delete action in an `AlertDialog` confirmation ("Remove this listing? This cannot be undone.") to prevent accidental deletions
5. Track a `deletingId` state to show a spinner on the card being deleted

No database changes needed -- admins already have full RLS access (`ALL`) on `property_proposals`.

