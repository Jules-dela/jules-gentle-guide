The "Enter fake client portal" button calls the `seed-demo-client` edge function, and the network log shows a "Failed to fetch" / no CORS response — meaning the function isn't reachable (it exists in source but isn't currently deployed on the backend).

## Fix

1. Deploy the `seed-demo-client` edge function to the backend.
2. Verify by calling it directly (curl) and checking it returns credentials (email + password) with proper CORS headers.
3. If the direct call fails, inspect the function source for a runtime error (e.g. missing `DEMO_CLIENT_PASSWORD` handling, bad `.env`, or a broken import) and patch it, then redeploy.
4. Retest the button flow on `/auth?demo=true` — it should sign you in and land on the demo portal.

No frontend changes expected unless step 3 uncovers a code bug in the function itself.