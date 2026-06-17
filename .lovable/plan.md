## Problem

`metadevelopers67@gmail.com` has the `admin` role in the database, but after login the `/admin` page flashes "Admin access required" and redirects home.

Root cause is in `src/hooks/use-auth.ts`:

- `loading` is set to `false` as soon as `getSession()` resolves.
- `roles` is loaded in a separate, un-awaited query (and via `setTimeout` in the auth listener).
- So for a moment after login: `loading = false`, `user = <you>`, `roles = []`, `isAdmin = false`.
- `src/routes/admin.tsx`'s effect sees `!isAdmin` and immediately redirects with the toast.

## Fix

Track role loading as part of `loading` in `useAuth`, so consumers don't see a "logged in but no roles yet" state.

1. In `src/hooks/use-auth.ts`:
   - Add a `rolesLoading` piece of state (default `true` when a session exists).
   - Set `rolesLoading = true` whenever we start loading roles (initial session + every `onAuthStateChange` with a user).
   - Set `rolesLoading = false` only after the `user_roles` query resolves (success or error).
   - When there is no user, `rolesLoading = false` and `roles = []`.
   - Expose `loading = sessionLoading || (!!user && rolesLoading)` so `loading` stays `true` until roles are known.
   - Remove the `setTimeout(..., 0)` wrapper — just call `loadRoles` directly inside the listener.

2. No changes needed in `src/routes/admin.tsx`, `auth.tsx`, or `provider.tsx` — they already correctly gate on `loading` before checking `isAdmin` / `isProvider`. The fix in the hook makes that gate actually wait for roles.

## Result

After login, the admin page will show its loading state until roles arrive, then render the dashboard for admins (and only redirect non-admins). The toast false-positive disappears.
