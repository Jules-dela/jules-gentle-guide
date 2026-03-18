
# Fix Password Reset "Link Expired" Issue

## Problem Analysis

Based on the auth logs and code review, the password reset links are failing because of how the recovery token flow is handled:

1. **One-time token consumption**: The recovery link token gets consumed when Supabase's `/verify` endpoint processes it
2. **Session not being captured**: The `ResetPassword.tsx` page doesn't wait for Supabase to process the URL hash tokens before checking for a session
3. **Race condition with AuthProvider**: The `AuthProvider` may be checking the session before the URL hash tokens are processed by Supabase's client library

## Root Cause

When clicking the email link:
1. Supabase `/verify` endpoint consumes the one-time token
2. Supabase redirects to `/reset-password#access_token=...&type=recovery`
3. The page loads and immediately calls `getSession()` before Supabase client processes the hash
4. No session found → shows "expired" error → redirects to `/auth`

## Solution

### Step 1: Update ResetPassword.tsx to properly handle recovery tokens

Modify the session detection to:
1. First check if there's a recovery event in the URL hash
2. Wait for the `onAuthStateChange` event with `PASSWORD_RECOVERY` type
3. Only then verify the session is valid

```text
Key changes:
- Listen for PASSWORD_RECOVERY auth event instead of just checking session
- Add a small delay to allow Supabase client to process URL hash
- Handle the recovery session specifically
```

### Step 2: Prevent Auth page from interfering

Update `Auth.tsx` to NOT redirect users who land on `/reset-password` route. Currently the `AuthProvider` might redirect authenticated users away before they can reset their password.

### Step 3: Add explicit hash handling

Add code to detect and handle the URL hash parameters that Supabase includes after verification:
- Check for `#access_token` and `type=recovery` in URL
- Use `supabase.auth.setSession()` if needed to establish the recovery session

## Technical Implementation

### File: src/pages/ResetPassword.tsx

```typescript
useEffect(() => {
  // Handle the recovery session from URL hash
  const handleRecoverySession = async () => {
    // Check if we have hash params (Supabase recovery redirect)
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = hashParams.get('access_token');
    const refreshToken = hashParams.get('refresh_token');
    const type = hashParams.get('type');
    
    if (type === 'recovery' && accessToken && refreshToken) {
      // Set the session from URL tokens
      const { error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });
      
      if (!error) {
        setIsValidSession(true);
        // Clean up URL
        window.history.replaceState(null, '', window.location.pathname);
        return;
      }
    }
    
    // Fallback: check existing session
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      setIsValidSession(true);
    } else {
      toast({
        title: "Invalid or expired link",
        description: "Please request a new password reset link.",
        variant: "destructive",
      });
      navigate("/auth");
    }
  };
  
  handleRecoverySession();
}, [navigate, toast]);
```

### File: src/hooks/useAuth.tsx

Add check to prevent auto-redirect during password recovery:

```typescript
// In the auth state change listener, check for recovery event
supabase.auth.onAuthStateChange((event, session) => {
  // Don't trigger admin checks for PASSWORD_RECOVERY events
  if (event === 'PASSWORD_RECOVERY') {
    setSession(session);
    setUser(session?.user ?? null);
    return; // Don't check admin or trigger redirects
  }
  // ... rest of existing logic
});
```

## Expected Outcome

After these changes:
1. User clicks the email reset link
2. Supabase verifies the token and redirects with session in URL hash
3. `ResetPassword.tsx` explicitly captures the tokens from the hash
4. Session is established and user can set their new password
5. No more "expired" errors on first click

## Files to Modify

| File | Change |
|------|--------|
| `src/pages/ResetPassword.tsx` | Add URL hash token handling |
| `src/hooks/useAuth.tsx` | Handle PASSWORD_RECOVERY event specially |
